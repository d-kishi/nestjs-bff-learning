/**
 * タスク一覧取得クエリDTO
 *
 * GET /tasks のクエリパラメータ
 *
 * 複数条件はAND検索で適用される。
 */
import { IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TaskStatus } from '../entities/task-status.enum';
import { TaskPriority } from '../entities/task-priority.enum';

export class TaskQueryDto extends PaginationQueryDto {
  /**
   * プロジェクトIDでフィルタリング（任意）
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'projectId must be an integer' })
  @Min(1, { message: 'projectId must be at least 1' })
  projectId?: number;

  /**
   * ステータスでフィルタリング（任意）
   * @example "TODO"
   */
  @IsOptional()
  @IsEnum(TaskStatus, {
    message: 'status must be one of: TODO, IN_PROGRESS, DONE',
  })
  status?: TaskStatus;

  /**
   * 優先度でフィルタリング（任意）
   * @example "HIGH"
   */
  @IsOptional()
  @IsEnum(TaskPriority, {
    message: 'priority must be one of: LOW, MEDIUM, HIGH',
  })
  priority?: TaskPriority;

  /**
   * 担当者IDでフィルタリング（任意）
   * @example 123
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'assigneeId must be an integer' })
  @Min(1, { message: 'assigneeId must be at least 1' })
  assigneeId?: number;

  /**
   * タグIDでフィルタリング（任意）
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'tagId must be an integer' })
  @Min(1, { message: 'tagId must be at least 1' })
  tagId?: number;
}
