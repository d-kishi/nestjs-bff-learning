/**
 * RolesGuard
 *
 * ロールベースのアクセス制御を行うガード。
 * @Roles()デコレータで指定されたロールを持つユーザーのみアクセスを許可。
 *
 * Why: BFFではJWT検証後のrequest.userからロール情報を取得。
 * user-service/task-serviceのRolesGuardとは異なり、
 * X-User-Rolesヘッダではなくrequest.user.rolesを参照する。
 *
 * @example
 * @Roles('ADMIN')
 * @Delete(':id')
 * delete(@Param('id') id: number) { ... }
 */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { BffForbiddenException } from '../exceptions/bff.exception';
import { UserFromJwt } from '../types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * アクセス可否を判定
   *
   * 1. @Roles()デコレータで指定されたロールを取得
   * 2. 指定がない場合はアクセス許可
   * 3. request.userからユーザーのロールを取得
   * 4. いずれかのロールが一致すればアクセス許可
   */
  canActivate(context: ExecutionContext): boolean {
    // @Roles()で指定された必要なロールを取得
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // @Roles()が指定されていない場合はアクセス許可
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // リクエストからユーザー情報を取得
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: UserFromJwt }>();
    const user = request.user;

    if (!user || !user.roles || user.roles.length === 0) {
      throw new BffForbiddenException('Insufficient permissions');
    }

    // いずれかのロールが一致すればアクセス許可
    const hasRole = requiredRoles.some((role) => user.roles.includes(role));

    if (!hasRole) {
      throw new BffForbiddenException(
        `Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
