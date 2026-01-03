/**
 * RolesServiceのテスト
 *
 * TDD Red Phase
 */
import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { UserServiceClient } from '../clients/user-service.client';
import { UserFromJwt } from '../common/types';

describe('RolesService', () => {
  let service: RolesService;
  let userServiceClient: jest.Mocked<UserServiceClient>;

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
      providers: [
        RolesService,
        {
          provide: UserServiceClient,
          useValue: {
            getRoles: jest.fn(),
            getRole: jest.fn(),
            createRole: jest.fn(),
            updateRole: jest.fn(),
            deleteRole: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    userServiceClient = module.get(UserServiceClient);
  });

  describe('findAll', () => {
    it('should call userServiceClient.getRoles with user info', async () => {
      const mockResponse = [
        { id: 1, name: 'ADMIN' },
        { id: 2, name: 'MEMBER' },
      ];
      userServiceClient.getRoles.mockResolvedValue(mockResponse);

      const result = await service.findAll(mockUser);

      expect(userServiceClient.getRoles).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.roles,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should call userServiceClient.getRole with id and user info', async () => {
      const mockResponse = { data: { id: 1, name: 'ADMIN', userCount: 5 } };
      userServiceClient.getRole.mockResolvedValue(mockResponse);

      const result = await service.findOne(1, mockUser);

      expect(userServiceClient.getRole).toHaveBeenCalledWith(
        1,
        mockUser.id,
        mockUser.roles,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('should call userServiceClient.createRole with dto and user info', async () => {
      const dto = { name: 'EDITOR', description: 'Editor role' };
      const mockResponse = { data: { id: 3, ...dto } };
      userServiceClient.createRole.mockResolvedValue(mockResponse);

      const result = await service.create(dto, mockAdmin);

      expect(userServiceClient.createRole).toHaveBeenCalledWith(
        dto,
        mockAdmin.id,
        mockAdmin.roles,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should call userServiceClient.updateRole with id, dto, and user info', async () => {
      const dto = { name: 'EDITOR_V2' };
      const mockResponse = { data: { id: 3, name: 'EDITOR_V2' } };
      userServiceClient.updateRole.mockResolvedValue(mockResponse);

      const result = await service.update(3, dto, mockAdmin);

      expect(userServiceClient.updateRole).toHaveBeenCalledWith(
        3,
        dto,
        mockAdmin.id,
        mockAdmin.roles,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should call userServiceClient.deleteRole with id and user info', async () => {
      userServiceClient.deleteRole.mockResolvedValue(undefined);

      await service.delete(3, mockAdmin);

      expect(userServiceClient.deleteRole).toHaveBeenCalledWith(
        3,
        mockAdmin.id,
        mockAdmin.roles,
      );
    });
  });
});
