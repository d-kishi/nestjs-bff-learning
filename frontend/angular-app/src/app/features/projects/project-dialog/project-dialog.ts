/**
 * ProjectDialogComponent
 *
 * プロジェクト作成/編集ダイアログ
 *
 * 機能:
 * - 新規作成モード: 空のフォームで開始
 * - 編集モード: 既存のプロジェクト情報を表示
 * - 入力バリデーション
 */
import { Component, input, output, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../../../core/models';

@Component({
  selector: 'app-project-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './project-dialog.html',
  styleUrl: './project-dialog.scss',
})
export class ProjectDialogComponent {
  /** ダイアログモード */
  readonly mode = input.required<'create' | 'edit'>();

  /** 編集対象のプロジェクト（編集モード時） */
  readonly project = input<Project | null>(null);

  /** 保存イベント */
  readonly save = output<CreateProjectRequest | UpdateProjectRequest>();

  /** キャンセルイベント */
  readonly cancel = output<void>();

  /** フォーム: プロジェクト名 */
  name = '';

  /** フォーム: 説明 */
  description = '';

  constructor() {
    // project inputが変更されたらフォームを初期化
    effect(() => {
      const proj = this.project();
      if (proj) {
        this.name = proj.name;
        this.description = proj.description || '';
      } else {
        this.name = '';
        this.description = '';
      }
    });
  }

  /**
   * ダイアログタイトルを取得
   */
  get dialogTitle(): string {
    return this.mode() === 'create' ? '新規プロジェクト' : 'プロジェクト編集';
  }

  /**
   * フォームが有効かどうか
   */
  get isFormValid(): boolean {
    return this.name.trim().length > 0;
  }

  /**
   * 保存処理
   */
  onSave(): void {
    if (!this.isFormValid) return;

    this.save.emit({
      name: this.name.trim(),
      description: this.description.trim() || undefined,
    });
  }

  /**
   * キャンセル処理
   */
  onCancel(): void {
    this.cancel.emit();
  }

  /**
   * オーバーレイクリック時の処理
   */
  onOverlayClick(): void {
    this.onCancel();
  }

  /**
   * ダイアログ内クリック時の伝播防止
   *
   * @param event クリックイベント
   */
  onContentClick(event: Event): void {
    event.stopPropagation();
  }
}
