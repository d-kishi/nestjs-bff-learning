/**
 * RolesService
 *
 * ADMIN機能: ロール管理サービス
 *
 * 主な機能:
 * - ロール一覧取得
 * - ロールCRUD（作成・更新・削除）
 * - システムロール判定（ADMIN, MEMBERは削除不可）
 */
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, of } from 'rxjs';
import { Role, ApiResponse } from '../../../core/models';

/** ロール管理APIエンドポイント */
const API_ENDPOINT = '/api/admin/roles';

/** システムロール名（削除不可） */
const SYSTEM_ROLES = ['ADMIN', 'MEMBER'];

/**
 * ロール作成リクエスト
 */
export interface CreateRoleRequest {
  /** ロール名 */
  name: string;
  /** 説明 */
  description?: string;
}

/**
 * ロール更新リクエスト
 */
export interface UpdateRoleRequest {
  /** ロール名 */
  name?: string;
  /** 説明 */
  description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private readonly http = inject(HttpClient);

  /**
   * ロール一覧（Signal）
   */
  private readonly rolesSignal = signal<Role[]>([]);

  /**
   * ローディング状態（Signal）
   */
  private readonly isLoadingSignal = signal<boolean>(false);

  /**
   * エラー状態（Signal）
   */
  private readonly errorSignal = signal<string | null>(null);

  /** ロール一覧（読み取り専用） */
  readonly roles = this.rolesSignal.asReadonly();

  /** ローディング状態（読み取り専用） */
  readonly isLoading = this.isLoadingSignal.asReadonly();

  /** エラー状態（読み取り専用） */
  readonly error = this.errorSignal.asReadonly();

  /**
   * ロール一覧を取得
   */
  loadRoles(): void {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    this.http
      .get<ApiResponse<Role[]>>(API_ENDPOINT)
      .pipe(
        tap((response) => {
          this.rolesSignal.set(response.data);
          this.isLoadingSignal.set(false);
        }),
        catchError((error) => {
          this.errorSignal.set(error.message || 'ロール一覧の取得に失敗しました');
          this.isLoadingSignal.set(false);
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * ロール詳細を取得
   *
   * @param id ロールID
   * @returns ロール
   */
  getRole(id: number): Observable<Role> {
    return this.http.get<ApiResponse<Role>>(`${API_ENDPOINT}/${id}`).pipe(map((response) => response.data));
  }

  /**
   * ロールを作成
   *
   * @param request 作成リクエスト
   * @returns 作成されたロール
   */
  createRole(request: CreateRoleRequest): Observable<Role> {
    return this.http.post<ApiResponse<Role>>(API_ENDPOINT, request).pipe(
      map((response) => response.data),
      tap((role) => {
        // 一覧に追加
        this.rolesSignal.update((roles) => [...roles, role]);
      })
    );
  }

  /**
   * ロールを更新
   *
   * @param id ロールID
   * @param request 更新リクエスト
   * @returns 更新されたロール
   */
  updateRole(id: number, request: UpdateRoleRequest): Observable<Role> {
    return this.http.put<ApiResponse<Role>>(`${API_ENDPOINT}/${id}`, request).pipe(
      map((response) => response.data),
      tap((updatedRole) => {
        // 一覧内のロールを更新
        this.rolesSignal.update((roles) => roles.map((r) => (r.id === id ? updatedRole : r)));
      })
    );
  }

  /**
   * ロールを削除
   *
   * @param id ロールID
   */
  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${API_ENDPOINT}/${id}`).pipe(
      tap(() => {
        // 一覧から削除
        this.rolesSignal.update((roles) => roles.filter((r) => r.id !== id));
      })
    );
  }

  /**
   * システムロールかどうかを判定
   * ADMIN, MEMBERはシステムロールで削除不可
   *
   * @param role ロール
   * @returns システムロールの場合true
   */
  isSystemRole(role: Role): boolean {
    return SYSTEM_ROLES.includes(role.name);
  }
}
