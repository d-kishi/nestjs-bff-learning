/**
 * RoleDialogComponent テスト
 *
 * ADMIN機能: ロール作成/編集ダイアログの単体テスト
 * - 作成モード
 * - 編集モード
 * - バリデーション
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleDialogComponent } from './role-dialog';
import { Role } from '../../../../core/models';

describe('RoleDialogComponent', () => {
  let component: RoleDialogComponent;
  let fixture: ComponentFixture<RoleDialogComponent>;

  /** テスト用モックロール */
  const mockRole: Role = {
    id: 3,
    name: 'VIEWER',
    description: '閲覧のみ',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleDialogComponent);
    component = fixture.componentInstance;
  });

  describe('初期化', () => {
    it('コンポーネントが作成される', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('作成モード', () => {
    it('タイトルが「ロール作成」になる', () => {
      fixture.componentRef.setInput('mode', 'create');
      fixture.componentRef.setInput('role', null);
      fixture.detectChanges();

      const title = fixture.nativeElement.querySelector('.role-dialog__title');
      expect(title.textContent).toContain('ロール作成');
    });

    it('フォームが空の状態で表示される', () => {
      fixture.componentRef.setInput('mode', 'create');
      fixture.componentRef.setInput('role', null);
      fixture.detectChanges();

      expect(component.name()).toBe('');
      expect(component.description()).toBe('');
    });

    it('保存ボタンが「作成」になる', () => {
      fixture.componentRef.setInput('mode', 'create');
      fixture.componentRef.setInput('role', null);
      fixture.detectChanges();

      const saveBtn = fixture.nativeElement.querySelector('.role-dialog__save-btn');
      expect(saveBtn.textContent).toContain('作成');
    });
  });

  describe('編集モード', () => {
    it('タイトルが「ロール編集」になる', () => {
      fixture.componentRef.setInput('mode', 'edit');
      fixture.componentRef.setInput('role', mockRole);
      fixture.detectChanges();

      const title = fixture.nativeElement.querySelector('.role-dialog__title');
      expect(title.textContent).toContain('ロール編集');
    });

    it('既存のロール情報がフォームに設定される', () => {
      fixture.componentRef.setInput('mode', 'edit');
      fixture.componentRef.setInput('role', mockRole);
      fixture.detectChanges();

      expect(component.name()).toBe('VIEWER');
      expect(component.description()).toBe('閲覧のみ');
    });

    it('保存ボタンが「保存」になる', () => {
      fixture.componentRef.setInput('mode', 'edit');
      fixture.componentRef.setInput('role', mockRole);
      fixture.detectChanges();

      const saveBtn = fixture.nativeElement.querySelector('.role-dialog__save-btn');
      expect(saveBtn.textContent).toContain('保存');
    });
  });

  describe('バリデーション', () => {
    it('ロール名が空の場合はエラー', () => {
      fixture.componentRef.setInput('mode', 'create');
      fixture.componentRef.setInput('role', null);
      fixture.detectChanges();

      component.name.set('');
      component.onSubmit();

      expect(component.errorMessage()).toBe('ロール名は必須です');
    });

    it('ロール名に無効な文字が含まれる場合はエラー', () => {
      fixture.componentRef.setInput('mode', 'create');
      fixture.componentRef.setInput('role', null);
      fixture.detectChanges();

      component.name.set('invalid-name');
      component.onSubmit();

      expect(component.errorMessage()).toContain('大文字英字とアンダースコアのみ');
    });

    it('有効なロール名で保存できる', () => {
      fixture.componentRef.setInput('mode', 'create');
      fixture.componentRef.setInput('role', null);
      fixture.detectChanges();

      const saveSpy = vi.fn();
      component.save.subscribe(saveSpy);

      component.name.set('VALID_ROLE');
      component.description.set('説明文');
      component.onSubmit();

      expect(saveSpy).toHaveBeenCalledWith({
        name: 'VALID_ROLE',
        description: '説明文',
      });
    });
  });

  describe('キャンセル', () => {
    it('キャンセルボタンでcancelイベントが発火', () => {
      fixture.componentRef.setInput('mode', 'create');
      fixture.componentRef.setInput('role', null);
      fixture.detectChanges();

      const cancelSpy = vi.fn();
      component.cancel.subscribe(cancelSpy);

      const cancelBtn = fixture.nativeElement.querySelector('.role-dialog__cancel-btn');
      cancelBtn.click();

      expect(cancelSpy).toHaveBeenCalled();
    });

    it('オーバーレイクリックでcancelイベントが発火', () => {
      fixture.componentRef.setInput('mode', 'create');
      fixture.componentRef.setInput('role', null);
      fixture.detectChanges();

      const cancelSpy = vi.fn();
      component.cancel.subscribe(cancelSpy);

      const overlay = fixture.nativeElement.querySelector('.role-dialog__overlay');
      overlay.click();

      expect(cancelSpy).toHaveBeenCalled();
    });
  });

  describe('アクセシビリティ', () => {
    it('ダイアログにrole="dialog"とaria-modal="true"がある', () => {
      fixture.componentRef.setInput('mode', 'create');
      fixture.componentRef.setInput('role', null);
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector('.role-dialog__content');
      expect(dialog.getAttribute('role')).toBe('dialog');
      expect(dialog.getAttribute('aria-modal')).toBe('true');
    });

    it('aria-labelledbyでタイトルを参照している', () => {
      fixture.componentRef.setInput('mode', 'create');
      fixture.componentRef.setInput('role', null);
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector('.role-dialog__content');
      const titleId = dialog.getAttribute('aria-labelledby');
      const title = fixture.nativeElement.querySelector(`#${titleId}`);
      expect(title).toBeTruthy();
    });
  });
});
