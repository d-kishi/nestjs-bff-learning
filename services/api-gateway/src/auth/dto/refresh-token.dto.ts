/**
 * トークンリフレッシュDTO
 */
import { IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  /**
   * リフレッシュトークン
   */
  @IsString()
  @MinLength(1, { message: 'Refresh token is required' })
  refreshToken: string;
}
