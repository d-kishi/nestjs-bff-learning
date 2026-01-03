/**
 * ToastService
 *
 * トースト通知（成功・エラー・警告・情報）の表示管理を担当
 *
 * 主な機能:
 * - トースト追加（タイプ別メソッド）
 * - 自動消去（デフォルト5秒）
 * - 手動削除
 *
 * 使用例:
 * ```typescript
 * this.toastService.success('保存しました');
 * this.toastService.error('エラーが発生しました');
 * ```
 */
import { Injectable, signal } from '@angular/core';

/** トースト通知のタイプ */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * トースト通知オブジェクト
 */
export interface Toast {
  /** 一意なID（削除時に使用） */
  id: string;
  /** トーストタイプ */
  type: ToastType;
  /** 表示メッセージ */
  message: string;
}

/** デフォルトの表示時間（ミリ秒） */
const DEFAULT_DURATION = 5000;

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  /**
   * トースト一覧（Signal）
   *
   * 表示中の全トーストを管理
   */
  private readonly toastsSignal = signal<Toast[]>([]);

  /** トースト一覧（読み取り専用） */
  readonly toasts = this.toastsSignal.asReadonly();

  /**
   * 成功トーストを表示
   *
   * @param message 表示メッセージ
   * @param duration 表示時間（ミリ秒）。0で無期限
   */
  success(message: string, duration: number = DEFAULT_DURATION): void {
    this.show('success', message, duration);
  }

  /**
   * エラートーストを表示
   *
   * @param message 表示メッセージ
   * @param duration 表示時間（ミリ秒）。0で無期限
   */
  error(message: string, duration: number = DEFAULT_DURATION): void {
    this.show('error', message, duration);
  }

  /**
   * 警告トーストを表示
   *
   * @param message 表示メッセージ
   * @param duration 表示時間（ミリ秒）。0で無期限
   */
  warning(message: string, duration: number = DEFAULT_DURATION): void {
    this.show('warning', message, duration);
  }

  /**
   * 情報トーストを表示
   *
   * @param message 表示メッセージ
   * @param duration 表示時間（ミリ秒）。0で無期限
   */
  info(message: string, duration: number = DEFAULT_DURATION): void {
    this.show('info', message, duration);
  }

  /**
   * トーストを削除
   *
   * @param id 削除対象のトーストID
   */
  remove(id: string): void {
    this.toastsSignal.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  /**
   * トースト表示の内部実装
   *
   * @param type トーストタイプ
   * @param message 表示メッセージ
   * @param duration 表示時間
   */
  private show(type: ToastType, message: string, duration: number): void {
    const id = this.generateId();
    const toast: Toast = { id, type, message };

    this.toastsSignal.update((toasts) => [...toasts, toast]);

    // 自動消去（duration > 0 の場合のみ）
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  /**
   * ユニークなIDを生成
   *
   * タイムスタンプ + ランダム文字列で一意性を担保
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
