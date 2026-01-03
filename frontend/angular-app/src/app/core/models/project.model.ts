/**
 * プロジェクト関連の型定義
 *
 * BFF（api-gateway）のProject関連レスポンスに対応
 */

/**
 * プロジェクトメンバー
 */
export interface ProjectMember {
  /** ユーザーID */
  userId: number;
  /** 表示名 */
  displayName: string;
  /** メンバーシップロール（OWNER/MEMBER） */
  role: 'OWNER' | 'MEMBER';
}

/**
 * プロジェクト
 */
export interface Project {
  /** プロジェクトID */
  id: number;
  /** プロジェクト名 */
  name: string;
  /** 説明 */
  description: string | null;
  /** オーナーユーザーID */
  ownerId: number;
  /** オーナー表示名 */
  ownerName?: string;
  /** メンバー一覧 */
  members?: ProjectMember[];
  /** 作成日時 */
  createdAt: string;
  /** 更新日時 */
  updatedAt: string;
}

/**
 * プロジェクト作成リクエスト
 */
export interface CreateProjectRequest {
  /** プロジェクト名 */
  name: string;
  /** 説明（オプション） */
  description?: string;
}

/**
 * プロジェクト更新リクエスト
 */
export interface UpdateProjectRequest {
  /** プロジェクト名 */
  name?: string;
  /** 説明 */
  description?: string | null;
}

/**
 * プロジェクトフィルター
 */
export interface ProjectFilter {
  /** 所有者のみ */
  ownerOnly?: boolean;
  /** 検索キーワード */
  search?: string;
  /** ページ番号 */
  page?: number;
  /** 1ページあたりの件数 */
  limit?: number;
}
