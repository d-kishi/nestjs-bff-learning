/**
 * プロジェクト一覧取得クエリDTO
 *
 * GET /api/projects のクエリパラメータ
 *
 * Why: ページネーションとフィルタを統一的に処理
 */
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ProjectQueryDto {
  /**
   * オーナーIDでフィルタ
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ownerId?: number;

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
