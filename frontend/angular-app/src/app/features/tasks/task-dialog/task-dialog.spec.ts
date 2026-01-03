/**
 * TaskDialogComponent テスト
 *
 * タスク作成・編集ダイアログの動作をテスト
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskDialogComponent } from './task-dialog';
import { Task, Project } from '../../../core/models';

describe('TaskDialogComponent', () => {
  let component: TaskDialogComponent;
  let fixture: ComponentFixture<TaskDialogComponent>;

  const mockProjects: Project[] = [
    {
      id: 1,
      name: 'Project A',
      description: null,
      ownerId: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Project B',
      description: 'Description B',
      ownerId: 1,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: '2024-12-31',
    projectId: 1,
    projectName: 'Project A',
    assigneeId: 1,
    assigneeName: 'User A',
    creatorId: 1,
    creatorName: 'User A',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  describe('作成モード', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TaskDialogComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(TaskDialogComponent);
      component = fixture.componentInstance;

      // 必須inputを設定
      fixture.componentRef.setInput('mode', 'create');
      fixture.componentRef.setInput('task', null);
      fixture.componentRef.setInput('projects', mockProjects);

      fixture.detectChanges();
    });

    it('コンポーネントが作成されること', () => {
      expect(component).toBeTruthy();
    });

    it('作成モードでタイトルが「タスク作成」になること', () => {
      const title = fixture.nativeElement.querySelector('.task-dialog__title');
      expect(title.textContent).toContain('タスク作成');
    });

    it('フォームが空の状態で表示されること', () => {
      const titleInput = fixture.nativeElement.querySelector('input[name="title"]');
      const descriptionInput = fixture.nativeElement.querySelector('textarea[name="description"]');

      expect(titleInput.value).toBe('');
      expect(descriptionInput.value).toBe('');
    });

    it('プロジェクト選択肢が表示されること', () => {
      const projectSelect = fixture.nativeElement.querySelector('select[name="projectId"]');
      const options = projectSelect.querySelectorAll('option');

      // 空オプション + プロジェクト数
      expect(options.length).toBe(3);
      expect(options[1].textContent).toContain('Project A');
      expect(options[2].textContent).toContain('Project B');
    });

    it('ステータス選択肢が表示されること', () => {
      const statusSelect = fixture.nativeElement.querySelector('select[name="status"]');
      const options = statusSelect.querySelectorAll('option');

      expect(options.length).toBe(3);
    });

    it('優先度選択肢が表示されること', () => {
      const prioritySelect = fixture.nativeElement.querySelector('select[name="priority"]');
      const options = prioritySelect.querySelectorAll('option');

      expect(options.length).toBe(3);
    });

    it('タイトル未入力でエラーが表示されること', () => {
      const submitBtn = fixture.nativeElement.querySelector('.task-dialog__submit-btn');
      submitBtn.click();
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('.task-dialog__error');
      expect(error).toBeTruthy();
      expect(error.textContent).toContain('タイトル');
    });

    it('プロジェクト未選択でエラーが表示されること', () => {
      // タイトルを入力
      component.title.set('Test Title');
      fixture.detectChanges();

      const submitBtn = fixture.nativeElement.querySelector('.task-dialog__submit-btn');
      submitBtn.click();
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('.task-dialog__error');
      expect(error).toBeTruthy();
      expect(error.textContent).toContain('プロジェクト');
    });

    it('有効なフォームでsaveイベントが発火すること', () => {
      const saveSpy = vi.fn();
      component.save.subscribe(saveSpy);

      // フォームを入力
      component.title.set('New Task');
      component.description.set('New Description');
      component.projectId.set(1);
      component.status.set('TODO');
      component.priority.set('MEDIUM');
      component.dueDate.set('2024-12-31');
      fixture.detectChanges();

      const submitBtn = fixture.nativeElement.querySelector('.task-dialog__submit-btn');
      submitBtn.click();
      fixture.detectChanges();

      expect(saveSpy).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'New Description',
        projectId: 1,
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '2024-12-31',
      });
    });

    it('キャンセルボタンでcancelイベントが発火すること', () => {
      const cancelSpy = vi.fn();
      component.cancel.subscribe(cancelSpy);

      const cancelBtn = fixture.nativeElement.querySelector('.task-dialog__cancel-btn');
      cancelBtn.click();

      expect(cancelSpy).toHaveBeenCalled();
    });
  });

  describe('編集モード', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TaskDialogComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(TaskDialogComponent);
      component = fixture.componentInstance;

      // 必須inputを設定
      fixture.componentRef.setInput('mode', 'edit');
      fixture.componentRef.setInput('task', mockTask);
      fixture.componentRef.setInput('projects', mockProjects);

      fixture.detectChanges();
    });

    it('編集モードでタイトルが「タスク編集」になること', () => {
      const title = fixture.nativeElement.querySelector('.task-dialog__title');
      expect(title.textContent).toContain('タスク編集');
    });

    it('タスクの値がフォームに設定されること', () => {
      const titleInput = fixture.nativeElement.querySelector('input[name="title"]');
      const descriptionInput = fixture.nativeElement.querySelector('textarea[name="description"]');

      expect(titleInput.value).toBe('Test Task');
      expect(descriptionInput.value).toBe('Test Description');
    });

    it('保存時にsaveイベントが発火すること', () => {
      const saveSpy = vi.fn();
      component.save.subscribe(saveSpy);

      // タイトルを変更
      component.title.set('Updated Task');
      fixture.detectChanges();

      const submitBtn = fixture.nativeElement.querySelector('.task-dialog__submit-btn');
      submitBtn.click();
      fixture.detectChanges();

      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Task',
        })
      );
    });
  });

  describe('オーバーレイクリック', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TaskDialogComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(TaskDialogComponent);
      component = fixture.componentInstance;

      fixture.componentRef.setInput('mode', 'create');
      fixture.componentRef.setInput('task', null);
      fixture.componentRef.setInput('projects', mockProjects);

      fixture.detectChanges();
    });

    it('オーバーレイクリックでcancelイベントが発火すること', () => {
      const cancelSpy = vi.fn();
      component.cancel.subscribe(cancelSpy);

      const overlay = fixture.nativeElement.querySelector('.task-dialog__overlay');
      overlay.click();

      expect(cancelSpy).toHaveBeenCalled();
    });

    it('ダイアログ内クリックではcancelイベントが発火しないこと', () => {
      const cancelSpy = vi.fn();
      component.cancel.subscribe(cancelSpy);

      const dialog = fixture.nativeElement.querySelector('.task-dialog__content');
      dialog.click();

      expect(cancelSpy).not.toHaveBeenCalled();
    });
  });
});
