/**
 * TagRepository ユニットテスト
 *
 * TypeORM Repositoryをモックしてテスト。
 * TDDアプローチ: テストを先に書き、実装を後から行う。
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TagRepository } from './tag.repository';
import { Tag } from './entities/tag.entity';

describe('TagRepository', () => {
  let tagRepository: TagRepository;
  let mockTypeOrmRepository: jest.Mocked<Partial<Repository<Tag>>>;

  // テスト用のタグデータ
  const mockTag: Tag = {
    id: 1,
    name: 'urgent',
    color: '#FF0000',
    createdAt: new Date('2025-01-01'),
    tasks: [],
  };

  beforeEach(async () => {
    mockTypeOrmRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagRepository,
        {
          provide: getRepositoryToken(Tag),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    tagRepository = module.get<TagRepository>(TagRepository);
  });

  describe('create', () => {
    it('タグを作成できる（名前のみ）', async () => {
      // Given
      const createDto = { name: 'new-tag' };
      const expectedTag = { ...mockTag, ...createDto, color: null };

      mockTypeOrmRepository.create!.mockReturnValue(expectedTag as Tag);
      mockTypeOrmRepository.save!.mockResolvedValue(expectedTag as Tag);

      // When
      const result = await tagRepository.create(createDto);

      // Then
      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith({
        name: createDto.name,
        color: undefined,
      });
      expect(result.name).toBe(createDto.name);
    });

    it('タグを作成できる（名前と色）', async () => {
      // Given
      const createDto = { name: 'urgent', color: '#FF0000' };
      const expectedTag = { ...mockTag, ...createDto };

      mockTypeOrmRepository.create!.mockReturnValue(expectedTag as Tag);
      mockTypeOrmRepository.save!.mockResolvedValue(expectedTag as Tag);

      // When
      const result = await tagRepository.create(createDto);

      // Then
      expect(result.name).toBe(createDto.name);
      expect(result.color).toBe(createDto.color);
    });
  });

  describe('findAll', () => {
    it('タグ一覧を取得できる', async () => {
      // Given
      const mockTags = [mockTag, { ...mockTag, id: 2, name: 'bug' }];
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockTags, 2]),
      };
      mockTypeOrmRepository.createQueryBuilder!.mockReturnValue(
        mockQueryBuilder as any,
      );

      // When
      const result = await tagRepository.findAll();

      // Then
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('名前で部分一致検索できる', async () => {
      // Given
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockTag], 1]),
      };
      mockTypeOrmRepository.createQueryBuilder!.mockReturnValue(
        mockQueryBuilder as any,
      );

      // When
      await tagRepository.findAll({ search: 'urg' });

      // Then
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(tag.name) LIKE LOWER(:search)',
        { search: '%urg%' },
      );
    });

    it('ページネーションが適用される', async () => {
      // Given
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      mockTypeOrmRepository.createQueryBuilder!.mockReturnValue(
        mockQueryBuilder as any,
      );

      // When
      await tagRepository.findAll({ page: 2, limit: 10 });

      // Then
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10); // (2-1) * 10
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('名前の昇順でソートされる', async () => {
      // Given
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      mockTypeOrmRepository.createQueryBuilder!.mockReturnValue(
        mockQueryBuilder as any,
      );

      // When
      await tagRepository.findAll();

      // Then
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('tag.name', 'ASC');
    });
  });

  describe('findById', () => {
    it('IDでタグを取得できる', async () => {
      // Given
      mockTypeOrmRepository.findOne!.mockResolvedValue(mockTag);

      // When
      const result = await tagRepository.findById(1);

      // Then
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockTag);
    });

    it('存在しないIDの場合nullを返す', async () => {
      // Given
      mockTypeOrmRepository.findOne!.mockResolvedValue(null);

      // When
      const result = await tagRepository.findById(999);

      // Then
      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('名前でタグを取得できる', async () => {
      // Given
      mockTypeOrmRepository.findOne!.mockResolvedValue(mockTag);

      // When
      const result = await tagRepository.findByName('urgent');

      // Then
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'urgent' },
      });
      expect(result).toEqual(mockTag);
    });

    it('存在しない名前の場合nullを返す', async () => {
      // Given
      mockTypeOrmRepository.findOne!.mockResolvedValue(null);

      // When
      const result = await tagRepository.findByName('nonexistent');

      // Then
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('タグを更新できる', async () => {
      // Given
      const updateDto = { name: 'critical', color: '#FF5500' };
      const updatedTag = { ...mockTag, ...updateDto };
      mockTypeOrmRepository.findOne!.mockResolvedValue({ ...mockTag });
      mockTypeOrmRepository.save!.mockResolvedValue(updatedTag as Tag);

      // When
      const result = await tagRepository.update(1, updateDto);

      // Then
      expect(result?.name).toBe(updateDto.name);
      expect(result?.color).toBe(updateDto.color);
    });

    it('色をnullに設定できる', async () => {
      // Given
      const updateDto = { color: null };
      const updatedTag = { ...mockTag, color: null };
      mockTypeOrmRepository.findOne!.mockResolvedValue({ ...mockTag });
      mockTypeOrmRepository.save!.mockResolvedValue(updatedTag as Tag);

      // When
      const result = await tagRepository.update(1, updateDto);

      // Then
      expect(result?.color).toBeNull();
    });

    it('存在しないタグの場合nullを返す', async () => {
      // Given
      mockTypeOrmRepository.findOne!.mockResolvedValue(null);

      // When
      const result = await tagRepository.update(999, { name: 'Updated' });

      // Then
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('タグを削除できる', async () => {
      // Given
      mockTypeOrmRepository.delete!.mockResolvedValue({ affected: 1, raw: [] });

      // When
      const result = await tagRepository.delete(1);

      // Then
      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('存在しないタグの場合falseを返す', async () => {
      // Given
      mockTypeOrmRepository.delete!.mockResolvedValue({ affected: 0, raw: [] });

      // When
      const result = await tagRepository.delete(999);

      // Then
      expect(result).toBe(false);
    });
  });
});
