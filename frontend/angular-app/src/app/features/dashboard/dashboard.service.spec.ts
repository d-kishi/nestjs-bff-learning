/**
 * DashboardService テスト
 *
 * ダッシュボードデータ取得のテスト
 */
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { DashboardResponse } from '../../core/models/dashboard.model';
import { ApiResponse } from '../../core/models/api-response.model';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  const mockDashboardResponse: DashboardResponse = {
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
        dueDate: '2026-01-18',
        projectId: 2,
        projectName: 'プロジェクト2',
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('サービスが作成されること', () => {
    expect(service).toBeTruthy();
  });

  describe('getDashboard()', () => {
    it('ダッシュボードデータを取得できること', () => {
      const apiResponse: ApiResponse<DashboardResponse> = {
        data: mockDashboardResponse,
        meta: { timestamp: '2026-01-03T00:00:00Z' },
      };

      service.getDashboard().subscribe((response) => {
        expect(response).toEqual(mockDashboardResponse);
      });

      const req = httpMock.expectOne('/api/dashboard');
      expect(req.request.method).toBe('GET');
      req.flush(apiResponse);
    });

    it('部分失敗時に_errorsが含まれること', () => {
      const partialResponse: DashboardResponse = {
        ...mockDashboardResponse,
        user: null,
        _errors: ['user-service unavailable'],
      };

      const apiResponse: ApiResponse<DashboardResponse> = {
        data: partialResponse,
        meta: { timestamp: '2026-01-03T00:00:00Z' },
      };

      service.getDashboard().subscribe((response) => {
        expect(response.user).toBeNull();
        expect(response._errors).toContain('user-service unavailable');
      });

      const req = httpMock.expectOne('/api/dashboard');
      req.flush(apiResponse);
    });
  });

  describe('Signal状態管理', () => {
    it('初期状態でisLoadingがfalseであること', () => {
      expect(service.isLoading()).toBe(false);
    });

    it('初期状態でdashboardがnullであること', () => {
      expect(service.dashboard()).toBeNull();
    });

    it('初期状態でerrorがnullであること', () => {
      expect(service.error()).toBeNull();
    });

    it('loadDashboard()でisLoadingがtrueになること', () => {
      service.loadDashboard();
      expect(service.isLoading()).toBe(true);

      // リクエストをフラッシュ
      const req = httpMock.expectOne('/api/dashboard');
      req.flush({ data: mockDashboardResponse, meta: { timestamp: '' } });
    });

    it('loadDashboard()成功後にdashboardが更新されること', () => {
      service.loadDashboard();

      const req = httpMock.expectOne('/api/dashboard');
      req.flush({ data: mockDashboardResponse, meta: { timestamp: '' } });

      expect(service.dashboard()).toEqual(mockDashboardResponse);
      expect(service.isLoading()).toBe(false);
    });

    it('loadDashboard()失敗時にerrorが設定されること', () => {
      service.loadDashboard();

      const req = httpMock.expectOne('/api/dashboard');
      req.flush({ error: { code: 'ERROR', message: 'Internal Error' } }, { status: 500, statusText: 'Error' });

      expect(service.error()).toBeTruthy();
      expect(service.isLoading()).toBe(false);
    });

    it('hasPartialError()で部分失敗を判定できること', () => {
      const partialResponse: DashboardResponse = {
        ...mockDashboardResponse,
        _errors: ['user-service unavailable'],
      };

      service.loadDashboard();

      const req = httpMock.expectOne('/api/dashboard');
      req.flush({ data: partialResponse, meta: { timestamp: '' } });

      expect(service.hasPartialError()).toBe(true);
    });
  });
});
