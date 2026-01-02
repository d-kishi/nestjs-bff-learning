/**
 * Project サービス
 *
 * プロジェクトのビジネスロジックを集約する。
 *
 * Why: Controller → Service → Repositoryの3層構造
 * - Controllerは薄く保ち、HTTPリクエスト/レスポンスのみ担当
 * - Serviceにビジネスロジックを集中
 * - Repositoryはデータアクセスのみ担当
 */
import { Injectable } from '@nestjs/common';
import { ProjectRepository, ProjectFindOptions } from './project.repository';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginatedResponse } from '../common/dto/api-response.dto';
import {
  ProjectNotFoundException,
  ProjectForbiddenException,
} from '../common/exceptions/business.exception';

@Injectable()
export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  /**
   * プロジェクトを作成
   *
   * @param dto 作成データ
   * @param ownerId オーナーユーザーID（X-User-Idから取得）
   * @returns 作成されたプロジェクト
   */
  async create(dto: CreateProjectDto, ownerId: number): Promise<Project> {
    return this.projectRepository.create(dto, ownerId);
  }

  /**
   * プロジェクト一覧を取得
   *
   * @param options 検索条件
   * @returns ページネーション付きプロジェクト一覧
   */
  async findAll(
    options: ProjectFindOptions = {},
  ): Promise<PaginatedResponse<Project>> {
    const { page = 1, limit = 20 } = options;
    const { data, total } = await this.projectRepository.findAll(options);
    return new PaginatedResponse(data, total, page, limit);
  }

  /**
   * IDでプロジェクトを取得
   *
   * @param id プロジェクトID
   * @returns プロジェクト
   * @throws ProjectNotFoundException プロジェクトが存在しない場合
   */
  async findOne(id: number): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new ProjectNotFoundException(id);
    }
    return project;
  }

  /**
   * プロジェクトを更新
   *
   * @param id プロジェクトID
   * @param dto 更新データ
   * @param userId リクエストユーザーID（権限チェック用）
   * @returns 更新されたプロジェクト
   * @throws ProjectNotFoundException プロジェクトが存在しない場合
   * @throws ProjectForbiddenException 権限がない場合
   */
  async update(
    id: number,
    dto: UpdateProjectDto,
    userId: number,
  ): Promise<Project> {
    // プロジェクトの存在確認
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new ProjectNotFoundException(id);
    }

    // 権限チェック: オーナーのみ更新可能
    if (project.ownerId !== userId) {
      throw new ProjectForbiddenException(
        'Only the owner can update this project',
      );
    }

    // 更新実行
    const updated = await this.projectRepository.update(id, dto);
    // update後はnullになることはないが、型安全のためチェック
    if (!updated) {
      throw new ProjectNotFoundException(id);
    }

    return updated;
  }

  /**
   * プロジェクトを削除
   *
   * @param id プロジェクトID
   * @param userId リクエストユーザーID（権限チェック用）
   * @throws ProjectNotFoundException プロジェクトが存在しない場合
   * @throws ProjectForbiddenException 権限がない場合
   */
  async delete(id: number, userId: number): Promise<void> {
    // プロジェクトの存在確認
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new ProjectNotFoundException(id);
    }

    // 権限チェック: オーナーのみ削除可能
    if (project.ownerId !== userId) {
      throw new ProjectForbiddenException(
        'Only the owner can delete this project',
      );
    }

    // 削除実行
    await this.projectRepository.delete(id);
  }
}
