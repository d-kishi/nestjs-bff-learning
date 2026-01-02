/**
 * コメント検索クエリDTO
 *
 * GET /tasks/:taskId/comments のクエリパラメータ
 *
 * Why: PaginationQueryDtoを継承してページネーションを統一
 */
import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class CommentQueryDto extends PaginationQueryDto {
  /**
   * タスクID（Controller層で設定）
   *
   * Why: パスパラメータから取得するため、DTOでは任意
   */
  @IsOptional()
  @IsNumber({}, { message: 'taskId must be a number' })
  @Type(() => Number)
  taskId?: number;
}
