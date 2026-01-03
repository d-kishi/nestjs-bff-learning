/**
 * コメント更新DTO
 *
 * PATCH /api/comments/:id のリクエストボディ
 */
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateCommentDto {
  /**
   * コメント内容
   */
  @IsNotEmpty({ message: 'content is required' })
  @IsString({ message: 'content must be a string' })
  @MaxLength(2000, { message: 'content must not exceed 2000 characters' })
  content: string;
}
