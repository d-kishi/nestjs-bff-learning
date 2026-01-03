/**
 * ProfileComponent
 *
 * ユーザープロフィール画面
 *
 * 機能:
 * - プロフィール表示
 * - プロフィール編集
 * - パスワード変更
 */
import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProfileService } from './profile.service';
import { ToastService } from '../../shared/services/toast.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, LoadingSpinnerComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit {
  protected readonly profileService = inject(ProfileService);
  private readonly toastService = inject(ToastService);

  /** 編集モード */
  readonly isEditing = signal<boolean>(false);

  /** パスワード変更ダイアログ表示状態 */
  readonly isPasswordDialogOpen = signal<boolean>(false);

  /** 編集中の表示名 */
  readonly editDisplayName = signal<string>('');

  /** 編集中の自己紹介 */
  readonly editBio = signal<string>('');

  /** 現在のパスワード */
  readonly currentPassword = signal<string>('');

  /** 新しいパスワード */
  readonly newPassword = signal<string>('');

  /** 確認パスワード */
  readonly confirmPassword = signal<string>('');

  /** パスワードエラー */
  readonly passwordError = signal<string>('');

  constructor() {
    /**
     * プロフィールが変更されたら編集フォームを初期化
     * 編集モード中は上書きしない
     */
    effect(() => {
      const user = this.profileService.profile();
      const editing = this.isEditing();
      if (user && !editing) {
        this.editDisplayName.set(user.profile.displayName || '');
        this.editBio.set(user.profile.bio || '');
      }
    });
  }

  ngOnInit(): void {
    this.profileService.loadProfile();
  }

  /**
   * 編集モードを開始
   */
  startEditing(): void {
    this.isEditing.set(true);
  }

  /**
   * 編集をキャンセル
   */
  cancelEditing(): void {
    const user = this.profileService.profile();
    if (user) {
      this.editDisplayName.set(user.profile.displayName || '');
      this.editBio.set(user.profile.bio || '');
    }
    this.isEditing.set(false);
  }

  /**
   * プロフィールを保存
   */
  saveProfile(): void {
    this.profileService
      .updateProfile({
        displayName: this.editDisplayName().trim() || undefined,
        bio: this.editBio().trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.toastService.success('プロフィールを更新しました');
          this.isEditing.set(false);
        },
        error: () => {
          this.toastService.error('プロフィールの更新に失敗しました');
        },
      });
  }

  /**
   * パスワード変更ダイアログを開く
   */
  openPasswordDialog(): void {
    this.currentPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.passwordError.set('');
    this.isPasswordDialogOpen.set(true);
  }

  /**
   * パスワード変更ダイアログを閉じる
   */
  closePasswordDialog(): void {
    this.isPasswordDialogOpen.set(false);
  }

  /**
   * パスワードを変更
   */
  changePassword(): void {
    // バリデーション
    if (!this.currentPassword() || !this.newPassword() || !this.confirmPassword()) {
      this.passwordError.set('すべての項目を入力してください');
      return;
    }

    if (this.newPassword() !== this.confirmPassword()) {
      this.passwordError.set('新しいパスワードが一致しません');
      return;
    }

    if (this.newPassword().length < 8) {
      this.passwordError.set('パスワードは8文字以上で入力してください');
      return;
    }

    this.passwordError.set('');

    this.profileService
      .changePassword({
        currentPassword: this.currentPassword(),
        newPassword: this.newPassword(),
        confirmPassword: this.confirmPassword(),
      })
      .subscribe({
        next: () => {
          this.toastService.success('パスワードを変更しました');
          this.closePasswordDialog();
        },
        error: () => {
          this.toastService.error('パスワードの変更に失敗しました');
        },
      });
  }
}
