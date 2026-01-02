/**
 * Comment リポジトリ
 *
 * コメントのDB操作を抽象化する。
 * タスク単位での検索、ページネーションをサポート。
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { calculatePagination } from '../common/dto/pagination.dto';

/**
 * コメント検索条件
 */
export interface CommentFindOptions {
  taskId?: number;
  page?: number;
  limit?: number;
}

/**
 * コメント検索結果
 */
export interface CommentFindResult {
  data: Comment[];
  total: number;
}

@Injectable()
export class CommentRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly repository: Repository<Comment>,
  ) {}

  /**
   * コメントを作成
   *
   * @param content コメント内容
   * @param taskId タスクID
   * @param authorId 投稿者ID
   */
  async create(
    content: string,
    taskId: number,
    authorId: number,
  ): Promise<Comment> {
    const comment = this.repository.create({
      content,
      taskId,
      authorId,
    });
    return this.repository.save(comment);
  }

  /**
   * コメント一覧を取得
   *
   * @param options 検索条件
   */
  async findAll(options: CommentFindOptions = {}): Promise<CommentFindResult> {
    const { taskId, page = 1, limit = 20 } = options;
    const { skip, take } = calculatePagination(page, limit);

    const queryBuilder = this.repository.createQueryBuilder('comment');

    // タスクIDでフィルタリング
    if (taskId !== undefined) {
      queryBuilder.andWhere('comment.taskId = :taskId', { taskId });
    }

    // ソート: 作成日時の降順
    queryBuilder.orderBy('comment.createdAt', 'DESC');

    // ページネーション
    queryBuilder.skip(skip).take(take);

    // 実行
    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  /**
   * IDでコメントを取得
   *
   * @param id コメントID
   */
  async findById(id: number): Promise<Comment | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  /**
   * コメントを更新
   *
   * @param id コメントID
   * @param dto 更新データ
   */
  async update(id: number, dto: UpdateCommentDto): Promise<Comment | null> {
    const comment = await this.repository.findOne({ where: { id } });
    if (!comment) {
      return null;
    }

    // 更新対象のフィールドのみ適用
    if (dto.content !== undefined) {
      comment.content = dto.content;
    }

    return this.repository.save(comment);
  }

  /**
   * コメントを削除
   *
   * @param id コメントID
   * @returns 削除成功時true
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
