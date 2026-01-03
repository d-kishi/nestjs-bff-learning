/**
 * LoadingSpinnerComponent
 *
 * ローディング中を示すスピナーコンポーネント
 *
 * 機能:
 * - 3サイズ対応（small, medium, large）
 * - オーバーレイモード（画面全体をカバー）
 * - カスタムメッセージ表示
 *
 * 使用例:
 * ```html
 * <!-- インライン表示 -->
 * <app-loading-spinner />
 *
 * <!-- フルスクリーンオーバーレイ -->
 * <app-loading-spinner [overlay]="true" message="データを読み込み中..." />
 * ```
 */
import { Component, input } from '@angular/core';

/** スピナーサイズ */
export type SpinnerSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  templateUrl: './loading-spinner.html',
  styleUrl: './loading-spinner.scss',
})
export class LoadingSpinnerComponent {
  /** 表示メッセージ */
  readonly message = input<string>('Loading...');

  /** オーバーレイモード（画面全体をカバー） */
  readonly overlay = input<boolean>(false);

  /** スピナーサイズ */
  readonly size = input<SpinnerSize>('medium');
}
