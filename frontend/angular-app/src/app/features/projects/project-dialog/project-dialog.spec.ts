/**
 * ProjectDialogComponent テスト
 *
 * プロジェクト作成/編集ダイアログのテスト
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ProjectDialogComponent } from './project-dialog';
import { Project } from '../../../core/models';

describe('ProjectDialogComponent', () => {
  let component: ProjectDialogComponent;
  let fixture: ComponentFixture<ProjectDialogComponent>;

  const mockProject: Project = {
    id: 1,
    name: 'Test Project',
    description: 'Test description',
    ownerId: 1,
    ownerName: 'Test User',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDialogComponent);
    component = fixture.componentInstance;
  });

  describe('新規作成モード', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('mode', 'create');
      fixture.componentRef.setInput('project', null);
      fixture.detectChanges();
    });

    it('コンポーネントが作成されること', () => {
      expect(component).toBeTruthy();
    });

    it('タイトルが「新規プロジェクト」であること', () => {
      const title = fixture.nativeElement.querySelector('.project-dialog__title');
      expect(title.textContent).toContain('新規プロジェクト');
    });

    it('フォームが空であること', () => {
      const nameInput = fixture.nativeElement.querySelector('input[name="name"]');
      const descInput = fixture.nativeElement.querySelector('textarea[name="description"]');

      expect(nameInput.value).toBe('');
      expect(descInput.value).toBe('');
    });

    it('名前が空の場合、保存ボタンが無効であること', () => {
      const saveBtn = fixture.nativeElement.querySelector('.project-dialog__save-btn');
      expect(saveBtn.disabled).toBe(true);
    });

    it('名前を入力すると保存ボタンが有効になること', () => {
      const nameInput = fixture.nativeElement.querySelector('input[name="name"]');
      nameInput.value = 'New Project';
      nameInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const saveBtn = fixture.nativeElement.querySelector('.project-dialog__save-btn');
      expect(saveBtn.disabled).toBe(false);
    });

    it('保存ボタンをクリックするとsaveイベントが発火すること', () => {
      const saveSpy = vi.fn();
      component.save.subscribe(saveSpy);

      const nameInput = fixture.nativeElement.querySelector('input[name="name"]');
      nameInput.value = 'New Project';
      nameInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const saveBtn = fixture.nativeElement.querySelector('.project-dialog__save-btn');
      saveBtn.click();

      // description が空の場合は undefined を送信
      expect(saveSpy).toHaveBeenCalledWith({
        name: 'New Project',
        description: undefined,
      });
    });

    it('キャンセルボタンをクリックするとcancelイベントが発火すること', () => {
      const cancelSpy = vi.fn();
      component.cancel.subscribe(cancelSpy);

      const cancelBtn = fixture.nativeElement.querySelector('.project-dialog__cancel-btn');
      cancelBtn.click();

      expect(cancelSpy).toHaveBeenCalled();
    });
  });

  describe('編集モード', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('mode', 'edit');
      fixture.componentRef.setInput('project', mockProject);
      fixture.detectChanges();
    });

    it('タイトルが「プロジェクト編集」であること', () => {
      const title = fixture.nativeElement.querySelector('.project-dialog__title');
      expect(title.textContent).toContain('プロジェクト編集');
    });

    it('フォームにプロジェクト情報が入力されていること', () => {
      const nameInput = fixture.nativeElement.querySelector('input[name="name"]');
      const descInput = fixture.nativeElement.querySelector('textarea[name="description"]');

      expect(nameInput.value).toBe('Test Project');
      expect(descInput.value).toBe('Test description');
    });

    it('保存ボタンをクリックすると更新データが送信されること', () => {
      const saveSpy = vi.fn();
      component.save.subscribe(saveSpy);

      const nameInput = fixture.nativeElement.querySelector('input[name="name"]');
      nameInput.value = 'Updated Project';
      nameInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const saveBtn = fixture.nativeElement.querySelector('.project-dialog__save-btn');
      saveBtn.click();

      expect(saveSpy).toHaveBeenCalledWith({
        name: 'Updated Project',
        description: 'Test description',
      });
    });
  });

  describe('オーバーレイ', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('mode', 'create');
      fixture.componentRef.setInput('project', null);
      fixture.detectChanges();
    });

    it('オーバーレイをクリックするとcancelイベントが発火すること', () => {
      const cancelSpy = vi.fn();
      component.cancel.subscribe(cancelSpy);

      const overlay = fixture.nativeElement.querySelector('.project-dialog__overlay');
      overlay.click();

      expect(cancelSpy).toHaveBeenCalled();
    });

    it('ダイアログ内をクリックしてもcancelイベントが発火しないこと', () => {
      const cancelSpy = vi.fn();
      component.cancel.subscribe(cancelSpy);

      const content = fixture.nativeElement.querySelector('.project-dialog__content');
      content.click();

      expect(cancelSpy).not.toHaveBeenCalled();
    });
  });
});
