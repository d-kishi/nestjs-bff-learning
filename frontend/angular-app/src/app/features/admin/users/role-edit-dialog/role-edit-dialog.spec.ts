/**
 * RoleEditDialogComponent テスト
 *
 * ADMIN機能: ユーザーロール編集ダイアログの単体テスト
 * - ロール選択（チェックボックス）
 * - 保存・キャンセル操作
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleEditDialogComponent } from './role-edit-dialog';
import { User, Role } from '../../../../core/models';

describe('RoleEditDialogComponent', () => {
  let component: RoleEditDialogComponent;
  let fixture: ComponentFixture<RoleEditDialogComponent>;

  /** テスト用モックロール */
  const mockRoles: Role[] = [
    { id: 1, name: 'ADMIN', description: '管理者' },
    { id: 2, name: 'MEMBER', description: '一般メンバー' },
    { id: 3, name: 'VIEWER', description: '閲覧のみ' },
  ];

  /** テスト用モックユーザー */
  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    profile: { displayName: 'テストユーザー', bio: null, avatarUrl: null },
    roles: [mockRoles[1]], // MEMBER only
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleEditDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleEditDialogComponent);
    component = fixture.componentInstance;
  });

  describe('初期化', () => {
    it('コンポーネントが作成される', () => {
      expect(component).toBeTruthy();
    });

    it('ユーザーの現在のロールがチェック済みになる', () => {
      fixture.componentRef.setInput('user', mockUser);
      fixture.componentRef.setInput('availableRoles', mockRoles);
      fixture.detectChanges();

      const checkboxes = fixture.nativeElement.querySelectorAll(
        'input[type="checkbox"]'
      ) as NodeListOf<HTMLInputElement>;

      // ADMINはチェックなし
      expect(checkboxes[0].checked).toBe(false);
      // MEMBERはチェック済み
      expect(checkboxes[1].checked).toBe(true);
      // VIEWERはチェックなし
      expect(checkboxes[2].checked).toBe(false);
    });
  });

  describe('表示', () => {
    it('ダイアログタイトルにユーザー名が表示される', () => {
      fixture.componentRef.setInput('user', mockUser);
      fixture.componentRef.setInput('availableRoles', mockRoles);
      fixture.detectChanges();

      const title = fixture.nativeElement.querySelector('.role-edit-dialog__title');
      expect(title.textContent).toContain('テストユーザー');
    });

    it('利用可能な全ロールが表示される', () => {
      fixture.componentRef.setInput('user', mockUser);
      fixture.componentRef.setInput('availableRoles', mockRoles);
      fixture.detectChanges();

      const roleItems = fixture.nativeElement.querySelectorAll('.role-edit-dialog__role');
      expect(roleItems.length).toBe(3);
    });

    it('ロール名と説明が表示される', () => {
      fixture.componentRef.setInput('user', mockUser);
      fixture.componentRef.setInput('availableRoles', mockRoles);
      fixture.detectChanges();

      const roleItem = fixture.nativeElement.querySelector('.role-edit-dialog__role');
      expect(roleItem.textContent).toContain('ADMIN');
      expect(roleItem.textContent).toContain('管理者');
    });
  });

  describe('ロール選択', () => {
    it('チェックボックスでロールを追加できる', () => {
      fixture.componentRef.setInput('user', mockUser);
      fixture.componentRef.setInput('availableRoles', mockRoles);
      fixture.detectChanges();

      const adminCheckbox = fixture.nativeElement.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;

      // ADMINをチェック
      adminCheckbox.click();
      fixture.detectChanges();

      expect(component.selectedRoleIds()).toContain(1);
      expect(component.selectedRoleIds()).toContain(2);
    });

    it('チェックボックスでロールを削除できる', () => {
      fixture.componentRef.setInput('user', mockUser);
      fixture.componentRef.setInput('availableRoles', mockRoles);
      fixture.detectChanges();

      const checkboxes = fixture.nativeElement.querySelectorAll(
        'input[type="checkbox"]'
      ) as NodeListOf<HTMLInputElement>;

      // MEMBERのチェックを外す
      checkboxes[1].click();
      fixture.detectChanges();

      expect(component.selectedRoleIds()).not.toContain(2);
    });
  });

  describe('保存', () => {
    it('保存ボタンでsaveイベントが発火される', () => {
      fixture.componentRef.setInput('user', mockUser);
      fixture.componentRef.setInput('availableRoles', mockRoles);
      fixture.detectChanges();

      const saveSpy = vi.fn();
      component.save.subscribe(saveSpy);

      const saveButton = fixture.nativeElement.querySelector('.role-edit-dialog__save-btn');
      saveButton.click();

      expect(saveSpy).toHaveBeenCalledWith([2]); // 現在のロール（MEMBER）
    });

    it('ロール変更後に保存すると新しいロールIDが送信される', () => {
      fixture.componentRef.setInput('user', mockUser);
      fixture.componentRef.setInput('availableRoles', mockRoles);
      fixture.detectChanges();

      // ADMINを追加
      component.toggleRole(1);
      fixture.detectChanges();

      const saveSpy = vi.fn();
      component.save.subscribe(saveSpy);

      const saveButton = fixture.nativeElement.querySelector('.role-edit-dialog__save-btn');
      saveButton.click();

      expect(saveSpy).toHaveBeenCalledWith([2, 1]); // MEMBER + ADMIN
    });

    it('ロールが0件の場合は保存ボタンが無効', () => {
      fixture.componentRef.setInput('user', mockUser);
      fixture.componentRef.setInput('availableRoles', mockRoles);
      fixture.detectChanges();

      // MEMBERのチェックを外す
      component.toggleRole(2);
      fixture.detectChanges();

      const saveButton = fixture.nativeElement.querySelector(
        '.role-edit-dialog__save-btn'
      ) as HTMLButtonElement;
      expect(saveButton.disabled).toBe(true);
    });
  });

  describe('キャンセル', () => {
    it('キャンセルボタンでcancelイベントが発火される', () => {
      fixture.componentRef.setInput('user', mockUser);
      fixture.componentRef.setInput('availableRoles', mockRoles);
      fixture.detectChanges();

      const cancelSpy = vi.fn();
      component.cancel.subscribe(cancelSpy);

      const cancelButton = fixture.nativeElement.querySelector('.role-edit-dialog__cancel-btn');
      cancelButton.click();

      expect(cancelSpy).toHaveBeenCalled();
    });

    it('オーバーレイクリックでcancelイベントが発火される', () => {
      fixture.componentRef.setInput('user', mockUser);
      fixture.componentRef.setInput('availableRoles', mockRoles);
      fixture.detectChanges();

      const cancelSpy = vi.fn();
      component.cancel.subscribe(cancelSpy);

      const overlay = fixture.nativeElement.querySelector('.role-edit-dialog__overlay');
      overlay.click();

      expect(cancelSpy).toHaveBeenCalled();
    });
  });

  describe('アクセシビリティ', () => {
    it('ダイアログにrole="dialog"とaria-modal="true"がある', () => {
      fixture.componentRef.setInput('user', mockUser);
      fixture.componentRef.setInput('availableRoles', mockRoles);
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector('.role-edit-dialog__content');
      expect(dialog.getAttribute('role')).toBe('dialog');
      expect(dialog.getAttribute('aria-modal')).toBe('true');
    });

    it('aria-labelledbyでタイトルを参照している', () => {
      fixture.componentRef.setInput('user', mockUser);
      fixture.componentRef.setInput('availableRoles', mockRoles);
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector('.role-edit-dialog__content');
      const titleId = dialog.getAttribute('aria-labelledby');
      const title = fixture.nativeElement.querySelector(`#${titleId}`);
      expect(title).toBeTruthy();
    });
  });
});
