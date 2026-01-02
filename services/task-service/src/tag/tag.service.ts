/**
 * Tag サービス
 *
 * タグのビジネスロジックを実装。
 * 同名タグの重複チェック、タスクへのタグ追加・削除を担当。
 */
import { Injectable } from '@nestjs/common';
import { TagRepository, TagFindOptions } from './tag.repository';
import { TaskRepository } from '../task/task.repository';
import { Tag } from './entities/tag.entity';
import { Task } from '../task/entities/task.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import {
  TagNotFoundException,
  TagAlreadyExistsException,
  TaskNotFoundException,
  TaskTagAlreadyExistsException,
} from '../common/exceptions/business.exception';

/**
 * タグ一覧レスポンス
 */
export interface TagListResponse {
  data: Tag[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

@Injectable()
export class TagService {
  constructor(
    private readonly tagRepository: TagRepository,
    private readonly taskRepository: TaskRepository,
  ) {}

  /**
   * タグを作成
   *
   * Why: 同名タグの重複を防ぐため、作成前にfindByNameでチェック
   *
   * @param dto 作成データ
   * @throws TagAlreadyExistsException 同名タグが存在する場合
   */
  async create(dto: CreateTagDto): Promise<Tag> {
    // 同名タグの重複チェック
    const existing = await this.tagRepository.findByName(dto.name);
    if (existing) {
      throw new TagAlreadyExistsException(dto.name);
    }

    return this.tagRepository.create(dto);
  }

  /**
   * タグ一覧を取得
   *
   * @param options 検索条件（search, page, limit）
   */
  async findAll(options: TagFindOptions = {}): Promise<TagListResponse> {
    const { page = 1, limit = 20 } = options;
    const result = await this.tagRepository.findAll(options);

    return {
      data: result.data,
      meta: {
        total: result.total,
        page,
        limit,
      },
    };
  }

  /**
   * IDでタグを取得
   *
   * @param id タグID
   * @throws TagNotFoundException タグが見つからない場合
   */
  async findOne(id: number): Promise<Tag> {
    const tag = await this.tagRepository.findById(id);
    if (!tag) {
      throw new TagNotFoundException(id);
    }
    return tag;
  }

  /**
   * タグを更新
   *
   * Why: 名前変更時は重複チェックが必要だが、自分自身との重複はOK
   *
   * @param id タグID
   * @param dto 更新データ
   * @throws TagNotFoundException タグが見つからない場合
   * @throws TagAlreadyExistsException 更新後の名前が他のタグと重複する場合
   */
  async update(id: number, dto: UpdateTagDto): Promise<Tag> {
    // 存在チェック
    const tag = await this.tagRepository.findById(id);
    if (!tag) {
      throw new TagNotFoundException(id);
    }

    // 名前変更時の重複チェック（自分自身は除く）
    if (dto.name !== undefined) {
      const existing = await this.tagRepository.findByName(dto.name);
      if (existing && existing.id !== id) {
        throw new TagAlreadyExistsException(dto.name);
      }
    }

    const updated = await this.tagRepository.update(id, dto);
    return updated!;
  }

  /**
   * タグを削除
   *
   * @param id タグID
   * @throws TagNotFoundException タグが見つからない場合
   */
  async delete(id: number): Promise<void> {
    const tag = await this.tagRepository.findById(id);
    if (!tag) {
      throw new TagNotFoundException(id);
    }

    await this.tagRepository.delete(id);
  }

  /**
   * タスクにタグを追加
   *
   * Why: 同一タグの重複付与を防ぐため、既存タグをチェック
   *
   * @param taskId タスクID
   * @param tagId タグID
   * @throws TaskNotFoundException タスクが見つからない場合
   * @throws TagNotFoundException タグが見つからない場合
   * @throws TaskTagAlreadyExistsException 既にタグが付与されている場合
   */
  async addTagToTask(taskId: number, tagId: number): Promise<Task> {
    // タスク存在チェック（tags リレーション含む）
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new TaskNotFoundException(taskId);
    }

    // タグ存在チェック
    const tag = await this.tagRepository.findById(tagId);
    if (!tag) {
      throw new TagNotFoundException(tagId);
    }

    // 重複チェック
    const alreadyHasTag = task.tags?.some((t) => t.id === tagId) ?? false;
    if (alreadyHasTag) {
      throw new TaskTagAlreadyExistsException(taskId, tagId);
    }

    // タグを追加
    if (!task.tags) {
      task.tags = [];
    }
    task.tags.push(tag);

    return this.taskRepository.save(task);
  }

  /**
   * タスクからタグを削除
   *
   * @param taskId タスクID
   * @param tagId タグID
   * @throws TaskNotFoundException タスクが見つからない場合
   * @throws TagNotFoundException タグが見つからない場合
   */
  async removeTagFromTask(taskId: number, tagId: number): Promise<void> {
    // タスク存在チェック（tags リレーション含む）
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new TaskNotFoundException(taskId);
    }

    // タグ存在チェック
    const tag = await this.tagRepository.findById(tagId);
    if (!tag) {
      throw new TagNotFoundException(tagId);
    }

    // タグを削除
    task.tags = task.tags?.filter((t) => t.id !== tagId) ?? [];

    await this.taskRepository.save(task);
  }
}
