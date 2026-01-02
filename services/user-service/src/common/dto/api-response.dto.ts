/**
 * API統一レスポンス型
 *
 * 全エンドポイントで統一されたレスポンス形式を提供する。
 * CLAUDE.mdのAPI Response Formatに準拠。
 */

/**
 * メタ情報（全レスポンス共通）
 */
export interface ResponseMeta {
  timestamp: string;
}

/**
 * ページネーションメタ情報
 */
export interface PaginationMeta extends ResponseMeta {
  total: number;
  page: number;
  limit: number;
}

/**
 * 成功レスポンス（単一リソース）
 *
 * @example
 * {
 *   "data": { "id": 1, "name": "プロジェクト" },
 *   "meta": { "timestamp": "2025-01-15T10:30:00Z" }
 * }
 */
export class ApiResponse<T> {
  data: T;
  meta: ResponseMeta;

  constructor(data: T) {
    this.data = data;
    this.meta = { timestamp: new Date().toISOString() };
  }
}

/**
 * 成功レスポンス（一覧・ページネーション）
 *
 * @example
 * {
 *   "data": [{ "id": 1, "name": "プロジェクト" }],
 *   "meta": { "total": 100, "page": 1, "limit": 20, "timestamp": "2025-01-15T10:30:00Z" }
 * }
 */
export class PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.meta = {
      total,
      page,
      limit,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * エラー情報
 */
export interface ErrorInfo {
  code: string;
  message: string;
}

/**
 * エラーレスポンス
 *
 * エラーコード形式: [SERVICE]_[ENTITY]_[ERROR_TYPE]
 * 例: TASK_PROJECT_NOT_FOUND, TASK_TASK_VALIDATION_ERROR
 *
 * @example
 * {
 *   "error": { "code": "TASK_PROJECT_NOT_FOUND", "message": "Project not found" },
 *   "meta": { "timestamp": "2025-01-15T10:30:00Z" }
 * }
 */
export class ErrorResponse {
  error: ErrorInfo;
  meta: ResponseMeta;

  constructor(code: string, message: string) {
    this.error = { code, message };
    this.meta = { timestamp: new Date().toISOString() };
  }
}
