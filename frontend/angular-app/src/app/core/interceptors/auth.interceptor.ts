/**
 * 認証インターセプター
 *
 * 全HTTPリクエストに認証トークンを付与し、401エラー時にトークンリフレッシュを試みる
 *
 * 処理フロー:
 * 1. 公開URLの場合はトークン付与をスキップ
 * 2. トークンがあればAuthorizationヘッダに付与
 * 3. 401エラー時はトークンリフレッシュを試行
 * 4. リフレッシュ成功時は元のリクエストをリトライ
 * 5. リフレッシュ失敗時はログアウト
 */
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** 認証不要な公開URL */
const PUBLIC_URLS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];

/**
 * URLが公開URLかどうかを判定
 *
 * @param url リクエストURL
 * @returns 公開URLの場合true
 *
 * startsWithで前方一致判定を行い、偽陽性を防止
 * 例: /api/auth/login-historyが/api/auth/loginにマッチしないようにする
 */
const isPublicUrl = (url: string): boolean => {
  return PUBLIC_URLS.some((publicUrl) => url.startsWith(publicUrl));
};

/**
 * リクエストにAuthorizationヘッダを付与
 *
 * @param request 元のリクエスト
 * @param token アクセストークン
 * @returns ヘッダ付きリクエスト
 */
const addAuthHeader = (request: HttpRequest<unknown>, token: string): HttpRequest<unknown> => {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * 認証インターセプター（Functional Interceptor）
 *
 * Angular 17+の関数型インターセプター形式
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);

  // 公開URLはトークン付与をスキップ
  if (isPublicUrl(request.url)) {
    return next(request);
  }

  // トークンを取得してヘッダに付与
  const token = authService.getAccessToken();
  const authRequest = token ? addAuthHeader(request, token) : request;

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401エラーの場合、トークンリフレッシュを試行
      if (error.status === 401 && !isPublicUrl(request.url)) {
        return handleUnauthorizedError(request, next, authService);
      }
      return throwError(() => error);
    })
  );
};

/**
 * 401エラーのハンドリング
 *
 * トークンリフレッシュを試み、成功時は元のリクエストをリトライ
 *
 * @param request 元のリクエスト
 * @param next ハンドラ
 * @param authService 認証サービス
 */
const handleUnauthorizedError = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
) => {
  return authService.refreshToken().pipe(
    switchMap(() => {
      // 新しいトークンで再度リクエスト
      const newToken = authService.getAccessToken();
      const newRequest = newToken ? addAuthHeader(request, newToken) : request;
      return next(newRequest);
    }),
    catchError((refreshError) => {
      // リフレッシュ失敗時はログアウト
      authService.logout().subscribe();
      return throwError(() => refreshError);
    })
  );
};
