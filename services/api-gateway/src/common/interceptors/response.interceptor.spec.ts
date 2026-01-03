/**
 * ResponseInterceptorのテスト
 *
 * TDD Red Phase: まずテストを書く
 */
import { of } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';
import {
  ApiResponse,
  PaginatedResponse,
  ErrorResponse,
} from '../dto/api-response.dto';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<any>;
  let mockContext: any;
  let mockCallHandler: any;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();
    mockContext = {
      switchToHttp: jest.fn(),
    };
  });

  it('should wrap plain object with ApiResponse', (done) => {
    const data = { id: 1, name: 'Test' };
    mockCallHandler = {
      handle: () => of(data),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result).toBeInstanceOf(ApiResponse);
      expect((result as ApiResponse<any>).data).toEqual(data);
      expect((result as ApiResponse<any>).meta.timestamp).toBeDefined();
      done();
    });
  });

  it('should not double-wrap ApiResponse instance', (done) => {
    const apiResponse = new ApiResponse({ id: 1 });
    mockCallHandler = {
      handle: () => of(apiResponse),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result).toBe(apiResponse);
      expect(result).toBeInstanceOf(ApiResponse);
      done();
    });
  });

  it('should pass through PaginatedResponse', (done) => {
    const paginatedResponse = new PaginatedResponse([{ id: 1 }], 100, 1, 20);
    mockCallHandler = {
      handle: () => of(paginatedResponse),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result).toBe(paginatedResponse);
      expect(result).toBeInstanceOf(PaginatedResponse);
      done();
    });
  });

  it('should pass through ErrorResponse', (done) => {
    const errorResponse = new ErrorResponse('BFF_UNAUTHORIZED', 'Unauthorized');
    mockCallHandler = {
      handle: () => of(errorResponse),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result).toBe(errorResponse);
      expect(result).toBeInstanceOf(ErrorResponse);
      done();
    });
  });

  it('should pass through null/undefined', (done) => {
    mockCallHandler = {
      handle: () => of(null),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result).toBeNull();
      done();
    });
  });
});
