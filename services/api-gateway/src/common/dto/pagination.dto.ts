/**
 * ページネーション共通DTO
 *
 * 一覧取得エンドポイントで使用するクエリパラメータ。
 * 下流サービスにそのまま伝播される。
 */
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class PaginationQueryDto {
  /**
   * ページ番号（1始まり）
   * @default 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be at least 1' })
  page?: number = 1;

  /**
   * 1ページあたりの件数
   * @default 20
   * @max 100
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
 * @returns skip（オフセット）とtake（取得件数）
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
