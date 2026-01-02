/**
 * Task リポジトリ
 *
 * タスクのDB操作を抽象化する。
 * 複数条件でのフィルタリング、ページネーションをサポート。
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from './entities/task-status.enum';
import { TaskPriority } from './entities/task-priority.enum';
import { calculatePagination } from '../common/dto/pagination.dto';

/**
 * タスク検索条件
 */
export interface TaskFindOptions {
  projectId?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: number;
  tagId?: number;
  page?: number;
  limit?: number;
}

/**
 * タスク検索結果
 */
export interface TaskFindResult {
  data: Task[];
  total: number;
}

@Injectable()
export class TaskRepository {
  constructor(
    @InjectRepository(Task)
    private readonly repository: Repository<Task>,
  ) {}

  /**
   * タスクを作成
   *
   * @param dto 作成データ
   */
  async create(dto: CreateTaskDto): Promise<Task> {
    const task = this.repository.create({
      title: dto.title,
      description: dto.description,
      status: dto.status || TaskStatus.TODO,
      priority: dto.priority || TaskPriority.MEDIUM,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      projectId: dto.projectId,
      assigneeId: dto.assigneeId || null,
    });
    return this.repository.save(task);
  }

  /**
   * タスク一覧を取得
   *
   * @param options 検索条件
   */
  async findAll(options: TaskFindOptions = {}): Promise<TaskFindResult> {
    const {
      projectId,
      status,
      priority,
      assigneeId,
      tagId,
      page = 1,
      limit = 20,
    } = options;
    const { skip, take } = calculatePagination(page, limit);

    const queryBuilder = this.repository.createQueryBuilder('task');

    // フィルタリング条件を追加
    if (projectId !== undefined) {
      queryBuilder.andWhere('task.projectId = :projectId', { projectId });
    }
    if (status !== undefined) {
      queryBuilder.andWhere('task.status = :status', { status });
    }
    if (priority !== undefined) {
      queryBuilder.andWhere('task.priority = :priority', { priority });
    }
    if (assigneeId !== undefined) {
      queryBuilder.andWhere('task.assigneeId = :assigneeId', { assigneeId });
    }

    // タグでのフィルタリング
    if (tagId !== undefined) {
      queryBuilder
        .innerJoin('task.tags', 'tag')
        .andWhere('tag.id = :tagId', { tagId });
    }

    // ソート: 作成日時の降順
    queryBuilder.orderBy('task.createdAt', 'DESC');

    // ページネーション
    queryBuilder.skip(skip).take(take);

    // 実行
    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  /**
   * IDでタスクを取得
   *
   * Why: project, tags リレーションも取得（タグ追加・削除時に必要）
   *
   * @param id タスクID
   */
  async findById(id: number): Promise<Task | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['project', 'tags'],
    });
  }

  /**
   * タスクを保存（リレーション更新用）
   *
   * Why: タグ追加・削除時にManyToManyリレーションを保存するため
   *
   * @param task タスクエンティティ
   */
  async save(task: Task): Promise<Task> {
    return this.repository.save(task);
  }

  /**
   * タスクを更新
   *
   * @param id タスクID
   * @param dto 更新データ
   */
  async update(id: number, dto: UpdateTaskDto): Promise<Task | null> {
    const task = await this.repository.findOne({ where: { id } });
    if (!task) {
      return null;
    }

    // 更新対象のフィールドのみ適用
    if (dto.title !== undefined) {
      task.title = dto.title;
    }
    if (dto.description !== undefined) {
      task.description = dto.description;
    }
    if (dto.status !== undefined) {
      task.status = dto.status;
    }
    if (dto.priority !== undefined) {
      task.priority = dto.priority;
    }
    if (dto.dueDate !== undefined) {
      task.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }
    if (dto.assigneeId !== undefined) {
      task.assigneeId = dto.assigneeId;
    }

    return this.repository.save(task);
  }

  /**
   * タスクを削除
   *
   * @param id タスクID
   * @returns 削除成功時true
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
