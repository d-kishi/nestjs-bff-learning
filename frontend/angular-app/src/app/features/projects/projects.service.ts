/**
 * ProjectsService
 *
 * プロジェクトCRUD操作とSignal状態管理を担当
 *
 * 主な機能:
 * - プロジェクト一覧取得（フィルター・ページネーション対応）
 * - プロジェクトCRUD（作成・更新・削除）
 * - 選択中プロジェクトの管理
 */
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap, catchError, of } from 'rxjs';
import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectFilter,
  ApiResponse,
  PaginatedResponse,
} from '../../core/models';

/** API エンドポイント */
const API_ENDPOINT = '/api/projects';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private readonly http = inject(HttpClient);

  /**
   * プロジェクト一覧（Signal）
   */
  private readonly projectsSignal = signal<Project[]>([]);

  /**
   * ローディング状態（Signal）
   */
  private readonly isLoadingSignal = signal<boolean>(false);

  /**
   * エラー状態（Signal）
   */
  private readonly errorSignal = signal<string | null>(null);

  /**
   * 選択中プロジェクト（Signal）
   */
  private readonly selectedProjectSignal = signal<Project | null>(null);

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

  /** プロジェクト一覧（読み取り専用） */
  readonly projects = this.projectsSignal.asReadonly();

  /** ローディング状態（読み取り専用） */
  readonly isLoading = this.isLoadingSignal.asReadonly();

  /** エラー状態（読み取り専用） */
  readonly error = this.errorSignal.asReadonly();

  /** 選択中プロジェクト（読み取り専用） */
  readonly selectedProject = this.selectedProjectSignal.asReadonly();

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
   * プロジェクト一覧を取得
   *
   * @param filter フィルター条件
   */
  loadProjects(filter?: ProjectFilter): void {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    let params = new HttpParams();
    if (filter?.ownerOnly) {
      params = params.set('ownerOnly', 'true');
    }
    if (filter?.search) {
      params = params.set('search', filter.search);
    }
    if (filter?.page) {
      params = params.set('page', filter.page.toString());
    }
    if (filter?.limit) {
      params = params.set('limit', filter.limit.toString());
    }

    this.http
      .get<PaginatedResponse<Project>>(API_ENDPOINT, { params })
      .pipe(
        tap((response) => {
          this.projectsSignal.set(response.data);
          this.totalCountSignal.set(response.meta.total);
          this.currentPageSignal.set(response.meta.page);
          this.limitSignal.set(response.meta.limit);
          this.isLoadingSignal.set(false);
        }),
        catchError((error) => {
          this.errorSignal.set(error.message || 'プロジェクト一覧の取得に失敗しました');
          this.isLoadingSignal.set(false);
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * プロジェクト詳細を取得
   *
   * @param id プロジェクトID
   * @returns プロジェクト
   */
  getProject(id: number): Observable<Project> {
    return this.http.get<ApiResponse<Project>>(`${API_ENDPOINT}/${id}`).pipe(
      map((response) => response.data)
    );
  }

  /**
   * プロジェクトを作成
   *
   * @param request 作成リクエスト
   * @returns 作成されたプロジェクト
   */
  createProject(request: CreateProjectRequest): Observable<Project> {
    return this.http.post<ApiResponse<Project>>(API_ENDPOINT, request).pipe(
      map((response) => response.data),
      tap((project) => {
        // 一覧に追加
        this.projectsSignal.update((projects) => [...projects, project]);
      })
    );
  }

  /**
   * プロジェクトを更新
   *
   * @param id プロジェクトID
   * @param request 更新リクエスト
   * @returns 更新されたプロジェクト
   */
  updateProject(id: number, request: UpdateProjectRequest): Observable<Project> {
    return this.http.put<ApiResponse<Project>>(`${API_ENDPOINT}/${id}`, request).pipe(
      map((response) => response.data),
      tap((updatedProject) => {
        // 一覧内のプロジェクトを更新
        this.projectsSignal.update((projects) =>
          projects.map((p) => (p.id === id ? updatedProject : p))
        );
      })
    );
  }

  /**
   * プロジェクトを削除
   *
   * @param id プロジェクトID
   */
  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${API_ENDPOINT}/${id}`).pipe(
      tap(() => {
        // 一覧から削除
        this.projectsSignal.update((projects) => projects.filter((p) => p.id !== id));
      })
    );
  }

  /**
   * プロジェクトを選択
   *
   * @param project 選択するプロジェクト（nullで選択解除）
   */
  selectProject(project: Project | null): void {
    this.selectedProjectSignal.set(project);
  }
}
