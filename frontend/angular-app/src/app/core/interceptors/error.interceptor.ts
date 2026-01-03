/**
 * エラーインターセプター
 *
 * HTTPエラーレスポンスを共通処理する
 *
 * 処理内容:
 * - BFF形式のエラーレスポンスをそのまま伝播
 * - 将来的にはToastServiceと連携してエラー通知
 */
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * エラーインターセプター（Functional Interceptor）
 *
 * 現時点では単純にエラーを伝播するのみ
 * Step 2でToastServiceを実装後、エラー通知機能を追加予定
 */
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // エラーログ出力（開発時のデバッグ用）
      console.error(`HTTP Error: ${error.status} - ${request.url}`, error);

      // BFF形式のエラーレスポンスを含むエラーをそのまま伝播
      // コンポーネント側でerror.error.error.messageでメッセージ取得可能
      return throwError(() => error);
    })
  );
};
