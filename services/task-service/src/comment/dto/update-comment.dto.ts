/**
 * コメント更新DTO
 *
 * PATCH /comments/:id のリクエストボディ
 *
 * Why: 編集は投稿者（author_id）のみ許可
 * - Service層で権限チェックを実施
 */
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCommentDto {
  /**
   * コメント内容（任意）
   * @example "更新後のコメント内容"
   */
  @IsOptional()
  @IsString({ message: 'content must be a string' })
  @MaxLength(2000, { message: 'content must not exceed 2000 characters' })
  content?: string;
}
