/**
 * RoleSeedService
 *
 * アプリケーション起動時にデフォルトロールを初期化する。
 * ADMIN, MEMBERロールが存在しない場合のみ作成（冪等性あり）。
 *
 * Why: OnModuleInitを使用
 * - アプリケーション起動時に自動実行
 * - マニュアルでのシード実行が不要
 * - 開発時・デプロイ時どちらも動作
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RoleRepository } from './role.repository';

/**
 * デフォルトロール定義
 */
const DEFAULT_ROLES = [
  {
    name: 'ADMIN',
    description: '管理者。全操作可能。',
  },
  {
    name: 'MEMBER',
    description: '一般ユーザー。自分のリソースのみ操作可能。',
  },
];

@Injectable()
export class RoleSeedService implements OnModuleInit {
  private readonly logger = new Logger(RoleSeedService.name);

  constructor(private readonly roleRepository: RoleRepository) {}

  /**
   * モジュール初期化時にシードを実行
   */
  async onModuleInit(): Promise<void> {
    await this.seedRoles();
  }

  /**
   * デフォルトロールをシード
   *
   * 各ロールについて:
   * 1. 存在チェック
   * 2. 存在しない場合のみ作成
   *
   * これにより冪等性が保証される。
   */
  private async seedRoles(): Promise<void> {
    this.logger.log('Starting role seed...');

    for (const roleData of DEFAULT_ROLES) {
      const existingRole = await this.roleRepository.findByName(roleData.name);

      if (existingRole) {
        this.logger.log(`Role '${roleData.name}' already exists, skipping.`);
        continue;
      }

      try {
        await this.roleRepository.create(roleData);
        this.logger.log(`Role '${roleData.name}' created successfully.`);
      } catch (error) {
        // レース条件で重複が発生した場合はログを出してスキップ
        this.logger.warn(
          `Failed to create role '${roleData.name}': ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    this.logger.log('Role seed completed.');
  }
}
