/**
 * CommentService ユニットテスト
 *
 * Repositoryをモックしてテスト。
 * US006のシナリオをカバー。権限チェックのテストを含む。
 */
import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { CommentRepository } from './comment.repository';
import { TaskRepository } from '../task/task.repository';
import { Comment } from './entities/comment.entity';
import { Task } from '../task/entities/task.entity';
import { TaskStatus } from '../task/entities/task-status.enum';
import { TaskPriority } from '../task/entities/task-priority.enum';
import {
  CommentNotFoundException,
  CommentForbiddenException,
  TaskNotFoundException,
} from '../common/exceptions/business.exception';

describe('CommentService', () => {
  let service: CommentService;
  let mockCommentRepository: jest.Mocked<Partial<CommentRepository>>;
  let mockTaskRepository: jest.Mocked<Partial<TaskRepository>>;

  // テスト用のデータ
  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: null,
    projectId: 1,
    project: {} as any,
    assigneeId: null,
    comments: [],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockComment: Comment = {
    id: 1,
    content: 'Test Comment',
    taskId: 1,
    task: mockTask,
    authorId: 123,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    mockCommentRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockTaskRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: CommentRepository,
          useValue: mockCommentRepository,
        },
        {
          provide: TaskRepository,
          useValue: mockTaskRepository,
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  // ============================================
  // US006: コメント投稿
  // ============================================
  describe('create', () => {
    it('【US006-1】タスクにコメントを投稿できる', async () => {
      // Given
      const content = '進捗報告です。50%完了しました。';
      const taskId = 1;
      const authorId = 123;
      const expectedComment = { ...mockComment, content, taskId, authorId };

      mockTaskRepository.findById!.mockResolvedValue(mockTask);
      mockCommentRepository.create!.mockResolvedValue(expectedComment);

      // When
      const result = await service.create(content, taskId, authorId);

      // Then
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockCommentRepository.create).toHaveBeenCalledWith(
        content,
        taskId,
        authorId,
      );
      expect(result.content).toBe(content);
      expect(result.authorId).toBe(authorId);
    });

    it('【US006-2】存在しないタスクの場合TaskNotFoundExceptionをスロー', async () => {
      // Given
      mockTaskRepository.findById!.mockResolvedValue(null);

      // When & Then
      await expect(service.create('コメント', 999, 123)).rejects.toThrow(
        TaskNotFoundException,
      );
    });
  });

  // ============================================
  // コメント一覧取得
  // ============================================
  describe('findAll', () => {
    it('タスクのコメント一覧を取得できる', async () => {
      // Given
      const mockComments = [
        mockComment,
        { ...mockComment, id: 2, content: 'Second Comment' },
      ];
      mockCommentRepository.findAll!.mockResolvedValue({
        data: mockComments,
        total: 2,
      });

      // When
      const result = await service.findAll({ taskId: 1 });

      // Then
      expect(mockCommentRepository.findAll).toHaveBeenCalledWith({ taskId: 1 });
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('ページネーションが適用される', async () => {
      // Given
      mockCommentRepository.findAll!.mockResolvedValue({
        data: [mockComment],
        total: 50,
      });

      // When
      const result = await service.findAll({ taskId: 1, page: 2, limit: 10 });

      // Then
      expect(mockCommentRepository.findAll).toHaveBeenCalledWith({
        taskId: 1,
        page: 2,
        limit: 10,
      });
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(10);
    });

    it('コメントがない場合空配列を返す', async () => {
      // Given
      mockCommentRepository.findAll!.mockResolvedValue({
        data: [],
        total: 0,
      });

      // When
      const result = await service.findAll({ taskId: 1 });

      // Then
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  // ============================================
  // コメント詳細取得
  // ============================================
  describe('findOne', () => {
    it('IDでコメントを取得できる', async () => {
      // Given
      mockCommentRepository.findById!.mockResolvedValue(mockComment);

      // When
      const result = await service.findOne(1);

      // Then
      expect(result).toEqual(mockComment);
    });

    it('存在しないIDの場合CommentNotFoundExceptionをスロー', async () => {
      // Given
      mockCommentRepository.findById!.mockResolvedValue(null);

      // When & Then
      await expect(service.findOne(999)).rejects.toThrow(
        CommentNotFoundException,
      );
    });
  });

  // ============================================
  // US006: コメント編集（権限チェック）
  // ============================================
  describe('update', () => {
    it('【US006-3】投稿者は自分のコメントを編集できる', async () => {
      // Given
      const updateDto = { content: '更新後のコメント' };
      const authorId = 123; // 投稿者と同じ
      const updatedComment = { ...mockComment, content: updateDto.content };

      mockCommentRepository.findById!.mockResolvedValue(mockComment);
      mockCommentRepository.update!.mockResolvedValue(updatedComment);

      // When
      const result = await service.update(1, updateDto, authorId);

      // Then
      expect(result.content).toBe(updateDto.content);
    });

    it('【US006-4】投稿者以外は編集できない（CommentForbiddenException）', async () => {
      // Given
      const updateDto = { content: '更新後のコメント' };
      const otherUserId = 456; // 投稿者ではない

      mockCommentRepository.findById!.mockResolvedValue(mockComment);

      // When & Then
      await expect(service.update(1, updateDto, otherUserId)).rejects.toThrow(
        CommentForbiddenException,
      );
    });

    it('存在しないコメントの場合CommentNotFoundExceptionをスロー', async () => {
      // Given
      mockCommentRepository.findById!.mockResolvedValue(null);

      // When & Then
      await expect(
        service.update(999, { content: '更新' }, 123),
      ).rejects.toThrow(CommentNotFoundException);
    });
  });

  // ============================================
  // US006: コメント削除（権限チェック）
  // ============================================
  describe('delete', () => {
    it('【US006-5】投稿者は自分のコメントを削除できる', async () => {
      // Given
      const authorId = 123;
      const roles: string[] = ['MEMBER'];

      mockCommentRepository.findById!.mockResolvedValue(mockComment);
      mockCommentRepository.delete!.mockResolvedValue(true);

      // When
      await service.delete(1, authorId, roles);

      // Then
      expect(mockCommentRepository.delete).toHaveBeenCalledWith(1);
    });

    it('【US006-6】ADMINは他者のコメントも削除できる', async () => {
      // Given
      const adminId = 999; // 投稿者ではない
      const roles: string[] = ['ADMIN'];

      mockCommentRepository.findById!.mockResolvedValue(mockComment);
      mockCommentRepository.delete!.mockResolvedValue(true);

      // When
      await service.delete(1, adminId, roles);

      // Then
      expect(mockCommentRepository.delete).toHaveBeenCalledWith(1);
    });

    it('【US006-7】MEMBERは他者のコメントを削除できない', async () => {
      // Given
      const otherUserId = 456;
      const roles: string[] = ['MEMBER'];

      mockCommentRepository.findById!.mockResolvedValue(mockComment);

      // When & Then
      await expect(service.delete(1, otherUserId, roles)).rejects.toThrow(
        CommentForbiddenException,
      );
    });

    it('存在しないコメントの場合CommentNotFoundExceptionをスロー', async () => {
      // Given
      mockCommentRepository.findById!.mockResolvedValue(null);

      // When & Then
      await expect(service.delete(999, 123, ['MEMBER'])).rejects.toThrow(
        CommentNotFoundException,
      );
    });
  });
});
