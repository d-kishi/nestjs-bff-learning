/**
 * ビジネスロジック例外クラス
 *
 * 各エンティティで使用するカスタム例外を定義。
 * エラーコード形式: TASK_[ENTITY]_[ERROR_TYPE]
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
} from '@nestjs/common';

// ============================================
// Project関連例外
// ============================================

/**
 * プロジェクトが見つからない場合の例外
 */
export class ProjectNotFoundException extends NotFoundException {
  constructor(id: number) {
    super({
      code: 'TASK_PROJECT_NOT_FOUND',
      message: `Project with id ${id} not found`,
    });
  }
}

/**
 * プロジェクトのバリデーションエラー
 */
export class ProjectValidationException extends BadRequestException {
  constructor(message: string) {
    super({
      code: 'TASK_PROJECT_VALIDATION_ERROR',
      message,
    });
  }
}

/**
 * プロジェクトへのアクセス権限がない場合の例外
 */
export class ProjectForbiddenException extends ForbiddenException {
  constructor(
    message: string = 'You do not have permission to access this project',
  ) {
    super({
      code: 'TASK_PROJECT_FORBIDDEN',
      message,
    });
  }
}

// ============================================
// Task関連例外
// ============================================

/**
 * タスクが見つからない場合の例外
 */
export class TaskNotFoundException extends NotFoundException {
  constructor(id: number) {
    super({
      code: 'TASK_TASK_NOT_FOUND',
      message: `Task with id ${id} not found`,
    });
  }
}

/**
 * タスクのバリデーションエラー
 */
export class TaskValidationException extends BadRequestException {
  constructor(message: string) {
    super({
      code: 'TASK_TASK_VALIDATION_ERROR',
      message,
    });
  }
}

/**
 * タスクへのアクセス権限がない場合の例外
 */
export class TaskForbiddenException extends ForbiddenException {
  constructor(
    message: string = 'You do not have permission to access this task',
  ) {
    super({
      code: 'TASK_TASK_FORBIDDEN',
      message,
    });
  }
}

/**
 * タスクに既にタグが付与されている場合の例外
 */
export class TaskTagAlreadyExistsException extends ConflictException {
  constructor(taskId: number, tagId: number) {
    super({
      code: 'TASK_TASK_TAG_ALREADY_EXISTS',
      message: `Tag ${tagId} is already assigned to task ${taskId}`,
    });
  }
}

// ============================================
// Comment関連例外
// ============================================

/**
 * コメントが見つからない場合の例外
 */
export class CommentNotFoundException extends NotFoundException {
  constructor(id: number) {
    super({
      code: 'TASK_COMMENT_NOT_FOUND',
      message: `Comment with id ${id} not found`,
    });
  }
}

/**
 * コメントのバリデーションエラー
 */
export class CommentValidationException extends BadRequestException {
  constructor(message: string) {
    super({
      code: 'TASK_COMMENT_VALIDATION_ERROR',
      message,
    });
  }
}

/**
 * コメントへのアクセス権限がない場合の例外
 */
export class CommentForbiddenException extends ForbiddenException {
  constructor(
    message: string = 'You do not have permission to access this comment',
  ) {
    super({
      code: 'TASK_COMMENT_FORBIDDEN',
      message,
    });
  }
}

// ============================================
// Tag関連例外
// ============================================

/**
 * タグが見つからない場合の例外
 */
export class TagNotFoundException extends NotFoundException {
  constructor(id: number) {
    super({
      code: 'TASK_TAG_NOT_FOUND',
      message: `Tag with id ${id} not found`,
    });
  }
}

/**
 * タグのバリデーションエラー
 */
export class TagValidationException extends BadRequestException {
  constructor(message: string) {
    super({
      code: 'TASK_TAG_VALIDATION_ERROR',
      message,
    });
  }
}

/**
 * 同名のタグが既に存在する場合の例外
 */
export class TagAlreadyExistsException extends ConflictException {
  constructor(name: string) {
    super({
      code: 'TASK_TAG_ALREADY_EXISTS',
      message: `Tag with name '${name}' already exists`,
    });
  }
}
