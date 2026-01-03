/**
 * 認証ガード
 *
 * 認証が必要なルートを保護する
 * 未認証の場合はログイン画面へリダイレクト（returnUrl付き）
 */
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * authGuard（Functional Guard）
 *
 * @param route アクティベートされるルート
 * @param state 現在のルーター状態
 * @returns 認証済みの場合true、未認証の場合ログイン画面へのUrlTree
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 認証済みの場合はアクセスを許可
  if (authService.isAuthenticated()) {
    return true;
  }

  // 未認証の場合はログイン画面へリダイレクト
  // returnUrlでリダイレクト後の戻り先を保持
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
