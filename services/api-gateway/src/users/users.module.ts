/**
 * UsersModule
 *
 * ユーザー管理機能を提供するモジュール。
 */
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [ClientsModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
