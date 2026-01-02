/**
 * RolesGuard ユニットテスト
 */
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (roles?: string): ExecutionContext => {
    const request = {
      headers: roles !== undefined ? { 'x-user-roles': roles } : {},
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;
  };

  describe('canActivate', () => {
    it('@Roles()が未指定の場合はアクセス許可', () => {
      // Given
      const context = createMockContext('MEMBER');
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

      // When
      const result = guard.canActivate(context);

      // Then
      expect(result).toBe(true);
    });

    it('空の@Roles()配列の場合はアクセス許可', () => {
      // Given
      const context = createMockContext('MEMBER');
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);

      // When
      const result = guard.canActivate(context);

      // Then
      expect(result).toBe(true);
    });

    it('必要なロールを持っている場合はアクセス許可', () => {
      // Given
      const context = createMockContext('ADMIN');
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

      // When
      const result = guard.canActivate(context);

      // Then
      expect(result).toBe(true);
    });

    it('複数ロールのうち1つを持っていればアクセス許可', () => {
      // Given
      const context = createMockContext('MEMBER');
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['ADMIN', 'MEMBER']);

      // When
      const result = guard.canActivate(context);

      // Then
      expect(result).toBe(true);
    });

    it('複数ロールを持つユーザーがいずれかにマッチすればアクセス許可', () => {
      // Given
      const context = createMockContext('ADMIN,MEMBER');
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

      // When
      const result = guard.canActivate(context);

      // Then
      expect(result).toBe(true);
    });

    it('必要なロールを持っていない場合はForbiddenException', () => {
      // Given
      const context = createMockContext('MEMBER');
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

      // When & Then
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('X-User-Rolesヘッダがない場合はForbiddenException', () => {
      // Given
      const context = createMockContext(); // ヘッダなし
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

      // When & Then
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('ロール名に空白が含まれていても正しく処理される', () => {
      // Given
      const context = createMockContext('ADMIN , MEMBER'); // 空白あり
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['MEMBER']);

      // When
      const result = guard.canActivate(context);

      // Then
      expect(result).toBe(true);
    });
  });
});
