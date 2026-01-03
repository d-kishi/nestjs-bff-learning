/**
 * @Public() デコレータ
 *
 * 認証不要のエンドポイントをマークする。
 * JwtAuthGuardでこのメタデータをチェックし、
 * 設定されている場合はJWT検証をスキップする。
 *
 * @example
 * @Controller('auth')
 * export class AuthController {
 *   @Public()
 *   @Post('login')
 *   login(@Body() dto: LoginDto) { ... }
 * }
 */
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 認証不要エンドポイントを宣言するデコレータ
 *
 * Why: BFFでは一部のエンドポイント（login, register, refresh）は
 * 認証なしでアクセス可能にする必要がある。
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
