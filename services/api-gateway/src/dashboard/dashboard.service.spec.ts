/**
 * DashboardServiceのテスト
 *
 * TDD Red Phase - US014対応
 */
import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { TaskServiceClient } from '../clients/task-service.client';
import { UserServiceClient } from '../clients/user-service.client';
import { UserFromJwt } from '../common/types';

describe('DashboardService', () => {
  let service: DashboardService;
  let taskServiceClient: jest.Mocked<TaskServiceClient>;
  let userServiceClient: jest.Mocked<UserServiceClient>;

  const mockUser: UserFromJwt = {
    id: 1,
    email: 'test@example.com',
    roles: ['MEMBER'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: TaskServiceClient,
          useValue: {
            getTasks: jest.fn(),
            getProjects: jest.fn(),
          },
        },
        {
          provide: UserServiceClient,
          useValue: {
            getUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    taskServiceClient = module.get(TaskServiceClient);
    userServiceClient = module.get(UserServiceClient);
  });

  describe('getDashboard - 正常系', () => {
    it('should aggregate data from all services when all succeed', async () => {
      const mockUserResponse = {
        data: {
          id: 1,
          email: 'test@example.com',
          profile: { displayName: 'Test User', avatarUrl: null },
        },
      };
      const mockTasksResponse = {
        data: [
          {
            id: 1,
            title: 'Task 1',
            status: 'TODO',
            priority: 'HIGH',
            dueDate: null,
            projectId: 1,
            project: { name: 'Project A' },
            updatedAt: '2025-01-15T10:00:00Z',
          },
          {
            id: 2,
            title: 'Task 2',
            status: 'IN_PROGRESS',
            priority: 'MEDIUM',
            dueDate: null,
            projectId: 1,
            project: { name: 'Project A' },
            updatedAt: '2025-01-14T10:00:00Z',
          },
          {
            id: 3,
            title: 'Task 3',
            status: 'DONE',
            priority: 'LOW',
            dueDate: null,
            projectId: 2,
            project: { name: 'Project B' },
            updatedAt: '2025-01-13T10:00:00Z',
          },
        ],
        meta: { total: 3 },
      };
      const mockProjectsResponse = {
        data: [
          { id: 1, name: 'Project A', ownerId: 1 },
          { id: 2, name: 'Project B', ownerId: 1 },
        ],
        meta: { total: 2 },
      };

      userServiceClient.getUser.mockResolvedValue(mockUserResponse);
      taskServiceClient.getTasks.mockResolvedValue(mockTasksResponse);
      taskServiceClient.getProjects.mockResolvedValue(mockProjectsResponse);

      const result = await service.getDashboard(mockUser);

      expect(result.user).toEqual({
        id: 1,
        email: 'test@example.com',
        profile: { displayName: 'Test User', avatarUrl: null },
      });
      expect(result.taskSummary).toEqual({
        total: 3,
        todo: 1,
        inProgress: 1,
        done: 1,
      });
      expect(result.projectSummary).toEqual({ total: 2, owned: 2 });
      expect(result.recentTasks).toHaveLength(3);
      expect(result._errors).toBeUndefined();
    });

    it('should calculate taskSummary correctly', async () => {
      userServiceClient.getUser.mockResolvedValue({
        data: { id: 1, email: 'test@example.com', profile: {} },
      });
      taskServiceClient.getTasks.mockResolvedValue({
        data: [
          { id: 1, status: 'TODO' },
          { id: 2, status: 'TODO' },
          { id: 3, status: 'IN_PROGRESS' },
        ],
        meta: { total: 3 },
      });
      taskServiceClient.getProjects.mockResolvedValue({
        data: [],
        meta: { total: 0 },
      });

      const result = await service.getDashboard(mockUser);

      expect(result.taskSummary).toEqual({
        total: 3,
        todo: 2,
        inProgress: 1,
        done: 0,
      });
    });

    it('should calculate projectSummary correctly', async () => {
      userServiceClient.getUser.mockResolvedValue({
        data: { id: 1, email: 'test@example.com', profile: {} },
      });
      taskServiceClient.getTasks.mockResolvedValue({
        data: [],
        meta: { total: 0 },
      });
      taskServiceClient.getProjects.mockResolvedValue({
        data: [
          { id: 1, ownerId: 1 },
          { id: 2, ownerId: 1 },
          { id: 3, ownerId: 2 }, // 別ユーザーが所有
        ],
        meta: { total: 3 },
      });

      const result = await service.getDashboard(mockUser);

      expect(result.projectSummary).toEqual({ total: 3, owned: 2 });
    });

    it('should extract recentTasks sorted by updatedAt descending', async () => {
      userServiceClient.getUser.mockResolvedValue({
        data: { id: 1, email: 'test@example.com', profile: {} },
      });
      taskServiceClient.getTasks.mockResolvedValue({
        data: [
          {
            id: 1,
            title: 'Old',
            updatedAt: '2025-01-01T10:00:00Z',
            status: 'TODO',
            priority: 'LOW',
            projectId: 1,
            project: { name: 'P' },
          },
          {
            id: 2,
            title: 'New',
            updatedAt: '2025-01-15T10:00:00Z',
            status: 'TODO',
            priority: 'LOW',
            projectId: 1,
            project: { name: 'P' },
          },
          {
            id: 3,
            title: 'Mid',
            updatedAt: '2025-01-10T10:00:00Z',
            status: 'TODO',
            priority: 'LOW',
            projectId: 1,
            project: { name: 'P' },
          },
        ],
        meta: { total: 3 },
      });
      taskServiceClient.getProjects.mockResolvedValue({
        data: [],
        meta: { total: 0 },
      });

      const result = await service.getDashboard(mockUser);

      expect(result.recentTasks[0].title).toBe('New');
      expect(result.recentTasks[1].title).toBe('Mid');
      expect(result.recentTasks[2].title).toBe('Old');
    });
  });

  describe('getDashboard - 部分失敗系', () => {
    it('should handle user-service failure with _errors', async () => {
      userServiceClient.getUser.mockRejectedValue(
        new Error('user-service unavailable'),
      );
      taskServiceClient.getTasks.mockResolvedValue({
        data: [{ id: 1, status: 'TODO' }],
        meta: { total: 1 },
      });
      taskServiceClient.getProjects.mockResolvedValue({
        data: [{ id: 1, ownerId: 1 }],
        meta: { total: 1 },
      });

      const result = await service.getDashboard(mockUser);

      expect(result.user).toBeNull();
      expect(result.taskSummary.total).toBe(1);
      expect(result.projectSummary.total).toBe(1);
      expect(result._errors).toContain('user-service unavailable');
    });

    it('should handle task-service failure with _errors', async () => {
      userServiceClient.getUser.mockResolvedValue({
        data: {
          id: 1,
          email: 'test@example.com',
          profile: { displayName: 'Test' },
        },
      });
      taskServiceClient.getTasks.mockRejectedValue(
        new Error('task-service unavailable'),
      );
      taskServiceClient.getProjects.mockRejectedValue(
        new Error('task-service unavailable'),
      );

      const result = await service.getDashboard(mockUser);

      expect(result.user).not.toBeNull();
      expect(result.taskSummary).toEqual({
        total: 0,
        todo: 0,
        inProgress: 0,
        done: 0,
      });
      expect(result.projectSummary).toEqual({ total: 0, owned: 0 });
      expect(result.recentTasks).toEqual([]);
      expect(result._errors).toContain('task-service unavailable');
    });

    it('should handle both services failure with _errors (deduplicated)', async () => {
      userServiceClient.getUser.mockRejectedValue(
        new Error('user-service unavailable'),
      );
      taskServiceClient.getTasks.mockRejectedValue(
        new Error('task-service unavailable'),
      );
      taskServiceClient.getProjects.mockRejectedValue(
        new Error('task-service unavailable'),
      );

      const result = await service.getDashboard(mockUser);

      expect(result.user).toBeNull();
      expect(result.taskSummary).toEqual({
        total: 0,
        todo: 0,
        inProgress: 0,
        done: 0,
      });
      expect(result._errors).toContain('user-service unavailable');
      expect(result._errors).toContain('task-service unavailable');
      // 重複排除されていること
      expect(
        result._errors?.filter((e) => e === 'task-service unavailable').length,
      ).toBe(1);
    });
  });

  describe('processResult', () => {
    it('should return value when fulfilled', () => {
      const result: PromiseSettledResult<string> = {
        status: 'fulfilled',
        value: 'success',
      };
      const errors: string[] = [];

      const processed = service['processResult'](
        result,
        'default',
        'error message',
        errors,
      );

      expect(processed).toBe('success');
      expect(errors).toHaveLength(0);
    });

    it('should return default value and add error when rejected', () => {
      const result: PromiseSettledResult<string> = {
        status: 'rejected',
        reason: new Error('failed'),
      };
      const errors: string[] = [];

      const processed = service['processResult'](
        result,
        'default',
        'error message',
        errors,
      );

      expect(processed).toBe('default');
      expect(errors).toContain('error message');
    });
  });
});
