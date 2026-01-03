/**
 * BFF固有の例外クラス
 *
 * api-gateway（BFF層）で発生する例外を定義。
 * エラーコード形式: BFF_[ERROR_TYPE]
 *
 * Why: 下流サービスのエラー（TASK_*, USER_*）と区別するため、
 * BFF固有のエラーにはBFF_プレフィックスを使用。
 */
import {
  UnauthorizedException,
  ForbiddenException,
  ServiceUnavailableException,
  GatewayTimeoutException,
  BadRequestException,
} from '@nestjs/common';

/**
 * 認証エラー（401）
 *
 * JWT未提供、無効なJWT、期限切れJWTの場合に使用。
 */
export class BffUnauthorizedException extends UnauthorizedException {
  constructor(message: string = 'Unauthorized') {
    super({
      code: 'BFF_UNAUTHORIZED',
      message,
    });
  }
}

/**
 * 認可エラー（403）
 *
 * 認証済みだが権限が不足している場合に使用。
 */
export class BffForbiddenException extends ForbiddenException {
  constructor(message: string = 'Forbidden') {
    super({
      code: 'BFF_FORBIDDEN',
      message,
    });
  }
}

/**
 * サービス利用不可エラー（503）
 *
 * 下流サービス（task-service, user-service）への接続に失敗した場合に使用。
 */
export class BffServiceUnavailableException extends ServiceUnavailableException {
  constructor(serviceName: string) {
    super({
      code: 'BFF_SERVICE_UNAVAILABLE',
      message: `${serviceName} is unavailable`,
    });
  }
}

/**
 * タイムアウトエラー（504）
 *
 * 下流サービスへのリクエストがタイムアウトした場合に使用。
 */
export class BffTimeoutException extends GatewayTimeoutException {
  constructor(serviceName: string) {
    super({
      code: 'BFF_TIMEOUT',
      message: `${serviceName} request timed out`,
    });
  }
}

/**
 * バリデーションエラー（400）
 *
 * BFF層でのバリデーションに失敗した場合に使用。
 */
export class BffValidationException extends BadRequestException {
  constructor(message: string) {
    super({
      code: 'BFF_VALIDATION_ERROR',
      message,
    });
  }
}
