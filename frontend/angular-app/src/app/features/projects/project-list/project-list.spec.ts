/**
 * ProjectListComponent テスト
 *
 * プロジェクト一覧画面の表示・操作をテスト
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ProjectListComponent } from './project-list';
import { ProjectsService } from '../projects.service';
import { ToastService } from '../../../shared/services/toast.service';
import { Project } from '../../../core/models';

describe('ProjectListComponent', () => {
  let component: ProjectListComponent;
  let fixture: ComponentFixture<ProjectListComponent>;
  let projectsServiceMock: Partial<ProjectsService>;
  let toastServiceMock: Partial<ToastService>;
  let projectsSignal: ReturnType<typeof signal<Project[]>>;
  let isLoadingSignal: ReturnType<typeof signal<boolean>>;
  let errorSignal: ReturnType<typeof signal<string | null>>;
  let selectedProjectSignal: ReturnType<typeof signal<Project | null>>;
  let totalPagesSignal: ReturnType<typeof signal<number>>;
  let currentPageSignal: ReturnType<typeof signal<number>>;

  const mockProjects: Project[] = [
    {
      id: 1,
      name: 'Project Alpha',
      description: 'First project',
      ownerId: 1,
      ownerName: 'User A',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Project Beta',
      description: null,
      ownerId: 2,
      ownerName: 'User B',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    projectsSignal = signal<Project[]>([]);
    isLoadingSignal = signal<boolean>(false);
    errorSignal = signal<string | null>(null);
    selectedProjectSignal = signal<Project | null>(null);
    totalPagesSignal = signal<number>(1);
    currentPageSignal = signal<number>(1);

    projectsServiceMock = {
      projects: projectsSignal.asReadonly(),
      isLoading: isLoadingSignal.asReadonly(),
      error: errorSignal.asReadonly(),
      selectedProject: selectedProjectSignal.asReadonly(),
      totalPages: totalPagesSignal.asReadonly(),
      currentPage: currentPageSignal.asReadonly(),
      loadProjects: vi.fn(),
      createProject: vi.fn(),
      updateProject: vi.fn(),
      deleteProject: vi.fn(),
      selectProject: vi.fn(),
    };

    toastServiceMock = {
      success: vi.fn(),
      error: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProjectListComponent],
      providers: [
        { provide: ProjectsService, useValue: projectsServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('コンポーネントが作成されること', () => {
    expect(component).toBeTruthy();
  });

  describe('初期化', () => {
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

    it('ローディング完了後にスピナーが非表示になること', () => {
      isLoadingSignal.set(false);
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('app-loading-spinner');
      expect(spinner).toBeFalsy();
    });
  });

  describe('プロジェクト一覧表示', () => {
    beforeEach(() => {
      projectsSignal.set(mockProjects);
      fixture.detectChanges();
    });

    it('プロジェクト一覧が表示されること', () => {
      const projectCards = fixture.nativeElement.querySelectorAll('.project-card');
      expect(projectCards.length).toBe(2);
    });

    it('プロジェクト名が表示されること', () => {
      const projectNames = fixture.nativeElement.querySelectorAll('.project-card__name');
      expect(projectNames[0].textContent).toContain('Project Alpha');
      expect(projectNames[1].textContent).toContain('Project Beta');
    });

    it('プロジェクト説明が表示されること', () => {
      const descriptions = fixture.nativeElement.querySelectorAll('.project-card__description');
      expect(descriptions[0].textContent).toContain('First project');
    });

    it('オーナー名が表示されること', () => {
      const owners = fixture.nativeElement.querySelectorAll('.project-card__owner');
      expect(owners[0].textContent).toContain('User A');
    });
  });

  describe('新規作成ダイアログ', () => {
    it('新規作成ボタンをクリックするとダイアログが開くこと', () => {
      const createBtn = fixture.nativeElement.querySelector('.project-list__create-btn');
      createBtn.click();
      fixture.detectChanges();

      expect(component.isDialogOpen()).toBe(true);
    });

    it('ダイアログのモードが新規作成であること', () => {
      const createBtn = fixture.nativeElement.querySelector('.project-list__create-btn');
      createBtn.click();
      fixture.detectChanges();

      expect(component.dialogMode()).toBe('create');
    });
  });

  describe('編集ダイアログ', () => {
    beforeEach(() => {
      projectsSignal.set(mockProjects);
      fixture.detectChanges();
    });

    it('編集ボタンをクリックするとダイアログが開くこと', () => {
      const editBtn = fixture.nativeElement.querySelector('.project-card__edit-btn');
      editBtn.click();
      fixture.detectChanges();

      expect(component.isDialogOpen()).toBe(true);
    });

    it('ダイアログのモードが編集であること', () => {
      const editBtn = fixture.nativeElement.querySelector('.project-card__edit-btn');
      editBtn.click();
      fixture.detectChanges();

      expect(component.dialogMode()).toBe('edit');
    });

    it('編集対象のプロジェクトが設定されること', () => {
      const editBtn = fixture.nativeElement.querySelector('.project-card__edit-btn');
      editBtn.click();
      fixture.detectChanges();

      expect(component.editingProject()).toEqual(mockProjects[0]);
    });
  });

  describe('削除確認ダイアログ', () => {
    beforeEach(() => {
      projectsSignal.set(mockProjects);
      fixture.detectChanges();
    });

    it('削除ボタンをクリックすると確認ダイアログが開くこと', () => {
      const deleteBtn = fixture.nativeElement.querySelector('.project-card__delete-btn');
      deleteBtn.click();
      fixture.detectChanges();

      expect(component.isConfirmDialogOpen()).toBe(true);
    });

    it('削除対象のプロジェクトが設定されること', () => {
      const deleteBtn = fixture.nativeElement.querySelector('.project-card__delete-btn');
      deleteBtn.click();
      fixture.detectChanges();

      expect(component.deletingProject()).toEqual(mockProjects[0]);
    });
  });

  describe('空の状態', () => {
    it('プロジェクトがない場合にメッセージが表示されること', () => {
      projectsSignal.set([]);
      fixture.detectChanges();

      const emptyMessage = fixture.nativeElement.querySelector('.project-list__empty');
      expect(emptyMessage).toBeTruthy();
      expect(emptyMessage.textContent).toContain('プロジェクトがありません');
    });
  });

  describe('エラー表示', () => {
    it('エラー時にエラーメッセージが表示されること', () => {
      errorSignal.set('取得に失敗しました');
      fixture.detectChanges();

      const errorMessage = fixture.nativeElement.querySelector('.project-list__error');
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.textContent).toContain('取得に失敗しました');
    });
  });

  describe('ページネーション', () => {
    it('ページネーションが表示されること', () => {
      projectsSignal.set(mockProjects);
      totalPagesSignal.set(3);
      fixture.detectChanges();

      const pagination = fixture.nativeElement.querySelector('app-pagination');
      expect(pagination).toBeTruthy();
    });

    it('ページ変更時にloadProjects()が呼ばれること', () => {
      projectsSignal.set(mockProjects);
      totalPagesSignal.set(3);
      fixture.detectChanges();

      component.onPageChange(2);

      expect(projectsServiceMock.loadProjects).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });
  });
});
