/**
 * TasksService
 *
 * タスク関連のビジネスロジック。
 * task-serviceへリクエストを委譲する薄いProxy層。
 */
import { Injectable } from '@nestjs/common';
import { TaskServiceClient } from '../clients/task-service.client';
import { UserFromJwt } from '../common/types';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly taskServiceClient: TaskServiceClient) {}

  /**
   * タスク一覧取得
   */
  async findAll(user: UserFromJwt, query: Record<string, any>): Promise<any> {
    return this.taskServiceClient.getTasks(user.id, user.roles, query);
  }

  /**
   * タスク詳細取得
   */
  async findOne(id: number, user: UserFromJwt): Promise<any> {
    return this.taskServiceClient.getTask(id, user.id, user.roles);
  }

  /**
   * タスク作成
   */
  async create(dto: CreateTaskDto, user: UserFromJwt): Promise<any> {
    return this.taskServiceClient.createTask(dto, user.id, user.roles);
  }

  /**
   * タスク更新
   */
  async update(
    id: number,
    dto: UpdateTaskDto,
    user: UserFromJwt,
  ): Promise<any> {
    return this.taskServiceClient.updateTask(id, dto, user.id, user.roles);
  }

  /**
   * タスク削除
   */
  async delete(id: number, user: UserFromJwt): Promise<void> {
    return this.taskServiceClient.deleteTask(id, user.id, user.roles);
  }
}
