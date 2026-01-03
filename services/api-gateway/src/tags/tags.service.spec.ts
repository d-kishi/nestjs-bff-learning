/**
 * TagsServiceのテスト
 *
 * TDD Red Phase
 */
import { Test, TestingModule } from '@nestjs/testing';
import { TagsService } from './tags.service';
import { TaskServiceClient } from '../clients/task-service.client';
import { UserFromJwt } from '../common/types';

describe('TagsService', () => {
  let service: TagsService;
  let taskServiceClient: jest.Mocked<TaskServiceClient>;

  const mockUser: UserFromJwt = {
    id: 1,
    email: 'test@example.com',
    roles: ['MEMBER'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        {
          provide: TaskServiceClient,
          useValue: {
            getTags: jest.fn(),
            getTag: jest.fn(),
            createTag: jest.fn(),
            updateTag: jest.fn(),
            deleteTag: jest.fn(),
            addTagToTask: jest.fn(),
            removeTagFromTask: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TagsService>(TagsService);
    taskServiceClient = module.get(TaskServiceClient);
  });

  describe('findAll', () => {
    it('should call taskServiceClient.getTags with user info and query', async () => {
      const query = { name: 'urgent', page: 1, limit: 20 };
      const mockResponse = {
        data: [{ id: 1, name: 'urgent' }],
        meta: { total: 1 },
      };
      taskServiceClient.getTags.mockResolvedValue(mockResponse);

      const result = await service.findAll(mockUser, query);

      expect(taskServiceClient.getTags).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.roles,
        query,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should call taskServiceClient.getTag with id and user info', async () => {
      const mockResponse = { data: { id: 1, name: 'urgent' } };
      taskServiceClient.getTag.mockResolvedValue(mockResponse);

      const result = await service.findOne(1, mockUser);

      expect(taskServiceClient.getTag).toHaveBeenCalledWith(
        1,
        mockUser.id,
        mockUser.roles,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('should call taskServiceClient.createTag with dto and user info', async () => {
      const dto = { name: 'urgent', color: '#FF0000' };
      const mockResponse = { data: { id: 1, ...dto } };
      taskServiceClient.createTag.mockResolvedValue(mockResponse);

      const result = await service.create(dto, mockUser);

      expect(taskServiceClient.createTag).toHaveBeenCalledWith(
        dto,
        mockUser.id,
        mockUser.roles,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should call taskServiceClient.updateTag with id, dto, and user info', async () => {
      const dto = { name: 'important' };
      const mockResponse = { data: { id: 1, name: 'important' } };
      taskServiceClient.updateTag.mockResolvedValue(mockResponse);

      const result = await service.update(1, dto, mockUser);

      expect(taskServiceClient.updateTag).toHaveBeenCalledWith(
        1,
        dto,
        mockUser.id,
        mockUser.roles,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should call taskServiceClient.deleteTag with id and user info', async () => {
      taskServiceClient.deleteTag.mockResolvedValue(undefined);

      await service.delete(1, mockUser);

      expect(taskServiceClient.deleteTag).toHaveBeenCalledWith(
        1,
        mockUser.id,
        mockUser.roles,
      );
    });
  });

  describe('addTagToTask', () => {
    it('should call taskServiceClient.addTagToTask with taskId, tagId, and user info', async () => {
      taskServiceClient.addTagToTask.mockResolvedValue(undefined);

      await service.addTagToTask(1, 2, mockUser);

      expect(taskServiceClient.addTagToTask).toHaveBeenCalledWith(
        1,
        2,
        mockUser.id,
        mockUser.roles,
      );
    });
  });

  describe('removeTagFromTask', () => {
    it('should call taskServiceClient.removeTagFromTask with taskId, tagId, and user info', async () => {
      taskServiceClient.removeTagFromTask.mockResolvedValue(undefined);

      await service.removeTagFromTask(1, 2, mockUser);

      expect(taskServiceClient.removeTagFromTask).toHaveBeenCalledWith(
        1,
        2,
        mockUser.id,
        mockUser.roles,
      );
    });
  });
});
