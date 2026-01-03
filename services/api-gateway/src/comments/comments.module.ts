/**
 * CommentsModule
 *
 * コメント機能を提供するモジュール。
 */
import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [ClientsModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
