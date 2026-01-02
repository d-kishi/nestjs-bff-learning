/**
 * HttpExceptionFilter ユニットテスト
 *
 * ExceptionFilterの動作を検証する。
 * - HttpExceptionがErrorResponse形式に変換されること
 * - ValidationPipeのエラーが適切に処理されること
 * - カスタムエラーコードが保持されること
 */
import { HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  // モックレスポンスオブジェクト
  const mockJson = jest.fn();
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
  const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
  const mockHttpArgumentsHost = jest.fn().mockReturnValue({
    getResponse: mockGetResponse,
  });
  const mockArgumentsHost = {
    switchToHttp: mockHttpArgumentsHost,
  } as any;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    jest.clearAllMocks();
  });

  describe('catch', () => {
    it('シンプルなHttpExceptionをErrorResponse形式に変換する', () => {
      // Given: シンプルなHttpException
      const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

      // When: フィルターで処理
      filter.catch(exception, mockArgumentsHost);

      // Then: ErrorResponse形式で返却される
      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Not Found',
          },
          meta: expect.objectContaining({
            timestamp: expect.any(String),
          }),
        }),
      );
    });

    it('BadRequestExceptionをErrorResponse形式に変換する', () => {
      // Given: BadRequestException
      const exception = new BadRequestException('Invalid input');

      // When: フィルターで処理
      filter.catch(exception, mockArgumentsHost);

      // Then: 400エラーがUSER_VALIDATION_ERROR形式で返却される
      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: {
            code: 'USER_VALIDATION_ERROR',
            message: 'Invalid input',
          },
        }),
      );
    });

    it('ValidationPipeの配列エラーを最初のメッセージで返却する', () => {
      // Given: ValidationPipeからのエラー（配列形式）
      const exception = new BadRequestException({
        message: ['email must be a valid email', 'password is too short'],
        error: 'Bad Request',
        statusCode: 400,
      });

      // When: フィルターで処理
      filter.catch(exception, mockArgumentsHost);

      // Then: 最初のメッセージが使用される
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: {
            code: 'USER_VALIDATION_ERROR',
            message: 'email must be a valid email',
          },
        }),
      );
    });

    it('カスタムエラーコードが保持される', () => {
      // Given: カスタムエラーコードを持つ例外
      const exception = new HttpException(
        {
          code: 'USER_USER_NOT_FOUND',
          message: 'User with id 999 not found',
        },
        HttpStatus.NOT_FOUND,
      );

      // When: フィルターで処理
      filter.catch(exception, mockArgumentsHost);

      // Then: カスタムエラーコードが保持される
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: {
            code: 'USER_USER_NOT_FOUND',
            message: 'User with id 999 not found',
          },
        }),
      );
    });

    it('403 ForbiddenはUSER_FORBIDDENコードを返す', () => {
      // Given: Forbidden例外
      const exception = new HttpException(
        'Access denied',
        HttpStatus.FORBIDDEN,
      );

      // When: フィルターで処理
      filter.catch(exception, mockArgumentsHost);

      // Then: USER_FORBIDDENコードが使用される
      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: {
            code: 'USER_FORBIDDEN',
            message: 'Access denied',
          },
        }),
      );
    });

    it('409 ConflictはUSER_CONFLICTコードを返す', () => {
      // Given: Conflict例外
      const exception = new HttpException(
        'Email already exists',
        HttpStatus.CONFLICT,
      );

      // When: フィルターで処理
      filter.catch(exception, mockArgumentsHost);

      // Then: USER_CONFLICTコードが使用される
      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: {
            code: 'USER_CONFLICT',
            message: 'Email already exists',
          },
        }),
      );
    });

    it('401 UnauthorizedはUSER_UNAUTHORIZEDコードを返す', () => {
      // Given: Unauthorized例外
      const exception = new HttpException(
        'Invalid credentials',
        HttpStatus.UNAUTHORIZED,
      );

      // When: フィルターで処理
      filter.catch(exception, mockArgumentsHost);

      // Then: USER_UNAUTHORIZEDコードが使用される
      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: {
            code: 'USER_UNAUTHORIZED',
            message: 'Invalid credentials',
          },
        }),
      );
    });

    it('timestampはISO8601形式である', () => {
      // Given: 任意の例外
      const exception = new HttpException('Test', HttpStatus.BAD_REQUEST);

      // When: フィルターで処理
      filter.catch(exception, mockArgumentsHost);

      // Then: timestampがISO8601形式
      const jsonCall = mockJson.mock.calls[0][0];
      const timestamp = jsonCall.meta.timestamp;
      expect(() => new Date(timestamp).toISOString()).not.toThrow();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});
