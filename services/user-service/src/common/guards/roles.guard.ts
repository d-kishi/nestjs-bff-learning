/**
 * RolesGuard
 *
 * ロールベースのアクセス制御を行うガード。
 * @Roles()デコレータで指定されたロールを持つユーザーのみアクセスを許可。
 *
 * Why: X-User-Rolesヘッダからロール情報を取得
 * - BFFがJWT検証済みのロール情報を内部ヘッダで伝播
 * - 各サービスはこのヘッダを信頼
 *
 * @example
 * // app.module.ts または各Controller
 * @UseGuards(RolesGuard)
 *
 * // controller.ts
 * @Get()
 * @Roles('ADMIN')
 * findAll() { ... }
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * アクセス可否を判定
   *
   * 1. @Roles()デコレータで指定されたロールを取得
   * 2. 指定がない場合はアクセス許可
   * 3. X-User-Rolesヘッダからユーザーのロールを取得
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

    // リクエストからユーザーロールを取得
    const request = context.switchToHttp().getRequest<Request>();
    const rolesHeader = request.headers['x-user-roles'];

    if (!rolesHeader) {
      throw new ForbiddenException('X-User-Roles header is required');
    }

    // ヘッダ値を配列に変換
    const rolesString = Array.isArray(rolesHeader)
      ? rolesHeader[0]
      : rolesHeader;

    const userRoles = rolesString
      .split(',')
      .map((role) => role.trim())
      .filter((role) => role.length > 0);

    // いずれかのロールが一致すればアクセス許可
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
