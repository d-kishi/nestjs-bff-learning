/**
 * RoleDialogComponent
 *
 * ロール作成/編集ダイアログ
 *
 * 機能:
 * - 作成モード: 新規ロール作成フォーム
 * - 編集モード: 既存ロール編集フォーム
 * - バリデーション（ロール名必須、形式チェック）
 * - オーバーレイクリックで閉じる
 */
import { Component, input, output, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Role } from '../../../../core/models';
import { CreateRoleRequest, UpdateRoleRequest } from '../roles.service';

/** ロール名の有効パターン: 大文字英字とアンダースコアのみ */
const ROLE_NAME_PATTERN = /^[A-Z][A-Z_]*$/;

@Component({
  selector: 'app-role-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './role-dialog.html',
  styleUrl: './role-dialog.scss',
})
export class RoleDialogComponent {
  /** ダイアログモード（作成 or 編集） */
  readonly mode = input.required<'create' | 'edit'>();

  /** 編集対象のロール（編集モード時） */
  readonly role = input.required<Role | null>();

  /** 保存イベント */
  readonly save = output<CreateRoleRequest | UpdateRoleRequest>();

  /** キャンセルイベント */
  readonly cancel = output<void>();

  /** ロール名入力値 */
  readonly name = signal<string>('');

  /** 説明入力値 */
  readonly description = signal<string>('');

  /** エラーメッセージ */
  readonly errorMessage = signal<string>('');

  constructor() {
    /**
     * ロールが変更されたらフォームを初期化
     */
    effect(() => {
      const currentRole = this.role();
      if (currentRole) {
        this.name.set(currentRole.name);
        this.description.set(currentRole.description || '');
      } else {
        this.resetForm();
      }
    });
  }

  /**
   * フォームをリセット
   */
  private resetForm(): void {
    this.name.set('');
    this.description.set('');
    this.errorMessage.set('');
  }

  /**
   * フォーム送信
   */
  onSubmit(): void {
    const nameValue = this.name().trim();

    // バリデーション: ロール名必須
    if (!nameValue) {
      this.errorMessage.set('ロール名は必須です');
      return;
    }

    // バリデーション: ロール名形式
    if (!ROLE_NAME_PATTERN.test(nameValue)) {
      this.errorMessage.set('ロール名は大文字英字とアンダースコアのみ使用可能です');
      return;
    }

    this.errorMessage.set('');

    const request: CreateRoleRequest | UpdateRoleRequest = {
      name: nameValue,
      description: this.description().trim() || undefined,
    };

    this.save.emit(request);
  }

  /**
   * キャンセル処理
   */
  onCancel(): void {
    this.cancel.emit();
  }
}
