/**
 * RolesService
 *
 * ロール管理のビジネスロジック。
 * user-serviceへリクエストを委譲する薄いProxy層。
 *
 * Why: BFFでADMIN専用エンドポイントをガード
 * - 一覧・詳細は認証済みユーザー全員がアクセス可能
 * - CUD（作成・更新・削除）はADMIN専用
 */
import { Injectable } from '@nestjs/common';
import { UserServiceClient } from '../clients/user-service.client';
import { UserFromJwt } from '../common/types';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly userServiceClient: UserServiceClient) {}

  /**
   * ロール一覧取得
   */
  async findAll(user: UserFromJwt): Promise<any> {
    return this.userServiceClient.getRoles(user.id, user.roles);
  }

  /**
   * ロール詳細取得
   */
  async findOne(id: number, user: UserFromJwt): Promise<any> {
    return this.userServiceClient.getRole(id, user.id, user.roles);
  }

  /**
   * ロール作成（ADMIN専用）
   */
  async create(dto: CreateRoleDto, user: UserFromJwt): Promise<any> {
    return this.userServiceClient.createRole(dto, user.id, user.roles);
  }

  /**
   * ロール更新（ADMIN専用）
   */
  async update(
    id: number,
    dto: UpdateRoleDto,
    user: UserFromJwt,
  ): Promise<any> {
    return this.userServiceClient.updateRole(id, dto, user.id, user.roles);
  }

  /**
   * ロール削除（ADMIN専用）
   */
  async delete(id: number, user: UserFromJwt): Promise<void> {
    return this.userServiceClient.deleteRole(id, user.id, user.roles);
  }
}
