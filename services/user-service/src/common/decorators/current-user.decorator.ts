/**
 * 現在のユーザー情報を取得するカスタムデコレータ
 *
 * BFF（api-gateway）から伝播される内部ヘッダを取得する。
 * - X-User-Id: ユーザーID（数値）
 * - X-User-Roles: ユーザーロール（カンマ区切り文字列）
 *
 * Why: 各サービスはJWTを直接検証せず、BFFが検証済みの情報を
 * 内部ヘッダで受け取る設計。これにより認証ロジックがBFFに集約される。
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * X-User-IdヘッダからユーザーIDを取得
 *
 * @example
 * @Post()
 * create(@CurrentUserId() userId: number, @Body() dto: CreateUserDto) {
 *   return this.service.create(dto, userId);
 * }
 */
export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const userIdHeader = request.headers['x-user-id'];

    if (!userIdHeader) {
      return undefined;
    }

    // 配列の場合は最初の値を使用
    const userIdString = Array.isArray(userIdHeader)
      ? userIdHeader[0]
      : userIdHeader;

    const userId = parseInt(userIdString, 10);

    // 数値に変換できない場合はundefined
    return isNaN(userId) ? undefined : userId;
  },
);

/**
 * X-User-Rolesヘッダからユーザーロール配列を取得
 *
 * @example
 * @Delete(':id')
 * delete(
 *   @Param('id') id: number,
 *   @CurrentUserId() userId: number,
 *   @CurrentUserRoles() roles: string[]
 * ) {
 *   return this.service.delete(id, userId, roles);
 * }
 */
export const CurrentUserRoles = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string[] => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const rolesHeader = request.headers['x-user-roles'];

    if (!rolesHeader) {
      return [];
    }

    // 配列の場合は最初の値を使用
    const rolesString = Array.isArray(rolesHeader)
      ? rolesHeader[0]
      : rolesHeader;

    // カンマ区切りで分割、空白を除去
    return rolesString
      .split(',')
      .map((role) => role.trim())
      .filter((role) => role.length > 0);
  },
);

/**
 * ユーザーが特定のロールを持っているかチェック
 *
 * @param roles ユーザーのロール配列
 * @param requiredRole 必要なロール
 */
export function hasRole(roles: string[], requiredRole: string): boolean {
  return roles.includes(requiredRole);
}

/**
 * ユーザーがADMINロールを持っているかチェック
 *
 * @param roles ユーザーのロール配列
 */
export function isAdmin(roles: string[]): boolean {
  return hasRole(roles, 'ADMIN');
}
