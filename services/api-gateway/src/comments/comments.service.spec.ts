/**
 * CommentsServiceのテスト
 *
 * TDD Red Phase
 */
import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { TaskServiceClient } from '../clients/task-service.client';
import { UserFromJwt } from '../common/types';

describe('CommentsService', () => {
  let service: CommentsService;
  let taskServiceClient: jest.Mocked<TaskServiceClient>;

  const mockUser: UserFromJwt = {
    id: 1,
    email: 'test@example.com',
    roles: ['MEMBER'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: TaskServiceClient,
          useValue: {
            getComments: jest.fn(),
            createComment: jest.fn(),
            updateComment: jest.fn(),
            deleteComment: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    taskServiceClient = module.get(TaskServiceClient);
  });

  describe('findAllByTask', () => {
    it('should call taskServiceClient.getComments with taskId and user info', async () => {
      const mockResponse = {
        data: [{ id: 1, content: 'Comment 1' }],
        meta: { total: 1 },
      };
      taskServiceClient.getComments.mockResolvedValue(mockResponse);

      const result = await service.findAllByTask(1, mockUser);

      expect(taskServiceClient.getComments).toHaveBeenCalledWith(
        1,
        mockUser.id,
        mockUser.roles,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('should call taskServiceClient.createComment with taskId, dto, and user info', async () => {
      const dto = { content: 'New comment' };
      const mockResponse = { data: { id: 1, ...dto, authorId: 1 } };
      taskServiceClient.createComment.mockResolvedValue(mockResponse);

      const result = await service.create(1, dto, mockUser);

      expect(taskServiceClient.createComment).toHaveBeenCalledWith(
        1,
        dto,
        mockUser.id,
        mockUser.roles,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should call taskServiceClient.updateComment with id, dto, and user info', async () => {
      const dto = { content: 'Updated comment' };
      const mockResponse = { data: { id: 1, content: 'Updated comment' } };
      taskServiceClient.updateComment.mockResolvedValue(mockResponse);

      const result = await service.update(1, dto, mockUser);

      expect(taskServiceClient.updateComment).toHaveBeenCalledWith(
        1,
        dto,
        mockUser.id,
        mockUser.roles,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should call taskServiceClient.deleteComment with id and user info', async () => {
      taskServiceClient.deleteComment.mockResolvedValue(undefined);

      await service.delete(1, mockUser);

      expect(taskServiceClient.deleteComment).toHaveBeenCalledWith(
        1,
        mockUser.id,
        mockUser.roles,
      );
    });
  });
});
