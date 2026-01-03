/**
 * AuthControllerのテスト
 *
 * TDD Red Phase
 */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
            me: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('register', () => {
    it('should call authService.register and return result', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'Password123',
        displayName: 'Test',
      };
      const mockResponse = {
        data: {
          user: { id: 1, email: 'test@example.com' },
          accessToken: 'jwt-token',
          refreshToken: 'refresh-token',
        },
      };
      authService.register.mockResolvedValue(mockResponse);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('login', () => {
    it('should call authService.login and return result', async () => {
      const dto = { email: 'test@example.com', password: 'Password123' };
      const mockResponse = {
        data: {
          user: { id: 1, email: 'test@example.com' },
          accessToken: 'jwt-token',
          refreshToken: 'refresh-token',
        },
      };
      authService.login.mockResolvedValue(mockResponse);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('refresh', () => {
    it('should call authService.refresh and return result', async () => {
      const dto = { refreshToken: 'old-refresh-token' };
      const mockResponse = {
        data: { accessToken: 'new-jwt', refreshToken: 'new-refresh' },
      };
      authService.refresh.mockResolvedValue(mockResponse);

      const result = await controller.refresh(dto);

      expect(authService.refresh).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('should call authService.logout with user info', async () => {
      const dto = { refreshToken: 'refresh-token' };
      const user = { id: 1, email: 'test@example.com', roles: ['MEMBER'] };
      const mockResponse = { data: { message: 'Logged out successfully' } };
      authService.logout.mockResolvedValue(mockResponse);

      const result = await controller.logout(user, dto);

      expect(authService.logout).toHaveBeenCalledWith(dto, user.id, user.roles);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('me', () => {
    it('should call authService.me with user info', async () => {
      const user = { id: 1, email: 'test@example.com', roles: ['MEMBER'] };
      const mockResponse = {
        data: {
          id: 1,
          email: 'test@example.com',
          profile: { displayName: 'Test' },
        },
      };
      authService.me.mockResolvedValue(mockResponse);

      const result = await controller.me(user);

      expect(authService.me).toHaveBeenCalledWith(user.id, user.roles);
      expect(result).toEqual(mockResponse);
    });
  });
});
