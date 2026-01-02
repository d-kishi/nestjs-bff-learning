/**
 * Role リポジトリ
 *
 * ロールのDB操作を抽象化する。
 *
 * Why: TypeORMのRepositoryを直接使わずラップする理由
 * - テスト時のモック化が容易
 * - ビジネスロジックとDB操作の分離
 * - クエリの再利用性向上
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';

/**
 * ロール作成データ
 */
export interface CreateRoleData {
  name: string;
  description?: string;
}

/**
 * ロール更新データ
 */
export interface UpdateRoleData {
  name?: string;
  description?: string;
}

@Injectable()
export class RoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly repository: Repository<Role>,
  ) {}

  /**
   * ロールを作成
   *
   * @param data 作成データ
   */
  async create(data: CreateRoleData): Promise<Role> {
    const role = this.repository.create(data);
    return this.repository.save(role);
  }

  /**
   * 全ロールを取得
   *
   * ソート: 作成日時の昇順
   */
  async findAll(): Promise<Role[]> {
    return this.repository.find({
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * IDでロールを取得
   *
   * @param id ロールID
   */
  async findById(id: number): Promise<Role | null> {
    return this.repository.findOne({ where: { id } });
  }

  /**
   * 名前でロールを取得
   *
   * @param name ロール名
   */
  async findByName(name: string): Promise<Role | null> {
    return this.repository.findOne({ where: { name } });
  }

  /**
   * 複数のIDでロールを取得
   *
   * ユーザーへのロール割り当て時に使用
   *
   * @param ids ロールID配列
   */
  async findByIds(ids: number[]): Promise<Role[]> {
    if (ids.length === 0) {
      return [];
    }
    return this.repository.find({
      where: { id: In(ids) },
    });
  }

  /**
   * ロールを更新
   *
   * @param id ロールID
   * @param data 更新データ
   */
  async update(id: number, data: UpdateRoleData): Promise<Role | null> {
    const role = await this.findById(id);
    if (!role) {
      return null;
    }

    // 更新対象のフィールドのみ適用
    if (data.name !== undefined) {
      role.name = data.name;
    }
    if (data.description !== undefined) {
      role.description = data.description;
    }

    return this.repository.save(role);
  }

  /**
   * ロールを削除
   *
   * @param id ロールID
   * @returns 削除成功時true
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * ロールに割り当てられているユーザー数を取得
   *
   * ロール削除前のチェックに使用
   *
   * @param roleId ロールID
   */
  async countUsersByRoleId(roleId: number): Promise<number> {
    const role = await this.repository.findOne({
      where: { id: roleId },
      relations: ['users'],
    });

    return role?.users?.length ?? 0;
  }
}
