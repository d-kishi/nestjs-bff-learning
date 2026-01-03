/**
 * RolesControllerのテスト
 *
 * TDD Red Phase
 */
import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { UserFromJwt } from '../common/types';

describe('RolesController', () => {
  let controller: RolesController;
  let rolesService: jest.Mocked<RolesService>;

  const mockUser: UserFromJwt = {
    id: 1,
    email: 'test@example.com',
    roles: ['MEMBER'],
  };
  const mockAdmin: UserFromJwt = {
    id: 1,
    email: 'admin@example.com',
    roles: ['ADMIN'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
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

    controller = module.get<RolesController>(RolesController);
    rolesService = module.get(RolesService);
  });

  describe('findAll', () => {
    it('should call rolesService.findAll with user', async () => {
      const mockResponse = [{ id: 1, name: 'ADMIN' }];
      rolesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockUser);

      expect(rolesService.findAll).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should call rolesService.findOne with id and user', async () => {
      const mockResponse = { data: { id: 1, name: 'ADMIN' } };
      rolesService.findOne.mockResolvedValue(mockResponse);

      const result = await controller.findOne(1, mockUser);

      expect(rolesService.findOne).toHaveBeenCalledWith(1, mockUser);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('should call rolesService.create with dto and user', async () => {
      const dto = { name: 'EDITOR', description: 'Editor role' };
      const mockResponse = { data: { id: 3, ...dto } };
      rolesService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(dto, mockAdmin);

      expect(rolesService.create).toHaveBeenCalledWith(dto, mockAdmin);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should call rolesService.update with id, dto, and user', async () => {
      const dto = { name: 'EDITOR_V2' };
      const mockResponse = { data: { id: 3, name: 'EDITOR_V2' } };
      rolesService.update.mockResolvedValue(mockResponse);

      const result = await controller.update(3, dto, mockAdmin);

      expect(rolesService.update).toHaveBeenCalledWith(3, dto, mockAdmin);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should call rolesService.delete with id and user', async () => {
      rolesService.delete.mockResolvedValue(undefined);

      await controller.delete(3, mockAdmin);

      expect(rolesService.delete).toHaveBeenCalledWith(3, mockAdmin);
    });
  });
});
