/**
 * ProjectService ユニットテスト
 *
 * Repositoryをモックしてテスト。
 * US001, US002のシナリオをカバー。
 *
 * Why: DataSourceもモック
 * - Service層でトランザクション管理を行うため
 * - DataSource.transaction()をモックして動作を検証
 */
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { ProjectService } from './project.service';
import { ProjectRepository } from './project.repository';
import { Project } from './entities/project.entity';
import {
  ProjectNotFoundException,
  ProjectForbiddenException,
} from '../common/exceptions/business.exception';

describe('ProjectService', () => {
  let service: ProjectService;
  let mockRepository: jest.Mocked<Partial<ProjectRepository>>;
  let mockDataSource: jest.Mocked<Partial<DataSource>>;
  let mockEntityManager: jest.Mocked<Partial<EntityManager>>;

  // テスト用のプロジェクトデータ
  const mockProject: Project = {
    id: 1,
    name: 'Test Project',
    description: 'Test Description',
    ownerId: 123,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    // EntityManagerのモック
    mockEntityManager = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      }),
    };

    // DataSourceのモック
    // transaction()はコールバック関数を受け取り、EntityManagerを渡して実行
    mockDataSource = {
      transaction: jest.fn().mockImplementation(async (callback) => {
        return callback(mockEntityManager as EntityManager);
      }),
    };

    mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: ProjectRepository,
          useValue: mockRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
  });

  // ============================================
  // US001: プロジェクト作成
  // ============================================
  describe('create', () => {
    it('【US001-1】名前と説明でプロジェクトを作成できる', async () => {
      // Given
      const createDto = { name: '新規プロジェクト', description: '説明' };
      const ownerId = 123;
      const expectedProject = { ...mockProject, ...createDto, ownerId };
      mockRepository.create!.mockResolvedValue(expectedProject);

      // When
      const result = await service.create(createDto, ownerId);

      // Then
      expect(mockRepository.create).toHaveBeenCalledWith(createDto, ownerId);
      expect(result.name).toBe(createDto.name);
      expect(result.ownerId).toBe(ownerId);
    });

    it('【US001-2】名前のみでプロジェクトを作成できる（description: null）', async () => {
      // Given
      const createDto = { name: 'プロジェクトA' };
      const ownerId = 123;
      const expectedProject = {
        ...mockProject,
        ...createDto,
        description: null,
        ownerId,
      };
      mockRepository.create!.mockResolvedValue(expectedProject);

      // When
      const result = await service.create(createDto, ownerId);

      // Then
      expect(result.description).toBeNull();
    });
  });

  // ============================================
  // US002: プロジェクト一覧取得
  // ============================================
  describe('findAll', () => {
    it('【US002-1】プロジェクト一覧を取得できる', async () => {
      // Given
      const mockProjects = [
        mockProject,
        { ...mockProject, id: 2 },
        { ...mockProject, id: 3 },
      ];
      mockRepository.findAll!.mockResolvedValue({
        data: mockProjects,
        total: 3,
      });

      // When
      const result = await service.findAll();

      // Then
      expect(result.data).toHaveLength(3);
      expect(result.meta.total).toBe(3);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
    });

    it('【US002-2】ページネーションが適用される', async () => {
      // Given
      const mockProjects = Array.from({ length: 10 }, (_, i) => ({
        ...mockProject,
        id: i + 11,
      }));
      mockRepository.findAll!.mockResolvedValue({
        data: mockProjects,
        total: 25,
      });

      // When
      const result = await service.findAll({ page: 2, limit: 10 });

      // Then
      expect(mockRepository.findAll).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
      });
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.total).toBe(25);
    });

    it('【US002-3】ownerIdでフィルタリングできる', async () => {
      // Given
      const ownerId = 123;
      const mockProjects = [mockProject, { ...mockProject, id: 2 }];
      mockRepository.findAll!.mockResolvedValue({
        data: mockProjects,
        total: 2,
      });

      // When
      const result = await service.findAll({ ownerId });

      // Then
      expect(mockRepository.findAll).toHaveBeenCalledWith({ ownerId });
      expect(result.data).toHaveLength(2);
    });

    it('【US002-4】プロジェクトがない場合空配列を返す', async () => {
      // Given
      mockRepository.findAll!.mockResolvedValue({ data: [], total: 0 });

      // When
      const result = await service.findAll();

      // Then
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  // ============================================
  // findOne（詳細取得）
  // ============================================
  describe('findOne', () => {
    it('IDでプロジェクトを取得できる', async () => {
      // Given
      mockRepository.findById!.mockResolvedValue(mockProject);

      // When
      const result = await service.findOne(1);

      // Then
      expect(result).toEqual(mockProject);
    });

    it('存在しないIDの場合ProjectNotFoundExceptionをスロー', async () => {
      // Given
      mockRepository.findById!.mockResolvedValue(null);

      // When & Then
      await expect(service.findOne(999)).rejects.toThrow(
        ProjectNotFoundException,
      );
    });
  });

  // ============================================
  // update（更新）
  // Why: トランザクション内でEntityManagerを使用するため、
  //      mockEntityManagerの動作を検証
  // ============================================
  describe('update', () => {
    it('オーナーはプロジェクトを更新できる', async () => {
      // Given
      const updateDto = { name: 'Updated Name' };
      const userId = 123; // オーナー
      const updatedProject = { ...mockProject, ...updateDto };
      mockEntityManager.findOne!.mockResolvedValue(mockProject);
      mockEntityManager.save!.mockResolvedValue(updatedProject);

      // When
      const result = await service.update(1, updateDto, userId);

      // Then
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(result.name).toBe('Updated Name');
    });

    it('存在しないプロジェクトの場合ProjectNotFoundExceptionをスロー', async () => {
      // Given
      mockEntityManager.findOne!.mockResolvedValue(null);

      // When & Then
      await expect(
        service.update(999, { name: 'Updated' }, 123),
      ).rejects.toThrow(ProjectNotFoundException);
    });

    it('オーナー以外が更新しようとするとProjectForbiddenExceptionをスロー', async () => {
      // Given
      const otherUserId = 456; // オーナーではない
      mockEntityManager.findOne!.mockResolvedValue(mockProject); // ownerId: 123

      // When & Then
      await expect(
        service.update(1, { name: 'Updated' }, otherUserId),
      ).rejects.toThrow(ProjectForbiddenException);
    });
  });

  // ============================================
  // delete（削除）
  // Why: 事前チェックはRepository、削除はトランザクション内のEntityManager
  // ============================================
  describe('delete', () => {
    it('オーナーはプロジェクトを削除できる', async () => {
      // Given
      const userId = 123; // オーナー
      // 事前チェック用（トランザクション外）
      mockRepository.findById!.mockResolvedValue(mockProject);
      // トランザクション内の操作
      mockEntityManager.find!.mockResolvedValue([]); // タスクなし
      mockEntityManager.delete!.mockResolvedValue({ affected: 1 });

      // When
      await service.delete(1, userId);

      // Then
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockDataSource.transaction).toHaveBeenCalled();
    });

    it('関連タスク・コメントがある場合も削除できる', async () => {
      // Given
      const userId = 123;
      mockRepository.findById!.mockResolvedValue(mockProject);
      // タスクが存在する場合
      mockEntityManager.find!.mockResolvedValue([{ id: 10 }, { id: 20 }]);
      mockEntityManager.delete!.mockResolvedValue({ affected: 1 });

      // When
      await service.delete(1, userId);

      // Then
      expect(mockDataSource.transaction).toHaveBeenCalled();
      // コメント削除、タスク削除、プロジェクト削除の順で呼ばれる
      expect(mockEntityManager.delete).toHaveBeenCalled();
    });

    it('存在しないプロジェクトの場合ProjectNotFoundExceptionをスロー', async () => {
      // Given
      mockRepository.findById!.mockResolvedValue(null);

      // When & Then
      await expect(service.delete(999, 123)).rejects.toThrow(
        ProjectNotFoundException,
      );
      // トランザクションは呼ばれない（事前チェックで弾かれる）
      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });

    it('オーナー以外が削除しようとするとProjectForbiddenExceptionをスロー', async () => {
      // Given
      const otherUserId = 456; // オーナーではない
      mockRepository.findById!.mockResolvedValue(mockProject); // ownerId: 123

      // When & Then
      await expect(service.delete(1, otherUserId)).rejects.toThrow(
        ProjectForbiddenException,
      );
      // トランザクションは呼ばれない（事前チェックで弾かれる）
      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });
  });
});
