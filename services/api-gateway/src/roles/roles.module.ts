/**
 * RolesModule
 *
 * ロール管理機能を提供するモジュール。
 */
import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [ClientsModule],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
