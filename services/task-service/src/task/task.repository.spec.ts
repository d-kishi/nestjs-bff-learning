/**
 * TaskRepository ユニットテスト
 *
 * TypeORM Repositoryをモックしてテスト。
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskRepository } from './task.repository';
import { Task } from './entities/task.entity';
import { TaskStatus } from './entities/task-status.enum';
import { TaskPriority } from './entities/task-priority.enum';

describe('TaskRepository', () => {
  let taskRepository: TaskRepository;
  let mockTypeOrmRepository: jest.Mocked<Partial<Repository<Task>>>;

  // テスト用のタスクデータ
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
        TaskRepository,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    taskRepository = module.get<TaskRepository>(TaskRepository);
  });

  describe('create', () => {
    it('タスクを作成できる（最小項目）', async () => {
      // Given
      const createDto = { title: 'New Task', projectId: 1 };
      const expectedTask = {
        ...mockTask,
        ...createDto,
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
      };

      mockTypeOrmRepository.create!.mockReturnValue(expectedTask as Task);
      mockTypeOrmRepository.save!.mockResolvedValue(expectedTask as Task);

      // When
      const result = await taskRepository.create(createDto);

      // Then
      expect(result.title).toBe(createDto.title);
      expect(result.status).toBe(TaskStatus.TODO);
      expect(result.priority).toBe(TaskPriority.MEDIUM);
    });

    it('タスクを作成できる（全項目）', async () => {
      // Given
      const createDto = {
        title: 'Full Task',
        description: 'Description',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: '2025-12-31T23:59:59Z',
        projectId: 1,
        assigneeId: 123,
      };
      const expectedTask = {
        ...mockTask,
        ...createDto,
        dueDate: new Date(createDto.dueDate),
      };

      mockTypeOrmRepository.create!.mockReturnValue(expectedTask as Task);
      mockTypeOrmRepository.save!.mockResolvedValue(expectedTask as Task);

      // When
      const result = await taskRepository.create(createDto);

      // Then
      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
      expect(result.priority).toBe(TaskPriority.HIGH);
      expect(result.assigneeId).toBe(123);
    });
  });

  describe('findAll', () => {
    it('タスク一覧を取得できる', async () => {
      // Given
      const mockTasks = [mockTask, { ...mockTask, id: 2 }];
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockTasks, 2]),
      };
      mockTypeOrmRepository.createQueryBuilder!.mockReturnValue(
        mockQueryBuilder as any,
      );

      // When
      const result = await taskRepository.findAll();

      // Then
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('projectIdでフィルタリングできる', async () => {
      // Given
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockTask], 1]),
      };
      mockTypeOrmRepository.createQueryBuilder!.mockReturnValue(
        mockQueryBuilder as any,
      );

      // When
      await taskRepository.findAll({ projectId: 1 });

      // Then
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'task.projectId = :projectId',
        { projectId: 1 },
      );
    });

    it('statusでフィルタリングできる', async () => {
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
      await taskRepository.findAll({ status: TaskStatus.IN_PROGRESS });

      // Then
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'task.status = :status',
        { status: TaskStatus.IN_PROGRESS },
      );
    });

    it('複数条件でフィルタリングできる', async () => {
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
      await taskRepository.findAll({
        projectId: 1,
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
      });

      // Then
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
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
      await taskRepository.findAll({ page: 3, limit: 15 });

      // Then
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(30); // (3-1) * 15
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(15);
    });
  });

  describe('findById', () => {
    it('IDでタスクを取得できる', async () => {
      // Given
      mockTypeOrmRepository.findOne!.mockResolvedValue(mockTask);

      // When
      const result = await taskRepository.findById(1);

      // Then
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['project', 'tags'],
      });
      expect(result).toEqual(mockTask);
    });

    it('存在しないIDの場合nullを返す', async () => {
      // Given
      mockTypeOrmRepository.findOne!.mockResolvedValue(null);

      // When
      const result = await taskRepository.findById(999);

      // Then
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('タスクを更新できる', async () => {
      // Given
      const updateDto = { title: 'Updated Title', status: TaskStatus.DONE };
      const updatedTask = { ...mockTask, ...updateDto };
      mockTypeOrmRepository.findOne!.mockResolvedValue({ ...mockTask });
      mockTypeOrmRepository.save!.mockResolvedValue(updatedTask as Task);

      // When
      const result = await taskRepository.update(1, updateDto);

      // Then
      expect(result?.title).toBe('Updated Title');
      expect(result?.status).toBe(TaskStatus.DONE);
    });

    it('dueDateをnullに設定できる', async () => {
      // Given
      const taskWithDueDate = { ...mockTask, dueDate: new Date('2025-12-31') };
      const updateDto = { dueDate: null };
      mockTypeOrmRepository.findOne!.mockResolvedValue({ ...taskWithDueDate });
      mockTypeOrmRepository.save!.mockResolvedValue({
        ...taskWithDueDate,
        dueDate: null,
      } as Task);

      // When
      const result = await taskRepository.update(1, updateDto);

      // Then
      expect(result?.dueDate).toBeNull();
    });

    it('assigneeIdをnullに設定できる', async () => {
      // Given
      const taskWithAssignee = { ...mockTask, assigneeId: 123 };
      const updateDto = { assigneeId: null };
      mockTypeOrmRepository.findOne!.mockResolvedValue({ ...taskWithAssignee });
      mockTypeOrmRepository.save!.mockResolvedValue({
        ...taskWithAssignee,
        assigneeId: null,
      } as Task);

      // When
      const result = await taskRepository.update(1, updateDto);

      // Then
      expect(result?.assigneeId).toBeNull();
    });

    it('存在しないタスクの場合nullを返す', async () => {
      // Given
      mockTypeOrmRepository.findOne!.mockResolvedValue(null);

      // When
      const result = await taskRepository.update(999, { title: 'Updated' });

      // Then
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('タスクを削除できる', async () => {
      // Given
      mockTypeOrmRepository.delete!.mockResolvedValue({ affected: 1, raw: [] });

      // When
      const result = await taskRepository.delete(1);

      // Then
      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('存在しないタスクの場合falseを返す', async () => {
      // Given
      mockTypeOrmRepository.delete!.mockResolvedValue({ affected: 0, raw: [] });

      // When
      const result = await taskRepository.delete(999);

      // Then
      expect(result).toBe(false);
    });
  });
});
