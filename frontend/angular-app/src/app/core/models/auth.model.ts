/**
 * 認証関連の型定義
 *
 * ログイン・新規登録・トークン管理に使用する型
 */

import { User } from './user.model';

/**
 * ログインリクエスト
 */
export interface LoginRequest {
  /** メールアドレス */
  email: string;
  /** パスワード */
  password: string;
}

/**
 * 新規登録リクエスト
 */
export interface RegisterRequest {
  /** メールアドレス（ユニーク制約） */
  email: string;
  /** パスワード（8文字以上、英大文字・英小文字・数字を含む） */
  password: string;
  /** 表示名（1〜50文字） */
  displayName: string;
}

/**
 * トークンペア
 *
 * アクセストークンとリフレッシュトークンのペア
 */
export interface TokenPair {
  /** アクセストークン（有効期限: 15分） */
  accessToken: string;
  /** リフレッシュトークン（有効期限: 7日） */
  refreshToken: string;
}

/**
 * 認証レスポンス
 *
 * ログイン・新規登録成功時のレスポンス
 */
export interface AuthResponse {
  /** ユーザー情報 */
  user: User;
  /** アクセストークン */
  accessToken: string;
  /** リフレッシュトークン */
  refreshToken: string;
}

/**
 * トークンリフレッシュリクエスト
 */
export interface RefreshTokenRequest {
  /** リフレッシュトークン */
  refreshToken: string;
}

/**
 * localStorage保存用の認証データ
 *
 * ブラウザのlocalStorageに保存する認証情報
 * キー名: 'auth'
 */
export interface StoredAuth {
  /** アクセストークン */
  accessToken: string;
  /** リフレッシュトークン */
  refreshToken: string;
  /** ユーザー情報 */
  user: {
    id: number;
    email: string;
    displayName: string;
    roles: string[];
  };
}
