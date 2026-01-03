/**
 * ProfileService
 *
 * ユーザープロフィールの取得・更新を担当
 *
 * 主な機能:
 * - プロフィール取得
 * - プロフィール更新
 * - パスワード変更
 */
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, of } from 'rxjs';
import {
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ApiResponse,
} from '../../core/models';

/** API エンドポイント */
const API_ENDPOINT = '/api/profile';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly http = inject(HttpClient);

  /**
   * プロフィール（Signal）
   */
  private readonly profileSignal = signal<User | null>(null);

  /**
   * ローディング状態（Signal）
   */
  private readonly isLoadingSignal = signal<boolean>(false);

  /**
   * エラー状態（Signal）
   */
  private readonly errorSignal = signal<string | null>(null);

  /** プロフィール（読み取り専用） */
  readonly profile = this.profileSignal.asReadonly();

  /** ローディング状態（読み取り専用） */
  readonly isLoading = this.isLoadingSignal.asReadonly();

  /** エラー状態（読み取り専用） */
  readonly error = this.errorSignal.asReadonly();

  /**
   * プロフィールを取得
   */
  loadProfile(): void {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    this.http
      .get<ApiResponse<User>>(API_ENDPOINT)
      .pipe(
        tap((response) => {
          this.profileSignal.set(response.data);
          this.isLoadingSignal.set(false);
        }),
        catchError((error) => {
          this.errorSignal.set(error.message || 'プロフィールの取得に失敗しました');
          this.isLoadingSignal.set(false);
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * プロフィールを更新
   *
   * @param request 更新リクエスト
   * @returns 更新されたプロフィール
   */
  updateProfile(request: UpdateProfileRequest): Observable<User> {
    return this.http.put<ApiResponse<User>>(API_ENDPOINT, request).pipe(
      map((response) => response.data),
      tap((user) => {
        this.profileSignal.set(user);
      })
    );
  }

  /**
   * パスワードを変更
   *
   * @param request パスワード変更リクエスト
   */
  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${API_ENDPOINT}/password`, request);
  }

  /**
   * プロフィール状態をクリア
   * ログアウト時に呼び出す
   */
  clearProfile(): void {
    this.profileSignal.set(null);
    this.errorSignal.set(null);
  }
}
