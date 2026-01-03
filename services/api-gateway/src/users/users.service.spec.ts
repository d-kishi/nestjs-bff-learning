/**
 * UsersServiceのテスト
 *
 * TDD Red Phase
 */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserServiceClient } from '../clients/user-service.client';
import { UserFromJwt } from '../common/types';

describe('UsersService', () => {
  let service: UsersService;
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
        UsersService,
        {
          provide: UserServiceClient,
          useValue: {
            getUsers: jest.fn(),
            getUser: jest.fn(),
            deleteUser: jest.fn(),
            updateProfile: jest.fn(),
            changePassword: jest.fn(),
            updateRoles: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userServiceClient = module.get(UserServiceClient);
  });

  describe('findAll', () => {
    it('should call userServiceClient.getUsers with user info and query', async () => {
      const query = { email: 'test', page: 1, limit: 20 };
      const mockResponse = {
        data: [{ id: 1, email: 'test@example.com' }],
        meta: { total: 1 },
      };
      userServiceClient.getUsers.mockResolvedValue(mockResponse);

      const result = await service.findAll(mockAdmin, query);

      expect(userServiceClient.getUsers).toHaveBeenCalledWith(
        mockAdmin.id,
        mockAdmin.roles,
        query,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should call userServiceClient.getUser with id and user info', async () => {
      const mockResponse = { data: { id: 1, email: 'test@example.com' } };
      userServiceClient.getUser.mockResolvedValue(mockResponse);

      const result = await service.findOne(1, mockUser);

      expect(userServiceClient.getUser).toHaveBeenCalledWith(
        1,
        mockUser.id,
        mockUser.roles,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should call userServiceClient.deleteUser with id and user info', async () => {
      userServiceClient.deleteUser.mockResolvedValue(undefined);

      await service.delete(1, mockAdmin);

      expect(userServiceClient.deleteUser).toHaveBeenCalledWith(
        1,
        mockAdmin.id,
        mockAdmin.roles,
      );
    });
  });

  describe('updateProfile', () => {
    it('should call userServiceClient.updateProfile with id, dto, and user info', async () => {
      const dto = { displayName: 'New Name' };
      const mockResponse = { data: { displayName: 'New Name' } };
      userServiceClient.updateProfile.mockResolvedValue(mockResponse);

      const result = await service.updateProfile(1, dto, mockUser);

      expect(userServiceClient.updateProfile).toHaveBeenCalledWith(
        1,
        dto,
        mockUser.id,
        mockUser.roles,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('changePassword', () => {
    it('should call userServiceClient.changePassword with id, dto, and user info', async () => {
      const dto = { currentPassword: 'old', newPassword: 'newpassword' };
      const mockResponse = { message: 'Password changed successfully' };
      userServiceClient.changePassword.mockResolvedValue(mockResponse);

      const result = await service.changePassword(1, dto, mockUser);

      expect(userServiceClient.changePassword).toHaveBeenCalledWith(
        1,
        dto,
        mockUser.id,
        mockUser.roles,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateRoles', () => {
    it('should call userServiceClient.updateRoles with id, dto, and user info', async () => {
      const dto = { roleIds: [1, 2] };
      const mockResponse = { data: { id: 1, roles: [] } };
      userServiceClient.updateRoles.mockResolvedValue(mockResponse);

      const result = await service.updateRoles(1, dto, mockAdmin);

      expect(userServiceClient.updateRoles).toHaveBeenCalledWith(
        1,
        dto,
        mockAdmin.id,
        mockAdmin.roles,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateStatus', () => {
    it('should call userServiceClient.updateStatus with id, dto, and user info', async () => {
      const dto = { isActive: false };
      const mockResponse = { data: { id: 1, isActive: false } };
      userServiceClient.updateStatus.mockResolvedValue(mockResponse);

      const result = await service.updateStatus(1, dto, mockAdmin);

      expect(userServiceClient.updateStatus).toHaveBeenCalledWith(
        1,
        dto,
        mockAdmin.id,
        mockAdmin.roles,
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
