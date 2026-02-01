/**
 * AuthService ユニットテスト
 *
 * Repositoryをモックしてテスト。
 * US008, US009の認証シナリオをカバー。
 */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UserRepository } from '../user/user.repository';
import { RoleRepository } from '../role/role.repository';
import { RefreshTokenRepository } from './refresh-token.repository';
import { User } from '../user/entities/user.entity';
import { UserProfile } from '../user/entities/user-profile.entity';
import { Role } from '../role/entities/role.entity';
import {
  AuthEmailAlreadyExistsException,
  AuthInvalidCredentialsException,
  AuthAccountDisabledException,
  AuthInvalidRefreshTokenException,
  UserNotFoundException,
} from '../common/exceptions/business.exception';
import * as bcrypt from 'bcryptjs';

// bcryptjsをモック
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: jest.Mocked<Partial<UserRepository>>;
  let mockRoleRepository: jest.Mocked<Partial<RoleRepository>>;
  let mockRefreshTokenRepository: jest.Mocked<Partial<RefreshTokenRepository>>;
  let mockJwtService: jest.Mocked<Partial<JwtService>>;
  let mockConfigService: jest.Mocked<Partial<ConfigService>>;

  // テスト用のデータ
  const mockProfile: UserProfile = {
    id: 1,
    userId: 1,
    displayName: 'Test User',
    firstName: null,
    lastName: null,
    avatarUrl: null,
    bio: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    user: {} as User,
  };

  const mockMemberRole: Role = {
    id: 2,
    name: 'MEMBER',
    description: '一般ユーザー',
    createdAt: new Date('2025-01-01'),
    users: [],
  };

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    profile: mockProfile,
    roles: [mockMemberRole],
  };

  const mockDisabledUser: User = {
    ...mockUser,
    id: 2,
    email: 'disabled@example.com',
    isActive: false,
  };

  beforeEach(async () => {
    mockUserRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      existsByEmail: jest.fn(),
    };

    mockRoleRepository = {
      findByName: jest.fn(),
    };

    mockRefreshTokenRepository = {
      create: jest.fn(),
      findValidToken: jest.fn(),
      revoke: jest.fn(),
      revokeByToken: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: RoleRepository,
          useValue: mockRoleRepository,
        },
        {
          provide: RefreshTokenRepository,
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // ConfigServiceのデフォルト設定
    mockConfigService.get!.mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret';
      if (key === 'JWT_EXPIRES_IN') return '15m';
      if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
      return undefined;
    });
  });

  // ============================================
  // US008: ユーザー登録
  // ============================================
  describe('register', () => {
    it('【US008-1】新規ユーザーを登録できる', async () => {
      // Given
      const registerDto = {
        email: 'new@example.com',
        password: 'Password123',
        displayName: 'New User',
      };
      mockUserRepository.existsByEmail!.mockResolvedValue(false);
      mockRoleRepository.findByName!.mockResolvedValue(mockMemberRole);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUserRepository.create!.mockResolvedValue({
        ...mockUser,
        email: registerDto.email,
      });
      mockJwtService.sign!.mockReturnValue('access-token');
      mockRefreshTokenRepository.create!.mockResolvedValue({
        id: 1,
        token: 'refresh-token',
        userId: 1,
        expiresAt: new Date(),
        isRevoked: false,
        createdAt: new Date(),
      });

      // When
      const result = await service.register(registerDto);

      // Then
      expect(result.user.email).toBe('new@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('【US008-2】登録時にMEMBERロールが付与される', async () => {
      // Given
      const registerDto = {
        email: 'new@example.com',
        password: 'Password123',
        displayName: 'New User',
      };
      mockUserRepository.existsByEmail!.mockResolvedValue(false);
      mockRoleRepository.findByName!.mockResolvedValue(mockMemberRole);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUserRepository.create!.mockResolvedValue(mockUser);
      mockJwtService.sign!.mockReturnValue('access-token');
      mockRefreshTokenRepository.create!.mockResolvedValue({
        id: 1,
        token: 'refresh-token',
        userId: 1,
        expiresAt: new Date(),
        isRevoked: false,
        createdAt: new Date(),
      });

      // When
      const result = await service.register(registerDto);

      // Then
      expect(result.user.roles).toContainEqual(
        expect.objectContaining({ name: 'MEMBER' }),
      );
    });

    it('【US008-5】既存メールアドレスで登録するとエラー', async () => {
      // Given
      const registerDto = {
        email: 'existing@example.com',
        password: 'Password123',
        displayName: 'New User',
      };
      mockUserRepository.existsByEmail!.mockResolvedValue(true);

      // When & Then
      await expect(service.register(registerDto)).rejects.toThrow(
        AuthEmailAlreadyExistsException,
      );
    });
  });

  // ============================================
  // US009: ログイン
  // ============================================
  describe('login', () => {
    it('【US009-1】正しい認証情報でログインできる', async () => {
      // Given
      const loginDto = {
        email: 'test@example.com',
        password: 'Password123',
      };
      mockUserRepository.findByEmail!.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign!.mockReturnValue('access-token');
      mockRefreshTokenRepository.create!.mockResolvedValue({
        id: 1,
        token: 'refresh-token',
        userId: 1,
        expiresAt: new Date(),
        isRevoked: false,
        createdAt: new Date(),
      });

      // When
      const result = await service.login(loginDto);

      // Then
      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('【US009-2】存在しないメールアドレスでログインするとエラー', async () => {
      // Given
      const loginDto = {
        email: 'notexist@example.com',
        password: 'Password123',
      };
      mockUserRepository.findByEmail!.mockResolvedValue(null);

      // When & Then
      await expect(service.login(loginDto)).rejects.toThrow(
        AuthInvalidCredentialsException,
      );
    });

    it('【US009-3】間違ったパスワードでログインするとエラー', async () => {
      // Given
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };
      mockUserRepository.findByEmail!.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // When & Then
      await expect(service.login(loginDto)).rejects.toThrow(
        AuthInvalidCredentialsException,
      );
    });

    it('【US009-4】無効化されたアカウントでログインするとエラー', async () => {
      // Given
      const loginDto = {
        email: 'disabled@example.com',
        password: 'Password123',
      };
      mockUserRepository.findByEmail!.mockResolvedValue(mockDisabledUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // When & Then
      await expect(service.login(loginDto)).rejects.toThrow(
        AuthAccountDisabledException,
      );
    });
  });

  // ============================================
  // リフレッシュトークン
  // ============================================
  describe('refresh', () => {
    it('有効なリフレッシュトークンで新しいアクセストークンを取得できる', async () => {
      // Given
      const refreshToken = 'valid-refresh-token';
      mockRefreshTokenRepository.findValidToken!.mockResolvedValue({
        id: 1,
        token: refreshToken,
        userId: 1,
        expiresAt: new Date(Date.now() + 86400000),
        isRevoked: false,
        createdAt: new Date(),
      });
      mockUserRepository.findById!.mockResolvedValue(mockUser);
      mockJwtService.sign!.mockReturnValue('new-access-token');
      mockRefreshTokenRepository.revoke!.mockResolvedValue(true);
      mockRefreshTokenRepository.create!.mockResolvedValue({
        id: 2,
        token: 'new-refresh-token',
        userId: 1,
        expiresAt: new Date(),
        isRevoked: false,
        createdAt: new Date(),
      });

      // When
      const result = await service.refresh(refreshToken);

      // Then
      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBeDefined();
      // Refresh Token Rotation: 古いトークンは無効化される
      expect(mockRefreshTokenRepository.revoke).toHaveBeenCalledWith(1);
    });

    it('無効なリフレッシュトークンでエラー', async () => {
      // Given
      const refreshToken = 'invalid-token';
      mockRefreshTokenRepository.findValidToken!.mockResolvedValue(null);

      // When & Then
      await expect(service.refresh(refreshToken)).rejects.toThrow(
        AuthInvalidRefreshTokenException,
      );
    });

    it('無効化されたユーザーのトークンでエラー', async () => {
      // Given
      const refreshToken = 'valid-refresh-token';
      mockRefreshTokenRepository.findValidToken!.mockResolvedValue({
        id: 1,
        token: refreshToken,
        userId: 2,
        expiresAt: new Date(Date.now() + 86400000),
        isRevoked: false,
        createdAt: new Date(),
      });
      mockUserRepository.findById!.mockResolvedValue(mockDisabledUser);

      // When & Then
      await expect(service.refresh(refreshToken)).rejects.toThrow(
        AuthAccountDisabledException,
      );
    });
  });

  // ============================================
  // ログアウト
  // ============================================
  describe('logout', () => {
    it('リフレッシュトークンを無効化できる', async () => {
      // Given
      const refreshToken = 'refresh-token';
      mockRefreshTokenRepository.revokeByToken!.mockResolvedValue(true);

      // When
      await service.logout(refreshToken);

      // Then
      expect(mockRefreshTokenRepository.revokeByToken).toHaveBeenCalledWith(
        refreshToken,
      );
    });
  });

  // ============================================
  // 現在ユーザー取得
  // ============================================
  describe('me', () => {
    it('ユーザーIDから現在ユーザー情報を取得できる', async () => {
      // Given
      mockUserRepository.findById!.mockResolvedValue(mockUser);

      // When
      const result = await service.me(1);

      // Then
      expect(result.email).toBe('test@example.com');
      expect(result.profile.displayName).toBe('Test User');
    });

    it('存在しないユーザーIDでNotFoundエラー', async () => {
      // Given
      mockUserRepository.findById!.mockResolvedValue(null);

      // When & Then
      await expect(service.me(999)).rejects.toThrow(UserNotFoundException);
    });
  });
});
