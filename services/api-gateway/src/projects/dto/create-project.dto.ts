/**
 * プロジェクト作成DTO
 *
 * POST /api/projects のリクエストボディ
 *
 * Why: BFFでも入力バリデーションを実施
 * - 不正なリクエストを早期にブロック
 * - 下流サービスへの無駄なリクエストを防止
 */
import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateProjectDto {
  /**
   * プロジェクト名
   */
  @IsNotEmpty({ message: 'name is required' })
  @IsString({ message: 'name must be a string' })
  @MaxLength(100, { message: 'name must not exceed 100 characters' })
  name: string;

  /**
   * プロジェクト説明（任意）
   */
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @MaxLength(1000, { message: 'description must not exceed 1000 characters' })
  description?: string;
}
