/**
 * ステータス更新DTO
 *
 * US012: アカウントの有効/無効を切り替えるためのDTO。
 */
import { IsBoolean } from 'class-validator';

export class UpdateStatusDto {
  /**
   * アカウント有効/無効
   */
  @IsBoolean()
  isActive: boolean;
}
