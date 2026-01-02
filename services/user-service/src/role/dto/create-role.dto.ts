/**
 * ロール作成DTO
 *
 * US012: 新しいロールを作成するためのDTO。
 */
import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateRoleDto {
  /**
   * ロール名
   * 1〜50文字、ユニーク
   */
  @IsString()
  @MinLength(1, { message: 'ロール名は1文字以上で入力してください' })
  @MaxLength(50)
  name: string;

  /**
   * 説明
   * 最大500文字
   */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
