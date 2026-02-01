/**
 * Auth サービス
 *
 * 認証のビジネスロジックを集約する。
 * US008（ユーザー登録）、US009（ログイン）に対応。
 *
 * Why: JWTとリフレッシュトークンの二重構成
 * - Access Token: 短命（15分）、リクエスト認証用
 * - Refresh Token: 長命（7日）、Access Token更新用
 * - Refresh Token Rotation: 使用済みトークンは即座に無効化
 */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UserRepository } from '../user/user.repository';
import { RoleRepository } from '../role/role.repository';
import { RefreshTokenRepository } from './refresh-token.repository';
import { User } from '../user/entities/user.entity';
import {
  AuthEmailAlreadyExistsException,
  AuthInvalidCredentialsException,
  AuthAccountDisabledException,
  AuthInvalidRefreshTokenException,
  UserNotFoundException,
} from '../common/exceptions/business.exception';

/**
 * 登録DTO
 */
export interface RegisterDto {
  email: string;
  password: string;
  displayName: string;
}

/**
 * ログインDTO
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * 認証レスポンス
 */
export interface AuthResponse {
  user: UserAuthResponse;
  accessToken: string;
  refreshToken: string;
}

/**
 * ユーザー認証レスポンス（パスワード除外）
 */
export interface UserAuthResponse {
  id: number;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile: {
    id: number;
    displayName: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    bio: string | null;
  };
  roles: Array<{
    id: number;
    name: string;
  }>;
}

/**
 * トークンリフレッシュレスポンス
 */
export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * bcryptのソルトラウンド数
 */
const BCRYPT_SALT_ROUNDS = 10;

/**
 * リフレッシュトークンの有効期間（ミリ秒）
 * デフォルト: 7日
 */
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * ユーザー登録
   *
   * 新規ユーザーを作成し、認証トークンを発行する。
   * MEMBERロールがデフォルトで付与される。
   *
   * @param dto 登録データ
   * @returns 認証レスポンス（ユーザー情報 + トークン）
   * @throws AuthEmailAlreadyExistsException メールアドレスが既に存在する場合
   */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    // メールアドレスの重複チェック
    const exists = await this.userRepository.existsByEmail(dto.email);
    if (exists) {
      throw new AuthEmailAlreadyExistsException(dto.email);
    }

    // MEMBERロールを取得
    const memberRole = await this.roleRepository.findByName('MEMBER');
    if (!memberRole) {
      // システムエラー: MEMBERロールは必須
      throw new Error('MEMBER role not found. Please run seed.');
    }

    // パスワードをハッシュ化
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    // ユーザー作成
    const user = await this.userRepository.create(
      {
        email: dto.email,
        passwordHash,
        displayName: dto.displayName,
      },
      memberRole,
    );

    // トークン発行
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user: this.toUserAuthResponse(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * ログイン
   *
   * メールアドレスとパスワードで認証し、トークンを発行する。
   *
   * @param dto ログインデータ
   * @returns 認証レスポンス（ユーザー情報 + トークン）
   * @throws AuthInvalidCredentialsException 認証情報が無効な場合
   * @throws AuthAccountDisabledException アカウントが無効化されている場合
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    // ユーザー検索
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new AuthInvalidCredentialsException();
    }

    // パスワード検証
    const isValidPassword = await bcrypt.compare(dto.password, user.password);
    if (!isValidPassword) {
      throw new AuthInvalidCredentialsException();
    }

    // アカウント状態チェック
    if (!user.isActive) {
      throw new AuthAccountDisabledException();
    }

    // トークン発行
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user: this.toUserAuthResponse(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * トークンリフレッシュ
   *
   * 有効なリフレッシュトークンを使用して新しいトークンペアを発行する。
   * Refresh Token Rotation: 古いトークンは無効化される。
   *
   * @param token リフレッシュトークン
   * @returns 新しいトークンペア
   * @throws AuthInvalidRefreshTokenException トークンが無効な場合
   * @throws AuthAccountDisabledException アカウントが無効化されている場合
   */
  async refresh(token: string): Promise<RefreshResponse> {
    // トークン検証
    const refreshToken =
      await this.refreshTokenRepository.findValidToken(token);
    if (!refreshToken) {
      throw new AuthInvalidRefreshTokenException();
    }

    // ユーザー取得・状態確認
    const user = await this.userRepository.findById(refreshToken.userId);
    if (!user) {
      throw new AuthInvalidRefreshTokenException();
    }

    if (!user.isActive) {
      throw new AuthAccountDisabledException();
    }

    // Refresh Token Rotation: 古いトークンを無効化
    await this.refreshTokenRepository.revoke(refreshToken.id);

    // 新しいトークンを発行
    const accessToken = this.generateAccessToken(user);
    const newRefreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * ログアウト
   *
   * リフレッシュトークンを無効化する。
   *
   * @param token リフレッシュトークン
   */
  async logout(token: string): Promise<void> {
    await this.refreshTokenRepository.revokeByToken(token);
  }

  /**
   * 現在ユーザー取得
   *
   * ユーザーIDからユーザー情報を取得する。
   *
   * @param userId ユーザーID
   * @returns ユーザー情報
   * @throws UserNotFoundException ユーザーが存在しない場合
   */
  async me(userId: number): Promise<UserAuthResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    return this.toUserAuthResponse(user);
  }

  /**
   * アクセストークンを生成
   *
   * JWTペイロード:
   * - sub: ユーザーID
   * - email: メールアドレス
   * - roles: ロール名の配列
   */
  private generateAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.name),
    };

    return this.jwtService.sign(payload);
  }

  /**
   * リフレッシュトークンを生成
   *
   * ランダムな文字列を生成し、DBに保存する。
   */
  private async generateRefreshToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

    await this.refreshTokenRepository.create(userId, token, expiresAt);

    return token;
  }

  /**
   * UserエンティティをUserAuthResponseに変換
   */
  private toUserAuthResponse(user: User): UserAuthResponse {
    return {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: {
        id: user.profile.id,
        displayName: user.profile.displayName,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        avatarUrl: user.profile.avatarUrl,
        bio: user.profile.bio,
      },
      roles: user.roles.map((role) => ({
        id: role.id,
        name: role.name,
      })),
    };
  }
}
