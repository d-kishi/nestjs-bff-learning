/**
 * @Roles() デコレータ
 *
 * 指定したロールを持つユーザーのみアクセスを許可する。
 * RolesGuardと組み合わせて使用する。
 *
 * Why: 宣言的な権限制御
 * - Controllerメソッドに@Roles('ADMIN')と記述するだけでアクセス制限
 * - ビジネスロジックから権限チェックを分離
 *
 * @example
 * @Controller('users')
 * export class UsersController {
 *   @Get()
 *   @Roles('ADMIN')
 *   findAll() {
 *     // ADMINのみアクセス可能
 *   }
 *
 *   @Get(':id')
 *   @Roles('ADMIN', 'MEMBER')
 *   findOne() {
 *     // ADMINまたはMEMBERがアクセス可能
 *   }
 * }
 */
import { SetMetadata } from '@nestjs/common';

/**
 * メタデータキー
 */
export const ROLES_KEY = 'roles';

/**
 * ロール要求デコレータ
 *
 * @param roles 必要なロール（いずれか1つを持っていればアクセス可能）
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
