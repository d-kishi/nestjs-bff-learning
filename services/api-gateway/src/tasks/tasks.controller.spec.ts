/**
 * TasksControllerのテスト
 *
 * TDD Red Phase
 */
import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { UserFromJwt } from '../common/types';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: jest.Mocked<TasksService>;

  const mockUser: UserFromJwt = {
    id: 1,
    email: 'test@example.com',
    roles: ['MEMBER'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    tasksService = module.get(TasksService);
  });

  describe('findAll', () => {
    it('should call tasksService.findAll with user and query', async () => {
      const query = { projectId: 1, page: 1, limit: 20 };
      const mockResponse = {
        data: [{ id: 1, title: 'Task 1' }],
        meta: { total: 1 },
      };
      tasksService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockUser, query);

      expect(tasksService.findAll).toHaveBeenCalledWith(mockUser, query);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should call tasksService.findOne with id and user', async () => {
      const mockResponse = { data: { id: 1, title: 'Task 1' } };
      tasksService.findOne.mockResolvedValue(mockResponse);

      const result = await controller.findOne(1, mockUser);

      expect(tasksService.findOne).toHaveBeenCalledWith(1, mockUser);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('should call tasksService.create with dto and user', async () => {
      const dto = { title: 'New Task', projectId: 1 };
      const mockResponse = { data: { id: 1, ...dto } };
      tasksService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(dto, mockUser);

      expect(tasksService.create).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should call tasksService.update with id, dto, and user', async () => {
      const dto = { title: 'Updated Task' };
      const mockResponse = { data: { id: 1, title: 'Updated Task' } };
      tasksService.update.mockResolvedValue(mockResponse);

      const result = await controller.update(1, dto, mockUser);

      expect(tasksService.update).toHaveBeenCalledWith(1, dto, mockUser);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should call tasksService.delete with id and user', async () => {
      tasksService.delete.mockResolvedValue(undefined);

      await controller.delete(1, mockUser);

      expect(tasksService.delete).toHaveBeenCalledWith(1, mockUser);
    });
  });
});
