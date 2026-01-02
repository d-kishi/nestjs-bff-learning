/**
 * Task モジュール
 *
 * タスク関連のコンポーネントを束ねる。
 * ProjectModuleをインポートしてプロジェクトの存在確認を行う。
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskRepository } from './task.repository';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    ProjectModule, // ProjectRepositoryを使用するためインポート
  ],
  controllers: [TaskController],
  providers: [TaskService, TaskRepository],
  exports: [TaskService, TaskRepository],
})
export class TaskModule {}
