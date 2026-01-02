/**
 * Role サービス
 *
 * ロールのビジネスロジックを集約する。
 *
 * Why: Controller → Service → Repositoryの3層構造
 * - Controllerは薄く保ち、HTTPリクエスト/レスポンスのみ担当
 * - Serviceにビジネスロジックを集中
 * - Repositoryはデータアクセスのみ担当
 */
import { Injectable } from '@nestjs/common';
import {
  RoleRepository,
  CreateRoleData,
  UpdateRoleData,
} from './role.repository';
import { Role } from './entities/role.entity';
import {
  RoleNotFoundException,
  RoleAlreadyExistsException,
  RoleHasUsersException,
} from '../common/exceptions/business.exception';

/**
 * ロール詳細レスポンス
 */
export interface RoleDetailResponse {
  role: Role;
  userCount: number;
}

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  /**
   * 全ロール一覧を取得
   *
   * @returns ロール配列
   */
  async findAll(): Promise<Role[]> {
    return this.roleRepository.findAll();
  }

  /**
   * IDでロールを取得（ユーザー数付き）
   *
   * @param id ロールID
   * @returns ロールとユーザー数
   * @throws RoleNotFoundException ロールが存在しない場合
   */
  async findOne(id: number): Promise<RoleDetailResponse> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new RoleNotFoundException(id);
    }

    const userCount = await this.roleRepository.countUsersByRoleId(id);

    return { role, userCount };
  }

  /**
   * ロールを作成
   *
   * @param data 作成データ
   * @returns 作成されたロール
   * @throws RoleAlreadyExistsException 同名のロールが存在する場合
   */
  async create(data: CreateRoleData): Promise<Role> {
    // 同名ロールの存在チェック
    const existing = await this.roleRepository.findByName(data.name);
    if (existing) {
      throw new RoleAlreadyExistsException(data.name);
    }

    return this.roleRepository.create(data);
  }

  /**
   * ロールを更新
   *
   * @param id ロールID
   * @param data 更新データ
   * @returns 更新されたロール
   * @throws RoleNotFoundException ロールが存在しない場合
   * @throws RoleAlreadyExistsException 同名のロールが既に存在する場合
   */
  async update(id: number, data: UpdateRoleData): Promise<Role> {
    // ロールの存在確認
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new RoleNotFoundException(id);
    }

    // 名前変更時の重複チェック
    if (data.name !== undefined) {
      const existing = await this.roleRepository.findByName(data.name);
      // 自分自身以外で同名が存在する場合はエラー
      if (existing && existing.id !== id) {
        throw new RoleAlreadyExistsException(data.name);
      }
    }

    // 更新実行
    const updated = await this.roleRepository.update(id, data);
    if (!updated) {
      throw new RoleNotFoundException(id);
    }

    return updated;
  }

  /**
   * ロールを削除
   *
   * ユーザーが割り当てられているロールは削除不可。
   *
   * @param id ロールID
   * @throws RoleNotFoundException ロールが存在しない場合
   * @throws RoleHasUsersException ユーザーが割り当てられている場合
   */
  async delete(id: number): Promise<void> {
    // ロールの存在確認
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new RoleNotFoundException(id);
    }

    // ユーザー割り当てチェック
    const userCount = await this.roleRepository.countUsersByRoleId(id);
    if (userCount > 0) {
      throw new RoleHasUsersException(id, userCount);
    }

    // 削除実行
    await this.roleRepository.delete(id);
  }
}
