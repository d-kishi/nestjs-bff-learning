/**
 * タスク一覧取得クエリDTO
 *
 * GET /api/tasks のクエリパラメータ
 *
 * Why: PaginationQueryDtoを継承してページネーション定義を共通化。
 */
import { IsOptional, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus, TaskPriority } from './task-enums';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class TaskQueryDto extends PaginationQueryDto {
  /**
   * プロジェクトIDでフィルタ
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  projectId?: number;

  /**
   * 担当者IDでフィルタ
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assigneeId?: number;

  /**
   * タグIDでフィルタ
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tagId?: number;

  /**
   * ステータスでフィルタ
   */
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  /**
   * 優先度でフィルタ
   */
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;
}
