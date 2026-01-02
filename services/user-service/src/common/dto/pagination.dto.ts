/**
 * ページネーションクエリDTO
 *
 * 一覧取得APIで共通利用するページネーションパラメータ。
 * デフォルト値: page=1, limit=20
 * 最大値: limit=100
 *
 * Why: 全一覧APIで統一されたページネーション仕様を実現し、
 * 大量データ取得によるパフォーマンス問題を防ぐ。
 */
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  /**
   * ページ番号（1始まり）
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be at least 1' })
  page?: number = 1;

  /**
   * 1ページあたりの取得件数
   * @example 20
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be at least 1' })
  @Max(100, { message: 'limit must not exceed 100' })
  limit?: number = 20;
}

/**
 * ページネーション計算ヘルパー
 *
 * @param page ページ番号（1始まり）
 * @param limit 1ページあたりの件数
 * @returns skip値とtake値
 */
export function calculatePagination(
  page: number = 1,
  limit: number = 20,
): { skip: number; take: number } {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}
