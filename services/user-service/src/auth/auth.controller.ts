/**
 * Auth コントローラー
 *
 * 認証関連のHTTPリクエストを処理する。
 * Controllerは薄く保ち、ビジネスロジックはServiceに委譲。
 *
 * Why: /auth/register, /auth/login, /auth/refresh は未認証でもアクセス可能
 * - JWT発行前のエンドポイントのため、X-User-* ヘッダは不要
 * - /auth/logout, /auth/me は認証必要
 */
import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AuthService,
  AuthResponse,
  RefreshResponse,
  UserAuthResponse,
} from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, LogoutDto } from './dto';
import { CurrentUserId } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * ユーザー登録
   *
   * POST /auth/register
   *
   * 認証不要。新規ユーザーを作成し、JWTを発行する。
   *
   * @param dto 登録データ
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    // displayNameが未指定の場合、emailのローカルパートを使用
    const displayName = dto.displayName || dto.email.split('@')[0];

    return this.authService.register({
      email: dto.email,
      password: dto.password,
      displayName,
    });
  }

  /**
   * ログイン
   *
   * POST /auth/login
   *
   * 認証不要。メールアドレスとパスワードで認証し、JWTを発行する。
   *
   * @param dto ログインデータ
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  /**
   * トークンリフレッシュ
   *
   * POST /auth/refresh
   *
   * 認証不要。有効なリフレッシュトークンで新しいトークンペアを取得する。
   * Refresh Token Rotation: 古いトークンは無効化される。
   *
   * @param dto リフレッシュトークン
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto): Promise<RefreshResponse> {
    return this.authService.refresh(dto.refreshToken);
  }

  /**
   * ログアウト
   *
   * POST /auth/logout
   *
   * 認証必要。リフレッシュトークンを無効化する。
   *
   * @param dto リフレッシュトークン
   * @param userId X-User-Idヘッダから取得（ログアウトの認証確認用）
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body() dto: LogoutDto,
    @CurrentUserId() userId: number | undefined,
  ): Promise<{ message: string }> {
    if (userId === undefined) {
      throw new UnauthorizedException('X-User-Id header is required');
    }

    await this.authService.logout(dto.refreshToken);
    return { message: 'Logged out successfully' };
  }

  /**
   * 現在ユーザー取得
   *
   * GET /auth/me
   *
   * 認証必要。現在認証中のユーザー情報を取得する。
   *
   * @param userId X-User-Idヘッダから取得
   */
  @Get('me')
  async me(
    @CurrentUserId() userId: number | undefined,
  ): Promise<UserAuthResponse> {
    if (userId === undefined) {
      throw new UnauthorizedException('X-User-Id header is required');
    }

    return this.authService.me(userId);
  }
}
