/**
 * コメント作成DTO
 *
 * POST /api/tasks/:taskId/comments のリクエストボディ
 */
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  /**
   * コメント内容
   */
  @IsNotEmpty({ message: 'content is required' })
  @IsString({ message: 'content must be a string' })
  @MaxLength(2000, { message: 'content must not exceed 2000 characters' })
  content: string;
}
