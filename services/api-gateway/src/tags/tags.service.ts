/**
 * TagsService
 *
 * タグ関連のビジネスロジック。
 * task-serviceへリクエストを委譲する薄いProxy層。
 *
 * Why: タグ管理 + タスクへのタグ付け/解除機能を提供
 */
import { Injectable } from '@nestjs/common';
import { TaskServiceClient } from '../clients/task-service.client';
import { UserFromJwt } from '../common/types';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly taskServiceClient: TaskServiceClient) {}

  /**
   * タグ一覧取得
   */
  async findAll(user: UserFromJwt, query: Record<string, any>): Promise<any> {
    return this.taskServiceClient.getTags(user.id, user.roles, query);
  }

  /**
   * タグ詳細取得
   */
  async findOne(id: number, user: UserFromJwt): Promise<any> {
    return this.taskServiceClient.getTag(id, user.id, user.roles);
  }

  /**
   * タグ作成
   */
  async create(dto: CreateTagDto, user: UserFromJwt): Promise<any> {
    return this.taskServiceClient.createTag(dto, user.id, user.roles);
  }

  /**
   * タグ更新
   */
  async update(id: number, dto: UpdateTagDto, user: UserFromJwt): Promise<any> {
    return this.taskServiceClient.updateTag(id, dto, user.id, user.roles);
  }

  /**
   * タグ削除
   */
  async delete(id: number, user: UserFromJwt): Promise<void> {
    return this.taskServiceClient.deleteTag(id, user.id, user.roles);
  }

  /**
   * タスクにタグを付与
   */
  async addTagToTask(
    taskId: number,
    tagId: number,
    user: UserFromJwt,
  ): Promise<void> {
    return this.taskServiceClient.addTagToTask(
      taskId,
      tagId,
      user.id,
      user.roles,
    );
  }

  /**
   * タスクからタグを解除
   */
  async removeTagFromTask(
    taskId: number,
    tagId: number,
    user: UserFromJwt,
  ): Promise<void> {
    return this.taskServiceClient.removeTagFromTask(
      taskId,
      tagId,
      user.id,
      user.roles,
    );
  }
}
