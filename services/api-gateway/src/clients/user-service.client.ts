/**
 * UserServiceClient
 *
 * user-serviceへのHTTPクライアント。
 * 認証系API（register, login, refresh, logout, me）の呼び出しを担当。
 *
 * Why: BFFはuser-serviceに認証処理を委譲し、
 * JWTの発行・検証・無効化はuser-serviceが担当する。
 */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { HttpException } from '@nestjs/common';
import {
  BffServiceUnavailableException,
  BffTimeoutException,
} from '../common/exceptions/bff.exception';

/**
 * 登録リクエストDTO
 */
interface RegisterDto {
  email: string;
  password: string;
  displayName?: string;
}

/**
 * ログインリクエストDTO
 */
interface LoginDto {
  email: string;
  password: string;
}

/**
 * トークンリフレッシュDTO
 */
interface RefreshTokenDto {
  refreshToken: string;
}

/**
 * ログアウトDTO
 */
interface LogoutDto {
  refreshToken: string;
}

@Injectable()
export class UserServiceClient {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    configService: ConfigService,
  ) {
    this.baseUrl = configService.get<string>(
      'USER_SERVICE_URL',
      'http://localhost:3002',
    );
  }

  /**
   * ユーザー登録
   *
   * @param dto 登録情報
   */
  async register(dto: RegisterDto): Promise<any> {
    return this.post('/auth/register', dto);
  }

  /**
   * ログイン
   *
   * @param dto ログイン情報
   */
  async login(dto: LoginDto): Promise<any> {
    return this.post('/auth/login', dto);
  }

  /**
   * トークンリフレッシュ
   *
   * @param dto リフレッシュトークン
   */
  async refresh(dto: RefreshTokenDto): Promise<any> {
    return this.post('/auth/refresh', dto);
  }

  /**
   * ログアウト
   *
   * @param dto リフレッシュトークン
   * @param userId ユーザーID
   * @param roles ロール配列
   */
  async logout(dto: LogoutDto, userId: number, roles: string[]): Promise<any> {
    return this.post('/auth/logout', dto, userId, roles);
  }

  /**
   * 現在のユーザー情報取得
   *
   * @param userId ユーザーID
   * @param roles ロール配列
   */
  async getMe(userId: number, roles: string[]): Promise<any> {
    return this.get('/auth/me', userId, roles);
  }

  /**
   * ユーザー一覧取得（ADMIN専用）
   *
   * @param userId リクエストユーザーID
   * @param roles ロール配列
   * @param query クエリパラメータ
   */
  async getUsers(
    userId: number,
    roles: string[],
    query?: Record<string, any>,
  ): Promise<any> {
    return this.get('/users', userId, roles, query);
  }

  /**
   * ユーザー詳細取得
   *
   * @param id ターゲットユーザーID
   * @param userId リクエストユーザーID
   * @param roles ロール配列
   */
  async getUser(id: number, userId: number, roles: string[]): Promise<any> {
    return this.get(`/users/${id}`, userId, roles);
  }

  /**
   * ユーザー削除（ADMIN専用）
   *
   * @param id ターゲットユーザーID
   * @param userId リクエストユーザーID
   * @param roles ロール配列
   */
  async deleteUser(id: number, userId: number, roles: string[]): Promise<void> {
    return this.delete(`/users/${id}`, userId, roles);
  }

  /**
   * プロフィール更新
   *
   * @param id ターゲットユーザーID
   * @param dto プロフィールデータ
   * @param userId リクエストユーザーID
   * @param roles ロール配列
   */
  async updateProfile(
    id: number,
    dto: any,
    userId: number,
    roles: string[],
  ): Promise<any> {
    return this.patch(`/users/${id}/profile`, dto, userId, roles);
  }

  /**
   * パスワード変更
   *
   * @param id ターゲットユーザーID
   * @param dto パスワードデータ
   * @param userId リクエストユーザーID
   * @param roles ロール配列
   */
  async changePassword(
    id: number,
    dto: any,
    userId: number,
    roles: string[],
  ): Promise<any> {
    return this.patch(`/users/${id}/password`, dto, userId, roles);
  }

  /**
   * ロール更新（ADMIN専用）
   *
   * @param id ターゲットユーザーID
   * @param dto ロールデータ
   * @param userId リクエストユーザーID
   * @param roles ロール配列
   */
  async updateRoles(
    id: number,
    dto: any,
    userId: number,
    roles: string[],
  ): Promise<any> {
    return this.patch(`/users/${id}/roles`, dto, userId, roles);
  }

  /**
   * ステータス更新（ADMIN専用）
   *
   * @param id ターゲットユーザーID
   * @param dto ステータスデータ
   * @param userId リクエストユーザーID
   * @param roles ロール配列
   */
  async updateStatus(
    id: number,
    dto: any,
    userId: number,
    roles: string[],
  ): Promise<any> {
    return this.patch(`/users/${id}/status`, dto, userId, roles);
  }

  // ========== Roles ==========

  /**
   * ロール一覧取得
   *
   * @param userId リクエストユーザーID
   * @param roles ロール配列
   */
  async getRoles(userId: number, roles: string[]): Promise<any> {
    return this.get('/roles', userId, roles);
  }

  /**
   * ロール詳細取得
   *
   * @param id ロールID
   * @param userId リクエストユーザーID
   * @param roles ロール配列
   */
  async getRole(id: number, userId: number, roles: string[]): Promise<any> {
    return this.get(`/roles/${id}`, userId, roles);
  }

  /**
   * ロール作成（ADMIN専用）
   *
   * @param dto ロールデータ
   * @param userId リクエストユーザーID
   * @param roles ロール配列
   */
  async createRole(dto: any, userId: number, roles: string[]): Promise<any> {
    return this.post('/roles', dto, userId, roles);
  }

  /**
   * ロール更新（ADMIN専用）
   *
   * @param id ロールID
   * @param dto ロールデータ
   * @param userId リクエストユーザーID
   * @param roles ロール配列
   */
  async updateRole(
    id: number,
    dto: any,
    userId: number,
    roles: string[],
  ): Promise<any> {
    return this.patch(`/roles/${id}`, dto, userId, roles);
  }

  /**
   * ロール削除（ADMIN専用）
   *
   * @param id ロールID
   * @param userId リクエストユーザーID
   * @param roles ロール配列
   */
  async deleteRole(id: number, userId: number, roles: string[]): Promise<void> {
    return this.delete(`/roles/${id}`, userId, roles);
  }

  /**
   * POSTリクエスト共通処理
   */
  private async post(
    path: string,
    data: any,
    userId?: number,
    roles?: string[],
  ): Promise<any> {
    try {
      const config =
        userId !== undefined ? this.createConfig(userId, roles) : undefined;
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}${path}`, data, config),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * GETリクエスト共通処理
   */
  private async get(
    path: string,
    userId: number,
    roles: string[],
    query?: Record<string, any>,
  ): Promise<any> {
    try {
      const config = {
        ...this.createConfig(userId, roles),
        params: query,
      };
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}${path}`, config),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * PATCHリクエスト共通処理
   */
  private async patch(
    path: string,
    data: any,
    userId: number,
    roles: string[],
  ): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.baseUrl}${path}`,
          data,
          this.createConfig(userId, roles),
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * DELETEリクエスト共通処理
   */
  private async delete(
    path: string,
    userId: number,
    roles: string[],
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.delete(
          `${this.baseUrl}${path}`,
          this.createConfig(userId, roles),
        ),
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * ヘッダ設定を作成
   *
   * Why: BFFからuser-serviceへX-User-Id, X-User-Rolesを伝播することで、
   * user-service側で認証情報を利用可能にする。
   */
  private createConfig(
    userId: number,
    roles?: string[],
  ): { headers: Record<string, string> } {
    return {
      headers: {
        'X-User-Id': String(userId),
        'X-User-Roles': roles?.join(',') || '',
      },
    };
  }

  /**
   * エラーハンドリング
   *
   * - タイムアウト: BffTimeoutException
   * - 接続エラー: BffServiceUnavailableException
   * - HTTPエラー: 下流サービスのエラーを透過
   */
  private handleError(error: unknown): never {
    if (error instanceof AxiosError) {
      // タイムアウト
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw new BffTimeoutException('user-service');
      }

      // 接続エラー
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new BffServiceUnavailableException('user-service');
      }

      // 下流サービスのHTTPエラーを透過
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
    }

    // その他のエラー
    throw new BffServiceUnavailableException('user-service');
  }
}
