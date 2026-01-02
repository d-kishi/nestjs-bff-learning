/**
 * ユーザー検索クエリDTO
 *
 * ユーザー一覧取得時のフィルタ・ページネーション。
 */
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class UserQueryDto {
  /**
   * メールアドレス部分一致検索
   */
  @IsOptional()
  @IsString()
  email?: string;

  /**
   * 有効/無効フィルタ
   */
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  /**
   * ロールIDでフィルタ
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  roleId?: number;

  /**
   * ページ番号（デフォルト: 1）
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  /**
   * 1ページあたりの件数（デフォルト: 20、最大: 100）
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
