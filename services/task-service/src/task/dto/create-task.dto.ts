/**
 * タスク作成DTO
 *
 * POST /tasks のリクエストボディ
 */
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsEnum,
  IsNumber,
  IsISO8601,
  IsArray,
} from 'class-validator';
import { TaskStatus } from '../entities/task-status.enum';
import { TaskPriority } from '../entities/task-priority.enum';

export class CreateTaskDto {
  /**
   * タスクタイトル
   * @example "新機能の実装"
   */
  @IsNotEmpty({ message: 'title is required' })
  @IsString({ message: 'title must be a string' })
  @MaxLength(200, { message: 'title must not exceed 200 characters' })
  title: string;

  /**
   * タスク説明（任意）
   * @example "この機能の詳細な説明"
   */
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @MaxLength(2000, { message: 'description must not exceed 2000 characters' })
  description?: string;

  /**
   * ステータス（任意、デフォルト: TODO）
   * @example "TODO"
   */
  @IsOptional()
  @IsEnum(TaskStatus, {
    message: 'status must be one of: TODO, IN_PROGRESS, DONE',
  })
  status?: TaskStatus;

  /**
   * 優先度（任意、デフォルト: MEDIUM）
   * @example "MEDIUM"
   */
  @IsOptional()
  @IsEnum(TaskPriority, {
    message: 'priority must be one of: LOW, MEDIUM, HIGH',
  })
  priority?: TaskPriority;

  /**
   * 期限日（任意、ISO8601形式）
   * @example "2025-12-31T23:59:59Z"
   */
  @IsOptional()
  @IsISO8601({}, { message: 'dueDate must be a valid ISO8601 date string' })
  dueDate?: string;

  /**
   * 所属プロジェクトID（必須）
   * @example 1
   */
  @IsNotEmpty({ message: 'projectId is required' })
  @IsNumber({}, { message: 'projectId must be a number' })
  projectId: number;

  /**
   * 担当者ユーザーID（任意）
   * @example 123
   */
  @IsOptional()
  @IsNumber({}, { message: 'assigneeId must be a number' })
  assigneeId?: number;

  /**
   * 付与するタグID配列（任意）
   * @example [1, 2, 3]
   */
  @IsOptional()
  @IsArray({ message: 'tagIds must be an array' })
  @IsNumber({}, { each: true, message: 'each tagId must be a number' })
  tagIds?: number[];
}
