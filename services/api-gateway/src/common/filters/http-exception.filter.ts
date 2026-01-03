/**
 * HTTP例外フィルター
 *
 * 全エンドポイントで発生するHttpExceptionをキャッチし、
 * 統一されたErrorResponse形式に変換する。
 *
 * Why: NestJSのデフォルトエラーレスポンスではなく、
 * CLAUDE.mdで定義されたAPI Response Formatに準拠するため。
 *
 * BFF固有の処理:
 * - BFF_* プレフィックスのエラーコードを使用
 * - 下流サービスのエラー（TASK_*, USER_*）はそのまま透過
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse } from '../dto/api-response.dto';

/**
 * ValidationPipeのエラー詳細の型
 */
interface ValidationErrorResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * HttpExceptionをキャッチしてErrorResponse形式に変換
   *
   * @param exception キャッチした例外
   * @param host 実行コンテキスト
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    // エラーコードとメッセージを決定
    const { code, message } = this.extractErrorInfo(exception, status);

    // ErrorResponse形式でレスポンス
    const errorResponse = new ErrorResponse(code, message);

    response.status(status).json(errorResponse);
  }

  /**
   * 例外からエラーコードとメッセージを抽出
   *
   * Why: ValidationPipeのエラーは配列で返されることがあるため、
   * 統一された形式に変換する必要がある。
   * 下流サービスのカスタムエラーコードは透過する。
   */
  private extractErrorInfo(
    exception: HttpException,
    status: number,
  ): { code: string; message: string } {
    const exceptionResponse = exception.getResponse();

    // 文字列の場合はそのまま使用
    if (typeof exceptionResponse === 'string') {
      return {
        code: this.getDefaultErrorCode(status),
        message: exceptionResponse,
      };
    }

    // オブジェクトの場合
    const responseObj = exceptionResponse as ValidationErrorResponse;

    // カスタムエラーコードがある場合（BFF例外または下流サービスエラー）
    if (
      'code' in exceptionResponse &&
      typeof (exceptionResponse as { code?: string }).code === 'string'
    ) {
      return {
        code: (exceptionResponse as { code: string }).code,
        message: this.extractMessage(responseObj.message),
      };
    }

    // ValidationPipeのエラー
    return {
      code: this.getDefaultErrorCode(status),
      message: this.extractMessage(responseObj.message),
    };
  }

  /**
   * メッセージを文字列に変換
   *
   * ValidationPipeは配列でエラーを返すことがあるため、
   * 最初のメッセージを使用する。
   */
  private extractMessage(message: string | string[] | undefined): string {
    if (Array.isArray(message)) {
      return message[0] || 'Validation failed';
    }
    return message || 'An error occurred';
  }

  /**
   * HTTPステータスコードからデフォルトのエラーコードを生成
   *
   * BFF用に BFF_* プレフィックスを使用
   */
  private getDefaultErrorCode(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BFF_VALIDATION_ERROR';
      case HttpStatus.NOT_FOUND:
        return 'BFF_NOT_FOUND';
      case HttpStatus.FORBIDDEN:
        return 'BFF_FORBIDDEN';
      case HttpStatus.CONFLICT:
        return 'BFF_CONFLICT';
      case HttpStatus.UNAUTHORIZED:
        return 'BFF_UNAUTHORIZED';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'BFF_SERVICE_UNAVAILABLE';
      case HttpStatus.GATEWAY_TIMEOUT:
        return 'BFF_TIMEOUT';
      default:
        return 'BFF_INTERNAL_ERROR';
    }
  }
}
