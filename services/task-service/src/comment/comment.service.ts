/**
 * Comment サービス
 *
 * コメントのビジネスロジックを集約する。
 * タスクの存在確認、権限チェックを含む。
 *
 * 権限ルール:
 * - 作成: MEMBER以上（authorIdは自動設定）
 * - 編集: 投稿者のみ
 * - 削除: 投稿者またはADMIN
 */
import { Injectable } from '@nestjs/common';
import { CommentRepository, CommentFindOptions } from './comment.repository';
import { TaskRepository } from '../task/task.repository';
import { Comment } from './entities/comment.entity';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PaginatedResponse } from '../common/dto/api-response.dto';
import {
  CommentNotFoundException,
  CommentForbiddenException,
  TaskNotFoundException,
} from '../common/exceptions/business.exception';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly taskRepository: TaskRepository,
  ) {}

  /**
   * コメントを作成
   *
   * @param content コメント内容
   * @param taskId タスクID
   * @param authorId 投稿者ID（X-User-Idから取得）
   * @returns 作成されたコメント
   * @throws TaskNotFoundException タスクが存在しない場合
   */
  async create(
    content: string,
    taskId: number,
    authorId: number,
  ): Promise<Comment> {
    // タスクの存在確認
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new TaskNotFoundException(taskId);
    }

    return this.commentRepository.create(content, taskId, authorId);
  }

  /**
   * コメント一覧を取得
   *
   * @param options 検索条件
   * @returns ページネーション付きコメント一覧
   */
  async findAll(
    options: CommentFindOptions = {},
  ): Promise<PaginatedResponse<Comment>> {
    const { page = 1, limit = 20 } = options;
    const { data, total } = await this.commentRepository.findAll(options);
    return new PaginatedResponse(data, total, page, limit);
  }

  /**
   * IDでコメントを取得
   *
   * @param id コメントID
   * @returns コメント
   * @throws CommentNotFoundException コメントが存在しない場合
   */
  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new CommentNotFoundException(id);
    }
    return comment;
  }

  /**
   * コメントを更新
   *
   * @param id コメントID
   * @param dto 更新データ
   * @param userId リクエストユーザーID
   * @returns 更新されたコメント
   * @throws CommentNotFoundException コメントが存在しない場合
   * @throws CommentForbiddenException 投稿者以外が編集しようとした場合
   */
  async update(
    id: number,
    dto: UpdateCommentDto,
    userId: number,
  ): Promise<Comment> {
    // コメントの存在確認
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new CommentNotFoundException(id);
    }

    // 権限チェック: 投稿者のみ編集可能
    if (comment.authorId !== userId) {
      throw new CommentForbiddenException(
        'Only the author can edit this comment',
      );
    }

    // 更新実行
    const updated = await this.commentRepository.update(id, dto);
    if (!updated) {
      throw new CommentNotFoundException(id);
    }

    return updated;
  }

  /**
   * コメントを削除
   *
   * @param id コメントID
   * @param userId リクエストユーザーID
   * @param roles ユーザーロール配列
   * @throws CommentNotFoundException コメントが存在しない場合
   * @throws CommentForbiddenException 投稿者でもADMINでもない場合
   */
  async delete(id: number, userId: number, roles: string[]): Promise<void> {
    // コメントの存在確認
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new CommentNotFoundException(id);
    }

    // 権限チェック: 投稿者またはADMINのみ削除可能
    const isAuthor = comment.authorId === userId;
    const isAdmin = roles.includes('ADMIN');
    if (!isAuthor && !isAdmin) {
      throw new CommentForbiddenException(
        'Only the author or ADMIN can delete this comment',
      );
    }

    // 削除実行
    await this.commentRepository.delete(id);
  }
}
