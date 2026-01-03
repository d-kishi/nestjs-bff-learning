/**
 * RolesGuardのテスト
 *
 * TDD Red Phase
 */
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { BffForbiddenException } from '../exceptions/bff.exception';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (user?: { roles: string[] }): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
    }) as any;

  describe('canActivate', () => {
    it('should allow access when @Roles() is not set', () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      const context = createMockContext();

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when @Roles() is empty array', () => {
      reflector.getAllAndOverride.mockReturnValue([]);
      const context = createMockContext();

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user has required role (single)', () => {
      reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
      const context = createMockContext({ roles: ['ADMIN', 'MEMBER'] });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user has any of required roles (multiple)', () => {
      reflector.getAllAndOverride.mockReturnValue(['ADMIN', 'MANAGER']);
      const context = createMockContext({ roles: ['MEMBER', 'MANAGER'] });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should throw BffForbiddenException when user lacks required role', () => {
      reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
      const context = createMockContext({ roles: ['MEMBER'] });

      expect(() => guard.canActivate(context)).toThrow(BffForbiddenException);
    });

    it('should throw BffForbiddenException when request.user is not set', () => {
      reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
      const context = createMockContext(undefined);

      expect(() => guard.canActivate(context)).toThrow(BffForbiddenException);
    });

    it('should throw BffForbiddenException when user.roles is empty', () => {
      reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
      const context = createMockContext({ roles: [] });

      expect(() => guard.canActivate(context)).toThrow(BffForbiddenException);
    });
  });
});
