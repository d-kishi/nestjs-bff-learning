/**
 * ADMIN権限ガード
 *
 * ADMIN権限が必要なルートを保護する
 * 認証済みだがADMIN権限がない場合はダッシュボードへリダイレクト
 * 未認証の場合はログイン画面へリダイレクト
 */
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * adminGuard（Functional Guard）
 *
 * @param route アクティベートされるルート
 * @param state 現在のルーター状態
 * @returns ADMIN権限がある場合true、ない場合はリダイレクトUrlTree
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 未認証の場合はログイン画面へリダイレクト
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  // ADMIN権限がある場合はアクセスを許可
  if (authService.isAdmin()) {
    return true;
  }

  // 認証済みだがADMIN権限がない場合はダッシュボードへリダイレクト
  return router.createUrlTree(['/dashboard']);
};
