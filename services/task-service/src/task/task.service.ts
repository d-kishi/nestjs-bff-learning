/**
 * Task サービス
 *
 * タスクのビジネスロジックを集約する。
 * プロジェクトの存在確認を含む。
 */
import { Injectable } from '@nestjs/common';
import { TaskRepository, TaskFindOptions } from './task.repository';
import { ProjectRepository } from '../project/project.repository';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginatedResponse } from '../common/dto/api-response.dto';
import {
  TaskNotFoundException,
  ProjectNotFoundException,
} from '../common/exceptions/business.exception';

@Injectable()
export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly projectRepository: ProjectRepository,
  ) {}

  /**
   * タスクを作成
   *
   * @param dto 作成データ
   * @returns 作成されたタスク
   * @throws ProjectNotFoundException プロジェクトが存在しない場合
   */
  async create(dto: CreateTaskDto): Promise<Task> {
    // プロジェクトの存在確認
    const project = await this.projectRepository.findById(dto.projectId);
    if (!project) {
      throw new ProjectNotFoundException(dto.projectId);
    }

    return this.taskRepository.create(dto);
  }

  /**
   * タスク一覧を取得
   *
   * @param options 検索条件
   * @returns ページネーション付きタスク一覧
   */
  async findAll(
    options: TaskFindOptions = {},
  ): Promise<PaginatedResponse<Task>> {
    const { page = 1, limit = 20 } = options;
    const { data, total } = await this.taskRepository.findAll(options);
    return new PaginatedResponse(data, total, page, limit);
  }

  /**
   * IDでタスクを取得
   *
   * @param id タスクID
   * @returns タスク
   * @throws TaskNotFoundException タスクが存在しない場合
   */
  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new TaskNotFoundException(id);
    }
    return task;
  }

  /**
   * タスクを更新
   *
   * @param id タスクID
   * @param dto 更新データ
   * @returns 更新されたタスク
   * @throws TaskNotFoundException タスクが存在しない場合
   */
  async update(id: number, dto: UpdateTaskDto): Promise<Task> {
    // タスクの存在確認
    const existingTask = await this.taskRepository.findById(id);
    if (!existingTask) {
      throw new TaskNotFoundException(id);
    }

    // 更新実行
    const updated = await this.taskRepository.update(id, dto);
    if (!updated) {
      throw new TaskNotFoundException(id);
    }

    return updated;
  }

  /**
   * タスクを削除
   *
   * @param id タスクID
   * @throws TaskNotFoundException タスクが存在しない場合
   */
  async delete(id: number): Promise<void> {
    // タスクの存在確認
    const existingTask = await this.taskRepository.findById(id);
    if (!existingTask) {
      throw new TaskNotFoundException(id);
    }

    // 削除実行
    await this.taskRepository.delete(id);
  }
}
