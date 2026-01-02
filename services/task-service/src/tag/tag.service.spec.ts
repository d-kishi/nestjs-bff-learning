/**
 * TagService ユニットテスト
 *
 * Repositoryをモックしてテスト。
 * US007のシナリオをカバー。重複チェックのテストを含む。
 */
import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from './tag.service';
import { TagRepository } from './tag.repository';
import { TaskRepository } from '../task/task.repository';
import { Tag } from './entities/tag.entity';
import { Task } from '../task/entities/task.entity';
import { TaskStatus } from '../task/entities/task-status.enum';
import { TaskPriority } from '../task/entities/task-priority.enum';
import {
  TagNotFoundException,
  TagAlreadyExistsException,
  TaskNotFoundException,
  TaskTagAlreadyExistsException,
} from '../common/exceptions/business.exception';

describe('TagService', () => {
  let service: TagService;
  let mockTagRepository: jest.Mocked<Partial<TagRepository>>;
  let mockTaskRepository: jest.Mocked<Partial<TaskRepository>>;

  // テスト用のデータ
  const mockTag: Tag = {
    id: 1,
    name: 'urgent',
    color: '#FF0000',
    createdAt: new Date('2025-01-01'),
    tasks: [],
  };

  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: null,
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: null,
    projectId: 1,
    project: {} as any,
    assigneeId: null,
    tags: [],
    comments: [],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    mockTagRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockTaskRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagService,
        {
          provide: TagRepository,
          useValue: mockTagRepository,
        },
        {
          provide: TaskRepository,
          useValue: mockTaskRepository,
        },
      ],
    }).compile();

    service = module.get<TagService>(TagService);
  });

  // ============================================
  // US007: タグ作成
  // ============================================
  describe('create', () => {
    it('【US007-1】タグを作成できる（名前のみ）', async () => {
      // Given
      const createDto = { name: 'new-tag' };
      const expectedTag = { ...mockTag, ...createDto, color: null };

      mockTagRepository.findByName!.mockResolvedValue(null);
      mockTagRepository.create!.mockResolvedValue(expectedTag);

      // When
      const result = await service.create(createDto);

      // Then
      expect(mockTagRepository.findByName).toHaveBeenCalledWith('new-tag');
      expect(result.name).toBe(createDto.name);
    });

    it('【US007-2】タグを作成できる（名前と色）', async () => {
      // Given
      const createDto = { name: 'urgent', color: '#FF0000' };
      const expectedTag = { ...mockTag, ...createDto };

      mockTagRepository.findByName!.mockResolvedValue(null);
      mockTagRepository.create!.mockResolvedValue(expectedTag);

      // When
      const result = await service.create(createDto);

      // Then
      expect(result.name).toBe(createDto.name);
      expect(result.color).toBe(createDto.color);
    });

    it('【US007-3】同名タグが存在する場合TagAlreadyExistsExceptionをスロー', async () => {
      // Given
      const createDto = { name: 'urgent' };
      mockTagRepository.findByName!.mockResolvedValue(mockTag);

      // When & Then
      await expect(service.create(createDto)).rejects.toThrow(
        TagAlreadyExistsException,
      );
    });
  });

  // ============================================
  // タグ一覧取得
  // ============================================
  describe('findAll', () => {
    it('タグ一覧を取得できる', async () => {
      // Given
      const mockTags = [mockTag, { ...mockTag, id: 2, name: 'bug' }];
      mockTagRepository.findAll!.mockResolvedValue({
        data: mockTags,
        total: 2,
      });

      // When
      const result = await service.findAll();

      // Then
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('名前で部分一致検索できる', async () => {
      // Given
      mockTagRepository.findAll!.mockResolvedValue({
        data: [mockTag],
        total: 1,
      });

      // When
      const result = await service.findAll({ search: 'urg' });

      // Then
      expect(mockTagRepository.findAll).toHaveBeenCalledWith({ search: 'urg' });
      expect(result.data).toHaveLength(1);
    });

    it('タグがない場合空配列を返す', async () => {
      // Given
      mockTagRepository.findAll!.mockResolvedValue({
        data: [],
        total: 0,
      });

      // When
      const result = await service.findAll();

      // Then
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  // ============================================
  // タグ詳細取得
  // ============================================
  describe('findOne', () => {
    it('IDでタグを取得できる', async () => {
      // Given
      mockTagRepository.findById!.mockResolvedValue(mockTag);

      // When
      const result = await service.findOne(1);

      // Then
      expect(result).toEqual(mockTag);
    });

    it('存在しないIDの場合TagNotFoundExceptionをスロー', async () => {
      // Given
      mockTagRepository.findById!.mockResolvedValue(null);

      // When & Then
      await expect(service.findOne(999)).rejects.toThrow(TagNotFoundException);
    });
  });

  // ============================================
  // US007: タグ更新
  // ============================================
  describe('update', () => {
    it('【US007-4】タグを更新できる', async () => {
      // Given
      const updateDto = { name: 'critical', color: '#FF5500' };
      const updatedTag = { ...mockTag, ...updateDto };

      mockTagRepository.findById!.mockResolvedValue(mockTag);
      mockTagRepository.findByName!.mockResolvedValue(null);
      mockTagRepository.update!.mockResolvedValue(updatedTag);

      // When
      const result = await service.update(1, updateDto);

      // Then
      expect(result.name).toBe(updateDto.name);
      expect(result.color).toBe(updateDto.color);
    });

    it('【US007-5】色をnullに設定できる', async () => {
      // Given
      const updateDto = { color: null };
      const updatedTag = { ...mockTag, color: null };

      mockTagRepository.findById!.mockResolvedValue(mockTag);
      mockTagRepository.update!.mockResolvedValue(updatedTag);

      // When
      const result = await service.update(1, updateDto);

      // Then
      expect(result.color).toBeNull();
    });

    it('【US007-6】更新後の名前が既存タグと重複する場合TagAlreadyExistsExceptionをスロー', async () => {
      // Given
      const updateDto = { name: 'existing' };
      const existingTag = { ...mockTag, id: 2, name: 'existing' };

      mockTagRepository.findById!.mockResolvedValue(mockTag);
      mockTagRepository.findByName!.mockResolvedValue(existingTag);

      // When & Then
      await expect(service.update(1, updateDto)).rejects.toThrow(
        TagAlreadyExistsException,
      );
    });

    it('自分自身との名前重複はエラーにならない', async () => {
      // Given
      const updateDto = { name: 'urgent', color: '#00FF00' };
      const updatedTag = { ...mockTag, ...updateDto };

      mockTagRepository.findById!.mockResolvedValue(mockTag);
      mockTagRepository.findByName!.mockResolvedValue(mockTag); // 同じタグ
      mockTagRepository.update!.mockResolvedValue(updatedTag);

      // When
      const result = await service.update(1, updateDto);

      // Then
      expect(result.color).toBe('#00FF00');
    });

    it('存在しないタグの場合TagNotFoundExceptionをスロー', async () => {
      // Given
      mockTagRepository.findById!.mockResolvedValue(null);

      // When & Then
      await expect(service.update(999, { name: 'Updated' })).rejects.toThrow(
        TagNotFoundException,
      );
    });
  });

  // ============================================
  // US007: タグ削除
  // ============================================
  describe('delete', () => {
    it('【US007-7】タグを削除できる', async () => {
      // Given
      mockTagRepository.findById!.mockResolvedValue(mockTag);
      mockTagRepository.delete!.mockResolvedValue(true);

      // When
      await service.delete(1);

      // Then
      expect(mockTagRepository.delete).toHaveBeenCalledWith(1);
    });

    it('存在しないタグの場合TagNotFoundExceptionをスロー', async () => {
      // Given
      mockTagRepository.findById!.mockResolvedValue(null);

      // When & Then
      await expect(service.delete(999)).rejects.toThrow(TagNotFoundException);
    });
  });

  // ============================================
  // US007: タスクへのタグ追加
  // ============================================
  describe('addTagToTask', () => {
    it('【US007-8】タスクにタグを追加できる', async () => {
      // Given
      const taskWithoutTag = { ...mockTask, tags: [] };
      const taskWithTag = { ...mockTask, tags: [mockTag] };

      mockTaskRepository.findById!.mockResolvedValue(taskWithoutTag);
      mockTagRepository.findById!.mockResolvedValue(mockTag);
      mockTaskRepository.save!.mockResolvedValue(taskWithTag);

      // When
      const result = await service.addTagToTask(1, 1);

      // Then
      expect(result.tags).toContain(mockTag);
    });

    it('【US007-9】存在しないタスクの場合TaskNotFoundExceptionをスロー', async () => {
      // Given
      mockTaskRepository.findById!.mockResolvedValue(null);

      // When & Then
      await expect(service.addTagToTask(999, 1)).rejects.toThrow(
        TaskNotFoundException,
      );
    });

    it('【US007-10】存在しないタグの場合TagNotFoundExceptionをスロー', async () => {
      // Given
      mockTaskRepository.findById!.mockResolvedValue(mockTask);
      mockTagRepository.findById!.mockResolvedValue(null);

      // When & Then
      await expect(service.addTagToTask(1, 999)).rejects.toThrow(
        TagNotFoundException,
      );
    });

    it('【US007-11】既にタグが付与されている場合TaskTagAlreadyExistsExceptionをスロー', async () => {
      // Given
      const taskWithTag = { ...mockTask, tags: [mockTag] };
      mockTaskRepository.findById!.mockResolvedValue(taskWithTag);
      mockTagRepository.findById!.mockResolvedValue(mockTag);

      // When & Then
      await expect(service.addTagToTask(1, 1)).rejects.toThrow(
        TaskTagAlreadyExistsException,
      );
    });
  });

  // ============================================
  // US007: タスクからのタグ削除
  // ============================================
  describe('removeTagFromTask', () => {
    it('【US007-12】タスクからタグを削除できる', async () => {
      // Given
      const taskWithTag = { ...mockTask, tags: [mockTag] };
      const taskWithoutTag = { ...mockTask, tags: [] };

      mockTaskRepository.findById!.mockResolvedValue(taskWithTag);
      mockTagRepository.findById!.mockResolvedValue(mockTag);
      mockTaskRepository.save!.mockResolvedValue(taskWithoutTag);

      // When
      await service.removeTagFromTask(1, 1);

      // Then
      expect(mockTaskRepository.save).toHaveBeenCalled();
    });

    it('存在しないタスクの場合TaskNotFoundExceptionをスロー', async () => {
      // Given
      mockTaskRepository.findById!.mockResolvedValue(null);

      // When & Then
      await expect(service.removeTagFromTask(999, 1)).rejects.toThrow(
        TaskNotFoundException,
      );
    });

    it('存在しないタグの場合TagNotFoundExceptionをスロー', async () => {
      // Given
      mockTaskRepository.findById!.mockResolvedValue(mockTask);
      mockTagRepository.findById!.mockResolvedValue(null);

      // When & Then
      await expect(service.removeTagFromTask(1, 999)).rejects.toThrow(
        TagNotFoundException,
      );
    });
  });
});
