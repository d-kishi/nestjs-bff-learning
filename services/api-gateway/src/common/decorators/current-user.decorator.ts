/**
 * @CurrentUser() デコレータ
 *
 * JWT検証後のユーザー情報を取得するパラメータデコレータ。
 * JwtStrategyのvalidateメソッドで設定されたrequest.userを取得する。
 *
 * Why: user-service/task-serviceではX-User-Id/X-User-Rolesヘッダから取得するが、
 * BFFではJWT検証結果をrequest.userに格納するため、別の実装が必要。
 *
 * @example
 * @Get('me')
 * me(@CurrentUser() user: UserFromJwt) {
 *   return user;
 * }
 *
 * @Get('profile')
 * profile(@CurrentUser('id') userId: number) {
 *   return this.service.getProfile(userId);
 * }
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserFromJwt } from '../types';

/**
 * 現在の認証済みユーザーを取得するデコレータ
 *
 * @param data 取得するプロパティ名（省略時は全オブジェクト）
 */
export const CurrentUser = createParamDecorator(
  (data: keyof UserFromJwt | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: UserFromJwt }>();
    const user = request.user;

    if (!user) {
      return undefined;
    }

    // プロパティ名が指定されている場合はそのプロパティを返す
    if (data) {
      return user[data];
    }

    return user;
  },
);
