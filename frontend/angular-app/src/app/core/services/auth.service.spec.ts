/**
 * AuthService テスト
 *
 * TDD Red Phase: 認証サービスのテストケースを定義
 * 各メソッドの期待動作を先に記述し、実装で満たす
 */
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthResponse, StoredAuth } from '../models/auth.model';
import { User } from '../models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  // テスト用モックデータ
  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    profile: {
      displayName: 'Test User',
      bio: null,
      avatarUrl: null,
    },
    roles: [{ id: 1, name: 'MEMBER', description: null }],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const mockAdminUser: User = {
    ...mockUser,
    roles: [
      { id: 1, name: 'ADMIN', description: 'Administrator' },
      { id: 2, name: 'MEMBER', description: null },
    ],
  };

  const mockAuthResponse: AuthResponse = {
    user: mockUser,
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  const mockStoredAuth: StoredAuth = {
    accessToken: 'stored-access-token',
    refreshToken: 'stored-refresh-token',
    user: {
      id: 1,
      email: 'test@example.com',
      displayName: 'Test User',
      roles: ['MEMBER'],
    },
  };

  beforeEach(() => {
    // localStorageのモック
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // Routerのモック
    routerSpy = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('初期状態', () => {
    it('currentUserがnullであること', () => {
      expect(service.currentUser()).toBeNull();
    });

    it('isAuthenticatedがfalseであること', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('isAdminがfalseであること', () => {
      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('login', () => {
    it('ログイン成功時、currentUserが更新されること', () => {
      const loginRequest = { email: 'test@example.com', password: 'Password123' };

      service.login(loginRequest.email, loginRequest.password).subscribe((response) => {
        expect(response).toEqual(mockAuthResponse);
        expect(service.currentUser()).toEqual(mockUser);
        expect(service.isAuthenticated()).toBe(true);
      });

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginRequest);
      req.flush({ data: mockAuthResponse, meta: { timestamp: new Date().toISOString() } });
    });

    it('ログイン成功時、localStorageにトークンが保存されること', () => {
      const loginRequest = { email: 'test@example.com', password: 'Password123' };

      service.login(loginRequest.email, loginRequest.password).subscribe();

      const req = httpMock.expectOne('/api/auth/login');
      req.flush({ data: mockAuthResponse, meta: { timestamp: new Date().toISOString() } });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'auth',
        expect.stringContaining('mock-access-token')
      );
    });

    it('ログイン成功時、ダッシュボードへ遷移すること', () => {
      const loginRequest = { email: 'test@example.com', password: 'Password123' };

      service.login(loginRequest.email, loginRequest.password).subscribe();

      const req = httpMock.expectOne('/api/auth/login');
      req.flush({ data: mockAuthResponse, meta: { timestamp: new Date().toISOString() } });

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('register', () => {
    it('登録成功時、currentUserが更新されること', () => {
      const registerRequest = {
        email: 'new@example.com',
        password: 'Password123',
        displayName: 'New User',
      };

      service
        .register(registerRequest.email, registerRequest.password, registerRequest.displayName)
        .subscribe((response) => {
          expect(response).toEqual(mockAuthResponse);
          expect(service.currentUser()).toEqual(mockUser);
          expect(service.isAuthenticated()).toBe(true);
        });

      const req = httpMock.expectOne('/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerRequest);
      req.flush({ data: mockAuthResponse, meta: { timestamp: new Date().toISOString() } });
    });

    it('登録成功時、localStorageにトークンが保存されること', () => {
      service.register('new@example.com', 'Password123', 'New User').subscribe();

      const req = httpMock.expectOne('/api/auth/register');
      req.flush({ data: mockAuthResponse, meta: { timestamp: new Date().toISOString() } });

      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('ログアウト成功時、currentUserがnullになること', () => {
      // まずログイン状態にする
      service.login('test@example.com', 'Password123').subscribe();
      const loginReq = httpMock.expectOne('/api/auth/login');
      loginReq.flush({ data: mockAuthResponse, meta: { timestamp: new Date().toISOString() } });

      // ログアウト
      service.logout().subscribe(() => {
        expect(service.currentUser()).toBeNull();
        expect(service.isAuthenticated()).toBe(false);
      });

      const logoutReq = httpMock.expectOne('/api/auth/logout');
      expect(logoutReq.request.method).toBe('POST');
      logoutReq.flush({ data: null, meta: { timestamp: new Date().toISOString() } });
    });

    it('ログアウト成功時、localStorageがクリアされること', () => {
      service.logout().subscribe();

      const req = httpMock.expectOne('/api/auth/logout');
      req.flush({ data: null, meta: { timestamp: new Date().toISOString() } });

      expect(localStorage.removeItem).toHaveBeenCalledWith('auth');
    });

    it('ログアウト成功時、ログイン画面へ遷移すること', () => {
      service.logout().subscribe();

      const req = httpMock.expectOne('/api/auth/logout');
      req.flush({ data: null, meta: { timestamp: new Date().toISOString() } });

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('refreshToken', () => {
    it('トークンリフレッシュ成功時、新しいトークンが保存されること', () => {
      // localStorageにリフレッシュトークンを設定
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockStoredAuth));

      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      service.refreshToken().subscribe((response) => {
        expect(response).toEqual(newTokens);
      });

      const req = httpMock.expectOne('/api/auth/refresh');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'stored-refresh-token' });
      req.flush({ data: newTokens, meta: { timestamp: new Date().toISOString() } });

      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('getAccessToken', () => {
    it('localStorageからアクセストークンを取得できること', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockStoredAuth));

      const token = service.getAccessToken();

      expect(token).toBe('stored-access-token');
    });

    it('localStorageが空の場合、nullを返すこと', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const token = service.getAccessToken();

      expect(token).toBeNull();
    });
  });

  describe('initialize', () => {
    it('localStorageに認証情報がある場合、currentUserが復元されること', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockStoredAuth));

      service.initialize();

      expect(service.currentUser()).not.toBeNull();
      expect(service.currentUser()?.email).toBe('test@example.com');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('localStorageが空の場合、currentUserはnullのままであること', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      service.initialize();

      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('ADMINロールを持つユーザーの場合、trueを返すこと', () => {
      const adminAuthResponse: AuthResponse = {
        ...mockAuthResponse,
        user: mockAdminUser,
      };

      service.login('admin@example.com', 'Password123').subscribe();

      const req = httpMock.expectOne('/api/auth/login');
      req.flush({ data: adminAuthResponse, meta: { timestamp: new Date().toISOString() } });

      expect(service.isAdmin()).toBe(true);
    });

    it('ADMINロールを持たないユーザーの場合、falseを返すこと', () => {
      service.login('test@example.com', 'Password123').subscribe();

      const req = httpMock.expectOne('/api/auth/login');
      req.flush({ data: mockAuthResponse, meta: { timestamp: new Date().toISOString() } });

      expect(service.isAdmin()).toBe(false);
    });
  });
});
