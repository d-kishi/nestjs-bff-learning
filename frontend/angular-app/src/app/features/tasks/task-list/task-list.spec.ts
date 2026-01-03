/**
 * TaskListComponent テスト
 *
 * タスク一覧画面の表示・操作をテスト
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { TaskListComponent } from './task-list';
import { TasksService } from '../tasks.service';
import { ProjectsService } from '../../projects/projects.service';
import { ToastService } from '../../../shared/services/toast.service';
import { Task, Project } from '../../../core/models';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let tasksServiceMock: Partial<TasksService>;
  let projectsServiceMock: Partial<ProjectsService>;
  let toastServiceMock: Partial<ToastService>;
  let tasksSignal: ReturnType<typeof signal<Task[]>>;
  let isLoadingSignal: ReturnType<typeof signal<boolean>>;
  let errorSignal: ReturnType<typeof signal<string | null>>;
  let totalPagesSignal: ReturnType<typeof signal<number>>;
  let currentPageSignal: ReturnType<typeof signal<number>>;
  let projectsSignal: ReturnType<typeof signal<Project[]>>;

  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'Task Alpha',
      description: 'First task',
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
    },
    {
      id: 2,
      title: 'Task Beta',
      description: null,
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      dueDate: null,
      projectId: 1,
      projectName: 'Project A',
      assigneeId: null,
      assigneeName: null,
      creatorId: 1,
      creatorName: 'User A',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  const mockProjects: Project[] = [
    {
      id: 1,
      name: 'Project A',
      description: null,
      ownerId: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    tasksSignal = signal<Task[]>([]);
    isLoadingSignal = signal<boolean>(false);
    errorSignal = signal<string | null>(null);
    totalPagesSignal = signal<number>(1);
    currentPageSignal = signal<number>(1);
    projectsSignal = signal<Project[]>([]);

    tasksServiceMock = {
      tasks: tasksSignal.asReadonly(),
      isLoading: isLoadingSignal.asReadonly(),
      error: errorSignal.asReadonly(),
      totalPages: totalPagesSignal.asReadonly(),
      currentPage: currentPageSignal.asReadonly(),
      loadTasks: vi.fn(),
      createTask: vi.fn().mockReturnValue(of(mockTasks[0])),
      updateTask: vi.fn().mockReturnValue(of(mockTasks[0])),
      updateStatus: vi.fn().mockReturnValue(of(mockTasks[0])),
      deleteTask: vi.fn().mockReturnValue(of(undefined)),
    };

    projectsServiceMock = {
      projects: projectsSignal.asReadonly(),
      loadProjects: vi.fn(),
    };

    toastServiceMock = {
      success: vi.fn(),
      error: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [TaskListComponent],
      providers: [
        { provide: TasksService, useValue: tasksServiceMock },
        { provide: ProjectsService, useValue: projectsServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('コンポーネントが作成されること', () => {
    expect(component).toBeTruthy();
  });

  describe('初期化', () => {
    it('初期化時にloadTasks()が呼ばれること', () => {
      expect(tasksServiceMock.loadTasks).toHaveBeenCalled();
    });

    it('初期化時にloadProjects()が呼ばれること', () => {
      expect(projectsServiceMock.loadProjects).toHaveBeenCalled();
    });
  });

  describe('ローディング表示', () => {
    it('ローディング中にスピナーが表示されること', () => {
      isLoadingSignal.set(true);
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('app-loading-spinner');
      expect(spinner).toBeTruthy();
    });
  });

  describe('タスク一覧表示', () => {
    beforeEach(() => {
      tasksSignal.set(mockTasks);
      fixture.detectChanges();
    });

    it('タスク一覧が表示されること', () => {
      const taskRows = fixture.nativeElement.querySelectorAll('.task-row');
      expect(taskRows.length).toBe(2);
    });

    it('タスクタイトルが表示されること', () => {
      const titles = fixture.nativeElement.querySelectorAll('.task-row__title');
      expect(titles[0].textContent).toContain('Task Alpha');
      expect(titles[1].textContent).toContain('Task Beta');
    });

    it('ステータスバッジが表示されること', () => {
      const badges = fixture.nativeElement.querySelectorAll('.task-row__status');
      expect(badges[0].textContent).toContain('TODO');
      expect(badges[1].textContent).toContain('IN_PROGRESS');
    });

    it('優先度バッジが表示されること', () => {
      const badges = fixture.nativeElement.querySelectorAll('.task-row__priority');
      expect(badges[0].textContent).toContain('HIGH');
      expect(badges[1].textContent).toContain('MEDIUM');
    });
  });

  describe('フィルター', () => {
    beforeEach(() => {
      projectsSignal.set(mockProjects);
      fixture.detectChanges();
    });

    it('ステータスフィルターが変更時にloadTasks()が呼ばれること', () => {
      component.onFilterChange();

      expect(tasksServiceMock.loadTasks).toHaveBeenCalled();
    });

    it('プロジェクトフィルターが表示されること', () => {
      const projectFilter = fixture.nativeElement.querySelector('select[name="projectFilter"]');
      expect(projectFilter).toBeTruthy();
    });
  });

  describe('ソート', () => {
    it('ソート変更時にloadTasks()が呼ばれること', () => {
      component.sortBy.set('dueDate');
      component.onSortChange();

      expect(tasksServiceMock.loadTasks).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: 'dueDate' })
      );
    });
  });

  describe('新規作成ダイアログ', () => {
    it('新規作成ボタンをクリックするとダイアログが開くこと', () => {
      const createBtn = fixture.nativeElement.querySelector('.task-list__create-btn');
      createBtn.click();
      fixture.detectChanges();

      expect(component.isDialogOpen()).toBe(true);
    });
  });

  describe('インラインステータス変更', () => {
    beforeEach(() => {
      tasksSignal.set(mockTasks);
      fixture.detectChanges();
    });

    it('ステータス変更時にupdateStatus()が呼ばれること', () => {
      component.onStatusChange(1, 'DONE');

      expect(tasksServiceMock.updateStatus).toHaveBeenCalledWith(1, 'DONE');
    });
  });

  describe('削除確認ダイアログ', () => {
    beforeEach(() => {
      tasksSignal.set(mockTasks);
      fixture.detectChanges();
    });

    it('削除ボタンをクリックすると確認ダイアログが開くこと', () => {
      const deleteBtn = fixture.nativeElement.querySelector('.task-row__delete-btn');
      deleteBtn.click();
      fixture.detectChanges();

      expect(component.isConfirmDialogOpen()).toBe(true);
    });
  });

  describe('空の状態', () => {
    it('タスクがない場合にメッセージが表示されること', () => {
      tasksSignal.set([]);
      fixture.detectChanges();

      const emptyMessage = fixture.nativeElement.querySelector('.task-list__empty');
      expect(emptyMessage).toBeTruthy();
      expect(emptyMessage.textContent).toContain('タスクがありません');
    });
  });

  describe('ページネーション', () => {
    it('ページネーションが表示されること', () => {
      tasksSignal.set(mockTasks);
      totalPagesSignal.set(3);
      fixture.detectChanges();

      const pagination = fixture.nativeElement.querySelector('app-pagination');
      expect(pagination).toBeTruthy();
    });

    it('ページ変更時にloadTasks()が呼ばれること', () => {
      tasksSignal.set(mockTasks);
      totalPagesSignal.set(3);
      fixture.detectChanges();

      component.onPageChange(2);

      expect(tasksServiceMock.loadTasks).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });
  });
});
