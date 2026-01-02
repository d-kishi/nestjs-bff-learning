/**
 * ログアウトDTO
 *
 * ログアウト時にリフレッシュトークンを受け取る。
 */
import { IsString, IsNotEmpty } from 'class-validator';

export class LogoutDto {
  /**
   * リフレッシュトークン
   */
  @IsString()
  @IsNotEmpty({ message: 'リフレッシュトークンは必須です' })
  refreshToken: string;
}
