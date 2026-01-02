/**
 * コメント作成DTO
 *
 * POST /tasks/:taskId/comments のリクエストボディ
 *
 * Why: authorIdはDTOに含めない
 * - X-User-Idヘッダから自動設定される
 * - クライアントからの改ざんを防ぐ
 */
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  /**
   * コメント内容
   * @example "進捗報告です。50%完了しました。"
   */
  @IsNotEmpty({ message: 'content is required' })
  @IsString({ message: 'content must be a string' })
  @MaxLength(2000, { message: 'content must not exceed 2000 characters' })
  content: string;
}
