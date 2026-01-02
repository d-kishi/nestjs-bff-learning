/**
 * Tag モジュール
 *
 * タグ関連の機能を提供。
 * Task エンティティとの M:N リレーションのため TaskModule に依存。
 */
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { TagRepository } from './tag.repository';
import { TagService } from './tag.service';
import { TagController, TaskTagsController } from './tag.controller';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tag]),
    // TaskRepository を使用するため TaskModule をインポート
    // 循環参照を避けるため forwardRef を使用
    forwardRef(() => TaskModule),
  ],
  controllers: [TagController, TaskTagsController],
  providers: [TagRepository, TagService],
  exports: [TagRepository, TagService],
})
export class TagModule {}
