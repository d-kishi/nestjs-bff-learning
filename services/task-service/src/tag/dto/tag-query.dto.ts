/**
 * タグ検索クエリDTO
 *
 * GET /tags のクエリパラメータ
 */
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class TagQueryDto extends PaginationQueryDto {
  /**
   * タグ名で部分一致検索
   * @example "urg"
   */
  @IsOptional()
  @IsString({ message: 'search must be a string' })
  search?: string;
}
