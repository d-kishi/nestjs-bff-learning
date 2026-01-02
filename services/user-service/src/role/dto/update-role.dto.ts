/**
 * ロール更新DTO
 *
 * ロール情報を更新するためのDTO。
 */
import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateRoleDto {
  /**
   * ロール名
   * 1〜50文字、ユニーク
   */
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'ロール名は1文字以上で入力してください' })
  @MaxLength(50)
  name?: string;

  /**
   * 説明
   * 最大500文字
   */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
