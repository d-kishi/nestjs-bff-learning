/**
 * UsersService
 *
 * ユーザー管理のビジネスロジック。
 * user-serviceへリクエストを委譲する薄いProxy層。
 *
 * Why: 権限チェックは下流サービス（user-service）で実施
 * - BFFではADMIN専用エンドポイントを@Rolesでガード
 * - 詳細な権限チェック（本人 or ADMIN）は下流サービスで実施
 */
import { Injectable } from '@nestjs/common';
import { UserServiceClient } from '../clients/user-service.client';
import { UserFromJwt } from '../common/types';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateRolesDto } from './dto/update-roles.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userServiceClient: UserServiceClient) {}

  /**
   * ユーザー一覧取得（ADMIN専用）
   */
  async findAll(user: UserFromJwt, query: Record<string, any>): Promise<any> {
    return this.userServiceClient.getUsers(user.id, user.roles, query);
  }

  /**
   * ユーザー詳細取得
   */
  async findOne(id: number, user: UserFromJwt): Promise<any> {
    return this.userServiceClient.getUser(id, user.id, user.roles);
  }

  /**
   * ユーザー削除（ADMIN専用）
   */
  async delete(id: number, user: UserFromJwt): Promise<void> {
    return this.userServiceClient.deleteUser(id, user.id, user.roles);
  }

  /**
   * プロフィール更新
   */
  async updateProfile(
    id: number,
    dto: UpdateProfileDto,
    user: UserFromJwt,
  ): Promise<any> {
    return this.userServiceClient.updateProfile(id, dto, user.id, user.roles);
  }

  /**
   * パスワード変更
   */
  async changePassword(
    id: number,
    dto: ChangePasswordDto,
    user: UserFromJwt,
  ): Promise<any> {
    return this.userServiceClient.changePassword(id, dto, user.id, user.roles);
  }

  /**
   * ロール更新（ADMIN専用）
   */
  async updateRoles(
    id: number,
    dto: UpdateRolesDto,
    user: UserFromJwt,
  ): Promise<any> {
    return this.userServiceClient.updateRoles(id, dto, user.id, user.roles);
  }

  /**
   * ステータス更新（ADMIN専用）
   */
  async updateStatus(
    id: number,
    dto: UpdateStatusDto,
    user: UserFromJwt,
  ): Promise<any> {
    return this.userServiceClient.updateStatus(id, dto, user.id, user.roles);
  }
}
