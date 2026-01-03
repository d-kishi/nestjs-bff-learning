/**
 * RoleEditDialogComponent
 *
 * ユーザーロール編集ダイアログ
 *
 * 機能:
 * - チェックボックスでロール選択
 * - 保存時に選択されたロールIDを親に通知
 * - オーバーレイクリックでキャンセル
 */
import { Component, input, output, signal, effect } from '@angular/core';
import { User, Role } from '../../../../core/models';

@Component({
  selector: 'app-role-edit-dialog',
  standalone: true,
  imports: [],
  templateUrl: './role-edit-dialog.html',
  styleUrl: './role-edit-dialog.scss',
})
export class RoleEditDialogComponent {
  /** 編集対象のユーザー */
  readonly user = input.required<User | null>();

  /** 利用可能なロール一覧 */
  readonly availableRoles = input.required<Role[]>();

  /** 保存イベント（選択されたロールID一覧） */
  readonly save = output<number[]>();

  /** キャンセルイベント */
  readonly cancel = output<void>();

  /** 選択中のロールID一覧 */
  readonly selectedRoleIds = signal<number[]>([]);

  constructor() {
    /**
     * ユーザーが変更されたら選択状態を初期化
     */
    effect(() => {
      const currentUser = this.user();
      if (currentUser) {
        this.selectedRoleIds.set(currentUser.roles.map((r) => r.id));
      } else {
        this.selectedRoleIds.set([]);
      }
    });
  }

  /**
   * ロールが選択されているか
   */
  isRoleSelected(roleId: number): boolean {
    return this.selectedRoleIds().includes(roleId);
  }

  /**
   * ロール選択を切り替え
   */
  toggleRole(roleId: number): void {
    const current = this.selectedRoleIds();
    if (current.includes(roleId)) {
      this.selectedRoleIds.set(current.filter((id) => id !== roleId));
    } else {
      this.selectedRoleIds.set([...current, roleId]);
    }
  }

  /**
   * 保存処理
   */
  onSave(): void {
    if (this.selectedRoleIds().length > 0) {
      this.save.emit(this.selectedRoleIds());
    }
  }

  /**
   * キャンセル処理
   */
  onCancel(): void {
    this.cancel.emit();
  }
}
