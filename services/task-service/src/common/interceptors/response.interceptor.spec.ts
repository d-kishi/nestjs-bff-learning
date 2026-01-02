/**
 * ResponseInterceptor ユニットテスト
 *
 * インターセプターの動作を検証する。
 * - プリミティブ値がApiResponse形式にラップされること
 * - オブジェクトがApiResponse形式にラップされること
 * - 既にラップ済みのレスポンスは二重ラップされないこと
 * - null/undefinedはそのまま返されること
 */
import { of } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';
import {
  ApiResponse,
  PaginatedResponse,
  ErrorResponse,
} from '../dto/api-response.dto';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<unknown>;

  // モックExecutionContext
  const mockExecutionContext = {} as any;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();
  });

  describe('intercept', () => {
    it('オブジェクトをApiResponse形式にラップする', (done) => {
      // Given: オブジェクトを返すハンドラー
      const testData = { id: 1, name: 'Test Project' };
      const mockCallHandler = {
        handle: () => of(testData),
      };

      // When: インターセプト実行
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          // Then: ApiResponse形式でラップされる
          expect(result).toBeInstanceOf(ApiResponse);
          expect((result as ApiResponse<typeof testData>).data).toEqual(
            testData,
          );
          expect(
            (result as ApiResponse<typeof testData>).meta.timestamp,
          ).toBeDefined();
          done();
        },
      });
    });

    it('配列をApiResponse形式にラップする', (done) => {
      // Given: 配列を返すハンドラー
      const testData = [{ id: 1 }, { id: 2 }];
      const mockCallHandler = {
        handle: () => of(testData),
      };

      // When: インターセプト実行
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          // Then: 配列もApiResponse形式でラップされる
          expect(result).toBeInstanceOf(ApiResponse);
          expect((result as ApiResponse<typeof testData>).data).toEqual(
            testData,
          );
          done();
        },
      });
    });

    it('文字列をApiResponse形式にラップする', (done) => {
      // Given: 文字列を返すハンドラー
      const testData = 'Hello World';
      const mockCallHandler = {
        handle: () => of(testData),
      };

      // When: インターセプト実行
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          // Then: 文字列もApiResponse形式でラップされる
          expect(result).toBeInstanceOf(ApiResponse);
          expect((result as ApiResponse<string>).data).toBe(testData);
          done();
        },
      });
    });

    it('既にApiResponseインスタンスの場合は二重ラップしない', (done) => {
      // Given: 既にApiResponseインスタンス
      const testData = { id: 1 };
      const apiResponse = new ApiResponse(testData);
      const mockCallHandler = {
        handle: () => of(apiResponse),
      };

      // When: インターセプト実行
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          // Then: 二重ラップされずそのまま返される
          expect(result).toBe(apiResponse);
          expect((result as ApiResponse<typeof testData>).data).toEqual(
            testData,
          );
          done();
        },
      });
    });

    it('既にPaginatedResponseインスタンスの場合は二重ラップしない', (done) => {
      // Given: 既にPaginatedResponseインスタンス
      const testData = [{ id: 1 }, { id: 2 }];
      const paginatedResponse = new PaginatedResponse(testData, 100, 1, 20);
      const mockCallHandler = {
        handle: () => of(paginatedResponse),
      };

      // When: インターセプト実行
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          // Then: 二重ラップされずそのまま返される
          expect(result).toBe(paginatedResponse);
          expect(
            (result as PaginatedResponse<(typeof testData)[0]>).meta.total,
          ).toBe(100);
          done();
        },
      });
    });

    it('既にErrorResponseインスタンスの場合は二重ラップしない', (done) => {
      // Given: 既にErrorResponseインスタンス
      const errorResponse = new ErrorResponse('TASK_NOT_FOUND', 'Not found');
      const mockCallHandler = {
        handle: () => of(errorResponse),
      };

      // When: インターセプト実行
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          // Then: 二重ラップされずそのまま返される
          expect(result).toBe(errorResponse);
          done();
        },
      });
    });

    it('data/meta/timestamp構造のオブジェクトは二重ラップしない', (done) => {
      // Given: ApiResponse形式のプレーンオブジェクト
      const wrappedData = {
        data: { id: 1 },
        meta: { timestamp: '2025-01-01T00:00:00Z' },
      };
      const mockCallHandler = {
        handle: () => of(wrappedData),
      };

      // When: インターセプト実行
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          // Then: 二重ラップされない
          expect(result).toBe(wrappedData);
          done();
        },
      });
    });

    it('nullはそのまま返される（204 No Content対応）', (done) => {
      // Given: nullを返すハンドラー
      const mockCallHandler = {
        handle: () => of(null),
      };

      // When: インターセプト実行
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          // Then: nullがそのまま返される
          expect(result).toBeNull();
          done();
        },
      });
    });

    it('undefinedはそのまま返される', (done) => {
      // Given: undefinedを返すハンドラー
      const mockCallHandler = {
        handle: () => of(undefined),
      };

      // When: インターセプト実行
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          // Then: undefinedがそのまま返される
          expect(result).toBeUndefined();
          done();
        },
      });
    });

    it('timestampはISO8601形式である', (done) => {
      // Given: オブジェクトを返すハンドラー
      const testData = { id: 1 };
      const mockCallHandler = {
        handle: () => of(testData),
      };

      // When: インターセプト実行
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          // Then: timestampがISO8601形式
          const timestamp = (result as ApiResponse<typeof testData>).meta
            .timestamp;
          expect(() => new Date(timestamp).toISOString()).not.toThrow();
          expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
          done();
        },
      });
    });
  });
});
