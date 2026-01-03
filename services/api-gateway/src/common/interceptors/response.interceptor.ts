/**
 * レスポンス変換インターセプター
 *
 * Controllerの戻り値を統一されたApiResponse形式にラップする。
 *
 * Why: 全エンドポイントで同一のレスポンス形式を保証し、
 * クライアント側での処理を統一するため。
 *
 * Note: PaginatedResponseやErrorResponseは既にラップ済みの形式で返されるため、
 * このインターセプターでは再ラップしない。
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ApiResponse,
  PaginatedResponse,
  ErrorResponse,
} from '../dto/api-response.dto';

/**
 * レスポンス形式のチェックに使用する型
 */
interface WrappedResponse {
  data?: unknown;
  meta?: { timestamp?: string };
  error?: unknown;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T> | T
> {
  /**
   * リクエストをインターセプトし、レスポンスを変換
   *
   * @param context 実行コンテキスト
   * @param next 次のハンドラー
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T> | T> {
    return next.handle().pipe(
      map((data) => {
        // 既にラップされているレスポンスはそのまま返す
        if (this.isAlreadyWrapped(data)) {
          return data;
        }

        // null/undefinedの場合はそのまま返す（204 No Content対応）
        if (data === null || data === undefined) {
          return data;
        }

        // ApiResponse形式でラップ
        return new ApiResponse(data);
      }),
    );
  }

  /**
   * 既にApiResponse/PaginatedResponse/ErrorResponse形式かどうかを判定
   *
   * Why: Controller側で明示的にPaginatedResponseやカスタムレスポンスを
   * 返す場合があるため、二重ラップを防ぐ必要がある。
   *
   * Note: instanceofチェックを先に実行することで、クラスインスタンスを
   * 確実に検出してからプレーンオブジェクトの構造チェックを行う。
   */
  private isAlreadyWrapped(data: unknown): boolean {
    if (data === null || data === undefined) {
      return false;
    }

    // オブジェクトでない場合は未ラップ
    if (typeof data !== 'object') {
      return false;
    }

    // ApiResponse/PaginatedResponse/ErrorResponseのインスタンスチェック（先に実行）
    if (
      data instanceof ApiResponse ||
      data instanceof PaginatedResponse ||
      data instanceof ErrorResponse
    ) {
      return true;
    }

    const response = data as WrappedResponse;

    // プレーンオブジェクトの構造チェック（フォールバック）
    // ApiResponse形式: { data: ..., meta: { timestamp: ... } }
    if ('data' in response && 'meta' in response && response.meta?.timestamp) {
      return true;
    }

    // ErrorResponse形式: { error: ..., meta: { timestamp: ... } }
    if ('error' in response && 'meta' in response && response.meta?.timestamp) {
      return true;
    }

    return false;
  }
}
