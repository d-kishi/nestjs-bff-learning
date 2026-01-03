/**
 * タスク作成DTO
 *
 * POST /api/tasks のリクエストボディ
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
import { TaskStatus, TaskPriority } from './task-enums';

export class CreateTaskDto {
  /**
   * タスクタイトル
   */
  @IsNotEmpty({ message: 'title is required' })
  @IsString({ message: 'title must be a string' })
  @MaxLength(200, { message: 'title must not exceed 200 characters' })
  title: string;

  /**
   * タスク説明（任意）
   */
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @MaxLength(2000, { message: 'description must not exceed 2000 characters' })
  description?: string;

  /**
   * ステータス（任意、デフォルト: TODO）
   */
  @IsOptional()
  @IsEnum(TaskStatus, {
    message: 'status must be one of: TODO, IN_PROGRESS, DONE',
  })
  status?: TaskStatus;

  /**
   * 優先度（任意、デフォルト: MEDIUM）
   */
  @IsOptional()
  @IsEnum(TaskPriority, {
    message: 'priority must be one of: LOW, MEDIUM, HIGH',
  })
  priority?: TaskPriority;

  /**
   * 期限日（任意、ISO8601形式）
   */
  @IsOptional()
  @IsISO8601({}, { message: 'dueDate must be a valid ISO8601 date string' })
  dueDate?: string;

  /**
   * 所属プロジェクトID（必須）
   */
  @IsNotEmpty({ message: 'projectId is required' })
  @IsNumber({}, { message: 'projectId must be a number' })
  projectId: number;

  /**
   * 担当者ユーザーID（任意）
   */
  @IsOptional()
  @IsNumber({}, { message: 'assigneeId must be a number' })
  assigneeId?: number;

  /**
   * 付与するタグID配列（任意）
   */
  @IsOptional()
  @IsArray({ message: 'tagIds must be an array' })
  @IsNumber({}, { each: true, message: 'each tagId must be a number' })
  tagIds?: number[];
}
