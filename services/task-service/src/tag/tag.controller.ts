/**
 * Tag コントローラ
 *
 * タグのCRUD操作、タスクへのタグ追加・削除エンドポイント。
 * 2つのControllerに分割:
 * - TagController: /tags エンドポイント
 * - TaskTagsController: /tasks/:taskId/tags エンドポイント
 */
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TagService, TagListResponse } from './tag.service';
import { Tag } from './entities/tag.entity';
import { Task } from '../task/entities/task.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagQueryDto } from './dto/tag-query.dto';
import { AddTagToTaskDto } from './dto/add-tag-to-task.dto';

/**
 * レスポンスラッパー
 */
interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
  };
}

interface ApiListResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    timestamp: string;
  };
}

/**
 * タグCRUDコントローラ
 *
 * /tags エンドポイントを担当
 */
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  /**
   * タグ作成
   * POST /tags
   */
  @Post()
  async create(@Body() createTagDto: CreateTagDto): Promise<ApiResponse<Tag>> {
    const tag = await this.tagService.create(createTagDto);
    return {
      data: tag,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  /**
   * タグ一覧取得
   * GET /tags
   */
  @Get()
  async findAll(@Query() query: TagQueryDto): Promise<ApiListResponse<Tag>> {
    const result: TagListResponse = await this.tagService.findAll({
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
    return {
      data: result.data,
      meta: {
        total: result.meta.total,
        page: result.meta.page,
        limit: result.meta.limit,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * タグ詳細取得
   * GET /tags/:id
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Tag>> {
    const tag = await this.tagService.findOne(id);
    return {
      data: tag,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  /**
   * タグ更新
   * PATCH /tags/:id
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTagDto: UpdateTagDto,
  ): Promise<ApiResponse<Tag>> {
    const tag = await this.tagService.update(id, updateTagDto);
    return {
      data: tag,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  /**
   * タグ削除
   * DELETE /tags/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.tagService.delete(id);
  }
}

/**
 * タスク-タグ関連コントローラ
 *
 * /tasks/:taskId/tags エンドポイントを担当
 * タスクへのタグ追加・削除を処理
 */
@Controller('tasks/:taskId/tags')
export class TaskTagsController {
  constructor(private readonly tagService: TagService) {}

  /**
   * タスクにタグを追加
   * POST /tasks/:taskId/tags
   */
  @Post()
  async addTagToTask(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() addTagToTaskDto: AddTagToTaskDto,
  ): Promise<ApiResponse<Task>> {
    const task = await this.tagService.addTagToTask(
      taskId,
      addTagToTaskDto.tagId,
    );
    return {
      data: task,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  /**
   * タスクからタグを削除
   * DELETE /tasks/:taskId/tags/:tagId
   */
  @Delete(':tagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTagFromTask(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('tagId', ParseIntPipe) tagId: number,
  ): Promise<void> {
    await this.tagService.removeTagFromTask(taskId, tagId);
  }
}
