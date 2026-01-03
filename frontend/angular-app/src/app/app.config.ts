/**
 * アプリケーション設定
 *
 * Angular 21 Standalone Application の設定ファイル
 * - HttpClient（Interceptor付き）
 * - Router
 * - AuthService初期化
 */
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  APP_INITIALIZER,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthService } from './core/services/auth.service';

/**
 * AuthService初期化ファクトリ
 *
 * アプリ起動時にlocalStorageから認証状態を復元
 */
function initializeAuth(): () => void {
  const authService = inject(AuthService);
  return () => authService.initialize();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    // HttpClient with Interceptors
    // 順序: authInterceptor（トークン付与）→ errorInterceptor（エラー処理）
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),

    // アプリ起動時にAuthService初期化
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      multi: true,
    },
  ],
};
