/**
 * Tag リポジトリ
 *
 * タグのDB操作を抽象化する。
 * 名前での検索、ページネーションをサポート。
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { calculatePagination } from '../common/dto/pagination.dto';

/**
 * タグ検索条件
 */
export interface TagFindOptions {
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * タグ検索結果
 */
export interface TagFindResult {
  data: Tag[];
  total: number;
}

@Injectable()
export class TagRepository {
  constructor(
    @InjectRepository(Tag)
    private readonly repository: Repository<Tag>,
  ) {}

  /**
   * タグを作成
   *
   * @param dto 作成データ
   */
  async create(dto: CreateTagDto): Promise<Tag> {
    const tag = this.repository.create({
      name: dto.name,
      color: dto.color,
    });
    return this.repository.save(tag);
  }

  /**
   * タグ一覧を取得
   *
   * @param options 検索条件
   */
  async findAll(options: TagFindOptions = {}): Promise<TagFindResult> {
    const { search, page = 1, limit = 20 } = options;
    const { skip, take } = calculatePagination(page, limit);

    const queryBuilder = this.repository.createQueryBuilder('tag');

    // 名前で部分一致検索（大文字小文字を区別しない）
    if (search !== undefined && search.length > 0) {
      queryBuilder.andWhere('LOWER(tag.name) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    // ソート: 名前の昇順
    queryBuilder.orderBy('tag.name', 'ASC');

    // ページネーション
    queryBuilder.skip(skip).take(take);

    // 実行
    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  /**
   * IDでタグを取得
   *
   * @param id タグID
   */
  async findById(id: number): Promise<Tag | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  /**
   * 名前でタグを取得
   *
   * Why: 同名タグのチェックに使用
   *
   * @param name タグ名
   */
  async findByName(name: string): Promise<Tag | null> {
    return this.repository.findOne({
      where: { name },
    });
  }

  /**
   * タグを更新
   *
   * @param id タグID
   * @param dto 更新データ
   */
  async update(id: number, dto: UpdateTagDto): Promise<Tag | null> {
    const tag = await this.repository.findOne({ where: { id } });
    if (!tag) {
      return null;
    }

    // 更新対象のフィールドのみ適用
    if (dto.name !== undefined) {
      tag.name = dto.name;
    }
    if (dto.color !== undefined) {
      tag.color = dto.color;
    }

    return this.repository.save(tag);
  }

  /**
   * タグを削除
   *
   * @param id タグID
   * @returns 削除成功時true
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
