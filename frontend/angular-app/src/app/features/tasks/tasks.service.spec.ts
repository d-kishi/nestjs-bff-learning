/**
 * TasksService テスト
 *
 * タスクCRUD操作のテスト
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
import { TasksService } from './tasks.service';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../../core/models';

describe('TasksService', () => {
  let service: TasksService;
  let httpMock: HttpTestingController;

  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'A test task',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '2024-12-31',
    projectId: 1,
    projectName: 'Test Project',
    assigneeId: 1,
    assigneeName: 'User A',
    creatorId: 1,
    creatorName: 'User A',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockTasks: Task[] = [
    mockTask,
    {
      ...mockTask,
      id: 2,
      title: 'Second Task',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TasksService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(TasksService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('初期状態', () => {
    it('タスク一覧が空であること', () => {
      expect(service.tasks()).toEqual([]);
    });

    it('ローディング状態がfalseであること', () => {
      expect(service.isLoading()).toBe(false);
    });

    it('エラー状態がnullであること', () => {
      expect(service.error()).toBeNull();
    });
  });

  describe('loadTasks()', () => {
    it('タスク一覧を取得できること', () => {
      service.loadTasks();

      const req = httpMock.expectOne('/api/tasks');
      expect(req.request.method).toBe('GET');

      req.flush({
        data: mockTasks,
        meta: { total: 2, page: 1, limit: 20, timestamp: new Date().toISOString() },
      });

      expect(service.tasks()).toEqual(mockTasks);
      expect(service.isLoading()).toBe(false);
    });

    it('フィルターパラメータが正しく送信されること', () => {
      service.loadTasks({
        projectId: 1,
        status: 'TODO',
        priority: 'HIGH',
        sortBy: 'dueDate',
        sortOrder: 'asc',
        page: 2,
        limit: 10,
      });

      const req = httpMock.expectOne((r) => {
        return (
          r.url === '/api/tasks' &&
          r.params.get('projectId') === '1' &&
          r.params.get('status') === 'TODO' &&
          r.params.get('priority') === 'HIGH' &&
          r.params.get('sortBy') === 'dueDate' &&
          r.params.get('sortOrder') === 'asc' &&
          r.params.get('page') === '2' &&
          r.params.get('limit') === '10'
        );
      });

      req.flush({
        data: mockTasks,
        meta: { total: 2, page: 2, limit: 10, timestamp: new Date().toISOString() },
      });
    });

    it('エラー時にエラー状態が設定されること', () => {
      service.loadTasks();

      const req = httpMock.expectOne('/api/tasks');
      req.error(new ProgressEvent('error'));

      expect(service.error()).not.toBeNull();
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('getTask()', () => {
    it('タスク詳細を取得できること', () => {
      let result: Task | undefined;
      service.getTask(1).subscribe((task) => {
        result = task;
      });

      const req = httpMock.expectOne('/api/tasks/1');
      expect(req.request.method).toBe('GET');

      req.flush({ data: mockTask, meta: { timestamp: new Date().toISOString() } });

      expect(result).toEqual(mockTask);
    });
  });

  describe('createTask()', () => {
    const createRequest: CreateTaskRequest = {
      title: 'New Task',
      description: 'New task description',
      projectId: 1,
      priority: 'HIGH',
    };

    it('タスクを作成できること', () => {
      let result: Task | undefined;
      service.createTask(createRequest).subscribe((task) => {
        result = task;
      });

      const req = httpMock.expectOne('/api/tasks');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);

      req.flush({
        data: { ...mockTask, ...createRequest },
        meta: { timestamp: new Date().toISOString() },
      });

      expect(result).toBeTruthy();
      expect(result?.title).toBe('New Task');
    });

    it('作成後にタスク一覧が更新されること', () => {
      // まず一覧を読み込む
      service.loadTasks();
      const loadReq = httpMock.expectOne('/api/tasks');
      loadReq.flush({
        data: mockTasks,
        meta: { total: 2, page: 1, limit: 20, timestamp: new Date().toISOString() },
      });

      expect(service.tasks().length).toBe(2);

      // タスクを作成
      const newTask: Task = {
        ...mockTask,
        id: 3,
        title: 'New Task',
      };

      service.createTask(createRequest).subscribe();

      const createReq = httpMock.expectOne('/api/tasks');
      createReq.flush({ data: newTask, meta: { timestamp: new Date().toISOString() } });

      // 一覧に追加されていること
      expect(service.tasks().length).toBe(3);
    });
  });

  describe('updateTask()', () => {
    const updateRequest: UpdateTaskRequest = {
      title: 'Updated Task',
      status: 'DONE',
    };

    it('タスクを更新できること', () => {
      // まず一覧を読み込む
      service.loadTasks();
      const loadReq = httpMock.expectOne('/api/tasks');
      loadReq.flush({
        data: mockTasks,
        meta: { total: 2, page: 1, limit: 20, timestamp: new Date().toISOString() },
      });

      let result: Task | undefined;
      service.updateTask(1, updateRequest).subscribe((task) => {
        result = task;
      });

      const req = httpMock.expectOne('/api/tasks/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);

      const updatedTask = { ...mockTask, ...updateRequest };
      req.flush({ data: updatedTask, meta: { timestamp: new Date().toISOString() } });

      expect(result?.title).toBe('Updated Task');
      expect(result?.status).toBe('DONE');
    });

    it('更新後に一覧内のタスクも更新されること', () => {
      // まず一覧を読み込む
      service.loadTasks();
      const loadReq = httpMock.expectOne('/api/tasks');
      loadReq.flush({
        data: mockTasks,
        meta: { total: 2, page: 1, limit: 20, timestamp: new Date().toISOString() },
      });

      service.updateTask(1, updateRequest).subscribe();

      const req = httpMock.expectOne('/api/tasks/1');
      const updatedTask = { ...mockTask, ...updateRequest };
      req.flush({ data: updatedTask, meta: { timestamp: new Date().toISOString() } });

      const taskInList = service.tasks().find((t) => t.id === 1);
      expect(taskInList?.status).toBe('DONE');
    });
  });

  describe('updateStatus()', () => {
    it('インラインでステータスを更新できること', () => {
      // まず一覧を読み込む
      service.loadTasks();
      const loadReq = httpMock.expectOne('/api/tasks');
      loadReq.flush({
        data: mockTasks,
        meta: { total: 2, page: 1, limit: 20, timestamp: new Date().toISOString() },
      });

      service.updateStatus(1, 'DONE').subscribe();

      const req = httpMock.expectOne('/api/tasks/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ status: 'DONE' });

      const updatedTask = { ...mockTask, status: 'DONE' };
      req.flush({ data: updatedTask, meta: { timestamp: new Date().toISOString() } });

      const taskInList = service.tasks().find((t) => t.id === 1);
      expect(taskInList?.status).toBe('DONE');
    });
  });

  describe('deleteTask()', () => {
    it('タスクを削除できること', () => {
      // まず一覧を読み込む
      service.loadTasks();
      const loadReq = httpMock.expectOne('/api/tasks');
      loadReq.flush({
        data: mockTasks,
        meta: { total: 2, page: 1, limit: 20, timestamp: new Date().toISOString() },
      });

      expect(service.tasks().length).toBe(2);

      service.deleteTask(1).subscribe();

      const req = httpMock.expectOne('/api/tasks/1');
      expect(req.request.method).toBe('DELETE');

      req.flush(null, { status: 204, statusText: 'No Content' });

      // 一覧から削除されていること
      expect(service.tasks().length).toBe(1);
      expect(service.tasks().find((t) => t.id === 1)).toBeFalsy();
    });
  });

  describe('ページネーション', () => {
    it('総件数が取得できること', () => {
      service.loadTasks();

      const req = httpMock.expectOne('/api/tasks');
      req.flush({
        data: mockTasks,
        meta: { total: 50, page: 1, limit: 20, timestamp: new Date().toISOString() },
      });

      expect(service.totalCount()).toBe(50);
    });

    it('総ページ数が計算されること', () => {
      service.loadTasks();

      const req = httpMock.expectOne('/api/tasks');
      req.flush({
        data: mockTasks,
        meta: { total: 45, page: 1, limit: 20, timestamp: new Date().toISOString() },
      });

      expect(service.totalPages()).toBe(3); // ceil(45/20) = 3
    });
  });
});
