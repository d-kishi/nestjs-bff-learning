/**
 * タグ一覧取得クエリDTO
 *
 * GET /api/tags のクエリパラメータ
 *
 * Why: PaginationQueryDtoを継承してページネーション定義を共通化。
 */
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class TagQueryDto extends PaginationQueryDto {
  /**
   * 名前で部分一致検索
   */
  @IsOptional()
  @IsString()
  name?: string;
}
