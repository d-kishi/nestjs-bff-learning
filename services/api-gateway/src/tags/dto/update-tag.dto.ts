/**
 * タグ更新DTO
 *
 * PATCH /api/tags/:id のリクエストボディ
 */
import { IsString, MaxLength, IsOptional, Matches } from 'class-validator';

export class UpdateTagDto {
  /**
   * タグ名（任意）
   */
  @IsOptional()
  @IsString({ message: 'name must be a string' })
  @MaxLength(50, { message: 'name must not exceed 50 characters' })
  name?: string;

  /**
   * タグ色（任意、HEXカラー）
   */
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'color must be a valid HEX color (#RRGGBB)',
  })
  color?: string;
}
