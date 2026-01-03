/**
 * TasksModule
 *
 * タスク機能を提供するモジュール。
 */
import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [ClientsModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
