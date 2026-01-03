/**
 * ログアウトDTO
 */
import { IsString, MinLength, MaxLength } from 'class-validator';

export class LogoutDto {
  /**
   * リフレッシュトークン
   *
   * Why: MaxLengthでDoS攻撃（極端に長いトークン）を防止。
   */
  @IsString()
  @MinLength(1, { message: 'Refresh token is required' })
  @MaxLength(512, { message: 'Refresh token is too long' })
  refreshToken: string;
}
