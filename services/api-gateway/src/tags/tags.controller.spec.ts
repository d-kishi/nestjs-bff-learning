/**
 * TagsControllerのテスト
 *
 * TDD Red Phase
 */
import { Test, TestingModule } from '@nestjs/testing';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { UserFromJwt } from '../common/types';

describe('TagsController', () => {
  let controller: TagsController;
  let tagsService: jest.Mocked<TagsService>;

  const mockUser: UserFromJwt = {
    id: 1,
    email: 'test@example.com',
    roles: ['MEMBER'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagsController],
      providers: [
        {
          provide: TagsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            addTagToTask: jest.fn(),
            removeTagFromTask: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TagsController>(TagsController);
    tagsService = module.get(TagsService);
  });

  describe('findAll', () => {
    it('should call tagsService.findAll with user and query', async () => {
      const query = { name: 'urgent', page: 1, limit: 20 };
      const mockResponse = {
        data: [{ id: 1, name: 'urgent' }],
        meta: { total: 1 },
      };
      tagsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockUser, query);

      expect(tagsService.findAll).toHaveBeenCalledWith(mockUser, query);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should call tagsService.findOne with id and user', async () => {
      const mockResponse = { data: { id: 1, name: 'urgent' } };
      tagsService.findOne.mockResolvedValue(mockResponse);

      const result = await controller.findOne(1, mockUser);

      expect(tagsService.findOne).toHaveBeenCalledWith(1, mockUser);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('should call tagsService.create with dto and user', async () => {
      const dto = { name: 'urgent', color: '#FF0000' };
      const mockResponse = { data: { id: 1, ...dto } };
      tagsService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(dto, mockUser);

      expect(tagsService.create).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should call tagsService.update with id, dto, and user', async () => {
      const dto = { name: 'important' };
      const mockResponse = { data: { id: 1, name: 'important' } };
      tagsService.update.mockResolvedValue(mockResponse);

      const result = await controller.update(1, dto, mockUser);

      expect(tagsService.update).toHaveBeenCalledWith(1, dto, mockUser);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should call tagsService.delete with id and user', async () => {
      tagsService.delete.mockResolvedValue(undefined);

      await controller.delete(1, mockUser);

      expect(tagsService.delete).toHaveBeenCalledWith(1, mockUser);
    });
  });

  describe('addTagToTask', () => {
    it('should call tagsService.addTagToTask with taskId, tagId, and user', async () => {
      tagsService.addTagToTask.mockResolvedValue(undefined);

      await controller.addTagToTask(1, 2, mockUser);

      expect(tagsService.addTagToTask).toHaveBeenCalledWith(1, 2, mockUser);
    });
  });

  describe('removeTagFromTask', () => {
    it('should call tagsService.removeTagFromTask with taskId, tagId, and user', async () => {
      tagsService.removeTagFromTask.mockResolvedValue(undefined);

      await controller.removeTagFromTask(1, 2, mockUser);

      expect(tagsService.removeTagFromTask).toHaveBeenCalledWith(
        1,
        2,
        mockUser,
      );
    });
  });
});
