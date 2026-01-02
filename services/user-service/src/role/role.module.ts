/**
 * Role モジュール
 *
 * ロール管理機能を提供する。
 * ADMIN, MEMBERなどのロール定義とCRUD操作。
 *
 * RoleSeedServiceにより起動時にデフォルトロールが初期化される。
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RoleRepository } from './role.repository';
import { RoleService } from './role.service';
import { RoleSeedService } from './role-seed.service';
import { RolesController } from './role.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [RolesController],
  providers: [RoleRepository, RoleService, RoleSeedService],
  exports: [RoleRepository, RoleService],
})
export class RoleModule {}
