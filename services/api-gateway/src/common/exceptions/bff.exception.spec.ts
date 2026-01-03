/**
 * BFF例外クラスのテスト
 *
 * TDD Red Phase: まずテストを書く
 */
import { HttpStatus } from '@nestjs/common';
import {
  BffUnauthorizedException,
  BffForbiddenException,
  BffServiceUnavailableException,
  BffTimeoutException,
  BffValidationException,
} from './bff.exception';

describe('BFF Exceptions', () => {
  describe('BffUnauthorizedException', () => {
    it('should create exception with BFF_UNAUTHORIZED code and 401 status', () => {
      const exception = new BffUnauthorizedException();

      expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      const response = exception.getResponse() as {
        code: string;
        message: string;
      };
      expect(response.code).toBe('BFF_UNAUTHORIZED');
      expect(response.message).toBe('Unauthorized');
    });

    it('should accept custom message', () => {
      const exception = new BffUnauthorizedException('Invalid token');

      const response = exception.getResponse() as {
        code: string;
        message: string;
      };
      expect(response.code).toBe('BFF_UNAUTHORIZED');
      expect(response.message).toBe('Invalid token');
    });
  });

  describe('BffForbiddenException', () => {
    it('should create exception with BFF_FORBIDDEN code and 403 status', () => {
      const exception = new BffForbiddenException();

      expect(exception.getStatus()).toBe(HttpStatus.FORBIDDEN);
      const response = exception.getResponse() as {
        code: string;
        message: string;
      };
      expect(response.code).toBe('BFF_FORBIDDEN');
      expect(response.message).toBe('Forbidden');
    });

    it('should accept custom message', () => {
      const exception = new BffForbiddenException('Admin role required');

      const response = exception.getResponse() as {
        code: string;
        message: string;
      };
      expect(response.code).toBe('BFF_FORBIDDEN');
      expect(response.message).toBe('Admin role required');
    });
  });

  describe('BffServiceUnavailableException', () => {
    it('should create exception with BFF_SERVICE_UNAVAILABLE code and 503 status', () => {
      const exception = new BffServiceUnavailableException('user-service');

      expect(exception.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      const response = exception.getResponse() as {
        code: string;
        message: string;
      };
      expect(response.code).toBe('BFF_SERVICE_UNAVAILABLE');
      expect(response.message).toBe('user-service is unavailable');
    });
  });

  describe('BffTimeoutException', () => {
    it('should create exception with BFF_TIMEOUT code and 504 status', () => {
      const exception = new BffTimeoutException('task-service');

      expect(exception.getStatus()).toBe(HttpStatus.GATEWAY_TIMEOUT);
      const response = exception.getResponse() as {
        code: string;
        message: string;
      };
      expect(response.code).toBe('BFF_TIMEOUT');
      expect(response.message).toBe('task-service request timed out');
    });
  });

  describe('BffValidationException', () => {
    it('should create exception with BFF_VALIDATION_ERROR code and 400 status', () => {
      const exception = new BffValidationException('Invalid email format');

      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      const response = exception.getResponse() as {
        code: string;
        message: string;
      };
      expect(response.code).toBe('BFF_VALIDATION_ERROR');
      expect(response.message).toBe('Invalid email format');
    });
  });
});
