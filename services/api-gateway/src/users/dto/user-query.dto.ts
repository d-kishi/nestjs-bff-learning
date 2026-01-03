/**
 * ユーザー一覧取得クエリDTO
 *
 * GET /api/users のクエリパラメータ
 */
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class UserQueryDto {
  /**
   * メールアドレスで部分一致検索
   */
  @IsOptional()
  @IsString()
  email?: string;

  /**
   * アクティブ状態でフィルタ
   */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  /**
   * ロールIDでフィルタ
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  roleId?: number;

  /**
   * ページ番号（1始まり）
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  /**
   * 1ページあたりの件数
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
