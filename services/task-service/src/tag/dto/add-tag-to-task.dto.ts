/**
 * タスクにタグを追加するDTO
 *
 * POST /tasks/:taskId/tags のリクエストボディ
 */
import { IsNotEmpty, IsInt } from 'class-validator';

export class AddTagToTaskDto {
  /**
   * 追加するタグID
   * @example 1
   */
  @IsNotEmpty({ message: 'tagId is required' })
  @IsInt({ message: 'tagId must be an integer' })
  tagId: number;
}
