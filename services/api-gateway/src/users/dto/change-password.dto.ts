/**
 * パスワード変更DTO
 *
 * PATCH /api/users/:id/password のリクエストボディ
 *
 * Why: MaxLengthで極端に長い入力によるDoS攻撃を防止。
 */
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  /**
   * 現在のパスワード
   */
  @IsNotEmpty({ message: 'currentPassword is required' })
  @IsString()
  @MaxLength(128, { message: 'currentPassword must be 128 characters or less' })
  currentPassword: string;

  /**
   * 新しいパスワード
   */
  @IsNotEmpty({ message: 'newPassword is required' })
  @IsString()
  @MinLength(8, { message: 'newPassword must be at least 8 characters' })
  @MaxLength(128, { message: 'newPassword must be 128 characters or less' })
  newPassword: string;
}
