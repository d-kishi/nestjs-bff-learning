/**
 * ビジネスロジック例外クラス
 *
 * user-serviceで使用するカスタム例外を定義。
 * エラーコード形式: USER_[DOMAIN]_[ERROR_TYPE]
 *
 * Why: HttpExceptionを継承することで、ExceptionFilterで
 * 統一されたエラーレスポンス形式に変換される。
 * また、エラーコードを保持することで、クライアント側での
 * エラーハンドリングが容易になる。
 */
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';

// ============================================
// Auth関連例外
// ============================================

/**
 * メールアドレスが既に登録されている場合の例外
 */
export class AuthEmailAlreadyExistsException extends ConflictException {
  constructor(email: string) {
    super({
      code: 'USER_AUTH_EMAIL_ALREADY_EXISTS',
      message: `Email '${email}' is already registered`,
    });
  }
}

/**
 * ログイン認証失敗の例外
 *
 * Why: セキュリティ上、「メールが存在しない」と「パスワードが間違っている」を
 * 区別せず、同一のエラーメッセージを返す。
 */
export class AuthInvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super({
      code: 'USER_AUTH_INVALID_CREDENTIALS',
      message: 'Invalid email or password',
    });
  }
}

/**
 * アカウントが無効化されている場合の例外
 */
export class AuthAccountDisabledException extends ForbiddenException {
  constructor() {
    super({
      code: 'USER_AUTH_ACCOUNT_DISABLED',
      message: 'Account is disabled',
    });
  }
}

/**
 * リフレッシュトークンが無効または期限切れの例外
 */
export class AuthInvalidRefreshTokenException extends UnauthorizedException {
  constructor() {
    super({
      code: 'USER_AUTH_INVALID_REFRESH_TOKEN',
      message: 'Invalid or expired refresh token',
    });
  }
}

// ============================================
// User関連例外
// ============================================

/**
 * ユーザーが見つからない場合の例外
 */
export class UserNotFoundException extends NotFoundException {
  constructor(id: number) {
    super({
      code: 'USER_USER_NOT_FOUND',
      message: `User with id ${id} not found`,
    });
  }
}

/**
 * ユーザーのバリデーションエラー
 */
export class UserValidationException extends BadRequestException {
  constructor(message: string) {
    super({
      code: 'USER_USER_VALIDATION_ERROR',
      message,
    });
  }
}

/**
 * ユーザーへのアクセス権限がない場合の例外
 */
export class UserForbiddenException extends ForbiddenException {
  constructor(
    message: string = 'You do not have permission to access this user',
  ) {
    super({
      code: 'USER_USER_FORBIDDEN',
      message,
    });
  }
}

/**
 * メールアドレスが既に使用されている場合の例外（更新時）
 */
export class UserEmailAlreadyExistsException extends ConflictException {
  constructor(email: string) {
    super({
      code: 'USER_USER_EMAIL_ALREADY_EXISTS',
      message: `Email '${email}' is already in use`,
    });
  }
}

/**
 * 現在のパスワードが間違っている場合の例外
 */
export class UserInvalidPasswordException extends UnauthorizedException {
  constructor() {
    super({
      code: 'USER_USER_INVALID_PASSWORD',
      message: 'Current password is incorrect',
    });
  }
}

// ============================================
// Role関連例外
// ============================================

/**
 * ロールが見つからない場合の例外
 */
export class RoleNotFoundException extends NotFoundException {
  constructor(id: number) {
    super({
      code: 'USER_ROLE_NOT_FOUND',
      message: `Role with id ${id} not found`,
    });
  }
}

/**
 * ロールのバリデーションエラー
 */
export class RoleValidationException extends BadRequestException {
  constructor(message: string) {
    super({
      code: 'USER_ROLE_VALIDATION_ERROR',
      message,
    });
  }
}

/**
 * 同名のロールが既に存在する場合の例外
 */
export class RoleAlreadyExistsException extends ConflictException {
  constructor(name: string) {
    super({
      code: 'USER_ROLE_ALREADY_EXISTS',
      message: `Role with name '${name}' already exists`,
    });
  }
}

/**
 * ユーザーが割り当てられているロールを削除しようとした場合の例外
 */
export class RoleHasUsersException extends BadRequestException {
  constructor(roleId: number, userCount: number) {
    super({
      code: 'USER_ROLE_HAS_USERS',
      message: `Cannot delete role with id ${roleId}. ${userCount} user(s) have this role assigned`,
    });
  }
}
