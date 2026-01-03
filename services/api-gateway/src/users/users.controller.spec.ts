/**
 * UsersControllerのテスト
 *
 * TDD Red Phase
 */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserFromJwt } from '../common/types';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

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
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
            updateProfile: jest.fn(),
            changePassword: jest.fn(),
            updateRoles: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  describe('findAll', () => {
    it('should call usersService.findAll with user and query', async () => {
      const query = { email: 'test', page: 1, limit: 20 };
      const mockResponse = {
        data: [{ id: 1, email: 'test@example.com' }],
        meta: { total: 1 },
      };
      usersService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockAdmin, query);

      expect(usersService.findAll).toHaveBeenCalledWith(mockAdmin, query);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should call usersService.findOne with id and user', async () => {
      const mockResponse = { data: { id: 1, email: 'test@example.com' } };
      usersService.findOne.mockResolvedValue(mockResponse);

      const result = await controller.findOne(1, mockUser);

      expect(usersService.findOne).toHaveBeenCalledWith(1, mockUser);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should call usersService.delete with id and user', async () => {
      usersService.delete.mockResolvedValue(undefined);

      await controller.delete(1, mockAdmin);

      expect(usersService.delete).toHaveBeenCalledWith(1, mockAdmin);
    });
  });

  describe('updateProfile', () => {
    it('should call usersService.updateProfile with id, dto, and user', async () => {
      const dto = { displayName: 'New Name' };
      const mockResponse = { data: { displayName: 'New Name' } };
      usersService.updateProfile.mockResolvedValue(mockResponse);

      const result = await controller.updateProfile(1, dto, mockUser);

      expect(usersService.updateProfile).toHaveBeenCalledWith(1, dto, mockUser);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('changePassword', () => {
    it('should call usersService.changePassword with id, dto, and user', async () => {
      const dto = { currentPassword: 'old', newPassword: 'newpassword' };
      const mockResponse = { message: 'Password changed successfully' };
      usersService.changePassword.mockResolvedValue(mockResponse);

      const result = await controller.changePassword(1, dto, mockUser);

      expect(usersService.changePassword).toHaveBeenCalledWith(
        1,
        dto,
        mockUser,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateRoles', () => {
    it('should call usersService.updateRoles with id, dto, and user', async () => {
      const dto = { roleIds: [1, 2] };
      const mockResponse = { data: { id: 1, roles: [] } };
      usersService.updateRoles.mockResolvedValue(mockResponse);

      const result = await controller.updateRoles(1, dto, mockAdmin);

      expect(usersService.updateRoles).toHaveBeenCalledWith(1, dto, mockAdmin);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateStatus', () => {
    it('should call usersService.updateStatus with id, dto, and user', async () => {
      const dto = { isActive: false };
      const mockResponse = { data: { id: 1, isActive: false } };
      usersService.updateStatus.mockResolvedValue(mockResponse);

      const result = await controller.updateStatus(1, dto, mockAdmin);

      expect(usersService.updateStatus).toHaveBeenCalledWith(1, dto, mockAdmin);
      expect(result).toEqual(mockResponse);
    });
  });
});
