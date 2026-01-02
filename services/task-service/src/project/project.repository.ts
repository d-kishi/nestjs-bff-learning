/**
 * Project リポジトリ
 *
 * プロジェクトのDB操作を抽象化する。
 *
 * Why: TypeORMのRepositoryを直接使わずラップする理由
 * - テスト時のモック化が容易
 * - ビジネスロジックとDB操作の分離
 * - クエリの再利用性向上
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { calculatePagination } from '../common/dto/pagination.dto';

/**
 * プロジェクト検索条件
 */
export interface ProjectFindOptions {
  ownerId?: number;
  page?: number;
  limit?: number;
}

/**
 * プロジェクト検索結果
 */
export interface ProjectFindResult {
  data: Project[];
  total: number;
}

@Injectable()
export class ProjectRepository {
  constructor(
    @InjectRepository(Project)
    private readonly repository: Repository<Project>,
  ) {}

  /**
   * プロジェクトを作成
   *
   * @param dto 作成データ
   * @param ownerId オーナーユーザーID
   */
  async create(dto: CreateProjectDto, ownerId: number): Promise<Project> {
    const project = this.repository.create({
      ...dto,
      ownerId,
    });
    return this.repository.save(project);
  }

  /**
   * プロジェクト一覧を取得
   *
   * @param options 検索条件
   */
  async findAll(options: ProjectFindOptions = {}): Promise<ProjectFindResult> {
    const { ownerId, page = 1, limit = 20 } = options;
    const { skip, take } = calculatePagination(page, limit);

    const queryBuilder = this.repository.createQueryBuilder('project');

    // ownerIdでフィルタリング
    if (ownerId !== undefined) {
      queryBuilder.where('project.ownerId = :ownerId', { ownerId });
    }

    // ソート: 作成日時の降順
    queryBuilder.orderBy('project.createdAt', 'DESC');

    // ページネーション
    queryBuilder.skip(skip).take(take);

    // 実行
    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  /**
   * IDでプロジェクトを取得
   *
   * @param id プロジェクトID
   */
  async findById(id: number): Promise<Project | null> {
    return this.repository.findOne({ where: { id } });
  }

  /**
   * プロジェクトを更新
   *
   * @param id プロジェクトID
   * @param dto 更新データ
   */
  async update(id: number, dto: UpdateProjectDto): Promise<Project | null> {
    const project = await this.findById(id);
    if (!project) {
      return null;
    }

    // 更新対象のフィールドのみ適用
    if (dto.name !== undefined) {
      project.name = dto.name;
    }
    if (dto.description !== undefined) {
      project.description = dto.description;
    }

    return this.repository.save(project);
  }

  /**
   * プロジェクトを削除
   *
   * @param id プロジェクトID
   * @returns 削除成功時true
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
