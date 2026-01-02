/**
 * タグ作成DTO
 *
 * POST /tags のリクエストボディ
 */
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreateTagDto {
  /**
   * タグ名
   * - 必須、1-50文字、ユニーク
   * @example "urgent"
   */
  @IsNotEmpty({ message: 'name is required' })
  @IsString({ message: 'name must be a string' })
  @MaxLength(50, { message: 'name must not exceed 50 characters' })
  name: string;

  /**
   * タグ色（任意、HEXカラー）
   * @example "#FF0000"
   */
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'color must be a valid HEX color (#RRGGBB)',
  })
  color?: string;
}
