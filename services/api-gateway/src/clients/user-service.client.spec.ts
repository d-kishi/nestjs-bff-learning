/**
 * UserServiceClientのテスト
 *
 * TDD Red Phase
 */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AxiosResponse, AxiosError, AxiosHeaders } from 'axios';
import { UserServiceClient } from './user-service.client';
import {
  BffServiceUnavailableException,
  BffTimeoutException,
} from '../common/exceptions/bff.exception';

describe('UserServiceClient', () => {
  let client: UserServiceClient;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserServiceClient,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue: string) => {
              if (key === 'USER_SERVICE_URL') return 'http://localhost:3002';
              return defaultValue;
            }),
          },
        },
      ],
    }).compile();

    client = module.get<UserServiceClient>(UserServiceClient);
    httpService = module.get(HttpService);
  });

  const createMockResponse = <T>(data: T): AxiosResponse<T> => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

  describe('register', () => {
    it('should call user-service and return response', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'Password123',
        displayName: 'Test',
      };
      const mockResponse = {
        data: {
          user: { id: 1, email: 'test@example.com', roles: ['MEMBER'] },
          accessToken: 'jwt-token',
          refreshToken: 'refresh-token',
        },
        meta: { timestamp: new Date().toISOString() },
      };
      httpService.post.mockReturnValue(of(createMockResponse(mockResponse)));

      const result = await client.register(dto);

      expect(result).toEqual(mockResponse);
      expect(httpService.post).toHaveBeenCalledWith(
        'http://localhost:3002/auth/register',
        dto,
        undefined,
      );
    });
  });

  describe('login', () => {
    it('should call user-service and return response', async () => {
      const dto = { email: 'test@example.com', password: 'Password123' };
      const mockResponse = {
        data: {
          user: { id: 1, email: 'test@example.com' },
          accessToken: 'jwt-token',
          refreshToken: 'refresh-token',
        },
        meta: { timestamp: new Date().toISOString() },
      };
      httpService.post.mockReturnValue(of(createMockResponse(mockResponse)));

      const result = await client.login(dto);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('refresh', () => {
    it('should call user-service and return new tokens', async () => {
      const dto = { refreshToken: 'old-refresh-token' };
      const mockResponse = {
        data: { accessToken: 'new-jwt', refreshToken: 'new-refresh' },
        meta: { timestamp: new Date().toISOString() },
      };
      httpService.post.mockReturnValue(of(createMockResponse(mockResponse)));

      const result = await client.refresh(dto);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('should call user-service with headers', async () => {
      const dto = { refreshToken: 'refresh-token' };
      const userId = 1;
      const roles = ['MEMBER'];
      const mockResponse = {
        data: { message: 'Logged out successfully' },
        meta: { timestamp: new Date().toISOString() },
      };
      httpService.post.mockReturnValue(of(createMockResponse(mockResponse)));

      const result = await client.logout(dto, userId, roles);

      expect(result).toEqual(mockResponse);
      expect(httpService.post).toHaveBeenCalledWith(
        'http://localhost:3002/auth/logout',
        dto,
        {
          headers: {
            'X-User-Id': '1',
            'X-User-Roles': 'MEMBER',
          },
        },
      );
    });
  });

  describe('getMe', () => {
    it('should propagate X-User-Id and X-User-Roles headers', async () => {
      const userId = 1;
      const roles = ['MEMBER', 'ADMIN'];
      const mockResponse = {
        data: { id: 1, email: 'test@example.com' },
        meta: { timestamp: new Date().toISOString() },
      };
      httpService.get.mockReturnValue(of(createMockResponse(mockResponse)));

      const result = await client.getMe(userId, roles);

      expect(result).toEqual(mockResponse);
      expect(httpService.get).toHaveBeenCalledWith(
        'http://localhost:3002/auth/me',
        {
          headers: {
            'X-User-Id': '1',
            'X-User-Roles': 'MEMBER,ADMIN',
          },
        },
      );
    });
  });

  describe('error handling', () => {
    it('should throw BffTimeoutException on timeout', async () => {
      const error = new AxiosError('timeout', 'ECONNABORTED');
      error.code = 'ECONNABORTED';
      httpService.post.mockReturnValue(throwError(() => error));

      await expect(
        client.register({ email: 'test@example.com', password: 'Password123' }),
      ).rejects.toThrow(BffTimeoutException);
    });

    it('should throw BffServiceUnavailableException on connection error', async () => {
      const error = new AxiosError('connection refused', 'ECONNREFUSED');
      error.code = 'ECONNREFUSED';
      httpService.post.mockReturnValue(throwError(() => error));

      await expect(
        client.register({ email: 'test@example.com', password: 'Password123' }),
      ).rejects.toThrow(BffServiceUnavailableException);
    });

    it('should pass through downstream HTTP errors', async () => {
      const error = new AxiosError('Bad Request');
      error.response = {
        status: 400,
        statusText: 'Bad Request',
        data: {
          error: { code: 'USER_VALIDATION_ERROR', message: 'Invalid email' },
        },
        headers: {},
        config: { headers: new AxiosHeaders() },
      };
      httpService.post.mockReturnValue(throwError(() => error));

      await expect(
        client.register({ email: 'invalid', password: 'Password123' }),
      ).rejects.toThrow();
    });
  });
});
