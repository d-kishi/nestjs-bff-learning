/**
 * UsersService
 *
 * ADMIN機能: ユーザー管理サービス
 *
 * 主な機能:
 * - ユーザー一覧取得（フィルター・ページネーション対応）
 * - ユーザーロール更新
 * - ユーザーステータス更新（有効/無効化）
 * - 利用可能ロール一覧取得
 */
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap, catchError, of } from 'rxjs';
import {
  User,
  Role,
  UpdateUserRolesRequest,
  UpdateUserStatusRequest,
  ApiResponse,
  PaginatedResponse,
} from '../../../core/models';

/** ユーザー管理APIエンドポイント */
const API_ENDPOINT = '/api/admin/users';

/** ロールAPIエンドポイント */
const ROLES_ENDPOINT = '/api/admin/roles';

/**
 * ユーザー一覧取得フィルター
 */
export interface UserFilter {
  /** 検索キーワード（メール or 表示名） */
  search?: string;
  /** ステータスフィルター */
  isActive?: boolean;
  /** ページ番号 */
  page?: number;
  /** 1ページあたり件数 */
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);

  /**
   * ユーザー一覧（Signal）
   */
  private readonly usersSignal = signal<User[]>([]);

  /**
   * ローディング状態（Signal）
   */
  private readonly isLoadingSignal = signal<boolean>(false);

  /**
   * エラー状態（Signal）
   */
  private readonly errorSignal = signal<string | null>(null);

  /**
   * 総件数（Signal）
   */
  private readonly totalCountSignal = signal<number>(0);

  /**
   * 現在のページ（Signal）
   */
  private readonly currentPageSignal = signal<number>(1);

  /**
   * 1ページあたりの件数（Signal）
   */
  private readonly limitSignal = signal<number>(20);

  /**
   * 利用可能ロール一覧（Signal）
   */
  private readonly availableRolesSignal = signal<Role[]>([]);

  /** ユーザー一覧（読み取り専用） */
  readonly users = this.usersSignal.asReadonly();

  /** ローディング状態（読み取り専用） */
  readonly isLoading = this.isLoadingSignal.asReadonly();

  /** エラー状態（読み取り専用） */
  readonly error = this.errorSignal.asReadonly();

  /** 総件数（読み取り専用） */
  readonly totalCount = this.totalCountSignal.asReadonly();

  /** 現在のページ（読み取り専用） */
  readonly currentPage = this.currentPageSignal.asReadonly();

  /** 利用可能ロール一覧（読み取り専用） */
  readonly availableRoles = this.availableRolesSignal.asReadonly();

  /**
   * 総ページ数（Computed Signal）
   */
  readonly totalPages = computed(() => {
    const total = this.totalCountSignal();
    const limit = this.limitSignal();
    if (total === 0) return 0;
    return Math.ceil(total / limit);
  });

  /**
   * ユーザー一覧を取得
   *
   * @param filter フィルター条件
   */
  loadUsers(filter?: UserFilter): void {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    let params = new HttpParams();
    if (filter?.search) {
      params = params.set('search', filter.search);
    }
    if (filter?.isActive !== undefined) {
      params = params.set('isActive', filter.isActive.toString());
    }
    if (filter?.page) {
      params = params.set('page', filter.page.toString());
    }
    if (filter?.limit) {
      params = params.set('limit', filter.limit.toString());
    }

    this.http
      .get<PaginatedResponse<User>>(API_ENDPOINT, { params })
      .pipe(
        tap((response) => {
          this.usersSignal.set(response.data);
          this.totalCountSignal.set(response.meta.total);
          this.currentPageSignal.set(response.meta.page);
          this.limitSignal.set(response.meta.limit);
          this.isLoadingSignal.set(false);
        }),
        catchError((error) => {
          this.errorSignal.set(error.message || 'ユーザー一覧の取得に失敗しました');
          this.isLoadingSignal.set(false);
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * ユーザー詳細を取得
   *
   * @param id ユーザーID
   * @returns ユーザー
   */
  getUser(id: number): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${API_ENDPOINT}/${id}`).pipe(map((response) => response.data));
  }

  /**
   * ユーザーのロールを更新
   *
   * @param userId ユーザーID
   * @param roleIds 更新後のロールID一覧
   * @returns 更新されたユーザー
   */
  updateUserRoles(userId: number, roleIds: number[]): Observable<User> {
    const request: UpdateUserRolesRequest = { roleIds };
    return this.http.put<ApiResponse<User>>(`${API_ENDPOINT}/${userId}/roles`, request).pipe(
      map((response) => response.data),
      tap((updatedUser) => {
        // 一覧内のユーザーを更新
        this.usersSignal.update((users) => users.map((u) => (u.id === userId ? updatedUser : u)));
      })
    );
  }

  /**
   * ユーザーのステータスを更新
   *
   * @param userId ユーザーID
   * @param isActive 新しいステータス
   * @returns 更新されたユーザー
   */
  updateUserStatus(userId: number, isActive: boolean): Observable<User> {
    const request: UpdateUserStatusRequest = { isActive };
    return this.http.put<ApiResponse<User>>(`${API_ENDPOINT}/${userId}/status`, request).pipe(
      map((response) => response.data),
      tap((updatedUser) => {
        // 一覧内のユーザーを更新
        this.usersSignal.update((users) => users.map((u) => (u.id === userId ? updatedUser : u)));
      })
    );
  }

  /**
   * 利用可能なロール一覧を取得
   */
  loadAvailableRoles(): void {
    this.http
      .get<ApiResponse<Role[]>>(ROLES_ENDPOINT)
      .pipe(
        tap((response) => {
          this.availableRolesSignal.set(response.data);
        }),
        catchError(() => {
          // ロール取得失敗は致命的でないのでエラー無視
          return of(null);
        })
      )
      .subscribe();
  }
}
