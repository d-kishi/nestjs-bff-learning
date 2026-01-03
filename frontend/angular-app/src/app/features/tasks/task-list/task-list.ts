/**
 * TaskListComponent
 *
 * タスク一覧画面
 *
 * 機能:
 * - タスク一覧表示
 * - フィルター（ステータス、優先度、プロジェクト）
 * - ソート（期限日、優先度）
 * - インラインステータス変更
 * - 新規作成・編集・削除
 * - ページネーション
 */
import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TasksService } from '../tasks.service';
import { ProjectsService } from '../../projects/projects.service';
import { ToastService } from '../../../shared/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { TaskDialogComponent } from '../task-dialog/task-dialog';
import {
  Task,
  TaskStatus,
  TaskPriority,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilter,
} from '../../../core/models';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    DatePipe,
    LowerCasePipe,
    FormsModule,
    LoadingSpinnerComponent,
    PaginationComponent,
    ConfirmDialogComponent,
    TaskDialogComponent,
  ],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskListComponent implements OnInit {
  protected readonly tasksService = inject(TasksService);
  protected readonly projectsService = inject(ProjectsService);
  private readonly toastService = inject(ToastService);

  /** ステータスフィルター */
  readonly statusFilter = signal<TaskStatus | ''>('');

  /** 優先度フィルター */
  readonly priorityFilter = signal<TaskPriority | ''>('');

  /** プロジェクトフィルター */
  readonly projectFilter = signal<number | null>(null);

  /** ソートフィールド */
  readonly sortBy = signal<'dueDate' | 'priority' | 'createdAt'>('createdAt');

  /** ソート順序 */
  readonly sortOrder = signal<'asc' | 'desc'>('desc');

  /** ダイアログ表示状態 */
  readonly isDialogOpen = signal<boolean>(false);

  /** ダイアログモード */
  readonly dialogMode = signal<'create' | 'edit'>('create');

  /** 編集中のタスク */
  readonly editingTask = signal<Task | null>(null);

  /** 削除確認ダイアログ表示状態 */
  readonly isConfirmDialogOpen = signal<boolean>(false);

  /** 削除対象のタスク */
  readonly deletingTask = signal<Task | null>(null);

  /** ステータス選択肢 */
  readonly statusOptions: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

  /** 優先度選択肢 */
  readonly priorityOptions: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

  ngOnInit(): void {
    this.tasksService.loadTasks();
    this.projectsService.loadProjects();
  }

  /**
   * フィルター適用
   */
  onFilterChange(): void {
    this.loadWithFilters();
  }

  /**
   * ソート変更
   */
  onSortChange(): void {
    this.loadWithFilters();
  }

  /**
   * フィルター・ソート条件でタスク取得
   */
  private loadWithFilters(): void {
    const filter: TaskFilter = {
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder(),
    };

    const status = this.statusFilter();
    if (status) {
      filter.status = status;
    }

    const priority = this.priorityFilter();
    if (priority) {
      filter.priority = priority;
    }

    const projectId = this.projectFilter();
    if (projectId) {
      filter.projectId = projectId;
    }

    this.tasksService.loadTasks(filter);
  }

  /**
   * 新規作成ダイアログを開く
   */
  openCreateDialog(): void {
    this.dialogMode.set('create');
    this.editingTask.set(null);
    this.isDialogOpen.set(true);
  }

  /**
   * 編集ダイアログを開く
   */
  openEditDialog(task: Task): void {
    this.dialogMode.set('edit');
    this.editingTask.set(task);
    this.isDialogOpen.set(true);
  }

  /**
   * ダイアログを閉じる
   */
  closeDialog(): void {
    this.isDialogOpen.set(false);
    this.editingTask.set(null);
  }

  /**
   * タスク作成/更新の保存
   */
  onSave(data: CreateTaskRequest | UpdateTaskRequest): void {
    if (this.dialogMode() === 'create') {
      this.tasksService.createTask(data as CreateTaskRequest).subscribe({
        next: () => {
          this.toastService.success('タスクを作成しました');
          this.closeDialog();
        },
        error: () => {
          this.toastService.error('タスクの作成に失敗しました');
        },
      });
    } else {
      const task = this.editingTask();
      if (task) {
        this.tasksService.updateTask(task.id, data as UpdateTaskRequest).subscribe({
          next: () => {
            this.toastService.success('タスクを更新しました');
            this.closeDialog();
          },
          error: () => {
            this.toastService.error('タスクの更新に失敗しました');
          },
        });
      }
    }
  }

  /**
   * インラインステータス変更
   */
  onStatusChange(taskId: number, status: TaskStatus): void {
    this.tasksService.updateStatus(taskId, status).subscribe({
      next: () => {
        this.toastService.success('ステータスを更新しました');
      },
      error: () => {
        this.toastService.error('ステータスの更新に失敗しました');
      },
    });
  }

  /**
   * 削除確認ダイアログを開く
   */
  openDeleteConfirm(task: Task): void {
    this.deletingTask.set(task);
    this.isConfirmDialogOpen.set(true);
  }

  /**
   * 削除確認ダイアログを閉じる
   */
  closeDeleteConfirm(): void {
    this.isConfirmDialogOpen.set(false);
    this.deletingTask.set(null);
  }

  /**
   * タスクを削除
   */
  onConfirmDelete(): void {
    const task = this.deletingTask();
    if (task) {
      this.tasksService.deleteTask(task.id).subscribe({
        next: () => {
          this.toastService.success('タスクを削除しました');
          this.closeDeleteConfirm();
        },
        error: () => {
          this.toastService.error('タスクの削除に失敗しました');
        },
      });
    }
  }

  /**
   * ページ変更
   */
  onPageChange(page: number): void {
    const filter: TaskFilter = {
      page,
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder(),
    };

    const status = this.statusFilter();
    if (status) {
      filter.status = status;
    }

    const priority = this.priorityFilter();
    if (priority) {
      filter.priority = priority;
    }

    const projectId = this.projectFilter();
    if (projectId) {
      filter.projectId = projectId;
    }

    this.tasksService.loadTasks(filter);
  }
}
