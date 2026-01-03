/**
 * ログインコンポーネント
 *
 * ログイン・新規登録の両機能をタブ切り替えで提供
 *
 * 機能:
 * - ログインフォーム（メール・パスワード）
 * - 新規登録フォーム（メール・パスワード・表示名）
 * - バリデーション（Reactive Forms）
 * - エラーメッセージ表示
 */
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

/** タブの種類 */
type TabType = 'login' | 'register';

/**
 * パスワード確認バリデータ
 *
 * パスワードと確認用パスワードが一致するかチェック
 */
const passwordMatchValidator = (control: AbstractControl) => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  return null;
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  /** アクティブなタブ */
  readonly activeTab = signal<TabType>('login');

  /** エラーメッセージ */
  readonly errorMessage = signal<string>('');

  /** ローディング状態 */
  readonly isLoading = signal(false);

  /**
   * ログインフォーム
   */
  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  /**
   * 新規登録フォーム
   */
  readonly registerForm = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      displayName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
    },
    { validators: passwordMatchValidator }
  );

  /**
   * タブを切り替える
   */
  switchTab(tab: TabType): void {
    this.activeTab.set(tab);
    this.errorMessage.set('');
  }

  /**
   * ログイン処理
   */
  onLogin(): void {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    if (!email || !password) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(email, password).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(this.extractErrorMessage(error));
      },
    });
  }

  /**
   * 新規登録処理
   */
  onRegister(): void {
    if (this.registerForm.invalid) return;

    const { email, password, displayName } = this.registerForm.value;
    if (!email || !password || !displayName) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.register(email, password, displayName).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(this.extractErrorMessage(error));
      },
    });
  }

  /**
   * エラーレスポンスからメッセージを抽出
   */
  private extractErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.error?.message) {
      return error.error.error.message;
    }
    if (error.status === 401) {
      return 'メールアドレスまたはパスワードが正しくありません';
    }
    if (error.status === 409) {
      return 'このメールアドレスは既に登録されています';
    }
    return 'エラーが発生しました。しばらくしてからお試しください。';
  }
}
