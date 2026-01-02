/**
 * UserService ユニットテスト
 *
 * Repositoryをモックしてテスト。
 * US010, US011, US012のユーザー管理シナリオをカバー。
 */
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { RoleRepository } from '../role/role.repository';
import { RefreshTokenRepository } from '../auth/refresh-token.repository';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Role } from '../role/entities/role.entity';
import {
  UserNotFoundException,
  UserForbiddenException,
  UserInvalidPasswordException,
  RoleNotFoundException,
} from '../common/exceptions/business.exception';
import * as bcrypt from 'bcrypt';

// bcryptをモック
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: jest.Mocked<Partial<UserRepository>>;
  let mockRoleRepository: jest.Mocked<Partial<RoleRepository>>;
  let mockRefreshTokenRepository: jest.Mocked<Partial<RefreshTokenRepository>>;

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

  const mockAdminRole: Role = {
    id: 1,
    name: 'ADMIN',
    description: '管理者',
    createdAt: new Date('2025-01-01'),
    users: [],
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

  const mockAdminUser: User = {
    id: 2,
    email: 'admin@example.com',
    password: 'hashedPassword',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    profile: { ...mockProfile, id: 2, userId: 2 },
    roles: [mockAdminRole, mockMemberRole],
  };

  beforeEach(async () => {
    mockUserRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      existsByEmail: jest.fn(),
      update: jest.fn(),
      updateProfile: jest.fn(),
      updatePassword: jest.fn(),
      updateRoles: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
    };

    mockRoleRepository = {
      findByIds: jest.fn(),
    };

    mockRefreshTokenRepository = {
      revokeAllByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
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
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  // ============================================
  // US012: ユーザー一覧取得
  // ============================================
  describe('findAll', () => {
    it('【US012-1】ADMINがユーザー一覧を取得できる', async () => {
      // Given
      const mockUsers = [mockUser, mockAdminUser];
      mockUserRepository.findAll!.mockResolvedValue({
        data: mockUsers,
        total: 2,
      });

      // When
      const result = await service.findAll({}, 2, ['ADMIN']);

      // Then
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('【US012-2】メールアドレスでフィルタリングできる', async () => {
      // Given
      mockUserRepository.findAll!.mockResolvedValue({
        data: [mockUser],
        total: 1,
      });

      // When
      const result = await service.findAll({ email: 'test' }, 2, ['ADMIN']);

      // Then
      expect(mockUserRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test' }),
      );
    });

    it('【US012-6】MEMBERがユーザー一覧にアクセスするとForbiddenエラー', async () => {
      // When & Then
      await expect(service.findAll({}, 1, ['MEMBER'])).rejects.toThrow(
        UserForbiddenException,
      );
    });
  });

  // ============================================
  // findOne（詳細取得）
  // ============================================
  describe('findOne', () => {
    it('本人が自分の情報を取得できる', async () => {
      // Given
      mockUserRepository.findById!.mockResolvedValue(mockUser);

      // When
      const result = await service.findOne(1, 1, ['MEMBER']);

      // Then
      expect(result.email).toBe('test@example.com');
    });

    it('ADMINが他ユーザーの情報を取得できる', async () => {
      // Given
      mockUserRepository.findById!.mockResolvedValue(mockUser);

      // When
      const result = await service.findOne(1, 2, ['ADMIN']);

      // Then
      expect(result.email).toBe('test@example.com');
    });

    it('MEMBERが他人の情報を取得しようとするとForbiddenエラー', async () => {
      // Given
      mockUserRepository.findById!.mockResolvedValue(mockUser);

      // When & Then
      await expect(service.findOne(1, 99, ['MEMBER'])).rejects.toThrow(
        UserForbiddenException,
      );
    });

    it('存在しないユーザーの場合NotFoundエラー', async () => {
      // Given
      mockUserRepository.findById!.mockResolvedValue(null);

      // When & Then
      await expect(service.findOne(999, 999, ['MEMBER'])).rejects.toThrow(
        UserNotFoundException,
      );
    });
  });

  // ============================================
  // US010: プロフィール更新
  // ============================================
  describe('updateProfile', () => {
    it('【US010-1】本人がdisplayNameを更新できる', async () => {
      // Given
      const updateData = { displayName: 'New Name' };
      const updatedProfile = { ...mockProfile, ...updateData };
      mockUserRepository.findById!.mockResolvedValue(mockUser);
      mockUserRepository.updateProfile!.mockResolvedValue(updatedProfile);

      // When
      const result = await service.updateProfile(1, updateData, 1, ['MEMBER']);

      // Then
      expect(result.displayName).toBe('New Name');
    });

    it('【US010-2】複数フィールドを同時に更新できる', async () => {
      // Given
      const updateData = {
        displayName: 'New Name',
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Hello!',
      };
      const updatedProfile = { ...mockProfile, ...updateData };
      mockUserRepository.findById!.mockResolvedValue(mockUser);
      mockUserRepository.updateProfile!.mockResolvedValue(updatedProfile);

      // When
      const result = await service.updateProfile(1, updateData, 1, ['MEMBER']);

      // Then
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
    });

    it('【US010-3】ADMINが他ユーザーのプロフィールを更新できる', async () => {
      // Given
      const updateData = { displayName: 'Admin Updated' };
      const updatedProfile = { ...mockProfile, ...updateData };
      mockUserRepository.findById!.mockResolvedValue(mockUser);
      mockUserRepository.updateProfile!.mockResolvedValue(updatedProfile);

      // When
      const result = await service.updateProfile(1, updateData, 2, ['ADMIN']);

      // Then
      expect(result.displayName).toBe('Admin Updated');
    });

    it('【US010-4】MEMBERが他人のプロフィールを更新しようとするとForbiddenエラー', async () => {
      // Given
      mockUserRepository.findById!.mockResolvedValue(mockUser);

      // When & Then
      await expect(
        service.updateProfile(1, { displayName: 'Test' }, 99, ['MEMBER']),
      ).rejects.toThrow(UserForbiddenException);
    });
  });

  // ============================================
  // US011: パスワード変更
  // ============================================
  describe('changePassword', () => {
    it('【US011-1】正しい現在のパスワードで変更できる', async () => {
      // Given
      mockUserRepository.findById!.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      mockUserRepository.updatePassword!.mockResolvedValue(true);

      // When
      await service.changePassword(
        1,
        { currentPassword: 'OldPass123', newPassword: 'NewPass456' },
        1,
      );

      // Then
      expect(mockUserRepository.updatePassword).toHaveBeenCalledWith(
        1,
        'newHashedPassword',
      );
    });

    it('【US011-2】現在のパスワードが間違っている場合エラー', async () => {
      // Given
      mockUserRepository.findById!.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // When & Then
      await expect(
        service.changePassword(
          1,
          { currentPassword: 'WrongPass', newPassword: 'NewPass456' },
          1,
        ),
      ).rejects.toThrow(UserInvalidPasswordException);
    });

    it('【US011-5】他人のパスワードを変更しようとするとForbiddenエラー', async () => {
      // Given
      mockUserRepository.findById!.mockResolvedValue(mockUser);

      // When & Then
      await expect(
        service.changePassword(
          1,
          { currentPassword: 'OldPass123', newPassword: 'NewPass456' },
          99,
        ),
      ).rejects.toThrow(UserForbiddenException);
    });

    it('【US011-6】ADMINでも他人のパスワードは変更できない', async () => {
      // Given - ADMINユーザー(id:2)が一般ユーザー(id:1)のパスワードを変更しようとする
      mockUserRepository.findById!.mockResolvedValue(mockUser);

      // When & Then
      await expect(
        service.changePassword(
          1,
          { currentPassword: 'OldPass123', newPassword: 'NewPass456' },
          2, // ADMIN user id
        ),
      ).rejects.toThrow(UserForbiddenException);
    });
  });

  // ============================================
  // US012: ロール更新
  // ============================================
  describe('updateRoles', () => {
    it('【US012-4】ADMINがユーザーにロールを付与できる', async () => {
      // Given
      const roles = [mockAdminRole, mockMemberRole];
      mockUserRepository.findById!.mockResolvedValue(mockUser);
      mockRoleRepository.findByIds!.mockResolvedValue(roles);
      mockUserRepository.updateRoles!.mockResolvedValue({
        ...mockUser,
        roles,
      });

      // When
      const result = await service.updateRoles(1, { roleIds: [1, 2] }, 2, [
        'ADMIN',
      ]);

      // Then
      expect(result.roles).toHaveLength(2);
    });

    it('MEMBERがロールを変更しようとするとForbiddenエラー', async () => {
      // Given
      mockUserRepository.findById!.mockResolvedValue(mockUser);

      // When & Then
      await expect(
        service.updateRoles(1, { roleIds: [1] }, 1, ['MEMBER']),
      ).rejects.toThrow(UserForbiddenException);
    });

    it('存在しないロールIDを指定するとNotFoundエラー', async () => {
      // Given
      mockUserRepository.findById!.mockResolvedValue(mockUser);
      mockRoleRepository.findByIds!.mockResolvedValue([mockMemberRole]); // 1つしか見つからない

      // When & Then
      await expect(
        service.updateRoles(1, { roleIds: [2, 999] }, 2, ['ADMIN']),
      ).rejects.toThrow(RoleNotFoundException);
    });

    it('空配列で全ロールを削除できる', async () => {
      // Given
      mockUserRepository.findById!.mockResolvedValue(mockUser);
      mockRoleRepository.findByIds!.mockResolvedValue([]);
      mockUserRepository.updateRoles!.mockResolvedValue({
        ...mockUser,
        roles: [],
      });

      // When
      const result = await service.updateRoles(1, { roleIds: [] }, 2, [
        'ADMIN',
      ]);

      // Then
      expect(result.roles).toHaveLength(0);
    });
  });

  // ============================================
  // US012: ステータス更新
  // ============================================
  describe('updateStatus', () => {
    it('【US012-3】ADMINがユーザーを無効化できる', async () => {
      // Given
      mockUserRepository.findById!.mockResolvedValue(mockUser);
      mockUserRepository.updateStatus!.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });
      mockRefreshTokenRepository.revokeAllByUserId!.mockResolvedValue(1);

      // When
      const result = await service.updateStatus(1, { isActive: false }, 2, [
        'ADMIN',
      ]);

      // Then
      expect(result.isActive).toBe(false);
      expect(mockRefreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith(
        1,
      );
    });

    it('MEMBERがステータスを変更しようとするとForbiddenエラー', async () => {
      // Given
      mockUserRepository.findById!.mockResolvedValue(mockUser);

      // When & Then
      await expect(
        service.updateStatus(1, { isActive: false }, 1, ['MEMBER']),
      ).rejects.toThrow(UserForbiddenException);
    });
  });

  // ============================================
  // US012: ユーザー削除
  // ============================================
  describe('delete', () => {
    it('【US012-5】ADMINがユーザーを削除できる', async () => {
      // Given
      mockUserRepository.findById!.mockResolvedValue(mockUser);
      mockUserRepository.delete!.mockResolvedValue(true);

      // When
      await service.delete(1, 2, ['ADMIN']);

      // Then
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });

    it('MEMBERがユーザーを削除しようとするとForbiddenエラー', async () => {
      // Given
      mockUserRepository.findById!.mockResolvedValue(mockUser);

      // When & Then
      await expect(service.delete(1, 1, ['MEMBER'])).rejects.toThrow(
        UserForbiddenException,
      );
    });

    it('存在しないユーザーを削除しようとするとNotFoundエラー', async () => {
      // Given
      mockUserRepository.findById!.mockResolvedValue(null);

      // When & Then
      await expect(service.delete(999, 2, ['ADMIN'])).rejects.toThrow(
        UserNotFoundException,
      );
    });
  });
});
