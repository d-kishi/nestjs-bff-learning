/**
 * ログインDTO
 *
 * US009: ログインのバリデーションルールを定義。
 */
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  /**
   * メールアドレス
   */
  @IsEmail({}, { message: '有効なメールアドレスを入力してください' })
  email: string;

  /**
   * パスワード
   */
  @IsString()
  password: string;
}
