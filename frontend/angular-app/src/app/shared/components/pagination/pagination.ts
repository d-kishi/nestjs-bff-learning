/**
 * PaginationComponent
 *
 * ページネーションコンポーネント
 *
 * 機能:
 * - 現在ページ/総ページ数の表示
 * - 前へ/次へボタン
 * - 境界での無効化
 *
 * 使用例:
 * ```html
 * <app-pagination
 *   [currentPage]="page"
 *   [totalPages]="totalPages"
 *   (pageChange)="onPageChange($event)"
 * />
 * ```
 */
import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class PaginationComponent {
  /** 現在のページ番号（1始まり） */
  readonly currentPage = input.required<number>();

  /** 総ページ数 */
  readonly totalPages = input.required<number>();

  /** ページ変更イベント（新しいページ番号を発火） */
  readonly pageChange = output<number>();

  /** 前へボタンの無効化状態 */
  protected readonly isPrevDisabled = computed(() => this.currentPage() <= 1);

  /** 次へボタンの無効化状態 */
  protected readonly isNextDisabled = computed(
    () => this.currentPage() >= this.totalPages() || this.totalPages() === 0
  );

  /**
   * 前のページへ移動
   */
  protected goToPrev(): void {
    if (!this.isPrevDisabled()) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }

  /**
   * 次のページへ移動
   */
  protected goToNext(): void {
    if (!this.isNextDisabled()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }
}
