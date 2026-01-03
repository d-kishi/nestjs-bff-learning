/**
 * CommentsController
 *
 * コメントエンドポイントを提供。
 * タスク配下のネストしたリソース + 単独リソース。
 *
 * Why: コメントは2つのURLパターンを持つ
 * - GET/POST: /api/tasks/:taskId/comments（タスク配下）
 * - PATCH/DELETE: /api/comments/:id（単独）
 */
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserFromJwt } from '../common/types';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('api')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /**
   * タスクのコメント一覧取得
   *
   * GET /api/tasks/:taskId/comments
   */
  @Get('tasks/:taskId/comments')
  async findAllByTask(
    @Param('taskId', ParseIntPipe) taskId: number,
    @CurrentUser() user: UserFromJwt,
  ): Promise<any> {
    return this.commentsService.findAllByTask(taskId, user);
  }

  /**
   * コメント作成
   *
   * POST /api/tasks/:taskId/comments
   */
  @Post('tasks/:taskId/comments')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: UserFromJwt,
  ): Promise<any> {
    return this.commentsService.create(taskId, dto, user);
  }

  /**
   * コメント更新
   *
   * PATCH /api/comments/:id
   */
  @Patch('comments/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: UserFromJwt,
  ): Promise<any> {
    return this.commentsService.update(id, dto, user);
  }

  /**
   * コメント削除
   *
   * DELETE /api/comments/:id
   */
  @Delete('comments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserFromJwt,
  ): Promise<void> {
    return this.commentsService.delete(id, user);
  }
}
