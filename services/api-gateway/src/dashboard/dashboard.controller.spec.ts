/**
 * DashboardControllerのテスト
 *
 * TDD Red Phase
 */
import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { UserFromJwt } from '../common/types';

describe('DashboardController', () => {
  let controller: DashboardController;
  let dashboardService: jest.Mocked<DashboardService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: {
            getDashboard: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    dashboardService = module.get(DashboardService);
  });

  describe('getDashboard', () => {
    it('should call dashboardService.getDashboard with user info', async () => {
      const user: UserFromJwt = {
        id: 1,
        email: 'test@example.com',
        roles: ['MEMBER'],
      };
      const mockResponse = {
        user: {
          id: 1,
          email: 'test@example.com',
          profile: { displayName: 'Test', avatarUrl: null },
        },
        taskSummary: { total: 3, todo: 1, inProgress: 1, done: 1 },
        projectSummary: { total: 2, owned: 2 },
        recentTasks: [],
      };
      dashboardService.getDashboard.mockResolvedValue(mockResponse);

      const result = await controller.getDashboard(user);

      expect(dashboardService.getDashboard).toHaveBeenCalledWith(user);
      expect(result).toEqual(mockResponse);
    });

    it('should return response with _errors when partial failure occurs', async () => {
      const user: UserFromJwt = {
        id: 1,
        email: 'test@example.com',
        roles: ['MEMBER'],
      };
      const mockResponse = {
        user: null,
        taskSummary: { total: 3, todo: 1, inProgress: 1, done: 1 },
        projectSummary: { total: 2, owned: 2 },
        recentTasks: [],
        _errors: ['user-service unavailable'],
      };
      dashboardService.getDashboard.mockResolvedValue(mockResponse);

      const result = await controller.getDashboard(user);

      expect(result._errors).toContain('user-service unavailable');
    });

    it('should return HTTP 200 even with partial failure', async () => {
      const user: UserFromJwt = {
        id: 1,
        email: 'test@example.com',
        roles: ['MEMBER'],
      };
      const mockResponse = {
        user: null,
        taskSummary: { total: 0, todo: 0, inProgress: 0, done: 0 },
        projectSummary: { total: 0, owned: 0 },
        recentTasks: [],
        _errors: ['user-service unavailable', 'task-service unavailable'],
      };
      dashboardService.getDashboard.mockResolvedValue(mockResponse);

      const result = await controller.getDashboard(user);

      // コントローラは常にサービスのレスポンスを返す（HTTP 200）
      expect(result).toEqual(mockResponse);
    });
  });
});
