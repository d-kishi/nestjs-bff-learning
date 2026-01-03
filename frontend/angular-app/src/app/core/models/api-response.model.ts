/**
 * API共通レスポンス型定義
 *
 * BFF（api-gateway）からのレスポンス形式に対応
 * 全サービスで統一されたレスポンスフォーマットを使用
 */

/**
 * メタ情報
 *
 * 全レスポンスに含まれる共通メタデータ
 */
export interface ResponseMeta {
  /** レスポンス生成時刻（ISO 8601形式） */
  timestamp: string;
}

/**
 * ページネーションメタ情報
 *
 * 一覧取得時のページネーション情報
 */
export interface PaginationMeta extends ResponseMeta {
  /** 全件数 */
  total: number;
  /** 現在のページ番号（1始まり） */
  page: number;
  /** 1ページあたりの件数 */
  limit: number;
}

/**
 * 単一リソースレスポンス
 *
 * 単一のエンティティを返すAPIのレスポンス形式
 * @template T レスポンスデータの型
 */
export interface ApiResponse<T> {
  /** レスポンスデータ */
  data: T;
  /** メタ情報 */
  meta: ResponseMeta;
}

/**
 * ページネーション付き一覧レスポンス
 *
 * 複数のエンティティを返すAPIのレスポンス形式
 * @template T 配列要素の型
 */
export interface PaginatedResponse<T> {
  /** レスポンスデータ配列 */
  data: T[];
  /** ページネーションメタ情報 */
  meta: PaginationMeta;
}

/**
 * エラー詳細情報
 *
 * エラーレスポンスに含まれるエラー情報
 */
export interface ErrorDetail {
  /** エラーコード（例: "USER_NOT_FOUND", "TASK_INVALID_STATUS"） */
  code: string;
  /** エラーメッセージ（人間が読める形式） */
  message: string;
}

/**
 * エラーレスポンス
 *
 * エラー時のレスポンス形式
 */
export interface ErrorResponse {
  /** エラー詳細 */
  error: ErrorDetail;
  /** メタ情報 */
  meta: ResponseMeta;
}
