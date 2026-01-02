/**
 * タスク更新DTO
 *
 * PATCH /tasks/:id のリクエストボディ
 *
 * Note: projectIdは更新不可（タスクの移動は別機能として検討）
 */
import {
  IsString,
  MaxLength,
  IsOptional,
  IsEnum,
  IsNumber,
  IsISO8601,
  ValidateIf,
} from 'class-validator';
import { TaskStatus } from '../entities/task-status.enum';
import { TaskPriority } from '../entities/task-priority.enum';

export class UpdateTaskDto {
  /**
   * タスクタイトル（任意）
   * @example "更新後のタイトル"
   */
  @IsOptional()
  @IsString({ message: 'title must be a string' })
  @MaxLength(200, { message: 'title must not exceed 200 characters' })
  title?: string;

  /**
   * タスク説明（任意）
   * @example "更新後の説明"
   */
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @MaxLength(2000, { message: 'description must not exceed 2000 characters' })
  description?: string;

  /**
   * ステータス（任意）
   * @example "IN_PROGRESS"
   */
  @IsOptional()
  @IsEnum(TaskStatus, {
    message: 'status must be one of: TODO, IN_PROGRESS, DONE',
  })
  status?: TaskStatus;

  /**
   * 優先度（任意）
   * @example "HIGH"
   */
  @IsOptional()
  @IsEnum(TaskPriority, {
    message: 'priority must be one of: LOW, MEDIUM, HIGH',
  })
  priority?: TaskPriority;

  /**
   * 期限日（任意、nullで削除可能）
   * @example "2025-12-31T23:59:59Z"
   */
  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsISO8601({}, { message: 'dueDate must be a valid ISO8601 date string' })
  dueDate?: string | null;

  /**
   * 担当者ユーザーID（任意、nullで解除可能）
   * @example 123
   */
  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsNumber({}, { message: 'assigneeId must be a number' })
  assigneeId?: number | null;
}
