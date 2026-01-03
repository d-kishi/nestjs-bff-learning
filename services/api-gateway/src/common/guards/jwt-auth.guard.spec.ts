/**
 * JwtAuthGuardのテスト
 *
 * TDD Red Phase
 */
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;
    guard = new JwtAuthGuard(reflector);
  });

  const createMockContext = (
    handler = jest.fn(),
    classRef = jest.fn(),
  ): ExecutionContext => ({
    getHandler: () => handler,
    getClass: () => classRef,
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({}),
    }),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    getType: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
  });

  describe('canActivate', () => {
    it('should skip JWT validation when @Public() is set', async () => {
      reflector.getAllAndOverride.mockReturnValue(true);
      const context = createMockContext();

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should call parent canActivate when @Public() is not set', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const context = createMockContext();

      // AuthGuardのcanActivateをモック
      const parentCanActivate = jest.spyOn(
        Object.getPrototypeOf(Object.getPrototypeOf(guard)),
        'canActivate',
      );
      parentCanActivate.mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('handleRequest', () => {
    it('should return user when authentication succeeds', () => {
      const user = { id: 1, email: 'test@example.com', roles: ['MEMBER'] };

      const result = guard.handleRequest(null, user);

      expect(result).toBe(user);
    });

    it('should throw BffUnauthorizedException when user is not set', () => {
      expect(() => guard.handleRequest(null, null)).toThrow();
    });

    it('should throw BffUnauthorizedException when error is provided', () => {
      const error = new Error('JWT expired');

      expect(() => guard.handleRequest(error, null)).toThrow();
    });
  });
});
