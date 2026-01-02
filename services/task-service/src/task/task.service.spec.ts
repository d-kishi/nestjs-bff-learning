/**
 * TaskService ユニットテスト
 *
 * Repositoryをモックしてテスト。
 * US003, US004, US005のシナリオをカバー。
 */
import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { TaskRepository } from './task.repository';
import { ProjectRepository } from '../project/project.repository';
import { Task } from './entities/task.entity';
import { Project } from '../project/entities/project.entity';
import { TaskStatus } from './entities/task-status.enum';
import { TaskPriority } from './entities/task-priority.enum';
import {
  TaskNotFoundException,
  ProjectNotFoundException,
} from '../common/exceptions/business.exception';

describe('TaskService', () => {
  let service: TaskService;
  let mockTaskRepository: jest.Mocked<Partial<TaskRepository>>;
  let mockProjectRepository: jest.Mocked<Partial<ProjectRepository>>;

  // テスト用のデータ
  const mockProject: Project = {
    id: 1,
    name: 'Test Project',
    description: null,
    ownerId: 123,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: null,
    projectId: 1,
    project: mockProject,
    assigneeId: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    mockTaskRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockProjectRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: TaskRepository,
          useValue: mockTaskRepository,
        },
        {
          provide: ProjectRepository,
          useValue: mockProjectRepository,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  // ============================================
  // US003: タスク作成
  // ============================================
  describe('create', () => {
    it('【US003-1】最小情報でタスクを作成できる', async () => {
      // Given
      const createDto = { title: '新規タスク', projectId: 1 };
      const expectedTask = {
        ...mockTask,
        ...createDto,
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
      };
      mockProjectRepository.findById!.mockResolvedValue(mockProject);
      mockTaskRepository.create!.mockResolvedValue(expectedTask);

      // When
      const result = await service.create(createDto);

      // Then
      expect(mockProjectRepository.findById).toHaveBeenCalledWith(1);
      expect(result.title).toBe(createDto.title);
      expect(result.status).toBe(TaskStatus.TODO);
      expect(result.priority).toBe(TaskPriority.MEDIUM);
    });

    it('【US003-2】全項目指定でタスクを作成できる', async () => {
      // Given
      const createDto = {
        title: 'Full Task',
        description: 'Description',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: '2025-12-31T23:59:59Z',
        projectId: 1,
        assigneeId: 123,
        tagIds: [1, 2],
      };
      const expectedTask = {
        ...mockTask,
        ...createDto,
        dueDate: new Date(createDto.dueDate),
      };
      mockProjectRepository.findById!.mockResolvedValue(mockProject);
      mockTaskRepository.create!.mockResolvedValue(expectedTask);

      // When
      const result = await service.create(createDto);

      // Then
      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
      expect(result.priority).toBe(TaskPriority.HIGH);
      expect(result.assigneeId).toBe(123);
    });

    it('【US003-5】存在しないプロジェクトの場合ProjectNotFoundExceptionをスロー', async () => {
      // Given
      const createDto = { title: 'タスク', projectId: 999 };
      mockProjectRepository.findById!.mockResolvedValue(null);

      // When & Then
      await expect(service.create(createDto)).rejects.toThrow(
        ProjectNotFoundException,
      );
    });
  });

  // ============================================
  // US004: タスク一覧取得
  // ============================================
  describe('findAll', () => {
    it('【US004-1】全タスクを取得できる', async () => {
      // Given
      const mockTasks = Array.from({ length: 5 }, (_, i) => ({
        ...mockTask,
        id: i + 1,
      }));
      mockTaskRepository.findAll!.mockResolvedValue({
        data: mockTasks,
        total: 5,
      });

      // When
      const result = await service.findAll();

      // Then
      expect(result.data).toHaveLength(5);
      expect(result.meta.total).toBe(5);
    });

    it('【US004-2】projectIdでフィルタリングできる', async () => {
      // Given
      const mockTasks = [
        mockTask,
        { ...mockTask, id: 2 },
        { ...mockTask, id: 3 },
      ];
      mockTaskRepository.findAll!.mockResolvedValue({
        data: mockTasks,
        total: 3,
      });

      // When
      const result = await service.findAll({ projectId: 1 });

      // Then
      expect(mockTaskRepository.findAll).toHaveBeenCalledWith({ projectId: 1 });
      expect(result.data).toHaveLength(3);
    });

    it('【US004-3】statusでフィルタリングできる', async () => {
      // Given
      const inProgressTasks = [
        { ...mockTask, id: 1, status: TaskStatus.IN_PROGRESS },
        { ...mockTask, id: 2, status: TaskStatus.IN_PROGRESS },
      ];
      mockTaskRepository.findAll!.mockResolvedValue({
        data: inProgressTasks,
        total: 2,
      });

      // When
      const result = await service.findAll({ status: TaskStatus.IN_PROGRESS });

      // Then
      expect(mockTaskRepository.findAll).toHaveBeenCalledWith({
        status: TaskStatus.IN_PROGRESS,
      });
      expect(result.data).toHaveLength(2);
    });

    it('【US004-4】複数条件でAND検索できる', async () => {
      // Given
      mockTaskRepository.findAll!.mockResolvedValue({
        data: [mockTask],
        total: 1,
      });

      // When
      const result = await service.findAll({
        projectId: 1,
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
      });

      // Then
      expect(mockTaskRepository.findAll).toHaveBeenCalledWith({
        projectId: 1,
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
      });
    });

    it('【US004-6】該当タスクがない場合空配列を返す', async () => {
      // Given
      mockTaskRepository.findAll!.mockResolvedValue({ data: [], total: 0 });

      // When
      const result = await service.findAll({ status: TaskStatus.DONE });

      // Then
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  // ============================================
  // findOne（詳細取得）
  // ============================================
  describe('findOne', () => {
    it('IDでタスクを取得できる', async () => {
      // Given
      mockTaskRepository.findById!.mockResolvedValue(mockTask);

      // When
      const result = await service.findOne(1);

      // Then
      expect(result).toEqual(mockTask);
    });

    it('存在しないIDの場合TaskNotFoundExceptionをスロー', async () => {
      // Given
      mockTaskRepository.findById!.mockResolvedValue(null);

      // When & Then
      await expect(service.findOne(999)).rejects.toThrow(TaskNotFoundException);
    });
  });

  // ============================================
  // US005: タスクステータス更新
  // ============================================
  describe('update', () => {
    it('【US005-1】ステータスをIN_PROGRESSに更新できる', async () => {
      // Given
      const updateDto = { status: TaskStatus.IN_PROGRESS };
      const updatedTask = { ...mockTask, status: TaskStatus.IN_PROGRESS };
      mockTaskRepository.findById!.mockResolvedValue(mockTask);
      mockTaskRepository.update!.mockResolvedValue(updatedTask);

      // When
      const result = await service.update(1, updateDto);

      // Then
      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('【US005-2】ステータスをDONEに更新できる', async () => {
      // Given
      const inProgressTask = { ...mockTask, status: TaskStatus.IN_PROGRESS };
      const updateDto = { status: TaskStatus.DONE };
      const updatedTask = { ...inProgressTask, status: TaskStatus.DONE };
      mockTaskRepository.findById!.mockResolvedValue(inProgressTask);
      mockTaskRepository.update!.mockResolvedValue(updatedTask);

      // When
      const result = await service.update(1, updateDto);

      // Then
      expect(result.status).toBe(TaskStatus.DONE);
    });

    it('【US005-3】複数項目を同時に更新できる', async () => {
      // Given
      const updateDto = {
        title: 'Updated Title',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        assigneeId: 456,
      };
      const updatedTask = { ...mockTask, ...updateDto };
      mockTaskRepository.findById!.mockResolvedValue(mockTask);
      mockTaskRepository.update!.mockResolvedValue(updatedTask);

      // When
      const result = await service.update(1, updateDto);

      // Then
      expect(result.title).toBe('Updated Title');
      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
      expect(result.priority).toBe(TaskPriority.HIGH);
      expect(result.assigneeId).toBe(456);
    });

    it('【US005-4】期限を削除できる（dueDateをnullに）', async () => {
      // Given
      const taskWithDueDate = { ...mockTask, dueDate: new Date('2025-12-31') };
      const updateDto = { dueDate: null };
      const updatedTask = { ...taskWithDueDate, dueDate: null };
      mockTaskRepository.findById!.mockResolvedValue(taskWithDueDate);
      mockTaskRepository.update!.mockResolvedValue(updatedTask);

      // When
      const result = await service.update(1, updateDto);

      // Then
      expect(result.dueDate).toBeNull();
    });

    it('【US005-5】担当者を解除できる（assigneeIdをnullに）', async () => {
      // Given
      const taskWithAssignee = { ...mockTask, assigneeId: 123 };
      const updateDto = { assigneeId: null };
      const updatedTask = { ...taskWithAssignee, assigneeId: null };
      mockTaskRepository.findById!.mockResolvedValue(taskWithAssignee);
      mockTaskRepository.update!.mockResolvedValue(updatedTask);

      // When
      const result = await service.update(1, updateDto);

      // Then
      expect(result.assigneeId).toBeNull();
    });

    it('【US005-6】存在しないタスクの場合TaskNotFoundExceptionをスロー', async () => {
      // Given
      mockTaskRepository.findById!.mockResolvedValue(null);

      // When & Then
      await expect(
        service.update(999, { status: TaskStatus.DONE }),
      ).rejects.toThrow(TaskNotFoundException);
    });
  });

  // ============================================
  // delete（削除）
  // ============================================
  describe('delete', () => {
    it('タスクを削除できる', async () => {
      // Given
      mockTaskRepository.findById!.mockResolvedValue(mockTask);
      mockTaskRepository.delete!.mockResolvedValue(true);

      // When
      await service.delete(1);

      // Then
      expect(mockTaskRepository.delete).toHaveBeenCalledWith(1);
    });

    it('存在しないタスクの場合TaskNotFoundExceptionをスロー', async () => {
      // Given
      mockTaskRepository.findById!.mockResolvedValue(null);

      // When & Then
      await expect(service.delete(999)).rejects.toThrow(TaskNotFoundException);
    });
  });
});
