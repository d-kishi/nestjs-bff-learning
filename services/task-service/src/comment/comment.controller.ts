/**
 * Comment コントローラー
 *
 * コメント関連のHTTPリクエストを処理する。
 *
 * エンドポイント:
 * - POST /tasks/:taskId/comments - コメント投稿
 * - GET /tasks/:taskId/comments - コメント一覧
 * - PATCH /comments/:id - コメント編集（投稿者のみ）
 * - DELETE /comments/:id - コメント削除（投稿者 or ADMIN）
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
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentQueryDto } from './dto/comment-query.dto';
import { Comment } from './entities/comment.entity';
import { PaginatedResponse } from '../common/dto/api-response.dto';
import {
  CurrentUserId,
  CurrentUserRoles,
} from '../common/decorators/current-user.decorator';

/**
 * タスクに紐づくコメント操作
 * /tasks/:taskId/comments
 */
@Controller('tasks/:taskId/comments')
export class TaskCommentsController {
  constructor(private readonly commentService: CommentService) {}

  /**
   * コメント投稿
   *
   * POST /tasks/:taskId/comments
   *
   * @param taskId タスクID
   * @param dto 作成データ
   * @param userId 投稿者ID（X-User-Idヘッダから取得）
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: CreateCommentDto,
    @CurrentUserId() userId: number,
  ): Promise<Comment> {
    return this.commentService.create(dto.content, taskId, userId);
  }

  /**
   * コメント一覧取得
   *
   * GET /tasks/:taskId/comments
   *
   * @param taskId タスクID
   * @param query ページネーションパラメータ
   */
  @Get()
  async findAll(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Query() query: CommentQueryDto,
  ): Promise<PaginatedResponse<Comment>> {
    return this.commentService.findAll({
      taskId,
      page: query.page,
      limit: query.limit,
    });
  }
}

/**
 * コメント単体操作
 * /comments/:id
 */
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentService: CommentService) {}

  /**
   * コメント詳細取得
   *
   * GET /comments/:id
   *
   * @param id コメントID
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Comment> {
    return this.commentService.findOne(id);
  }

  /**
   * コメント編集
   *
   * PATCH /comments/:id
   *
   * 権限: 投稿者のみ
   *
   * @param id コメントID
   * @param dto 更新データ
   * @param userId リクエストユーザーID
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentDto,
    @CurrentUserId() userId: number,
  ): Promise<Comment> {
    return this.commentService.update(id, dto, userId);
  }

  /**
   * コメント削除
   *
   * DELETE /comments/:id
   *
   * 権限: 投稿者 or ADMIN
   *
   * @param id コメントID
   * @param userId リクエストユーザーID
   * @param roles ユーザーロール配列
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
    @CurrentUserRoles() roles: string[],
  ): Promise<void> {
    return this.commentService.delete(id, userId, roles);
  }
}
