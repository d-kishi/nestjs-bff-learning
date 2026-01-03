/**
 * RoleListComponent テスト
 *
 * ADMIN機能: ロール管理画面の単体テスト
 * - ロール一覧表示
 * - ロールCRUD（作成・編集・削除）
 * - システムロール削除不可
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { RoleListComponent } from './role-list';
import { RolesService } from '../roles.service';
import { Role } from '../../../../core/models';

describe('RoleListComponent', () => {
  let component: RoleListComponent;
  let fixture: ComponentFixture<RoleListComponent>;
  let rolesServiceMock: {
    roles: ReturnType<typeof signal<Role[]>>;
    isLoading: ReturnType<typeof signal<boolean>>;
    error: ReturnType<typeof signal<string | null>>;
    loadRoles: ReturnType<typeof vi.fn>;
    createRole: ReturnType<typeof vi.fn>;
    updateRole: ReturnType<typeof vi.fn>;
    deleteRole: ReturnType<typeof vi.fn>;
    isSystemRole: ReturnType<typeof vi.fn>;
  };

  /** テスト用モックロール */
  const mockRoles: Role[] = [
    { id: 1, name: 'ADMIN', description: '管理者' },
    { id: 2, name: 'MEMBER', description: '一般メンバー' },
    { id: 3, name: 'VIEWER', description: '閲覧のみ' },
  ];

  beforeEach(async () => {
    rolesServiceMock = {
      roles: signal<Role[]>([]),
      isLoading: signal(false),
      error: signal<string | null>(null),
      loadRoles: vi.fn(),
      createRole: vi.fn().mockReturnValue(of(mockRoles[2])),
      updateRole: vi.fn().mockReturnValue(of(mockRoles[2])),
      deleteRole: vi.fn().mockReturnValue(of(undefined)),
      isSystemRole: vi.fn((role: Role) => ['ADMIN', 'MEMBER'].includes(role.name)),
    };

    await TestBed.configureTestingModule({
      imports: [RoleListComponent],
      providers: [{ provide: RolesService, useValue: rolesServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleListComponent);
    component = fixture.componentInstance;
  });

  describe('初期化', () => {
    it('コンポーネントが作成される', () => {
      expect(component).toBeTruthy();
    });

    it('初期化時にloadRolesが呼ばれる', () => {
      fixture.detectChanges();

      expect(rolesServiceMock.loadRoles).toHaveBeenCalled();
    });
  });

  describe('ロール一覧表示', () => {
    it('ロール一覧が表示される', () => {
      rolesServiceMock.roles.set(mockRoles);
      fixture.detectChanges();

      const rows = fixture.nativeElement.querySelectorAll('.role-row');
      expect(rows.length).toBe(3);
    });

    it('ロール情報が正しく表示される', () => {
      rolesServiceMock.roles.set([mockRoles[0]]);
      fixture.detectChanges();

      const row = fixture.nativeElement.querySelector('.role-row');
      expect(row.textContent).toContain('ADMIN');
      expect(row.textContent).toContain('管理者');
    });

    it('ロールがない場合は空メッセージを表示', () => {
      rolesServiceMock.roles.set([]);
      fixture.detectChanges();

      const emptyMessage = fixture.nativeElement.querySelector('.role-list__empty');
      expect(emptyMessage).toBeTruthy();
      expect(emptyMessage.textContent).toContain('ロールがありません');
    });
  });

  describe('ローディング状態', () => {
    it('ローディング中はスピナーを表示', () => {
      rolesServiceMock.isLoading.set(true);
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('app-loading-spinner');
      expect(spinner).toBeTruthy();
    });
  });

  describe('エラー状態', () => {
    it('エラー時はエラーメッセージを表示', () => {
      rolesServiceMock.error.set('サーバーエラー');
      fixture.detectChanges();

      const errorMessage = fixture.nativeElement.querySelector('.role-list__error');
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.textContent).toContain('サーバーエラー');
    });

    it('再試行ボタンでloadRolesを再呼び出し', () => {
      rolesServiceMock.error.set('エラー');
      fixture.detectChanges();

      const retryButton = fixture.nativeElement.querySelector('.role-list__retry-btn');
      retryButton.click();

      expect(rolesServiceMock.loadRoles).toHaveBeenCalledTimes(2);
    });
  });

  describe('ロール作成', () => {
    it('新規作成ボタンでダイアログを開く', () => {
      fixture.detectChanges();

      const createButton = fixture.nativeElement.querySelector('.role-list__create-btn');
      createButton.click();
      fixture.detectChanges();

      expect(component.isDialogOpen()).toBe(true);
      expect(component.dialogMode()).toBe('create');
    });

    it('保存でcreateRoleを呼び出す', () => {
      fixture.detectChanges();
      component.openCreateDialog();
      fixture.detectChanges();

      component.onSave({ name: 'NEW_ROLE', description: '新しいロール' });

      expect(rolesServiceMock.createRole).toHaveBeenCalledWith({
        name: 'NEW_ROLE',
        description: '新しいロール',
      });
    });
  });

  describe('ロール編集', () => {
    it('編集ボタンでダイアログを開く', () => {
      rolesServiceMock.roles.set(mockRoles);
      fixture.detectChanges();

      const editButtons = fixture.nativeElement.querySelectorAll('.role-row__edit-btn');
      editButtons[2].click(); // VIEWER（非システムロール）
      fixture.detectChanges();

      expect(component.isDialogOpen()).toBe(true);
      expect(component.dialogMode()).toBe('edit');
      expect(component.editingRole()).toEqual(mockRoles[2]);
    });

    it('保存でupdateRoleを呼び出す', () => {
      rolesServiceMock.roles.set(mockRoles);
      fixture.detectChanges();

      component.openEditDialog(mockRoles[2]);
      fixture.detectChanges();

      component.onSave({ name: 'VIEWER', description: '更新された説明' });

      expect(rolesServiceMock.updateRole).toHaveBeenCalledWith(3, {
        name: 'VIEWER',
        description: '更新された説明',
      });
    });
  });

  describe('ロール削除', () => {
    it('削除ボタンで確認ダイアログを開く', () => {
      rolesServiceMock.roles.set(mockRoles);
      fixture.detectChanges();

      const deleteButtons = fixture.nativeElement.querySelectorAll('.role-row__delete-btn');
      deleteButtons[0].click(); // VIEWER
      fixture.detectChanges();

      expect(component.isConfirmDialogOpen()).toBe(true);
      expect(component.deletingRole()).toEqual(mockRoles[2]);
    });

    it('削除確認でdeleteRoleを呼び出す', () => {
      rolesServiceMock.roles.set(mockRoles);
      fixture.detectChanges();

      component.openDeleteConfirm(mockRoles[2]);
      fixture.detectChanges();

      component.onConfirmDelete();

      expect(rolesServiceMock.deleteRole).toHaveBeenCalledWith(3);
    });
  });

  describe('システムロール', () => {
    it('システムロールは削除ボタンが無効', () => {
      rolesServiceMock.roles.set(mockRoles);
      fixture.detectChanges();

      // ADMINとMEMBERには削除ボタンがない
      const rows = fixture.nativeElement.querySelectorAll('.role-row');
      const adminRow = rows[0];
      const deleteBtn = adminRow.querySelector('.role-row__delete-btn');
      expect(deleteBtn).toBeFalsy();
    });

    it('非システムロールは削除ボタンが有効', () => {
      rolesServiceMock.roles.set(mockRoles);
      fixture.detectChanges();

      const rows = fixture.nativeElement.querySelectorAll('.role-row');
      const viewerRow = rows[2];
      const deleteBtn = viewerRow.querySelector('.role-row__delete-btn');
      expect(deleteBtn).toBeTruthy();
    });

    it('システムロールにはバッジが表示される', () => {
      rolesServiceMock.roles.set(mockRoles);
      fixture.detectChanges();

      const rows = fixture.nativeElement.querySelectorAll('.role-row');
      const adminRow = rows[0];
      const badge = adminRow.querySelector('.role-row__system-badge');
      expect(badge).toBeTruthy();
    });
  });
});
