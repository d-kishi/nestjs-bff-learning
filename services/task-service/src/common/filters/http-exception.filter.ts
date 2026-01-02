/**
 * HTTP例外フィルター
 *
 * 全エンドポイントで発生するHttpExceptionをキャッチし、
 * 統一されたErrorResponse形式に変換する。
 *
 * Why: NestJSのデフォルトエラーレスポンスではなく、
 * CLAUDE.mdで定義されたAPI Response Formatに準拠するため。
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

    // カスタムエラーコードがある場合（ビジネス例外）
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
   */
  private getDefaultErrorCode(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'TASK_VALIDATION_ERROR';
      case HttpStatus.NOT_FOUND:
        return 'TASK_NOT_FOUND';
      case HttpStatus.FORBIDDEN:
        return 'TASK_FORBIDDEN';
      case HttpStatus.CONFLICT:
        return 'TASK_CONFLICT';
      case HttpStatus.UNAUTHORIZED:
        return 'TASK_UNAUTHORIZED';
      default:
        return 'TASK_INTERNAL_ERROR';
    }
  }
}
