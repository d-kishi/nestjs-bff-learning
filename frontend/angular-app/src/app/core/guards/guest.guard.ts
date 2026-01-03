/**
 * 未認証ガード
 *
 * 未認証ユーザーのみアクセス可能なルートを保護する
 * ログイン画面・新規登録画面で使用
 * 認証済みの場合はダッシュボードへリダイレクト
 */
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * guestGuard（Functional Guard）
 *
 * @param route アクティベートされるルート
 * @param state 現在のルーター状態
 * @returns 未認証の場合true、認証済みの場合ダッシュボードへのUrlTree
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 未認証の場合はアクセスを許可
  if (!authService.isAuthenticated()) {
    return true;
  }

  // 認証済みの場合はダッシュボードへリダイレクト
  return router.createUrlTree(['/dashboard']);
};
