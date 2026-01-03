/**
 * TasksServiceのテスト
 *
 * TDD Red Phase - BFFのタスクProxy
 */
import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskServiceClient } from '../clients/task-service.client';
import { UserFromJwt } from '../common/types';

describe('TasksService', () => {
  let service: TasksService;
  let taskServiceClient: jest.Mocked<TaskServiceClient>;

  const mockUser: UserFromJwt = {
    id: 1,
    email: 'test@example.com',
    roles: ['MEMBER'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TaskServiceClient,
          useValue: {
            getTasks: jest.fn(),
            getTask: jest.fn(),
            createTask: jest.fn(),
            updateTask: jest.fn(),
            deleteTask: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskServiceClient = module.get(TaskServiceClient);
  });

  describe('findAll', () => {
    it('should call taskServiceClient.getTasks with user info and query', async () => {
      const query = { projectId: 1, status: 'TODO', page: 1, limit: 20 };
      const mockResponse = {
        data: [{ id: 1, title: 'Task 1' }],
        meta: { total: 1 },
      };
      taskServiceClient.getTasks.mockResolvedValue(mockResponse);

      const result = await service.findAll(mockUser, query);

      expect(taskServiceClient.getTasks).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.roles,
        query,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should call taskServiceClient.getTask with id and user info', async () => {
      const mockResponse = { data: { id: 1, title: 'Task 1' } };
      taskServiceClient.getTask.mockResolvedValue(mockResponse);

      const result = await service.findOne(1, mockUser);

      expect(taskServiceClient.getTask).toHaveBeenCalledWith(
        1,
        mockUser.id,
        mockUser.roles,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('should call taskServiceClient.createTask with dto and user info', async () => {
      const dto = { title: 'New Task', projectId: 1 };
      const mockResponse = { data: { id: 1, ...dto } };
      taskServiceClient.createTask.mockResolvedValue(mockResponse);

      const result = await service.create(dto, mockUser);

      expect(taskServiceClient.createTask).toHaveBeenCalledWith(
        dto,
        mockUser.id,
        mockUser.roles,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should call taskServiceClient.updateTask with id, dto, and user info', async () => {
      const dto = { title: 'Updated Task' };
      const mockResponse = { data: { id: 1, title: 'Updated Task' } };
      taskServiceClient.updateTask.mockResolvedValue(mockResponse);

      const result = await service.update(1, dto, mockUser);

      expect(taskServiceClient.updateTask).toHaveBeenCalledWith(
        1,
        dto,
        mockUser.id,
        mockUser.roles,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should call taskServiceClient.deleteTask with id and user info', async () => {
      taskServiceClient.deleteTask.mockResolvedValue(undefined);

      await service.delete(1, mockUser);

      expect(taskServiceClient.deleteTask).toHaveBeenCalledWith(
        1,
        mockUser.id,
        mockUser.roles,
      );
    });
  });
});
