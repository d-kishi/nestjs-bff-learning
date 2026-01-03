/**
 * @Roles() デコレータ
 *
 * エンドポイントに必要なロールを指定する。
 * RolesGuardでこのメタデータをチェックし、
 * ユーザーが指定されたロールを持っていない場合は403を返す。
 *
 * @example
 * @Controller('users')
 * export class UsersController {
 *   @Roles('ADMIN')
 *   @Delete(':id')
 *   delete(@Param('id') id: number) { ... }
 * }
 */
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * ロール要求を宣言するデコレータ
 *
 * @param roles 必要なロール（いずれか1つを持っていればアクセス可）
 *
 * Why: BFFではADMIN専用のエンドポイントがあるため、
 * 宣言的にロール要求を指定できるようにする。
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
