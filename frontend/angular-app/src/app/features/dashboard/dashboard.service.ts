/**
 * DashboardService
 *
 * ダッシュボードデータの取得・状態管理を担当
 *
 * 主な機能:
 * - BFFからダッシュボードデータを取得
 * - ローディング・エラー状態の管理（Signal）
 * - 部分失敗の検出
 */
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, of } from 'rxjs';
import { DashboardResponse } from '../../core/models/dashboard.model';
import { ApiResponse } from '../../core/models/api-response.model';

/** API エンドポイント */
const API_ENDPOINT = '/api/dashboard';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);

  /**
   * ダッシュボードデータ（Signal）
   *
   * 取得前・エラー時はnull
   */
  private readonly dashboardSignal = signal<DashboardResponse | null>(null);

  /**
   * ローディング状態（Signal）
   */
  private readonly isLoadingSignal = signal<boolean>(false);

  /**
   * エラー状態（Signal）
   */
  private readonly errorSignal = signal<string | null>(null);

  /** ダッシュボードデータ（読み取り専用） */
  readonly dashboard = this.dashboardSignal.asReadonly();

  /** ローディング状態（読み取り専用） */
  readonly isLoading = this.isLoadingSignal.asReadonly();

  /** エラー状態（読み取り専用） */
  readonly error = this.errorSignal.asReadonly();

  /**
   * 部分失敗の有無を判定
   *
   * BFFがデータ集約時に一部のサービスからデータ取得に失敗した場合にtrue
   */
  readonly hasPartialError = computed(() => {
    const data = this.dashboardSignal();
    return data?._errors !== undefined && data._errors.length > 0;
  });

  /**
   * 部分失敗のエラーメッセージを取得
   */
  readonly partialErrors = computed(() => {
    return this.dashboardSignal()?._errors ?? [];
  });

  /**
   * ダッシュボードデータを取得（Observable）
   *
   * @returns ダッシュボードレスポンス
   */
  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<ApiResponse<DashboardResponse>>(API_ENDPOINT).pipe(
      map((response) => response.data)
    );
  }

  /**
   * ダッシュボードデータをロードしてSignalを更新
   *
   * コンポーネントの初期化時に呼び出す
   */
  loadDashboard(): void {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    this.getDashboard()
      .pipe(
        tap((data) => {
          this.dashboardSignal.set(data);
          this.isLoadingSignal.set(false);
        }),
        catchError((error) => {
          this.errorSignal.set(error.message || 'ダッシュボードの取得に失敗しました');
          this.isLoadingSignal.set(false);
          return of(null);
        })
      )
      .subscribe();
  }
}
