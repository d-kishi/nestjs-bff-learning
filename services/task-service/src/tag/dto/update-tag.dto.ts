/**
 * タグ更新DTO
 *
 * PATCH /tags/:id のリクエストボディ
 */
import {
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  ValidateIf,
} from 'class-validator';

export class UpdateTagDto {
  /**
   * タグ名（任意）
   * @example "critical"
   */
  @IsOptional()
  @IsString({ message: 'name must be a string' })
  @MaxLength(50, { message: 'name must not exceed 50 characters' })
  name?: string;

  /**
   * タグ色（任意、HEXカラーまたはnull）
   * @example "#FF5500"
   */
  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'color must be a valid HEX color (#RRGGBB)',
  })
  color?: string | null;
}
