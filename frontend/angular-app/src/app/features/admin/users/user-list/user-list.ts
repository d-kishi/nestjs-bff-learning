/**
 * UserListComponent
 *
 * ユーザー管理画面
 *
 * 機能:
 * - ユーザー一覧表示（ページネーション対応）
 * - 検索・ステータスフィルター
 * - ロール編集ダイアログ
 * - ユーザーステータス変更（有効/無効化）
 * - ADMIN権限必須
 */
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, UserFilter } from '../users.service';
import { User } from '../../../../core/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { RoleEditDialogComponent } from '../role-edit-dialog/role-edit-dialog';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    PaginationComponent,
    RoleEditDialogComponent,
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserListComponent implements OnInit {
  /** UsersServiceをDI */
  readonly usersService = inject(UsersService);

  /** 検索キーワード */
  readonly searchKeyword = signal<string>('');

  /** ステータスフィルター（空文字=全て, active, inactive） */
  readonly statusFilter = signal<string>('');

  /** ダイアログ開閉状態 */
  readonly isDialogOpen = signal<boolean>(false);

  /** 編集中のユーザー */
  readonly editingUser = signal<User | null>(null);

  /** 検索デバウンス用タイマー */
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * 初期化
   */
  ngOnInit(): void {
    this.usersService.loadUsers();
    this.usersService.loadAvailableRoles();
  }

  /**
   * 検索入力変更時（デバウンス付き）
   */
  onSearchChange(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => {
      this.onFilterChange();
    }, 300);
  }

  /**
   * フィルター変更時
   */
  onFilterChange(): void {
    const filter: UserFilter = {};

    const keyword = this.searchKeyword().trim();
    if (keyword) {
      filter.search = keyword;
    }

    const status = this.statusFilter();
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    this.usersService.loadUsers(filter);
  }

  /**
   * ページ変更
   */
  onPageChange(page: number): void {
    const filter: UserFilter = { page };

    const keyword = this.searchKeyword().trim();
    if (keyword) {
      filter.search = keyword;
    }

    const status = this.statusFilter();
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    this.usersService.loadUsers(filter);
  }

  /**
   * ロール編集ダイアログを開く
   */
  openRoleEditDialog(user: User): void {
    this.editingUser.set(user);
    this.isDialogOpen.set(true);
  }

  /**
   * ダイアログを閉じる
   */
  closeDialog(): void {
    this.isDialogOpen.set(false);
    this.editingUser.set(null);
  }

  /**
   * ロール保存
   */
  onSaveRoles(roleIds: number[]): void {
    const user = this.editingUser();
    if (!user) return;

    this.usersService.updateUserRoles(user.id, roleIds).subscribe({
      next: () => {
        this.closeDialog();
      },
      error: (error) => {
        console.error('ロール更新に失敗しました', error);
      },
    });
  }

  /**
   * ステータス切り替え
   */
  onToggleStatus(user: User): void {
    this.usersService.updateUserStatus(user.id, !user.isActive).subscribe({
      error: (error) => {
        console.error('ステータス更新に失敗しました', error);
      },
    });
  }
}
