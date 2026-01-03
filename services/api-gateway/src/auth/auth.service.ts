/**
 * AuthService
 *
 * 認証関連のビジネスロジックを担当。
 * user-serviceへのプロキシとして機能。
 *
 * Why: BFFは認証処理をuser-serviceに委譲し、
 * JWT発行・検証・無効化はuser-serviceが担当する。
 * BFFはJWT検証のみを行い、発行は行わない。
 */
import { Injectable } from '@nestjs/common';
import { UserServiceClient } from '../clients/user-service.client';
import { RegisterDto, LoginDto, RefreshTokenDto, LogoutDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private readonly userServiceClient: UserServiceClient) {}

  /**
   * ユーザー登録
   *
   * user-serviceにリクエストを転送し、JWTを含むレスポンスを返す。
   */
  async register(dto: RegisterDto): Promise<any> {
    return this.userServiceClient.register(dto);
  }

  /**
   * ログイン
   *
   * user-serviceにリクエストを転送し、JWTを含むレスポンスを返す。
   */
  async login(dto: LoginDto): Promise<any> {
    return this.userServiceClient.login(dto);
  }

  /**
   * トークンリフレッシュ
   *
   * user-serviceにリクエストを転送し、新しいJWTペアを返す。
   */
  async refresh(dto: RefreshTokenDto): Promise<any> {
    return this.userServiceClient.refresh(dto);
  }

  /**
   * ログアウト
   *
   * user-serviceにリクエストを転送し、リフレッシュトークンを無効化。
   */
  async logout(dto: LogoutDto, userId: number, roles: string[]): Promise<any> {
    return this.userServiceClient.logout(dto, userId, roles);
  }

  /**
   * 現在のユーザー情報取得
   *
   * user-serviceにリクエストを転送し、ユーザー詳細を返す。
   */
  async me(userId: number, roles: string[]): Promise<any> {
    return this.userServiceClient.getMe(userId, roles);
  }
}
