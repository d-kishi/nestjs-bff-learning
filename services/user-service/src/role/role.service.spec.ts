/**
 * RoleService ユニットテスト
 *
 * Repositoryをモックしてテスト。
 * US012のロール管理シナリオをカバー。
 */
import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { RoleRepository } from './role.repository';
import { Role } from './entities/role.entity';
import {
  RoleNotFoundException,
  RoleAlreadyExistsException,
  RoleHasUsersException,
} from '../common/exceptions/business.exception';

describe('RoleService', () => {
  let service: RoleService;
  let mockRepository: jest.Mocked<Partial<RoleRepository>>;

  // テスト用のロールデータ
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

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findByIds: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      countUsersByRoleId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: RoleRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
  });

  // ============================================
  // findAll（一覧取得）
  // ============================================
  describe('findAll', () => {
    it('全ロール一覧を取得できる', async () => {
      // Given
      const mockRoles = [mockAdminRole, mockMemberRole];
      mockRepository.findAll!.mockResolvedValue(mockRoles);

      // When
      const result = await service.findAll();

      // Then
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('ADMIN');
      expect(result[1].name).toBe('MEMBER');
    });

    it('ロールがない場合空配列を返す', async () => {
      // Given
      mockRepository.findAll!.mockResolvedValue([]);

      // When
      const result = await service.findAll();

      // Then
      expect(result).toEqual([]);
    });
  });

  // ============================================
  // findOne（詳細取得）
  // ============================================
  describe('findOne', () => {
    it('IDでロールを取得できる', async () => {
      // Given
      mockRepository.findById!.mockResolvedValue(mockAdminRole);
      mockRepository.countUsersByRoleId!.mockResolvedValue(5);

      // When
      const result = await service.findOne(1);

      // Then
      expect(result.role).toEqual(mockAdminRole);
      expect(result.userCount).toBe(5);
    });

    it('存在しないIDの場合RoleNotFoundExceptionをスロー', async () => {
      // Given
      mockRepository.findById!.mockResolvedValue(null);

      // When & Then
      await expect(service.findOne(999)).rejects.toThrow(RoleNotFoundException);
    });
  });

  // ============================================
  // US012-10: ロール作成
  // ============================================
  describe('create', () => {
    it('【US012-10】新しいロールを作成できる', async () => {
      // Given
      const createDto = { name: 'EDITOR', description: '編集者' };
      const expectedRole = { ...mockAdminRole, id: 3, ...createDto };
      mockRepository.findByName!.mockResolvedValue(null);
      mockRepository.create!.mockResolvedValue(expectedRole);

      // When
      const result = await service.create(createDto);

      // Then
      expect(result.name).toBe('EDITOR');
      expect(result.description).toBe('編集者');
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    });

    it('同名のロールが存在する場合RoleAlreadyExistsExceptionをスロー', async () => {
      // Given
      const createDto = { name: 'ADMIN', description: '重複ロール' };
      mockRepository.findByName!.mockResolvedValue(mockAdminRole);

      // When & Then
      await expect(service.create(createDto)).rejects.toThrow(
        RoleAlreadyExistsException,
      );
    });
  });

  // ============================================
  // update（更新）
  // ============================================
  describe('update', () => {
    it('ロールを更新できる', async () => {
      // Given
      const updateDto = { description: '更新された説明' };
      const updatedRole = { ...mockAdminRole, ...updateDto };
      mockRepository.findById!.mockResolvedValue(mockAdminRole);
      mockRepository.findByName!.mockResolvedValue(null);
      mockRepository.update!.mockResolvedValue(updatedRole);

      // When
      const result = await service.update(1, updateDto);

      // Then
      expect(result.description).toBe('更新された説明');
    });

    it('存在しないロールの場合RoleNotFoundExceptionをスロー', async () => {
      // Given
      mockRepository.findById!.mockResolvedValue(null);

      // When & Then
      await expect(
        service.update(999, { description: 'test' }),
      ).rejects.toThrow(RoleNotFoundException);
    });

    it('別のロールと同名に変更しようとするとRoleAlreadyExistsExceptionをスロー', async () => {
      // Given
      const updateDto = { name: 'MEMBER' };
      mockRepository.findById!.mockResolvedValue(mockAdminRole);
      mockRepository.findByName!.mockResolvedValue(mockMemberRole);

      // When & Then
      await expect(service.update(1, updateDto)).rejects.toThrow(
        RoleAlreadyExistsException,
      );
    });

    it('自分自身と同名の場合は更新を許可する', async () => {
      // Given
      const updateDto = { name: 'ADMIN', description: '更新された説明' };
      const updatedRole = { ...mockAdminRole, ...updateDto };
      mockRepository.findById!.mockResolvedValue(mockAdminRole);
      mockRepository.findByName!.mockResolvedValue(mockAdminRole); // 自分自身
      mockRepository.update!.mockResolvedValue(updatedRole);

      // When
      const result = await service.update(1, updateDto);

      // Then
      expect(result.name).toBe('ADMIN');
    });
  });

  // ============================================
  // US012-11: ロール削除
  // ============================================
  describe('delete', () => {
    it('ユーザーが割り当てられていないロールを削除できる', async () => {
      // Given
      mockRepository.findById!.mockResolvedValue(mockAdminRole);
      mockRepository.countUsersByRoleId!.mockResolvedValue(0);
      mockRepository.delete!.mockResolvedValue(true);

      // When
      await service.delete(1);

      // Then
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('存在しないロールの場合RoleNotFoundExceptionをスロー', async () => {
      // Given
      mockRepository.findById!.mockResolvedValue(null);

      // When & Then
      await expect(service.delete(999)).rejects.toThrow(RoleNotFoundException);
    });

    it('【US012-11】ユーザーが割り当て済みのロールを削除しようとするとRoleHasUsersExceptionをスロー', async () => {
      // Given
      mockRepository.findById!.mockResolvedValue(mockMemberRole);
      mockRepository.countUsersByRoleId!.mockResolvedValue(5);

      // When & Then
      await expect(service.delete(2)).rejects.toThrow(RoleHasUsersException);
    });
  });
});
