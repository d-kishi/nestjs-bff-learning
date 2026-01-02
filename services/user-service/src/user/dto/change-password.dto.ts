/**
 * パスワード変更DTO
 *
 * US011: パスワード変更のバリデーションルールを定義。
 */
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  /**
   * 現在のパスワード
   */
  @IsString()
  currentPassword: string;

  /**
   * 新しいパスワード
   * - 8〜100文字
   * - 英字と数字を含む
   */
  @IsString()
  @MinLength(8, { message: '新しいパスワードは8文字以上で入力してください' })
  @MaxLength(100)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/, {
    message: '新しいパスワードは英字と数字を含める必要があります',
  })
  newPassword: string;
}
