/**
 * CommentsControllerのテスト
 *
 * TDD Red Phase
 */
import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { UserFromJwt } from '../common/types';

describe('CommentsController', () => {
  let controller: CommentsController;
  let commentsService: jest.Mocked<CommentsService>;

  const mockUser: UserFromJwt = {
    id: 1,
    email: 'test@example.com',
    roles: ['MEMBER'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: {
            findAllByTask: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    commentsService = module.get(CommentsService);
  });

  describe('findAllByTask', () => {
    it('should call commentsService.findAllByTask with taskId and user', async () => {
      const mockResponse = {
        data: [{ id: 1, content: 'Comment 1' }],
        meta: { total: 1 },
      };
      commentsService.findAllByTask.mockResolvedValue(mockResponse);

      const result = await controller.findAllByTask(1, mockUser);

      expect(commentsService.findAllByTask).toHaveBeenCalledWith(1, mockUser);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('should call commentsService.create with taskId, dto, and user', async () => {
      const dto = { content: 'New comment' };
      const mockResponse = { data: { id: 1, ...dto } };
      commentsService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(1, dto, mockUser);

      expect(commentsService.create).toHaveBeenCalledWith(1, dto, mockUser);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should call commentsService.update with id, dto, and user', async () => {
      const dto = { content: 'Updated comment' };
      const mockResponse = { data: { id: 1, content: 'Updated comment' } };
      commentsService.update.mockResolvedValue(mockResponse);

      const result = await controller.update(1, dto, mockUser);

      expect(commentsService.update).toHaveBeenCalledWith(1, dto, mockUser);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should call commentsService.delete with id and user', async () => {
      commentsService.delete.mockResolvedValue(undefined);

      await controller.delete(1, mockUser);

      expect(commentsService.delete).toHaveBeenCalledWith(1, mockUser);
    });
  });
});
