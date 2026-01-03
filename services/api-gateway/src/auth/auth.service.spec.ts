/**
 * AuthServiceのテスト
 *
 * TDD Red Phase
 */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserServiceClient } from '../clients/user-service.client';

describe('AuthService', () => {
  let service: AuthService;
  let userServiceClient: jest.Mocked<UserServiceClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserServiceClient,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
            getMe: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userServiceClient = module.get(UserServiceClient);
  });

  describe('register', () => {
    it('should call user-service register and return response', async () => {
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
      userServiceClient.register.mockResolvedValue(mockResponse);

      const result = await service.register(dto);

      expect(userServiceClient.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('login', () => {
    it('should call user-service login and return response', async () => {
      const dto = { email: 'test@example.com', password: 'Password123' };
      const mockResponse = {
        data: {
          user: { id: 1, email: 'test@example.com' },
          accessToken: 'jwt-token',
          refreshToken: 'refresh-token',
        },
        meta: { timestamp: new Date().toISOString() },
      };
      userServiceClient.login.mockResolvedValue(mockResponse);

      const result = await service.login(dto);

      expect(userServiceClient.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('refresh', () => {
    it('should call user-service refresh and return new tokens', async () => {
      const dto = { refreshToken: 'old-refresh-token' };
      const mockResponse = {
        data: { accessToken: 'new-jwt', refreshToken: 'new-refresh' },
        meta: { timestamp: new Date().toISOString() },
      };
      userServiceClient.refresh.mockResolvedValue(mockResponse);

      const result = await service.refresh(dto);

      expect(userServiceClient.refresh).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('should call user-service logout with user info', async () => {
      const dto = { refreshToken: 'refresh-token' };
      const userId = 1;
      const roles = ['MEMBER'];
      const mockResponse = {
        data: { message: 'Logged out successfully' },
        meta: { timestamp: new Date().toISOString() },
      };
      userServiceClient.logout.mockResolvedValue(mockResponse);

      const result = await service.logout(dto, userId, roles);

      expect(userServiceClient.logout).toHaveBeenCalledWith(dto, userId, roles);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('me', () => {
    it('should call user-service getMe with user info', async () => {
      const userId = 1;
      const roles = ['MEMBER'];
      const mockResponse = {
        data: {
          id: 1,
          email: 'test@example.com',
          profile: { displayName: 'Test' },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      userServiceClient.getMe.mockResolvedValue(mockResponse);

      const result = await service.me(userId, roles);

      expect(userServiceClient.getMe).toHaveBeenCalledWith(userId, roles);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should pass through errors from user-service', async () => {
      const dto = { email: 'test@example.com', password: 'Password123' };
      const error = new Error('user-service error');
      userServiceClient.login.mockRejectedValue(error);

      await expect(service.login(dto)).rejects.toThrow(error);
    });
  });
});
