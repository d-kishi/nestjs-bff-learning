/**
 * errorInterceptor テスト
 *
 * TDD Red Phase: エラーインターセプターのテストケースを定義
 */
import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('正常レスポンス', () => {
    it('正常なレスポンスはそのまま通過すること', () => {
      const mockData = { data: { id: 1, name: 'Test' }, meta: { timestamp: new Date().toISOString() } };

      let response: unknown;
      httpClient.get('/api/tasks').subscribe((res) => {
        response = res;
      });

      const req = httpMock.expectOne('/api/tasks');
      req.flush(mockData);

      expect(response).toEqual(mockData);
    });
  });

  describe('BFFエラーレスポンス', () => {
    it('BFF形式のエラーメッセージが抽出されること', () => {
      const bffError = {
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'タスクが見つかりません',
        },
        meta: { timestamp: new Date().toISOString() },
      };

      let errorReceived: HttpErrorResponse | undefined;
      httpClient.get('/api/tasks/999').subscribe({
        error: (err) => {
          errorReceived = err;
        },
      });

      const req = httpMock.expectOne('/api/tasks/999');
      req.flush(bffError, { status: 404, statusText: 'Not Found' });

      expect(errorReceived).toBeDefined();
      expect(errorReceived!.status).toBe(404);
      // エラーボディにBFF形式のエラーが含まれることを確認
      expect(errorReceived!.error).toEqual(bffError);
    });
  });

  describe('ネットワークエラー', () => {
    it('ネットワークエラーが適切に処理されること', () => {
      let errorReceived: HttpErrorResponse | undefined;
      httpClient.get('/api/tasks').subscribe({
        error: (err) => {
          errorReceived = err;
        },
      });

      const req = httpMock.expectOne('/api/tasks');
      req.error(new ProgressEvent('error'));

      expect(errorReceived).toBeDefined();
      expect(errorReceived!.status).toBe(0);
    });
  });

  describe('サーバーエラー', () => {
    it('500エラーが適切に処理されること', () => {
      let errorReceived: HttpErrorResponse | undefined;
      httpClient.get('/api/tasks').subscribe({
        error: (err) => {
          errorReceived = err;
        },
      });

      const req = httpMock.expectOne('/api/tasks');
      req.flush({}, { status: 500, statusText: 'Internal Server Error' });

      expect(errorReceived!.status).toBe(500);
    });
  });
});
