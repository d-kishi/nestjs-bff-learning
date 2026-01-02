/**
 * ProjectRepository ユニットテスト
 *
 * TypeORM Repositoryをモックしてテスト。
 * 実際のDB接続は不要。
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectRepository } from './project.repository';
import { Project } from './entities/project.entity';

describe('ProjectRepository', () => {
  let projectRepository: ProjectRepository;
  let mockTypeOrmRepository: jest.Mocked<Partial<Repository<Project>>>;

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
    // TypeORM Repositoryのモック
    mockTypeOrmRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectRepository,
        {
          provide: getRepositoryToken(Project),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    projectRepository = module.get<ProjectRepository>(ProjectRepository);
  });

  describe('create', () => {
    it('プロジェクトを作成できる', async () => {
      // Given
      const createDto = { name: 'New Project', description: 'Description' };
      const ownerId = 123;
      const expectedProject = { ...mockProject, ...createDto, ownerId };

      mockTypeOrmRepository.create!.mockReturnValue(expectedProject as Project);
      mockTypeOrmRepository.save!.mockResolvedValue(expectedProject as Project);

      // When
      const result = await projectRepository.create(createDto, ownerId);

      // Then
      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith({
        ...createDto,
        ownerId,
      });
      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(expectedProject);
      expect(result.name).toBe(createDto.name);
      expect(result.ownerId).toBe(ownerId);
    });
  });

  describe('findAll', () => {
    it('プロジェクト一覧を取得できる', async () => {
      // Given
      const mockProjects = [mockProject, { ...mockProject, id: 2 }];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockProjects, 2]),
      };
      mockTypeOrmRepository.createQueryBuilder!.mockReturnValue(
        mockQueryBuilder as any,
      );

      // When
      const result = await projectRepository.findAll();

      // Then
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'project.createdAt',
        'DESC',
      );
    });

    it('ownerIdでフィルタリングできる', async () => {
      // Given
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockProject], 1]),
      };
      mockTypeOrmRepository.createQueryBuilder!.mockReturnValue(
        mockQueryBuilder as any,
      );

      // When
      const result = await projectRepository.findAll({ ownerId: 123 });

      // Then
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'project.ownerId = :ownerId',
        { ownerId: 123 },
      );
      expect(result.data).toHaveLength(1);
    });

    it('ページネーションが適用される', async () => {
      // Given
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      mockTypeOrmRepository.createQueryBuilder!.mockReturnValue(
        mockQueryBuilder as any,
      );

      // When
      await projectRepository.findAll({ page: 2, limit: 10 });

      // Then
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10); // (2-1) * 10
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });
  });

  describe('findById', () => {
    it('IDでプロジェクトを取得できる', async () => {
      // Given
      mockTypeOrmRepository.findOne!.mockResolvedValue(mockProject);

      // When
      const result = await projectRepository.findById(1);

      // Then
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockProject);
    });

    it('存在しないIDの場合nullを返す', async () => {
      // Given
      mockTypeOrmRepository.findOne!.mockResolvedValue(null);

      // When
      const result = await projectRepository.findById(999);

      // Then
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('プロジェクトを更新できる', async () => {
      // Given
      const updateDto = { name: 'Updated Name' };
      const updatedProject = { ...mockProject, ...updateDto };
      mockTypeOrmRepository.findOne!.mockResolvedValue({ ...mockProject });
      mockTypeOrmRepository.save!.mockResolvedValue(updatedProject as Project);

      // When
      const result = await projectRepository.update(1, updateDto);

      // Then
      expect(result?.name).toBe('Updated Name');
    });

    it('存在しないプロジェクトの場合nullを返す', async () => {
      // Given
      mockTypeOrmRepository.findOne!.mockResolvedValue(null);

      // When
      const result = await projectRepository.update(999, { name: 'Updated' });

      // Then
      expect(result).toBeNull();
    });

    it('descriptionをnullに更新できる', async () => {
      // Given
      const updateDto = { description: null };
      const updatedProject = { ...mockProject, description: null };
      mockTypeOrmRepository.findOne!.mockResolvedValue({ ...mockProject });
      mockTypeOrmRepository.save!.mockResolvedValue(updatedProject);

      // When
      const result = await projectRepository.update(1, updateDto);

      // Then
      expect(result?.description).toBeNull();
    });
  });

  describe('delete', () => {
    it('プロジェクトを削除できる', async () => {
      // Given
      mockTypeOrmRepository.delete!.mockResolvedValue({ affected: 1, raw: [] });

      // When
      const result = await projectRepository.delete(1);

      // Then
      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('存在しないプロジェクトの場合falseを返す', async () => {
      // Given
      mockTypeOrmRepository.delete!.mockResolvedValue({ affected: 0, raw: [] });

      // When
      const result = await projectRepository.delete(999);

      // Then
      expect(result).toBe(false);
    });
  });
});
