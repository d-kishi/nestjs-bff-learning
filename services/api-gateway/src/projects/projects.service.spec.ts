/**
 * ProjectsServiceのテスト
 *
 * TDD Red Phase - BFFのプロジェクトProxy
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { TaskServiceClient } from '../clients/task-service.client';
import { UserFromJwt } from '../common/types';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let taskServiceClient: jest.Mocked<TaskServiceClient>;

  const mockUser: UserFromJwt = {
    id: 1,
    email: 'test@example.com',
    roles: ['MEMBER'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: TaskServiceClient,
          useValue: {
            getProjects: jest.fn(),
            getProject: jest.fn(),
            createProject: jest.fn(),
            updateProject: jest.fn(),
            deleteProject: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    taskServiceClient = module.get(TaskServiceClient);
  });

  describe('findAll', () => {
    it('should call taskServiceClient.getProjects with user info and query', async () => {
      const query = { ownerId: 1, page: 1, limit: 20 };
      const mockResponse = {
        data: [{ id: 1, name: 'Project 1' }],
        meta: { total: 1 },
      };
      taskServiceClient.getProjects.mockResolvedValue(mockResponse);

      const result = await service.findAll(mockUser, query);

      expect(taskServiceClient.getProjects).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.roles,
        query,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should pass empty query when no filters provided', async () => {
      const mockResponse = { data: [], meta: { total: 0 } };
      taskServiceClient.getProjects.mockResolvedValue(mockResponse);

      await service.findAll(mockUser, {});

      expect(taskServiceClient.getProjects).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.roles,
        {},
      );
    });
  });

  describe('findOne', () => {
    it('should call taskServiceClient.getProject with id and user info', async () => {
      const mockResponse = { data: { id: 1, name: 'Project 1' } };
      taskServiceClient.getProject.mockResolvedValue(mockResponse);

      const result = await service.findOne(1, mockUser);

      expect(taskServiceClient.getProject).toHaveBeenCalledWith(
        1,
        mockUser.id,
        mockUser.roles,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('should call taskServiceClient.createProject with dto and user info', async () => {
      const dto = { name: 'New Project', description: 'Description' };
      const mockResponse = { data: { id: 1, ...dto, ownerId: 1 } };
      taskServiceClient.createProject.mockResolvedValue(mockResponse);

      const result = await service.create(dto, mockUser);

      expect(taskServiceClient.createProject).toHaveBeenCalledWith(
        dto,
        mockUser.id,
        mockUser.roles,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should call taskServiceClient.updateProject with id, dto, and user info', async () => {
      const dto = { name: 'Updated Project' };
      const mockResponse = { data: { id: 1, name: 'Updated Project' } };
      taskServiceClient.updateProject.mockResolvedValue(mockResponse);

      const result = await service.update(1, dto, mockUser);

      expect(taskServiceClient.updateProject).toHaveBeenCalledWith(
        1,
        dto,
        mockUser.id,
        mockUser.roles,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should call taskServiceClient.deleteProject with id and user info', async () => {
      taskServiceClient.deleteProject.mockResolvedValue(undefined);

      await service.delete(1, mockUser);

      expect(taskServiceClient.deleteProject).toHaveBeenCalledWith(
        1,
        mockUser.id,
        mockUser.roles,
      );
    });
  });
});
