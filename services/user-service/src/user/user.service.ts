/**
 * User サービス
 *
 * ユーザー管理のビジネスロジックを集約する。
 * US010（プロフィール更新）、US011（パスワード変更）、US012（ユーザー管理）に対応。
 *
 * Why: Controller → Service → Repositoryの3層構造
 * - Controllerは薄く保ち、HTTPリクエスト/レスポンスのみ担当
 * - Serviceにビジネスロジックを集中
 * - Repositoryはデータアクセスのみ担当
 */
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import {
  UserRepository,
  UserFindOptions,
  UpdateProfileData,
} from './user.repository';
import { RoleRepository } from '../role/role.repository';
import { RefreshTokenRepository } from '../auth/refresh-token.repository';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import {
  UserNotFoundException,
  UserForbiddenException,
  UserInvalidPasswordException,
  RoleNotFoundException,
} from '../common/exceptions/business.exception';

/**
 * ユーザー一覧レスポンス
 */
export interface UserListResponse {
  data: UserResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

/**
 * ユーザーレスポンス（パスワード除外）
 */
export interface UserResponse {
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
 * パスワード変更DTO
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

/**
 * ロール更新DTO
 */
export interface UpdateRolesDto {
  roleIds: number[];
}

/**
 * ステータス更新DTO
 */
export interface UpdateStatusDto {
  isActive: boolean;
}

/**
 * bcryptのソルトラウンド数
 */
const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  /**
   * ユーザー一覧を取得
   *
   * ADMIN権限が必要。
   * ページネーション、フィルタリングをサポート。
   *
   * @param options 検索オプション
   * @param requesterId 要求者のユーザーID
   * @param requesterRoles 要求者のロール
   * @returns ユーザー一覧
   * @throws UserForbiddenException ADMIN権限がない場合
   */
  async findAll(
    options: UserFindOptions,
    requesterId: number,
    requesterRoles: string[],
  ): Promise<UserListResponse> {
    // ADMIN権限チェック
    if (!requesterRoles.includes('ADMIN')) {
      throw new UserForbiddenException(
        'ユーザー一覧の取得にはADMIN権限が必要です',
      );
    }

    const { page = 1, limit = 20 } = options;
    const result = await this.userRepository.findAll(options);

    return {
      data: result.data.map((user) => this.toUserResponse(user)),
      meta: {
        total: result.total,
        page,
        limit,
      },
    };
  }

  /**
   * ユーザー詳細を取得
   *
   * 本人またはADMINのみアクセス可能。
   *
   * @param id 取得対象のユーザーID
   * @param requesterId 要求者のユーザーID
   * @param requesterRoles 要求者のロール
   * @returns ユーザー情報
   * @throws UserNotFoundException ユーザーが存在しない場合
   * @throws UserForbiddenException アクセス権がない場合
   */
  async findOne(
    id: number,
    requesterId: number,
    requesterRoles: string[],
  ): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    // 本人またはADMINのみアクセス可能
    if (id !== requesterId && !requesterRoles.includes('ADMIN')) {
      throw new UserForbiddenException(
        '他のユーザーの情報にはアクセスできません',
      );
    }

    return this.toUserResponse(user);
  }

  /**
   * プロフィールを更新
   *
   * 本人またはADMINのみ更新可能。
   *
   * @param id 更新対象のユーザーID
   * @param data 更新データ
   * @param requesterId 要求者のユーザーID
   * @param requesterRoles 要求者のロール
   * @returns 更新されたプロフィール
   * @throws UserNotFoundException ユーザーが存在しない場合
   * @throws UserForbiddenException アクセス権がない場合
   */
  async updateProfile(
    id: number,
    data: UpdateProfileData,
    requesterId: number,
    requesterRoles: string[],
  ): Promise<UserProfile> {
    // ユーザー存在確認
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    // 本人またはADMINのみ更新可能
    if (id !== requesterId && !requesterRoles.includes('ADMIN')) {
      throw new UserForbiddenException(
        '他のユーザーのプロフィールは更新できません',
      );
    }

    const updatedProfile = await this.userRepository.updateProfile(id, data);
    if (!updatedProfile) {
      throw new UserNotFoundException(id);
    }

    return updatedProfile;
  }

