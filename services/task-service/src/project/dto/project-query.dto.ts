/**
 * プロジェクト一覧取得クエリDTO
 *
 * GET /projects のクエリパラメータ
 *
 * Why: PaginationQueryDtoを継承してownerIdフィルタを追加
 * - 統一されたページネーション仕様
 * - オーナーによるフィルタリング
 */
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class ProjectQueryDto extends PaginationQueryDto {
  /**
   * オーナーIDでフィルタリング（任意）
   * @example 123
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ownerId must be an integer' })
  @Min(1, { message: 'ownerId must be at least 1' })
  ownerId?: number;
}
