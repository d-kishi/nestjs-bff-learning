/**
 * ProjectListComponent
 *
 * プロジェクト一覧画面
 *
 * 機能:
 * - プロジェクト一覧表示
 * - 新規作成・編集・削除
 * - ページネーション
 */
import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectsService } from '../projects.service';
import { ToastService } from '../../../shared/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { ProjectDialogComponent } from '../project-dialog/project-dialog';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../../../core/models';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    LoadingSpinnerComponent,
    PaginationComponent,
    ConfirmDialogComponent,
    ProjectDialogComponent,
  ],
  templateUrl: './project-list.html',
  styleUrl: './project-list.scss',
})
export class ProjectListComponent implements OnInit {
  protected readonly projectsService = inject(ProjectsService);
  private readonly toastService = inject(ToastService);

  /** ダイアログ表示状態 */
  readonly isDialogOpen = signal<boolean>(false);

  /** ダイアログモード（新規作成/編集） */
  readonly dialogMode = signal<'create' | 'edit'>('create');

  /** 編集中のプロジェクト */
  readonly editingProject = signal<Project | null>(null);

  /** 削除確認ダイアログ表示状態 */
  readonly isConfirmDialogOpen = signal<boolean>(false);

  /** 削除対象のプロジェクト */
  readonly deletingProject = signal<Project | null>(null);

  ngOnInit(): void {
    this.projectsService.loadProjects();
  }

  /**
   * 新規作成ダイアログを開く
   */
  openCreateDialog(): void {
    this.dialogMode.set('create');
    this.editingProject.set(null);
    this.isDialogOpen.set(true);
  }

  /**
   * 編集ダイアログを開く
   *
   * @param project 編集対象のプロジェクト
   */
  openEditDialog(project: Project): void {
    this.dialogMode.set('edit');
    this.editingProject.set(project);
    this.isDialogOpen.set(true);
  }

  /**
   * ダイアログを閉じる
   */
  closeDialog(): void {
    this.isDialogOpen.set(false);
    this.editingProject.set(null);
  }

  /**
   * プロジェクト作成/更新の保存
   *
   * @param data フォームデータ
   */
  onSave(data: CreateProjectRequest | UpdateProjectRequest): void {
    if (this.dialogMode() === 'create') {
      this.projectsService.createProject(data as CreateProjectRequest).subscribe({
        next: () => {
          this.toastService.success('プロジェクトを作成しました');
          this.closeDialog();
        },
        error: () => {
          this.toastService.error('プロジェクトの作成に失敗しました');
        },
      });
    } else {
      const project = this.editingProject();
      if (project) {
        this.projectsService.updateProject(project.id, data as UpdateProjectRequest).subscribe({
          next: () => {
            this.toastService.success('プロジェクトを更新しました');
            this.closeDialog();
          },
          error: () => {
            this.toastService.error('プロジェクトの更新に失敗しました');
          },
        });
      }
    }
  }

  /**
   * 削除確認ダイアログを開く
   *
   * @param project 削除対象のプロジェクト
   */
  openDeleteConfirm(project: Project): void {
    this.deletingProject.set(project);
    this.isConfirmDialogOpen.set(true);
  }

  /**
   * 削除確認ダイアログを閉じる
   */
  closeDeleteConfirm(): void {
    this.isConfirmDialogOpen.set(false);
    this.deletingProject.set(null);
  }

  /**
   * プロジェクトを削除
   */
  onConfirmDelete(): void {
    const project = this.deletingProject();
    if (project) {
      this.projectsService.deleteProject(project.id).subscribe({
        next: () => {
          this.toastService.success('プロジェクトを削除しました');
          this.closeDeleteConfirm();
        },
        error: () => {
          this.toastService.error('プロジェクトの削除に失敗しました');
        },
      });
    }
  }

  /**
   * ページ変更
   *
   * @param page ページ番号
   */
  onPageChange(page: number): void {
    this.projectsService.loadProjects({ page });
  }
}
