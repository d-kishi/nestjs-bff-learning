/**
 * プロジェクト更新DTO
 *
 * PATCH /projects/:id のリクエストボディ
 *
 * Why: PartialTypeを使わず明示的に定義
 * - 学習目的のため、各フィールドのバリデーションを明示
 * - 更新可能なフィールドを明確にする
 */
import { IsString, MaxLength, MinLength, IsOptional } from 'class-validator';

export class UpdateProjectDto {
  /**
   * プロジェクト名（任意）
   * @example "更新後のプロジェクト名"
   */
  @IsOptional()
  @IsString({ message: 'name must be a string' })
  @MinLength(1, { message: 'name must not be empty' })
  @MaxLength(100, { message: 'name must not exceed 100 characters' })
  name?: string;

  /**
   * プロジェクト説明（任意）
   * @example "更新後の説明文"
   */
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @MaxLength(1000, { message: 'description must not exceed 1000 characters' })
  description?: string;
}
