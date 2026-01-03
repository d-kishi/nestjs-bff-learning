/**
 * TaskDialogComponent
 *
 * タスク作成・編集ダイアログ
 *
 * 機能:
 * - 作成モード: 新規タスク作成フォーム
 * - 編集モード: 既存タスク編集フォーム
 * - バリデーション（タイトル必須、プロジェクト必須）
 * - オーバーレイクリックで閉じる
 */
import { Component, input, output, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Task,
  TaskStatus,
  TaskPriority,
  CreateTaskRequest,
  UpdateTaskRequest,
  Project,
} from '../../../core/models';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './task-dialog.html',
  styleUrl: './task-dialog.scss',
})
export class TaskDialogComponent {
  /** ダイアログモード（作成 or 編集） */
  readonly mode = input.required<'create' | 'edit'>();

  /** 編集対象のタスク（編集モード時） */
  readonly task = input.required<Task | null>();

  /** プロジェクト一覧（選択肢用） */
  readonly projects = input.required<Project[]>();

  /** 保存イベント */
  readonly save = output<CreateTaskRequest | UpdateTaskRequest>();

  /** キャンセルイベント */
  readonly cancel = output<void>();

  /** タイトル入力値 */
  readonly title = signal<string>('');

  /** 説明入力値 */
  readonly description = signal<string>('');

  /** プロジェクトID入力値 */
  readonly projectId = signal<number | null>(null);

  /** ステータス入力値 */
  readonly status = signal<TaskStatus>('TODO');

  /** 優先度入力値 */
  readonly priority = signal<TaskPriority>('MEDIUM');

  /** 期限日入力値 */
  readonly dueDate = signal<string>('');

  /** エラーメッセージ */
  readonly errorMessage = signal<string>('');

  /** ステータス選択肢 */
  readonly statusOptions: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

  /** 優先度選択肢 */
  readonly priorityOptions: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

  constructor() {
    /**
     * タスクが変更されたらフォームを初期化
     * 編集モード時は既存のタスク情報をフォームに設定
     */
    effect(() => {
      const currentTask = this.task();
      if (currentTask) {
        this.title.set(currentTask.title);
        this.description.set(currentTask.description || '');
        this.projectId.set(currentTask.projectId);
        this.status.set(currentTask.status);
        this.priority.set(currentTask.priority);
        this.dueDate.set(currentTask.dueDate || '');
      } else {
        this.resetForm();
      }
    });
  }

  /**
   * フォームをリセット
   */
  private resetForm(): void {
    this.title.set('');
    this.description.set('');
    this.projectId.set(null);
    this.status.set('TODO');
    this.priority.set('MEDIUM');
    this.dueDate.set('');
    this.errorMessage.set('');
  }

  /**
   * プロジェクトID設定（安全な数値変換）
   */
  setProjectId(value: unknown): void {
    if (value === null || value === undefined || value === '') {
      this.projectId.set(null);
      return;
    }
    const numValue = Number(value);
    if (!Number.isNaN(numValue) && Number.isFinite(numValue)) {
      this.projectId.set(numValue);
    } else {
      this.projectId.set(null);
    }
  }

  /**
   * フォーム送信
   */
  onSubmit(): void {
    // バリデーション
    if (!this.title().trim()) {
      this.errorMessage.set('タイトルは必須です');
      return;
    }

    if (!this.projectId()) {
      this.errorMessage.set('プロジェクトを選択してください');
      return;
    }

    this.errorMessage.set('');

    const request: CreateTaskRequest | UpdateTaskRequest = {
      title: this.title().trim(),
      description: this.description().trim() || undefined,
      projectId: this.projectId()!,
      status: this.status(),
      priority: this.priority(),
      dueDate: this.dueDate() || undefined,
    };

    this.save.emit(request);
  }

  /**
   * オーバーレイクリック処理
   * ダイアログ外をクリックしたら閉じる
   */
  onOverlayClick(event: MouseEvent): void {
    // オーバーレイ自体がクリックされた場合のみキャンセル
    if ((event.target as HTMLElement).classList.contains('task-dialog__overlay')) {
      this.cancel.emit();
    }
  }

  /**
   * キャンセルボタン処理
   */
  onCancel(): void {
    this.cancel.emit();
  }
}
