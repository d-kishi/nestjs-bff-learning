/**
 * ロール作成DTO
 *
 * POST /api/roles のリクエストボディ
 */
import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateRoleDto {
  /**
   * ロール名
   */
  @IsNotEmpty({ message: 'name is required' })
  @IsString({ message: 'name must be a string' })
  @MaxLength(50, { message: 'name must not exceed 50 characters' })
  name: string;

  /**
   * ロール説明（任意）
   */
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @MaxLength(200, { message: 'description must not exceed 200 characters' })
  description?: string;
}
