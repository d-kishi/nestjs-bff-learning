/**
 * CommentRepository ユニットテスト
 *
 * TypeORM Repositoryをモックしてテスト。
 * TDDアプローチ: テストを先に書き、実装を後から行う。
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentRepository } from './comment.repository';
import { Comment } from './entities/comment.entity';

describe('CommentRepository', () => {
  let commentRepository: CommentRepository;
  let mockTypeOrmRepository: jest.Mocked<Partial<Repository<Comment>>>;

  // テスト用のコメントデータ
  const mockComment: Comment = {
    id: 1,
    content: 'Test Comment',
    taskId: 1,
    task: {} as any,
    authorId: 123,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
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
        CommentRepository,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    commentRepository = module.get<CommentRepository>(CommentRepository);
  });

  describe('create', () => {
    it('コメントを作成できる', async () => {
      // Given
      const content = 'New Comment';
      const taskId = 1;
      const authorId = 123;
      const expectedComment = { ...mockComment, content, taskId, authorId };

      mockTypeOrmRepository.create!.mockReturnValue(expectedComment as Comment);
      mockTypeOrmRepository.save!.mockResolvedValue(expectedComment as Comment);

      // When
      const result = await commentRepository.create(content, taskId, authorId);

      // Then
      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith({
        content,
        taskId,
        authorId,
      });
      expect(result.content).toBe(content);
      expect(result.taskId).toBe(taskId);
      expect(result.authorId).toBe(authorId);
    });
  });

  describe('findAll', () => {
    it('タスクIDでコメント一覧を取得できる', async () => {
      // Given
      const mockComments = [mockComment, { ...mockComment, id: 2 }];
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockComments, 2]),
      };
      mockTypeOrmRepository.createQueryBuilder!.mockReturnValue(
        mockQueryBuilder as any,
      );

      // When
      const result = await commentRepository.findAll({ taskId: 1 });

      // Then
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'comment.taskId = :taskId',
        { taskId: 1 },
      );
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
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
      await commentRepository.findAll({ taskId: 1, page: 2, limit: 10 });

      // Then
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10); // (2-1) * 10
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('作成日時の降順でソートされる', async () => {
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
      await commentRepository.findAll({ taskId: 1 });

      // Then
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'comment.createdAt',
        'DESC',
      );
    });
  });

  describe('findById', () => {
    it('IDでコメントを取得できる', async () => {
      // Given
      mockTypeOrmRepository.findOne!.mockResolvedValue(mockComment);

      // When
      const result = await commentRepository.findById(1);

      // Then
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockComment);
    });

    it('存在しないIDの場合nullを返す', async () => {
      // Given
      mockTypeOrmRepository.findOne!.mockResolvedValue(null);

      // When
      const result = await commentRepository.findById(999);

      // Then
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('コメントを更新できる', async () => {
      // Given
      const newContent = 'Updated Content';
      const updatedComment = { ...mockComment, content: newContent };
      mockTypeOrmRepository.findOne!.mockResolvedValue({ ...mockComment });
      mockTypeOrmRepository.save!.mockResolvedValue(updatedComment as Comment);

      // When
      const result = await commentRepository.update(1, { content: newContent });

      // Then
      expect(result?.content).toBe(newContent);
    });

    it('存在しないコメントの場合nullを返す', async () => {
      // Given
      mockTypeOrmRepository.findOne!.mockResolvedValue(null);

      // When
      const result = await commentRepository.update(999, {
        content: 'Updated',
      });

      // Then
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('コメントを削除できる', async () => {
      // Given
      mockTypeOrmRepository.delete!.mockResolvedValue({ affected: 1, raw: [] });

      // When
      const result = await commentRepository.delete(1);

      // Then
      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('存在しないコメントの場合falseを返す', async () => {
      // Given
      mockTypeOrmRepository.delete!.mockResolvedValue({ affected: 0, raw: [] });

      // When
      const result = await commentRepository.delete(999);

      // Then
      expect(result).toBe(false);
    });
  });
});
