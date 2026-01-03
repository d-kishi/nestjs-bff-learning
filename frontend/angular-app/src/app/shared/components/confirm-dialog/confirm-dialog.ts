/**
 * ConfirmDialogComponent
 *
 * 確認ダイアログコンポーネント
 *
 * 機能:
 * - タイトル・メッセージのカスタマイズ
 * - 確認/キャンセルボタンテキストのカスタマイズ
 * - danger（削除等）/confirm（通常）の2タイプ
 * - オーバーレイクリックでキャンセル
 *
 * 使用例:
 * ```html
 * <app-confirm-dialog
 *   [isOpen]="showDialog"
 *   title="削除確認"
 *   message="このプロジェクトを削除しますか？"
 *   confirmText="削除"
 *   type="danger"
 *   (confirm)="onConfirm()"
 *   (cancel)="showDialog = false"
 * />
 * ```
 */
import { Component, input, output } from '@angular/core';

/** ダイアログタイプ */
export type DialogType = 'confirm' | 'danger';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialogComponent {
  /** ダイアログ表示フラグ */
  readonly isOpen = input<boolean>(false);

  /** ダイアログタイトル */
  readonly title = input<string>('確認');

  /** ダイアログメッセージ */
  readonly message = input<string>('');

  /** 確認ボタンテキスト */
  readonly confirmText = input<string>('確認');

  /** キャンセルボタンテキスト */
  readonly cancelText = input<string>('キャンセル');

  /** ダイアログタイプ（通常/危険） */
  readonly type = input<DialogType>('confirm');

  /** 確認イベント */
  readonly confirm = output<void>();

  /** キャンセルイベント */
  readonly cancel = output<void>();

  /**
   * 確認ボタンクリック時
   */
  protected onConfirm(): void {
    this.confirm.emit();
  }

  /**
   * キャンセルボタン/オーバーレイクリック時
   */
  protected onCancel(): void {
    this.cancel.emit();
  }
}
