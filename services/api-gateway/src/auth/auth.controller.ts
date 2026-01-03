/**
 * AuthController
 *
 * 認証関連のエンドポイントを提供。
 * 公開エンドポイント（register, login, refresh）と
 * 認証必須エンドポイント（logout, me）を区別。
 *
 * Why: BFFは認証のエントリポイントとして機能し、
 * user-serviceへリクエストを転送する。
 */
import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, LogoutDto } from './dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserFromJwt } from '../common/types';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * ユーザー登録
   *
   * @Public - 認証不要
   */
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * ログイン
   *
   * @Public - 認証不要
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * トークンリフレッシュ
   *
   * @Public - 認証不要（リフレッシュトークンで認証）
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  /**
   * ログアウト
   *
   * 認証必須: 現在のアクセストークンが必要
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: UserFromJwt, @Body() dto: LogoutDto) {
    return this.authService.logout(dto, user.id, user.roles);
  }

  /**
   * 現在のユーザー情報取得
   *
   * 認証必須: 現在のアクセストークンが必要
   */
  @Get('me')
  async me(@CurrentUser() user: UserFromJwt) {
    return this.authService.me(user.id, user.roles);
  }
}
