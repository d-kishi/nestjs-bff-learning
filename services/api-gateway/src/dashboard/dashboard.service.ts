/**
 * DashboardService
 *
 * ダッシュボードデータ集約を担当。
 * 複数サービスから並列でデータを取得し、部分失敗をハンドリング。
 *
 * Why: BFFのデータ集約パターンを実装。
 * Promise.allSettledを使用して、一部サービスの障害時も
 * 利用可能なデータを返却する。
 */
import { Injectable } from '@nestjs/common';
import { TaskServiceClient } from '../clients/task-service.client';
import { UserServiceClient } from '../clients/user-service.client';
import { UserFromJwt } from '../common/types';
import {
  DashboardResponse,
  UserSummary,
  TaskSummary,
  ProjectSummary,
  RecentTask,
} from './dto/dashboard-response.dto';

/**
 * task-serviceから返されるタスクの型
 */
interface Task {
  id: number;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  projectId: number;
  project?: { name: string };
  updatedAt: string;
}

/**
 * task-serviceから返されるプロジェクトの型
 */
interface Project {
  id: number;
  name: string;
  ownerId: number;
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly taskServiceClient: TaskServiceClient,
    private readonly userServiceClient: UserServiceClient,
  ) {}

  /**
   * ダッシュボードデータを取得
   *
   * 1. 並列リクエストを発行（Promise.allSettled）
   * 2. 各結果を処理（成功: データ取得、失敗: デフォルト値 + エラー記録）
   * 3. サマリーを算出
   * 4. レスポンスを構築
   */
  async getDashboard(user: UserFromJwt): Promise<DashboardResponse> {
    const errors: string[] = [];

    // 並列リクエスト（Promise.allSettledで全結果を待つ）
    const [userResult, tasksResult, projectsResult] = await Promise.allSettled([
      this.userServiceClient.getUser(user.id, user.id, user.roles),
      this.taskServiceClient.getTasks(user.id, user.roles, {
        assigneeId: user.id,
      }),
      this.taskServiceClient.getProjects(user.id, user.roles, {
        ownerId: user.id,
      }),
    ]);

    // user-service結果処理
    const userData = this.processResult(
      userResult,
      null,
      'user-service unavailable',
      errors,
    );

    // task-service（タスク）結果処理
    const tasksData = this.processResult(
      tasksResult,
      { data: [], meta: { total: 0 } },
      'task-service unavailable',
      errors,
    );

    // task-service（プロジェクト）結果処理
    const projectsData = this.processResult(
      projectsResult,
      { data: [], meta: { total: 0 } },
      'task-service unavailable',
      errors,
    );

    // ユーザー情報を抽出
    const userSummary = this.extractUserSummary(userData);

    // サマリー算出
    const tasks: Task[] = tasksData?.data || [];
    const projects: Project[] = projectsData?.data || [];

    const taskSummary = this.summarizeTasks(tasks);
    const projectSummary = this.summarizeProjects(projects, user.id);
    const recentTasks = this.extractRecentTasks(tasks, 5);

    // エラーの重複排除
    const uniqueErrors = [...new Set(errors)];

    return {
      user: userSummary,
      taskSummary,
      projectSummary,
      recentTasks,
      ...(uniqueErrors.length > 0 && { _errors: uniqueErrors }),
    };
  }

  /**
   * Promise.allSettledの結果を処理
   *
   * 成功時: 値を返却
   * 失敗時: デフォルト値を返却し、エラーを記録
   */
  private processResult<T>(
    result: PromiseSettledResult<T>,
    defaultValue: T,
    errorMessage: string,
    errors: string[],
  ): T {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      errors.push(errorMessage);
      return defaultValue;
    }
  }

  /**
   * ユーザーサマリーを抽出
   */
  private extractUserSummary(userData: any): UserSummary | null {
    if (!userData || !userData.data) {
      return null;
    }

    const user = userData.data;
    return {
      id: user.id,
      email: user.email,
      profile: {
        displayName: user.profile?.displayName || '',
        avatarUrl: user.profile?.avatarUrl || null,
      },
    };
  }

  /**
   * タスクサマリー算出
   */
  private summarizeTasks(tasks: Task[]): TaskSummary {
    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'TODO').length,
      inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      done: tasks.filter((t) => t.status === 'DONE').length,
    };
  }

  /**
   * プロジェクトサマリー算出
   */
  private summarizeProjects(
    projects: Project[],
    userId: number,
  ): ProjectSummary {
    return {
      total: projects.length,
      owned: projects.filter((p) => p.ownerId === userId).length,
    };
  }

  /**
   * 直近タスク抽出（更新日時降順、上位N件）
   *
   * Why: 元の配列を変更しないよう、スプレッド構文でコピーしてからソート。
   */
  private extractRecentTasks(tasks: Task[], limit: number): RecentTask[] {
    return [...tasks]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, limit)
      .map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        projectId: task.projectId,
        projectName: task.project?.name || 'Unknown',
      }));
  }
}
