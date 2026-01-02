/**
 * Comment モジュール
 *
 * コメント関連のコンポーネントを束ねる。
 * TaskModuleをインポートしてタスクの存在確認を行う。
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import {
  TaskCommentsController,
  CommentsController,
} from './comment.controller';
import { CommentService } from './comment.service';
import { CommentRepository } from './comment.repository';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    TaskModule, // TaskRepositoryを使用するためインポート
  ],
  controllers: [TaskCommentsController, CommentsController],
  providers: [CommentService, CommentRepository],
  exports: [CommentService, CommentRepository],
})
export class CommentModule {}
