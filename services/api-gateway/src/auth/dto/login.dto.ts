/**
 * ログインDTO
 */
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  /**
   * メールアドレス
   */
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  /**
   * パスワード
   */
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password: string;
}