  /**
   * パスワードを変更
   *
   * 本人のみ変更可能（ADMINでも他人のパスワードは変更不可）。
   * セキュリティ上の理由から、現在のパスワードの検証が必須。
   *
   * @param id 変更対象のユーザーID
   * @param dto パスワード変更データ
   * @param requesterId 要求者のユーザーID
   * @throws UserNotFoundException ユーザーが存在しない場合
   * @throws UserForbiddenException 本人以外がアクセスした場合
   * @throws UserInvalidPasswordException 現在のパスワードが間違っている場合
   */
  async changePassword(
    id: number,
    dto: ChangePasswordDto,
    requesterId: number,
  ): Promise<void> {
    // 本人のみ変更可能（ADMINでも不可）
    if (id !== requesterId) {
      throw new UserForbiddenException('パスワードは本人のみ変更できます');
    }

    // ユーザー取得
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    // 現在のパスワード検証
    const isValidPassword = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );
    if (!isValidPassword) {
      throw new UserInvalidPasswordException();
    }

    // 新しいパスワードをハッシュ化して保存
    const newPasswordHash = await bcrypt.hash(
      dto.newPassword,
      BCRYPT_SALT_ROUNDS,
    );
    await this.userRepository.updatePassword(id, newPasswordHash);
  }

  /**
   * ロールを更新
   *
   * ADMIN権限が必要。
   * 指定されたロールで既存のロールを置換する。
   *
   * @param id 更新対象のユーザーID
   * @param dto ロール更新データ
   * @param requesterId 要求者のユーザーID
   * @param requesterRoles 要求者のロール
   * @returns 更新されたユーザー情報
   * @throws UserNotFoundException ユーザーが存在しない場合
   * @throws UserForbiddenException ADMIN権限がない場合
   * @throws RoleNotFoundException 指定されたロールが存在しない場合
   */
  async updateRoles(
    id: number,
    dto: UpdateRolesDto,
    requesterId: number,
    requesterRoles: string[],
  ): Promise<UserResponse> {
    // ADMIN権限チェック
    if (!requesterRoles.includes('ADMIN')) {
      throw new UserForbiddenException('ロールの変更にはADMIN権限が必要です');
    }

    // ユーザー存在確認
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    // 指定されたロールの存在確認
    const roles = await this.roleRepository.findByIds(dto.roleIds);
    if (roles.length !== dto.roleIds.length) {
      // 見つからないロールIDを特定
      const foundIds = roles.map((r) => r.id);
      const notFoundIds = dto.roleIds.filter((id) => !foundIds.includes(id));
      throw new RoleNotFoundException(notFoundIds[0]);
    }

    // ロール更新
    const updatedUser = await this.userRepository.updateRoles(id, roles);
    if (!updatedUser) {
      throw new UserNotFoundException(id);
    }

    return this.toUserResponse(updatedUser);
  }

  /**
   * ステータスを更新
   *
   * ADMIN権限が必要。
   * 無効化時は全リフレッシュトークンを失効させる。
   *
   * @param id 更新対象のユーザーID
   * @param dto ステータス更新データ
   * @param requesterId 要求者のユーザーID
   * @param requesterRoles 要求者のロール
   * @returns 更新されたユーザー情報
   * @throws UserNotFoundException ユーザーが存在しない場合
   * @throws UserForbiddenException ADMIN権限がない場合
   */
  async updateStatus(
    id: number,
    dto: UpdateStatusDto,
    requesterId: number,
    requesterRoles: string[],
  ): Promise<UserResponse> {
    // ADMIN権限チェック
    if (!requesterRoles.includes('ADMIN')) {
      throw new UserForbiddenException(
        'ステータスの変更にはADMIN権限が必要です',
      );
    }

    // ユーザー存在確認
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    // ステータス更新
    const updatedUser = await this.userRepository.updateStatus(
      id,
      dto.isActive,
    );
    if (!updatedUser) {
      throw new UserNotFoundException(id);
    }

    // 無効化時は全リフレッシュトークンを失効
    if (!dto.isActive) {
      await this.refreshTokenRepository.revokeAllByUserId(id);
    }

    return this.toUserResponse(updatedUser);
  }

  /**
   * ユーザーを削除
   *
   * ADMIN権限が必要。
   * 物理削除を行う。
   *
   * @param id 削除対象のユーザーID
   * @param requesterId 要求者のユーザーID
   * @param requesterRoles 要求者のロール
   * @throws UserNotFoundException ユーザーが存在しない場合
   * @throws UserForbiddenException ADMIN権限がない場合
   */
  async delete(
    id: number,
    requesterId: number,
    requesterRoles: string[],
  ): Promise<void> {
    // ADMIN権限チェック
    if (!requesterRoles.includes('ADMIN')) {
      throw new UserForbiddenException('ユーザーの削除にはADMIN権限が必要です');
    }

    // ユーザー存在確認
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    // 削除実行
    await this.userRepository.delete(id);
  }

  /**
   * UserエンティティをUserResponseに変換
   *
   * パスワードを除外し、安全な形式に変換する。
   */
  private toUserResponse(user: User): UserResponse {
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
