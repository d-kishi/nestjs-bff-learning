/**
 * 認証サービス
 *
 * ユーザー認証・認可の状態管理を担当
 * JWT保存方式: localStorage（学習プロジェクトのためシンプルさ優先）
 *
 * 主な責務:
 * - ログイン・新規登録・ログアウト処理
 * - トークン管理（保存・取得・リフレッシュ）
 * - 認証状態の提供（Signal）
 */
import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map, throwError } from 'rxjs';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  TokenPair,
  StoredAuth,
} from '../models/auth.model';
import { User } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';

/** localStorage保存キー */
const AUTH_STORAGE_KEY = 'auth';

/** API エンドポイント */
const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
} as const;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  /**
   * 現在のユーザー情報（Signal）
   *
   * nullの場合は未認証状態
   */
  private readonly currentUserSignal = signal<User | null>(null);

  /** 現在のユーザー情報（読み取り専用） */
  readonly currentUser = this.currentUserSignal.asReadonly();

  /**
   * 認証状態（Computed Signal）
   *
   * currentUserがnull以外の場合にtrue
   */
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  /**
   * ADMIN権限チェック（Computed Signal）
   *
   * ユーザーのrolesにADMINが含まれる場合にtrue
   */
  readonly isAdmin = computed(() => {
    const user = this.currentUserSignal();
    if (!user) return false;
    return user.roles.some((role) => role.name === 'ADMIN');
  });

  /**
   * ログイン処理
   *
   * @param email メールアドレス
   * @param password パスワード
   * @returns 認証レスポンス
   *
   * 成功時:
   * 1. トークンをlocalStorageに保存
   * 2. currentUserを更新
   * 3. ダッシュボードへ遷移
   */
  login(email: string, password: string): Observable<AuthResponse> {
    const request: LoginRequest = { email, password };

    return this.http.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.LOGIN, request).pipe(
      map((response) => response.data),
      tap((authResponse) => this.handleAuthSuccess(authResponse))
    );
  }

  /**
   * 新規登録処理
   *
   * @param email メールアドレス
   * @param password パスワード
   * @param displayName 表示名
   * @returns 認証レスポンス
   *
   * 成功時: ログインと同じ処理（自動ログイン）
   */
  register(email: string, password: string, displayName: string): Observable<AuthResponse> {
    const request: RegisterRequest = { email, password, displayName };

    return this.http.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.REGISTER, request).pipe(
      map((response) => response.data),
      tap((authResponse) => this.handleAuthSuccess(authResponse))
    );
  }

  /**
   * ログアウト処理
   *
   * @returns void
   *
   * 成功時:
   * 1. localStorageをクリア
   * 2. currentUserをnullに
   * 3. ログイン画面へ遷移
   */
  logout(): Observable<void> {
    const storedAuth = this.getStoredAuth();
    const refreshToken = storedAuth?.refreshToken;

    return this.http.post<ApiResponse<null>>(API_ENDPOINTS.LOGOUT, { refreshToken }).pipe(
      map(() => undefined),
      tap(() => this.handleLogout())
    );
  }

  /**
   * トークンリフレッシュ処理
   *
   * @returns 新しいトークンペア
   *
   * 401エラー時にInterceptorから呼び出される
   * refreshTokenがない場合はエラーを返す
   */
  refreshToken(): Observable<TokenPair> {
    const storedAuth = this.getStoredAuth();
    const refreshToken = storedAuth?.refreshToken;

    // refreshTokenがない場合は早期リターン
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http
      .post<ApiResponse<TokenPair>>(API_ENDPOINTS.REFRESH, { refreshToken })
      .pipe(
        map((response) => response.data),
        tap((tokens) => this.updateStoredTokens(tokens))
      );
  }

  /**
   * アクセストークン取得
   *
   * @returns アクセストークン（未認証時はnull）
   *
   * Interceptorで使用
   */
  getAccessToken(): string | null {
    const storedAuth = this.getStoredAuth();
    return storedAuth?.accessToken ?? null;
  }

  /**
   * 認証状態の初期化
   *
   * アプリ起動時にlocalStorageから認証情報を復元
   * app.config.tsのAPP_INITIALIZERで呼び出す
   */
  initialize(): void {
    const storedAuth = this.getStoredAuth();
    if (storedAuth) {
      // localStorageから復元したユーザー情報でcurrentUserを更新
      const restoredUser: User = {
        id: storedAuth.user.id,
        email: storedAuth.user.email,
        profile: {
          displayName: storedAuth.user.displayName,
          bio: null,
          avatarUrl: null,
        },
        roles: storedAuth.user.roles.map((roleName, index) => ({
          id: index + 1,
          name: roleName,
          description: null,
        })),
        isActive: true,
        createdAt: '',
      };
      this.currentUserSignal.set(restoredUser);
    }
  }

  /**
   * 認証成功時の共通処理
   *
   * @param authResponse 認証レスポンス
   */
  private handleAuthSuccess(authResponse: AuthResponse): void {
    // localStorageに保存
    const storedAuth: StoredAuth = {
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
      user: {
        id: authResponse.user.id,
        email: authResponse.user.email,
        displayName: authResponse.user.profile.displayName,
        roles: authResponse.user.roles.map((role) => role.name),
      },
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(storedAuth));

    // currentUser更新
    this.currentUserSignal.set(authResponse.user);

    // ダッシュボードへ遷移
    this.router.navigate(['/dashboard']);
  }

  /**
   * ログアウト時の共通処理
   */
  private handleLogout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * localStorageから認証情報を取得
   *
   * @returns 保存された認証情報（なければnull）
   */
  private getStoredAuth(): StoredAuth | null {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;

    try {
      return JSON.parse(stored) as StoredAuth;
    } catch {
      return null;
    }
  }

  /**
   * localStorageのトークンを更新
   *
   * @param tokens 新しいトークンペア
   */
  private updateStoredTokens(tokens: TokenPair): void {
    const storedAuth = this.getStoredAuth();
    if (storedAuth) {
      storedAuth.accessToken = tokens.accessToken;
      storedAuth.refreshToken = tokens.refreshToken;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(storedAuth));
    }
  }
}
