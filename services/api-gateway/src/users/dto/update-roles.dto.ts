/**
 * ロール更新DTO
 *
 * PATCH /api/users/:id/roles のリクエストボディ
 */
import { IsArray, IsInt, ArrayNotEmpty } from 'class-validator';

export class UpdateRolesDto {
  /**
   * 新しいロールID配列（既存を完全に置き換え）
   */
  @ArrayNotEmpty({ message: 'roleIds must not be empty' })
  @IsArray()
  @IsInt({ each: true, message: 'each roleId must be an integer' })
  roleIds: number[];
}
