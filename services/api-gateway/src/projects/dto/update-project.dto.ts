/**
 * プロジェクト更新DTO
 *
 * PATCH /api/projects/:id のリクエストボディ
 *
 * Why: 部分更新のため全フィールドOptional
 */
import { IsString, MaxLength, MinLength, IsOptional } from 'class-validator';

export class UpdateProjectDto {
  /**
   * プロジェクト名（任意）
   */
  @IsOptional()
  @IsString({ message: 'name must be a string' })
  @MinLength(1, { message: 'name must not be empty' })
  @MaxLength(100, { message: 'name must not exceed 100 characters' })
  name?: string;

  /**
   * プロジェクト説明（任意）
   */
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @MaxLength(1000, { message: 'description must not exceed 1000 characters' })
  description?: string;
}
