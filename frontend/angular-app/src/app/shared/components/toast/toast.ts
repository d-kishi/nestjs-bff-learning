/**
 * ToastComponent
 *
 * トースト通知を画面右上に表示するコンポーネント
 *
 * 機能:
 * - 成功・エラー・警告・情報の4タイプに対応
 * - タイプ別にアイコンと色を変更
 * - 閉じるボタンで手動削除可能
 *
 * 使用方法:
 * app.tsに1箇所配置するだけで全画面で使用可能
 * ```html
 * <app-toast />
 * ```
 */
import { Component, inject } from '@angular/core';
import { ToastService, ToastType } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);

  /**
   * タイプ別アイコンを取得
   *
   * @param type トーストタイプ
   * @returns 表示アイコン文字
   */
  protected getIcon(type: ToastType): string {
    const icons: Record<ToastType, string> = {
      success: '✓',
      error: '✗',
      warning: '⚠',
      info: 'ℹ',
    };
    return icons[type];
  }

  /**
   * トーストを閉じる
   *
   * @param id 削除対象のトーストID
   */
  protected close(id: string): void {
    this.toastService.remove(id);
  }
}
