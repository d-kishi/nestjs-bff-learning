/**
 * ProjectsControllerのテスト
 *
 * TDD Red Phase - BFFのプロジェクトエンドポイント
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { UserFromJwt } from '../common/types';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let projectsService: jest.Mocked<ProjectsService>;

  const mockUser: UserFromJwt = {
    id: 1,
    email: 'test@example.com',
    roles: ['MEMBER'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
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

    controller = module.get<ProjectsController>(ProjectsController);
    projectsService = module.get(ProjectsService);
  });

  describe('findAll', () => {
    it('should call projectsService.findAll with user and query', async () => {
      const query = { ownerId: 1, page: 1, limit: 20 };
      const mockResponse = {
        data: [{ id: 1, name: 'Project 1' }],
        meta: { total: 1 },
      };
      projectsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockUser, query);

      expect(projectsService.findAll).toHaveBeenCalledWith(mockUser, query);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should call projectsService.findOne with id and user', async () => {
      const mockResponse = { data: { id: 1, name: 'Project 1' } };
      projectsService.findOne.mockResolvedValue(mockResponse);

      const result = await controller.findOne(1, mockUser);

      expect(projectsService.findOne).toHaveBeenCalledWith(1, mockUser);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('should call projectsService.create with dto and user', async () => {
      const dto = { name: 'New Project', description: 'Description' };
      const mockResponse = { data: { id: 1, ...dto, ownerId: 1 } };
      projectsService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(dto, mockUser);

      expect(projectsService.create).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should call projectsService.update with id, dto, and user', async () => {
      const dto = { name: 'Updated Project' };
      const mockResponse = { data: { id: 1, name: 'Updated Project' } };
      projectsService.update.mockResolvedValue(mockResponse);

      const result = await controller.update(1, dto, mockUser);

      expect(projectsService.update).toHaveBeenCalledWith(1, dto, mockUser);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should call projectsService.delete with id and user', async () => {
      projectsService.delete.mockResolvedValue(undefined);

      await controller.delete(1, mockUser);

      expect(projectsService.delete).toHaveBeenCalledWith(1, mockUser);
    });
  });
});
