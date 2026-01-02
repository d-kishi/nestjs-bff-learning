/**
 * ユーザー登録DTO
 *
 * US008: ユーザー登録のバリデーションルールを定義。
 */
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  /**
   * メールアドレス
   * 有効なメールアドレス形式必須
   */
  @IsEmail({}, { message: '有効なメールアドレスを入力してください' })
  email: string;

  /**
   * パスワード
   * - 8〜100文字
   * - 英字と数字を含む
   */
  @IsString()
  @MinLength(8, { message: 'パスワードは8文字以上で入力してください' })
  @MaxLength(100)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/, {
    message: 'パスワードは英字と数字を含める必要があります',
  })
  password: string;

  /**
   * 表示名
   * 省略時はメールアドレスのローカルパートを使用
   */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;
}
