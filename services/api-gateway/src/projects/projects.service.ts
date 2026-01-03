/**
 * ProjectsService
 *
 * プロジェクト関連のビジネスロジック。
 * task-serviceへリクエストを委譲する薄いProxy層。
 *
 * Why: BFFはロジックを持たず、下流サービスに処理を委譲
 * - 認証済みユーザー情報をヘッダとして伝播
 * - エラーは下流サービスのレスポンスをそのまま透過
 */
import { Injectable } from '@nestjs/common';
import { TaskServiceClient } from '../clients/task-service.client';
import { UserFromJwt } from '../common/types';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly taskServiceClient: TaskServiceClient) {}

  /**
   * プロジェクト一覧取得
   */
  async findAll(user: UserFromJwt, query: Record<string, any>): Promise<any> {
    return this.taskServiceClient.getProjects(user.id, user.roles, query);
  }

  /**
   * プロジェクト詳細取得
   */
  async findOne(id: number, user: UserFromJwt): Promise<any> {
    return this.taskServiceClient.getProject(id, user.id, user.roles);
  }

  /**
   * プロジェクト作成
   */
  async create(dto: CreateProjectDto, user: UserFromJwt): Promise<any> {
    return this.taskServiceClient.createProject(dto, user.id, user.roles);
  }

  /**
   * プロジェクト更新
   */
  async update(
    id: number,
    dto: UpdateProjectDto,
    user: UserFromJwt,
  ): Promise<any> {
    return this.taskServiceClient.updateProject(id, dto, user.id, user.roles);
  }

  /**
   * プロジェクト削除
   */
  async delete(id: number, user: UserFromJwt): Promise<void> {
    return this.taskServiceClient.deleteProject(id, user.id, user.roles);
  }
}
