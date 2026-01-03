/**
 * TasksController
 *
 * タスクエンドポイントを提供。
 * 認証必須（JwtAuthGuard適用）。
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
import { TasksService } from './tasks.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserFromJwt } from '../common/types';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';

@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * タスク一覧取得
   *
   * GET /api/tasks
   */
  @Get()
  async findAll(
    @CurrentUser() user: UserFromJwt,
    @Query() query: TaskQueryDto,
  ): Promise<any> {
    return this.tasksService.findAll(user, query);
  }

  /**
   * タスク詳細取得
   *
   * GET /api/tasks/:id
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserFromJwt,
  ): Promise<any> {
    return this.tasksService.findOne(id, user);
  }

  /**
   * タスク作成
   *
   * POST /api/tasks
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: UserFromJwt,
  ): Promise<any> {
    return this.tasksService.create(dto, user);
  }

  /**
   * タスク更新
   *
   * PATCH /api/tasks/:id
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: UserFromJwt,
  ): Promise<any> {
    return this.tasksService.update(id, dto, user);
  }

  /**
   * タスク削除
   *
   * DELETE /api/tasks/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserFromJwt,
  ): Promise<void> {
    return this.tasksService.delete(id, user);
  }
}
