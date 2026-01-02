/**
 * Task コントローラー
 *
 * タスク関連のHTTPリクエストを処理する。
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
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { Task } from './entities/task.entity';
import { PaginatedResponse } from '../common/dto/api-response.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  /**
   * タスク作成
   *
   * POST /tasks
   *
   * @param dto 作成データ
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTaskDto): Promise<Task> {
    return this.taskService.create(dto);
  }

  /**
   * タスク一覧取得
   *
   * GET /tasks
   *
   * @param query フィルタ・ページネーションパラメータ
   */
  @Get()
  async findAll(
    @Query() query: TaskQueryDto,
  ): Promise<PaginatedResponse<Task>> {
    return this.taskService.findAll({
      projectId: query.projectId,
      status: query.status,
      priority: query.priority,
      assigneeId: query.assigneeId,
      tagId: query.tagId,
      page: query.page,
      limit: query.limit,
    });
  }

  /**
   * タスク詳細取得
   *
   * GET /tasks/:id
   *
   * @param id タスクID
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Task> {
    return this.taskService.findOne(id);
  }

  /**
   * タスク更新
   *
   * PATCH /tasks/:id
   *
   * @param id タスクID
   * @param dto 更新データ
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
  ): Promise<Task> {
    return this.taskService.update(id, dto);
  }

  /**
   * タスク削除
   *
   * DELETE /tasks/:id
   *
   * @param id タスクID
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.taskService.delete(id);
  }
}
