/**
 * ユーザー登録DTO
 */
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class RegisterDto {
  /**
   * メールアドレス
   */
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  /**
   * パスワード
   * - 8文字以上
   * - 英字と数字を含む
   */
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string;

  /**
   * 表示名（任意）
   */
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Display name cannot be empty' })
  @MaxLength(100, { message: 'Display name must not exceed 100 characters' })
  displayName?: string;
}
