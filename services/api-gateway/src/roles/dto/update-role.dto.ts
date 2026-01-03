/**
 * ロール更新DTO
 *
 * PATCH /api/roles/:id のリクエストボディ
 */
import { IsString, MaxLength, IsOptional, MinLength } from 'class-validator';

export class UpdateRoleDto {
  /**
   * ロール名（任意）
   */
  @IsOptional()
  @IsString({ message: 'name must be a string' })
  @MinLength(1, { message: 'name must not be empty' })
  @MaxLength(50, { message: 'name must not exceed 50 characters' })
  name?: string;

  /**
   * ロール説明（任意）
   */
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @MaxLength(200, { message: 'description must not exceed 200 characters' })
  description?: string;
}
