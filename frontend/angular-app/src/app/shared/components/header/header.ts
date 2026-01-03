/**
 * HeaderComponent
 *
 * アプリケーション共通ヘッダー
 *
 * 機能:
 * - ロゴ（ダッシュボードへのリンク）
 * - ナビゲーション（Dashboard, Projects, Tasks）
 * - ユーザーメニュー（プロフィール、ログアウト）
 * - ADMINメニュー（Users, Roles）※ADMIN権限時のみ
 *
 * 使用方法:
 * app.tsで認証済みの場合に表示
 * ```html
 * @if (authService.isAuthenticated()) {
 *   <app-header />
 * }
 * ```
 */
import { Component, inject, signal, HostListener, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  protected readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  /** ユーザーメニューの開閉状態 */
  protected readonly isUserMenuOpen = signal(false);

  /** ADMINメニューの開閉状態 */
  protected readonly isAdminMenuOpen = signal(false);

  /**
   * ドキュメントクリック時にドロップダウンを閉じる
   *
   * ヘッダー外をクリックした場合にメニューを閉じる
   */
  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // ユーザーメニューボタン外のクリックで閉じる
    if (!target.closest('.header__user')) {
      this.isUserMenuOpen.set(false);
    }

    // ADMINメニューボタン外のクリックで閉じる
    if (!target.closest('.header__admin')) {
      this.isAdminMenuOpen.set(false);
    }
  }

  /**
   * ユーザーメニューの開閉を切り替え
   *
   * @param event クリックイベント
   */
  protected toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.isUserMenuOpen.update((open) => !open);
    this.isAdminMenuOpen.set(false); // 他のメニューを閉じる
  }

  /**
   * ADMINメニューの開閉を切り替え
   *
   * @param event クリックイベント
   */
  protected toggleAdminMenu(event: Event): void {
    event.stopPropagation();
    this.isAdminMenuOpen.update((open) => !open);
    this.isUserMenuOpen.set(false); // 他のメニューを閉じる
  }

  /**
   * ログアウト処理
   *
   * takeUntilDestroyedでコンポーネント破棄時に購読解除
   * エラー発生時はコンソールに出力（既にリダイレクト処理済みのため）
   */
  protected logout(): void {
    this.authService
      .logout()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          console.error('Logout failed:', error);
          return EMPTY;
        })
      )
      .subscribe();
  }
}
