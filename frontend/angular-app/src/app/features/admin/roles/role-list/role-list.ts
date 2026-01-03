/**
 * RoleListComponent
 *
 * ロール管理画面
 *
 * 機能:
 * - ロール一覧表示
 * - ロールCRUD（作成・編集・削除）
 * - システムロール（ADMIN, MEMBER）は削除不可
 * - ADMIN権限必須
 */
import { Component, inject, signal, OnInit } from '@angular/core';
import { RolesService, CreateRoleRequest, UpdateRoleRequest } from '../roles.service';
import { Role } from '../../../../core/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { RoleDialogComponent } from '../role-dialog/role-dialog';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [LoadingSpinnerComponent, ConfirmDialogComponent, RoleDialogComponent],
  templateUrl: './role-list.html',
  styleUrl: './role-list.scss',
})
export class RoleListComponent implements OnInit {
  /** RolesServiceをDI */
  readonly rolesService = inject(RolesService);

  /** ダイアログ開閉状態 */
  readonly isDialogOpen = signal<boolean>(false);

  /** ダイアログモード（作成 or 編集） */
  readonly dialogMode = signal<'create' | 'edit'>('create');

  /** 編集中のロール */
  readonly editingRole = signal<Role | null>(null);

  /** 確認ダイアログ開閉状態 */
  readonly isConfirmDialogOpen = signal<boolean>(false);

  /** 削除対象のロール */
  readonly deletingRole = signal<Role | null>(null);

  /**
   * 初期化
   */
  ngOnInit(): void {
    this.rolesService.loadRoles();
  }

  /**
   * 新規作成ダイアログを開く
   */
  openCreateDialog(): void {
    this.dialogMode.set('create');
    this.editingRole.set(null);
    this.isDialogOpen.set(true);
  }

  /**
   * 編集ダイアログを開く
   */
  openEditDialog(role: Role): void {
    this.dialogMode.set('edit');
    this.editingRole.set(role);
    this.isDialogOpen.set(true);
  }

  /**
   * ダイアログを閉じる
   */
  closeDialog(): void {
    this.isDialogOpen.set(false);
    this.editingRole.set(null);
  }

  /**
   * ロール保存
   */
  onSave(data: CreateRoleRequest | UpdateRoleRequest): void {
    if (this.dialogMode() === 'create') {
      this.rolesService.createRole(data as CreateRoleRequest).subscribe({
        next: () => {
          this.closeDialog();
        },
        error: (error) => {
          console.error('ロール作成に失敗しました', error);
        },
      });
    } else {
      const role = this.editingRole();
      if (!role) return;

      this.rolesService.updateRole(role.id, data as UpdateRoleRequest).subscribe({
        next: () => {
          this.closeDialog();
        },
        error: (error) => {
          console.error('ロール更新に失敗しました', error);
        },
      });
    }
  }

  /**
   * 削除確認ダイアログを開く
   */
  openDeleteConfirm(role: Role): void {
    this.deletingRole.set(role);
    this.isConfirmDialogOpen.set(true);
  }

  /**
   * 削除確認ダイアログを閉じる
   */
  closeDeleteConfirm(): void {
    this.isConfirmDialogOpen.set(false);
    this.deletingRole.set(null);
  }

  /**
   * ロール削除実行
   */
  onConfirmDelete(): void {
    const role = this.deletingRole();
    if (!role) return;

    this.rolesService.deleteRole(role.id).subscribe({
      next: () => {
        this.closeDeleteConfirm();
      },
      error: (error) => {
        console.error('ロール削除に失敗しました', error);
      },
    });
  }
}
