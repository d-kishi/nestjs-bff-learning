/**
 * CommentsService
 *
 * コメント関連のビジネスロジック。
 * task-serviceへリクエストを委譲する薄いProxy層。
 */
import { Injectable } from '@nestjs/common';
import { TaskServiceClient } from '../clients/task-service.client';
import { UserFromJwt } from '../common/types';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly taskServiceClient: TaskServiceClient) {}

  /**
   * タスクのコメント一覧取得
   */
  async findAllByTask(taskId: number, user: UserFromJwt): Promise<any> {
    return this.taskServiceClient.getComments(taskId, user.id, user.roles);
  }

  /**
   * コメント作成
   */
  async create(
    taskId: number,
    dto: CreateCommentDto,
    user: UserFromJwt,
  ): Promise<any> {
    return this.taskServiceClient.createComment(
      taskId,
      dto,
      user.id,
      user.roles,
    );
  }

  /**
   * コメント更新
   */
  async update(
    id: number,
    dto: UpdateCommentDto,
    user: UserFromJwt,
  ): Promise<any> {
    return this.taskServiceClient.updateComment(id, dto, user.id, user.roles);
  }

  /**
   * コメント削除
   */
  async delete(id: number, user: UserFromJwt): Promise<void> {
    return this.taskServiceClient.deleteComment(id, user.id, user.roles);
  }
}
