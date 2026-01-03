/**
 * ユーザー関連の型定義
 *
 * user-serviceおよびBFFで使用するユーザー・プロフィール・ロール型
 */

/**
 * ロール（役割）
 *
 * ユーザーに付与される権限を表すロール
 * システムロール: ADMIN, MEMBER（削除不可）
 */
export interface Role {
  /** ロールID */
  id: number;
  /** ロール名（例: "ADMIN", "MEMBER"） */
  name: string;
  /** ロールの説明 */
  description: string | null;
}

/**
 * ユーザープロフィール
 *
 * ユーザーの表示情報を管理
 * Userと1:1リレーション
 */
export interface UserProfile {
  /** 表示名 */
  displayName: string;
  /** 自己紹介文 */
  bio: string | null;
  /** アバター画像URL */
  avatarUrl: string | null;
}

/**
 * ユーザー
 *
 * 認証済みユーザーの情報
 */
export interface User {
  /** ユーザーID */
  id: number;
  /** ユーザー名（ログインID） */
  username: string;
  /** メールアドレス */
  email: string;
  /** プロフィール情報 */
  profile: UserProfile;
  /** 付与されたロール一覧 */
  roles: Role[];
  /** アクティブ状態 */
  isActive: boolean;
  /** 作成日時（ISO 8601形式） */
  createdAt: string;
  /** 更新日時（ISO 8601形式） */
  updatedAt: string;
}

/**
 * ユーザーサマリー
 *
 * ダッシュボード等で使用する簡易ユーザー情報
 */
export interface UserSummary {
  /** ユーザーID */
  id: number;
  /** メールアドレス */
  email: string;
  /** 表示名 */
  displayName: string;
  /** ロール名一覧 */
  roles: string[];
}

/**
 * プロフィール更新リクエスト
 */
export interface UpdateProfileRequest {
  /** 表示名（1〜50文字） */
  displayName?: string;
  /** 自己紹介文（最大500文字） */
  bio?: string | null;
}

/**
 * パスワード変更リクエスト
 */
export interface ChangePasswordRequest {
  /** 現在のパスワード */
  currentPassword: string;
  /** 新しいパスワード（8文字以上、英大文字・英小文字・数字を含む） */
  newPassword: string;
  /** 確認用パスワード */
  confirmPassword: string;
}

/**
 * ユーザーロール更新リクエスト
 */
export interface UpdateUserRolesRequest {
  /** 更新後のロールID一覧 */
  roleIds: number[];
}

/**
 * ユーザーステータス更新リクエスト
 */
export interface UpdateUserStatusRequest {
  /** アクティブ状態 */
  isActive: boolean;
}
