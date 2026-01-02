/**
 * プロジェクト作成DTO
 *
 * POST /projects のリクエストボディ
 *
 * Why: ownerIdはDTOに含めない
 * - X-User-Idヘッダから取得するため
 * - ユーザーが他人をオーナーに指定することを防ぐ
 */
import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateProjectDto {
  /**
   * プロジェクト名
   * @example "新規プロジェクト"
   */
  @IsNotEmpty({ message: 'name is required' })
  @IsString({ message: 'name must be a string' })
  @MaxLength(100, { message: 'name must not exceed 100 characters' })
  name: string;

  /**
   * プロジェクト説明（任意）
   * @example "このプロジェクトの説明文"
   */
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @MaxLength(1000, { message: 'description must not exceed 1000 characters' })
  description?: string;
}
