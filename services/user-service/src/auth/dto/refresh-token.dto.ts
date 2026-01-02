/**
 * リフレッシュトークンDTO
 *
 * トークンリフレッシュのバリデーションルールを定義。
 */
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  /**
   * リフレッシュトークン
   */
  @IsString()
  @IsNotEmpty({ message: 'リフレッシュトークンは必須です' })
  refreshToken: string;
}
