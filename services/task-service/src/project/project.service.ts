/**
 * Project サービス
 *
 * プロジェクトのビジネスロジックを集約する。
 *
 * Why: Controller → Service → Repositoryの3層構造
 * - Controllerは薄く保ち、HTTPリクエスト/レスポンスのみ担当
 * - Serviceにビジネスロジックを集中
 * - Repositoryはデータアクセスのみ担当
 *
 * Why: トランザクション管理はService層で行う
 * - トランザクションは「ビジネスロジックの単位」であり、Service層の責務
 * - 複数のRepository操作を跨ぐ場合、Service層でトランザクションを管理
 * - Repository層は単一テーブル操作に特化すべき（単一責任の原則）
 */
import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, In } from 'typeorm';
import { ProjectRepository, ProjectFindOptions } from './project.repository';
import { Project } from './entities/project.entity';
import { Task } from '../task/entities/task.entity';
import { Comment } from '../comment/entities/comment.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginatedResponse } from '../common/dto/api-response.dto';
import {
  ProjectNotFoundException,
  ProjectForbiddenException,
} from '../common/exceptions/business.exception';

@Injectable()
export class ProjectService {
  /**
   * Why: DataSourceを直接インジェクト
   * - トランザクション管理のため
   * - DataSource.transaction()でトランザクション境界を明示的に制御
   */
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly dataSource: DataSource,
  ) {}

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
   *
   * Why: トランザクションでラップする理由
   * - 存在確認（findById）と更新（save）の間に他のトランザクションが
   *   同じレコードを変更する可能性がある（ロストアップデート問題）
   * - 本実装では学習目的で明示的にトランザクションを使用
   * - 厳密な排他制御が必要な場合は楽観的ロック（@Version）や
   *   悲観的ロック（SELECT FOR UPDATE）を併用する
   */
  async update(
    id: number,
    dto: UpdateProjectDto,
    userId: number,
  ): Promise<Project> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      // トランザクション内でプロジェクトを取得
      const project = await manager.findOne(Project, { where: { id } });
      if (!project) {
        throw new ProjectNotFoundException(id);
      }

      // 権限チェック: オーナーのみ更新可能
      if (project.ownerId !== userId) {
        throw new ProjectForbiddenException(
          'Only the owner can update this project',
        );
      }

      // 更新対象のフィールドのみ適用
      if (dto.name !== undefined) {
        project.name = dto.name;
      }
      if (dto.description !== undefined) {
        project.description = dto.description;
      }

      // トランザクション内で保存
      return manager.save(Project, project);
    });
  }

  /**
   * プロジェクトを削除
   *
   * @param id プロジェクトID
   * @param userId リクエストユーザーID（権限チェック用）
   * @throws ProjectNotFoundException プロジェクトが存在しない場合
   * @throws ProjectForbiddenException 権限がない場合
   *
   * Why: トランザクションで明示的に関連エンティティを削除する理由
   * - 学習目的: トランザクションの使い方を理解するため
   * - 本番では以下の選択肢がある:
   *   1. cascade: true / onDelete: 'CASCADE' でDBに任せる（現在の設定）
   *   2. トランザクション内で明示的に削除（本実装）
   * - 明示的に削除するメリット:
   *   - 削除順序を制御できる
   *   - 削除前に追加のビジネスロジックを挟める
   *   - デバッグ・ログ出力が容易
   */
  async delete(id: number, userId: number): Promise<void> {
    // 事前チェック（トランザクション外）
    // Why: 存在確認・権限チェックは読み取り専用なのでトランザクション外でOK
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new ProjectNotFoundException(id);
    }

    if (project.ownerId !== userId) {
      throw new ProjectForbiddenException(
        'Only the owner can delete this project',
      );
    }

    // トランザクション内で削除実行
    await this.dataSource.transaction(async (manager: EntityManager) => {
      // 1. プロジェクトに紐づくタスクIDを取得
      const tasks = await manager.find(Task, {
        where: { projectId: id },
        select: ['id'],
      });
      const taskIds = tasks.map((t) => t.id);

      // 2. タスクに紐づくコメントを削除
      // Why: コメントはタスクに依存しているため、タスク削除前に削除
      if (taskIds.length > 0) {
        await manager.delete(Comment, { taskId: In(taskIds) });

        // 3. task_tags中間テーブルのレコードを削除
        // Why: ManyToManyリレーションの中間テーブルは明示的に削除が必要な場合がある
        // 本プロジェクトでは@JoinTableのcascade設定により自動削除されるが、
        // 明示的に削除する場合は以下のようにする
        await manager
          .createQueryBuilder()
          .delete()
          .from('task_tags')
          .where('task_id IN (:...taskIds)', { taskIds })
          .execute();
      }

      // 4. タスクを削除
      if (taskIds.length > 0) {
        await manager.delete(Task, { projectId: id });
      }

      // 5. プロジェクトを削除
      await manager.delete(Project, { id });
    });
  }
}
