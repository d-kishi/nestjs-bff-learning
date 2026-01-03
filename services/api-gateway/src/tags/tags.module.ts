/**
 * TagsModule
 *
 * タグ機能を提供するモジュール。
 */
import { Module } from '@nestjs/common';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [ClientsModule],
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule {}
