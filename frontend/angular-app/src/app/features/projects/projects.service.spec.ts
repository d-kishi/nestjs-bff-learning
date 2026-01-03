/**
 * ProjectsService テスト
 *
 * プロジェクトCRUD操作のテスト
 */
import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ProjectsService } from './projects.service';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../../core/models';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let httpMock: HttpTestingController;

  const mockProject: Project = {
    id: 1,
    name: 'Test Project',
    description: 'A test project',
    ownerId: 1,
    ownerName: 'Test User',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockProjects: Project[] = [
    mockProject,
    {
      id: 2,
      name: 'Second Project',
      description: null,
      ownerId: 1,
      ownerName: 'Test User',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProjectsService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ProjectsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('初期状態', () => {
    it('プロジェクト一覧が空であること', () => {
      expect(service.projects()).toEqual([]);
    });

    it('ローディング状態がfalseであること', () => {
      expect(service.isLoading()).toBe(false);
    });

    it('エラー状態がnullであること', () => {
      expect(service.error()).toBeNull();
    });

    it('選択中プロジェクトがnullであること', () => {
      expect(service.selectedProject()).toBeNull();
    });
  });

  describe('loadProjects()', () => {
    it('プロジェクト一覧を取得できること', () => {
      service.loadProjects();

      const req = httpMock.expectOne('/api/projects');
      expect(req.request.method).toBe('GET');

      req.flush({
        data: mockProjects,
        meta: { total: 2, page: 1, limit: 20, timestamp: new Date().toISOString() },
      });

      expect(service.projects()).toEqual(mockProjects);
      expect(service.isLoading()).toBe(false);
    });

    it('ローディング状態が正しく管理されること', () => {
      expect(service.isLoading()).toBe(false);

      service.loadProjects();
      expect(service.isLoading()).toBe(true);

      const req = httpMock.expectOne('/api/projects');
      req.flush({
        data: mockProjects,
        meta: { total: 2, page: 1, limit: 20, timestamp: new Date().toISOString() },
      });

      expect(service.isLoading()).toBe(false);
    });

    it('エラー時にエラー状態が設定されること', () => {
      service.loadProjects();

      const req = httpMock.expectOne('/api/projects');
      req.error(new ProgressEvent('error'));

      expect(service.error()).not.toBeNull();
      expect(service.isLoading()).toBe(false);
    });

    it('フィルターパラメータが正しく送信されること', () => {
      service.loadProjects({ ownerOnly: true, search: 'test', page: 2, limit: 10 });

      const req = httpMock.expectOne(
        (r) =>
          r.url === '/api/projects' &&
          r.params.get('ownerOnly') === 'true' &&
          r.params.get('search') === 'test' &&
          r.params.get('page') === '2' &&
          r.params.get('limit') === '10'
      );

      req.flush({
        data: mockProjects,
        meta: { total: 2, page: 2, limit: 10, timestamp: new Date().toISOString() },
      });
    });
  });

  describe('getProject()', () => {
    it('プロジェクト詳細を取得できること', () => {
      let result: Project | undefined;
      service.getProject(1).subscribe((project) => {
        result = project;
      });

      const req = httpMock.expectOne('/api/projects/1');
      expect(req.request.method).toBe('GET');

      req.flush({ data: mockProject, meta: { timestamp: new Date().toISOString() } });

      expect(result).toEqual(mockProject);
    });
  });

  describe('createProject()', () => {
    const createRequest: CreateProjectRequest = {
      name: 'New Project',
      description: 'New project description',
    };

    it('プロジェクトを作成できること', () => {
      let result: Project | undefined;
      service.createProject(createRequest).subscribe((project) => {
        result = project;
      });

      const req = httpMock.expectOne('/api/projects');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);

      req.flush({ data: { ...mockProject, ...createRequest }, meta: { timestamp: new Date().toISOString() } });

      expect(result).toBeTruthy();
      expect(result?.name).toBe('New Project');
    });

    it('作成後にプロジェクト一覧が更新されること', () => {
      // まず一覧を読み込む
      service.loadProjects();
      const loadReq = httpMock.expectOne('/api/projects');
      loadReq.flush({
        data: mockProjects,
        meta: { total: 2, page: 1, limit: 20, timestamp: new Date().toISOString() },
      });

      expect(service.projects().length).toBe(2);

      // プロジェクトを作成
      const newProject: Project = {
        ...mockProject,
        id: 3,
        name: 'New Project',
      };

      service.createProject(createRequest).subscribe();

      const createReq = httpMock.expectOne('/api/projects');
      createReq.flush({ data: newProject, meta: { timestamp: new Date().toISOString() } });

      // 一覧に追加されていること
      expect(service.projects().length).toBe(3);
      expect(service.projects().find((p) => p.id === 3)).toBeTruthy();
    });
  });

  describe('updateProject()', () => {
    const updateRequest: UpdateProjectRequest = {
      name: 'Updated Project',
      description: 'Updated description',
    };

    it('プロジェクトを更新できること', () => {
      // まず一覧を読み込む
      service.loadProjects();
      const loadReq = httpMock.expectOne('/api/projects');
      loadReq.flush({
        data: mockProjects,
        meta: { total: 2, page: 1, limit: 20, timestamp: new Date().toISOString() },
      });

      let result: Project | undefined;
      service.updateProject(1, updateRequest).subscribe((project) => {
        result = project;
      });

      const req = httpMock.expectOne('/api/projects/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);

      const updatedProject = { ...mockProject, ...updateRequest };
      req.flush({ data: updatedProject, meta: { timestamp: new Date().toISOString() } });

      expect(result?.name).toBe('Updated Project');
    });

    it('更新後に一覧内のプロジェクトも更新されること', () => {
      // まず一覧を読み込む
      service.loadProjects();
      const loadReq = httpMock.expectOne('/api/projects');
      loadReq.flush({
        data: mockProjects,
        meta: { total: 2, page: 1, limit: 20, timestamp: new Date().toISOString() },
      });

      service.updateProject(1, updateRequest).subscribe();

      const req = httpMock.expectOne('/api/projects/1');
      const updatedProject = { ...mockProject, ...updateRequest };
      req.flush({ data: updatedProject, meta: { timestamp: new Date().toISOString() } });

      const projectInList = service.projects().find((p) => p.id === 1);
      expect(projectInList?.name).toBe('Updated Project');
    });
  });

  describe('deleteProject()', () => {
    it('プロジェクトを削除できること', () => {
      // まず一覧を読み込む
      service.loadProjects();
      const loadReq = httpMock.expectOne('/api/projects');
      loadReq.flush({
        data: mockProjects,
        meta: { total: 2, page: 1, limit: 20, timestamp: new Date().toISOString() },
      });

      expect(service.projects().length).toBe(2);

      service.deleteProject(1).subscribe();

      const req = httpMock.expectOne('/api/projects/1');
      expect(req.request.method).toBe('DELETE');

      req.flush(null, { status: 204, statusText: 'No Content' });

      // 一覧から削除されていること
      expect(service.projects().length).toBe(1);
      expect(service.projects().find((p) => p.id === 1)).toBeFalsy();
    });
  });

  describe('selectProject()', () => {
    it('プロジェクトを選択できること', () => {
      service.selectProject(mockProject);
      expect(service.selectedProject()).toEqual(mockProject);
    });

    it('選択を解除できること', () => {
      service.selectProject(mockProject);
      service.selectProject(null);
      expect(service.selectedProject()).toBeNull();
    });
  });

  describe('ページネーション', () => {
    it('総件数が取得できること', () => {
      service.loadProjects();

      const req = httpMock.expectOne('/api/projects');
      req.flush({
        data: mockProjects,
        meta: { total: 50, page: 1, limit: 20, timestamp: new Date().toISOString() },
      });

      expect(service.totalCount()).toBe(50);
    });

    it('現在のページが取得できること', () => {
      service.loadProjects({ page: 3 });

      const req = httpMock.expectOne((r) => r.url === '/api/projects');
      req.flush({
        data: mockProjects,
        meta: { total: 50, page: 3, limit: 20, timestamp: new Date().toISOString() },
      });

      expect(service.currentPage()).toBe(3);
    });

    it('総ページ数が計算されること', () => {
      service.loadProjects();

      const req = httpMock.expectOne('/api/projects');
      req.flush({
        data: mockProjects,
        meta: { total: 45, page: 1, limit: 20, timestamp: new Date().toISOString() },
      });

      expect(service.totalPages()).toBe(3); // ceil(45/20) = 3
    });
  });
});
