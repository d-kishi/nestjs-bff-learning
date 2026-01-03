/**
 * DashboardComponent テスト
 *
 * ダッシュボード画面の表示をテスト
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { DashboardComponent } from './dashboard';
import { DashboardService } from './dashboard.service';
import { DashboardResponse } from '../../core/models/dashboard.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dashboardServiceMock: Partial<DashboardService>;
  let dashboardSignal: ReturnType<typeof signal<DashboardResponse | null>>;
  let isLoadingSignal: ReturnType<typeof signal<boolean>>;
  let errorSignal: ReturnType<typeof signal<string | null>>;
  let hasPartialErrorSignal: ReturnType<typeof signal<boolean>>;
  let partialErrorsSignal: ReturnType<typeof signal<string[]>>;

  const mockDashboard: DashboardResponse = {
    user: {
      id: 1,
      email: 'test@example.com',
      profile: {
        displayName: 'Test User',
        avatarUrl: null,
      },
    },
    taskSummary: {
      total: 45,
      todo: 12,
      inProgress: 5,
      done: 28,
    },
    projectSummary: {
      total: 5,
      owned: 3,
    },
    recentTasks: [
      {
        id: 1,
        title: '機能Aの実装',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: '2026-01-20',
        projectId: 1,
        projectName: 'プロジェクト1',
      },
      {
        id: 2,
        title: 'バグ修正',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: null,
        projectId: 2,
        projectName: 'プロジェクト2',
      },
    ],
  };

  beforeEach(async () => {
    dashboardSignal = signal<DashboardResponse | null>(null);
    isLoadingSignal = signal<boolean>(false);
    errorSignal = signal<string | null>(null);
    hasPartialErrorSignal = signal<boolean>(false);
    partialErrorsSignal = signal<string[]>([]);

    dashboardServiceMock = {
      dashboard: dashboardSignal.asReadonly(),
      isLoading: isLoadingSignal.asReadonly(),
      error: errorSignal.asReadonly(),
      hasPartialError: hasPartialErrorSignal.asReadonly(),
      partialErrors: partialErrorsSignal.asReadonly(),
      loadDashboard: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [{ provide: DashboardService, useValue: dashboardServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('コンポーネントが作成されること', () => {
    expect(component).toBeTruthy();
  });

  it('初期化時にloadDashboard()が呼ばれること', () => {
    expect(dashboardServiceMock.loadDashboard).toHaveBeenCalled();
  });

  describe('ローディング状態', () => {
    it('ローディング中はスピナーが表示されること', () => {
      isLoadingSignal.set(true);
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('app-loading-spinner');
      expect(spinner).toBeTruthy();
    });

    it('ローディング完了後はスピナーが非表示になること', () => {
      isLoadingSignal.set(false);
      dashboardSignal.set(mockDashboard);
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('app-loading-spinner');
      expect(spinner).toBeFalsy();
    });
  });

  describe('エラー状態', () => {
    it('エラー時はエラーメッセージが表示されること', () => {
      errorSignal.set('データの取得に失敗しました');
      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('.dashboard__error');
      expect(error).toBeTruthy();
      expect(error.textContent).toContain('データの取得に失敗しました');
    });
  });

  describe('ユーザー情報表示', () => {
    beforeEach(() => {
      dashboardSignal.set(mockDashboard);
      fixture.detectChanges();
    });

    it('ユーザー名が表示されること', () => {
      const welcome = fixture.nativeElement.querySelector('.dashboard__welcome');
      expect(welcome.textContent).toContain('Test User');
    });
  });

  describe('タスクサマリー表示', () => {
    beforeEach(() => {
      dashboardSignal.set(mockDashboard);
      fixture.detectChanges();
    });

    it('TODO件数が表示されること', () => {
      const todo = fixture.nativeElement.querySelector('[data-testid="task-todo"]');
      expect(todo.textContent).toContain('12');
    });

    it('IN_PROGRESS件数が表示されること', () => {
      const inProgress = fixture.nativeElement.querySelector('[data-testid="task-in-progress"]');
      expect(inProgress.textContent).toContain('5');
    });

    it('DONE件数が表示されること', () => {
      const done = fixture.nativeElement.querySelector('[data-testid="task-done"]');
      expect(done.textContent).toContain('28');
    });
  });

  describe('プロジェクトサマリー表示', () => {
    beforeEach(() => {
      dashboardSignal.set(mockDashboard);
      fixture.detectChanges();
    });

    it('総プロジェクト数が表示されること', () => {
      const total = fixture.nativeElement.querySelector('[data-testid="project-total"]');
      expect(total.textContent).toContain('5');
    });

    it('所有プロジェクト数が表示されること', () => {
      const owned = fixture.nativeElement.querySelector('[data-testid="project-owned"]');
      expect(owned.textContent).toContain('3');
    });
  });

  describe('直近タスク表示', () => {
    beforeEach(() => {
      dashboardSignal.set(mockDashboard);
      fixture.detectChanges();
    });

    it('タスク一覧が表示されること', () => {
      const tasks = fixture.nativeElement.querySelectorAll('.dashboard__task-row');
      expect(tasks.length).toBe(2);
    });

    it('タスクタイトルが表示されること', () => {
      const taskTitle = fixture.nativeElement.querySelector('.dashboard__task-title');
      expect(taskTitle.textContent).toContain('機能Aの実装');
    });

    it('プロジェクト名が表示されること', () => {
      const projectName = fixture.nativeElement.querySelector('.dashboard__task-project');
      expect(projectName.textContent).toContain('プロジェクト1');
    });

    it('期限日が表示されること', () => {
      const dueDate = fixture.nativeElement.querySelector('.dashboard__task-due');
      expect(dueDate.textContent).toContain('2026-01-20');
    });

    it('期限日がnullの場合は"-"が表示されること', () => {
      const dueDates = fixture.nativeElement.querySelectorAll('.dashboard__task-due');
      expect(dueDates[1].textContent).toContain('-');
    });
  });

  describe('部分失敗表示', () => {
    it('部分失敗がある場合、警告が表示されること', () => {
      dashboardSignal.set(mockDashboard);
      hasPartialErrorSignal.set(true);
      partialErrorsSignal.set(['user-service unavailable']);
      fixture.detectChanges();

      const warning = fixture.nativeElement.querySelector('.dashboard__partial-error');
      expect(warning).toBeTruthy();
      expect(warning.textContent).toContain('user-service unavailable');
    });

    it('部分失敗がない場合、警告が表示されないこと', () => {
      dashboardSignal.set(mockDashboard);
      hasPartialErrorSignal.set(false);
      fixture.detectChanges();

      const warning = fixture.nativeElement.querySelector('.dashboard__partial-error');
      expect(warning).toBeFalsy();
    });
  });
});
