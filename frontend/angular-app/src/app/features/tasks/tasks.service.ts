/**
 * TasksService
 *
 * タスクCRUD操作とSignal状態管理を担当
 *
 * 主な機能:
 * - タスク一覧取得（フィルター・ソート・ページネーション対応）
 * - タスクCRUD（作成・更新・削除）
 * - インラインステータス変更
 */
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap, catchError, of } from 'rxjs';
import {
  Task,
  TaskStatus,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilter,
  ApiResponse,
  PaginatedResponse,
} from '../../core/models';

/** API エンドポイント */
const API_ENDPOINT = '/api/tasks';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private readonly http = inject(HttpClient);

  /**
   * タスク一覧（Signal）
   */
  private readonly tasksSignal = signal<Task[]>([]);

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

  /** タスク一覧（読み取り専用） */
  readonly tasks = this.tasksSignal.asReadonly();

  /** ローディング状態（読み取り専用） */
  readonly isLoading = this.isLoadingSignal.asReadonly();

  /** エラー状態（読み取り専用） */
  readonly error = this.errorSignal.asReadonly();

  /** 総件数（読み取り専用） */
  readonly totalCount = this.totalCountSignal.asReadonly();

  /** 現在のページ（読み取り専用） */
  readonly currentPage = this.currentPageSignal.asReadonly();

  /**
   * 総ページ数（Computed Signal）
   */
  readonly totalPages = computed(() => {
    const total = this.totalCountSignal();
    const limit = this.limitSignal();
    return Math.ceil(total / limit);
  });

  /**
   * タスク一覧を取得
   *
   * @param filter フィルター条件
   */
  loadTasks(filter?: TaskFilter): void {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    let params = new HttpParams();
    if (filter?.projectId) {
      params = params.set('projectId', filter.projectId.toString());
    }
    if (filter?.status) {
      params = params.set('status', filter.status);
    }
    if (filter?.priority) {
      params = params.set('priority', filter.priority);
    }
    if (filter?.assigneeId) {
      params = params.set('assigneeId', filter.assigneeId.toString());
    }
    if (filter?.search) {
      params = params.set('search', filter.search);
    }
    if (filter?.sortBy) {
      params = params.set('sortBy', filter.sortBy);
    }
    if (filter?.sortOrder) {
      params = params.set('sortOrder', filter.sortOrder);
    }
    if (filter?.page) {
      params = params.set('page', filter.page.toString());
    }
    if (filter?.limit) {
      params = params.set('limit', filter.limit.toString());
    }

    this.http
      .get<PaginatedResponse<Task>>(API_ENDPOINT, { params })
      .pipe(
        tap((response) => {
          this.tasksSignal.set(response.data);
          this.totalCountSignal.set(response.meta.total);
          this.currentPageSignal.set(response.meta.page);
          this.limitSignal.set(response.meta.limit);
          this.isLoadingSignal.set(false);
        }),
        catchError((error) => {
          this.errorSignal.set(error.message || 'タスク一覧の取得に失敗しました');
          this.isLoadingSignal.set(false);
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * タスク詳細を取得
   *
   * @param id タスクID
   * @returns タスク
   */
  getTask(id: number): Observable<Task> {
    return this.http.get<ApiResponse<Task>>(`${API_ENDPOINT}/${id}`).pipe(
      map((response) => response.data)
    );
  }

  /**
   * タスクを作成
   *
   * @param request 作成リクエスト
   * @returns 作成されたタスク
   */
  createTask(request: CreateTaskRequest): Observable<Task> {
    return this.http.post<ApiResponse<Task>>(API_ENDPOINT, request).pipe(
      map((response) => response.data),
      tap((task) => {
        // 一覧に追加
        this.tasksSignal.update((tasks) => [...tasks, task]);
      })
    );
  }

  /**
   * タスクを更新
   *
   * @param id タスクID
   * @param request 更新リクエスト
   * @returns 更新されたタスク
   */
  updateTask(id: number, request: UpdateTaskRequest): Observable<Task> {
    return this.http.put<ApiResponse<Task>>(`${API_ENDPOINT}/${id}`, request).pipe(
      map((response) => response.data),
      tap((updatedTask) => {
        // 一覧内のタスクを更新
        this.tasksSignal.update((tasks) =>
          tasks.map((t) => (t.id === id ? updatedTask : t))
        );
      })
    );
  }

  /**
   * タスクのステータスを更新（インライン編集用）
   *
   * @param id タスクID
   * @param status 新しいステータス
   * @returns 更新されたタスク
   */
  updateStatus(id: number, status: TaskStatus): Observable<Task> {
    return this.updateTask(id, { status });
  }

  /**
   * タスクを削除
   *
   * @param id タスクID
   */
  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${API_ENDPOINT}/${id}`).pipe(
      tap(() => {
        // 一覧から削除
        this.tasksSignal.update((tasks) => tasks.filter((t) => t.id !== id));
      })
    );
  }
}
