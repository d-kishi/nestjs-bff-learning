/**
 * タスク関連の型定義
 *
 * BFF（api-gateway）のTask関連レスポンスに対応
 */

/** タスクステータス */
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

/** タスク優先度 */
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * タスク
 */
export interface Task {
  /** タスクID */
  id: number;
  /** タスクタイトル */
  title: string;
  /** タスク説明 */
  description: string | null;
  /** ステータス */
  status: TaskStatus;
  /** 優先度 */
  priority: TaskPriority;
  /** 期限日（ISO 8601形式、未設定時はnull） */
  dueDate: string | null;
  /** 所属プロジェクトID */
  projectId: number;
  /** 所属プロジェクト名 */
  projectName?: string;
  /** 担当者ユーザーID（未割当時はnull） */
  assigneeId: number | null;
  /** 担当者表示名 */
  assigneeName?: string | null;
  /** 作成者ユーザーID */
  creatorId: number;
  /** 作成者表示名 */
  creatorName?: string;
  /** 作成日時 */
  createdAt: string;
  /** 更新日時 */
  updatedAt: string;
}

/**
 * タスク作成リクエスト
 */
export interface CreateTaskRequest {
  /** タスクタイトル */
  title: string;
  /** タスク説明（オプション） */
  description?: string;
  /** ステータス（デフォルト: TODO） */
  status?: TaskStatus;
  /** 優先度（デフォルト: MEDIUM） */
  priority?: TaskPriority;
  /** 期限日（オプション） */
  dueDate?: string;
  /** 所属プロジェクトID */
  projectId: number;
  /** 担当者ユーザーID（オプション） */
  assigneeId?: number;
}

/**
 * タスク更新リクエスト
 */
export interface UpdateTaskRequest {
  /** タスクタイトル */
  title?: string;
  /** タスク説明 */
  description?: string | null;
  /** ステータス */
  status?: TaskStatus;
  /** 優先度 */
  priority?: TaskPriority;
  /** 期限日 */
  dueDate?: string | null;
  /** 担当者ユーザーID */
  assigneeId?: number | null;
}

/**
 * タスクフィルター
 */
export interface TaskFilter {
  /** プロジェクトID */
  projectId?: number;
  /** ステータス */
  status?: TaskStatus;
  /** 優先度 */
  priority?: TaskPriority;
  /** 担当者ユーザーID */
  assigneeId?: number;
  /** 検索キーワード */
  search?: string;
  /** ソートフィールド */
  sortBy?: 'dueDate' | 'priority' | 'createdAt';
  /** ソート順序 */
  sortOrder?: 'asc' | 'desc';
  /** ページ番号 */
  page?: number;
  /** 1ページあたりの件数 */
  limit?: number;
}
