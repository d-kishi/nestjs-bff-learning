/**
 * authInterceptor テスト
 *
 * TDD: 認証インターセプターのテストケース
 */
import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';
import { of, throwError } from 'rxjs';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceSpy: {
    getAccessToken: ReturnType<typeof vi.fn>;
    refreshToken: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // 各テスト前にTestBedをリセット
    TestBed.resetTestingModule();

    // AuthServiceのモック
    authServiceSpy = {
      getAccessToken: vi.fn(),
      refreshToken: vi.fn(),
      logout: vi.fn().mockReturnValue(of(undefined)),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Bearer Token付与', () => {
    it('通常のリクエストにAuthorizationヘッダが付与されること', () => {
      authServiceSpy.getAccessToken.mockReturnValue('test-access-token');

      httpClient.get('/api/tasks').subscribe();

      const req = httpMock.expectOne('/api/tasks');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-access-token');
      req.flush({});
    });

    it('トークンがない場合、Authorizationヘッダが付与されないこと', () => {
      authServiceSpy.getAccessToken.mockReturnValue(null);

      httpClient.get('/api/tasks').subscribe();

      const req = httpMock.expectOne('/api/tasks');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });
  });

  describe('公開URL（認証不要）', () => {
    const publicUrls = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];

    publicUrls.forEach((url) => {
      it(`${url}にはAuthorizationヘッダが付与されないこと`, () => {
        authServiceSpy.getAccessToken.mockReturnValue('test-access-token');

        httpClient.post(url, {}).subscribe();

        const req = httpMock.expectOne(url);
        expect(req.request.headers.has('Authorization')).toBe(false);
        req.flush({});
      });
    });
  });

  describe('401エラー時のトークンリフレッシュ', () => {
    it('401エラー時、トークンリフレッシュが呼ばれること', () => {
      return new Promise<void>((resolve) => {
        authServiceSpy.getAccessToken.mockReturnValue('expired-token');
        authServiceSpy.refreshToken.mockReturnValue(
          of({ accessToken: 'new-token', refreshToken: 'new-refresh-token' })
        );

        httpClient.get('/api/tasks').subscribe({
          next: () => {
            expect(authServiceSpy.refreshToken).toHaveBeenCalled();
            resolve();
          },
        });

        // 最初のリクエストが401を返す
        const req1 = httpMock.expectOne('/api/tasks');
        req1.flush({}, { status: 401, statusText: 'Unauthorized' });

        // マイクロタスクを待機してからリトライリクエストを処理
        setTimeout(() => {
          const req2 = httpMock.expectOne('/api/tasks');
          req2.flush({ data: 'success' });
        }, 0);
      });
    });

    it('リフレッシュ失敗時、ログアウトが呼ばれること', () => {
      return new Promise<void>((resolve) => {
        authServiceSpy.getAccessToken.mockReturnValue('expired-token');
        authServiceSpy.refreshToken.mockReturnValue(
          throwError(() => new HttpErrorResponse({ status: 401 }))
        );

        httpClient.get('/api/tasks').subscribe({
          error: () => {
            expect(authServiceSpy.logout).toHaveBeenCalled();
            resolve();
          },
        });

        const req = httpMock.expectOne('/api/tasks');
        req.flush({}, { status: 401, statusText: 'Unauthorized' });
      });
    });
  });

  describe('401以外のエラー', () => {
    it('401以外のエラーはそのまま伝播すること', () => {
      authServiceSpy.getAccessToken.mockReturnValue('valid-token');

      let errorReceived: HttpErrorResponse | undefined;
      httpClient.get('/api/tasks').subscribe({
        error: (err: HttpErrorResponse) => {
          errorReceived = err;
        },
      });

      const req = httpMock.expectOne('/api/tasks');
      req.flush({}, { status: 500, statusText: 'Internal Server Error' });

      expect(errorReceived!.status).toBe(500);
      expect(authServiceSpy.refreshToken).not.toHaveBeenCalled();
    });
  });
});
