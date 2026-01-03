/**
 * TagsController
 *
 * タグエンドポイントを提供。
 * タグCRUD + タスクへのタグ付け/解除機能。
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
import { TagsService } from './tags.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserFromJwt } from '../common/types';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagQueryDto } from './dto/tag-query.dto';

@Controller('api')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  /**
   * タグ一覧取得
   *
   * GET /api/tags
   */
  @Get('tags')
  async findAll(
    @CurrentUser() user: UserFromJwt,
    @Query() query: TagQueryDto,
  ): Promise<any> {
    return this.tagsService.findAll(user, query);
  }

  /**
   * タグ詳細取得
   *
   * GET /api/tags/:id
   */
  @Get('tags/:id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserFromJwt,
  ): Promise<any> {
    return this.tagsService.findOne(id, user);
  }

  /**
   * タグ作成
   *
   * POST /api/tags
   */
  @Post('tags')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateTagDto,
    @CurrentUser() user: UserFromJwt,
  ): Promise<any> {
    return this.tagsService.create(dto, user);
  }

  /**
   * タグ更新
   *
   * PATCH /api/tags/:id
   */
  @Patch('tags/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTagDto,
    @CurrentUser() user: UserFromJwt,
  ): Promise<any> {
    return this.tagsService.update(id, dto, user);
  }

  /**
   * タグ削除
   *
   * DELETE /api/tags/:id
   */
  @Delete('tags/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserFromJwt,
  ): Promise<void> {
    return this.tagsService.delete(id, user);
  }

  /**
   * タスクにタグを付与
   *
   * POST /api/tasks/:taskId/tags/:tagId
   */
  @Post('tasks/:taskId/tags/:tagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async addTagToTask(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('tagId', ParseIntPipe) tagId: number,
    @CurrentUser() user: UserFromJwt,
  ): Promise<void> {
    return this.tagsService.addTagToTask(taskId, tagId, user);
  }

  /**
   * タスクからタグを解除
   *
   * DELETE /api/tasks/:taskId/tags/:tagId
   */
  @Delete('tasks/:taskId/tags/:tagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTagFromTask(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('tagId', ParseIntPipe) tagId: number,
    @CurrentUser() user: UserFromJwt,
  ): Promise<void> {
    return this.tagsService.removeTagFromTask(taskId, tagId, user);
  }
}
