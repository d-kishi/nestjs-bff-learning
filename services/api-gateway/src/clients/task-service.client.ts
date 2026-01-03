/**
 * TaskServiceClient
 *
 * task-serviceへのHTTPクライアント。
 * Project, Task, Comment, Tag APIの呼び出しを担当。
 *
 * Why: BFFはtask-serviceにタスク管理処理を委譲し、
 * X-User-Id, X-User-Rolesヘッダで認証情報を伝播する。
 */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { HttpException } from '@nestjs/common';
import {
  BffServiceUnavailableException,
  BffTimeoutException,
} from '../common/exceptions/bff.exception';

@Injectable()
export class TaskServiceClient {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    configService: ConfigService,
  ) {
    this.baseUrl = configService.get<string>(
      'TASK_SERVICE_URL',
      'http://localhost:3001',
    );
  }

  // ========== Projects ==========

  /**
   * プロジェクト一覧取得
   */
  async getProjects(
    userId: number,
    roles: string[],
    query?: Record<string, any>,
  ): Promise<any> {
    return this.get('/projects', userId, roles, query);
  }

  /**
   * プロジェクト詳細取得
   */
  async getProject(id: number, userId: number, roles: string[]): Promise<any> {
    return this.get(`/projects/${id}`, userId, roles);
  }

  /**
   * プロジェクト作成
   */
  async createProject(dto: any, userId: number, roles: string[]): Promise<any> {
    return this.post('/projects', dto, userId, roles);
  }

  /**
   * プロジェクト更新
   */
  async updateProject(
    id: number,
    dto: any,
    userId: number,
    roles: string[],
  ): Promise<any> {
    return this.patch(`/projects/${id}`, dto, userId, roles);
  }

  /**
   * プロジェクト削除
   */
  async deleteProject(
    id: number,
    userId: number,
    roles: string[],
  ): Promise<any> {
    return this.delete(`/projects/${id}`, userId, roles);
  }

  // ========== Tasks ==========

  /**
   * タスク一覧取得
   */
  async getTasks(
    userId: number,
    roles: string[],
    query?: Record<string, any>,
  ): Promise<any> {
    return this.get('/tasks', userId, roles, query);
  }

  /**
   * タスク詳細取得
   */
  async getTask(id: number, userId: number, roles: string[]): Promise<any> {
    return this.get(`/tasks/${id}`, userId, roles);
  }

  /**
   * タスク作成
   */
  async createTask(dto: any, userId: number, roles: string[]): Promise<any> {
    return this.post('/tasks', dto, userId, roles);
  }

  /**
   * タスク更新
   */
  async updateTask(
    id: number,
    dto: any,
    userId: number,
    roles: string[],
  ): Promise<any> {
    return this.patch(`/tasks/${id}`, dto, userId, roles);
  }

  /**
   * タスク削除
   */
  async deleteTask(id: number, userId: number, roles: string[]): Promise<any> {
    return this.delete(`/tasks/${id}`, userId, roles);
  }

  // ========== Comments ==========

  /**
   * コメント一覧取得
   */
  async getComments(
    taskId: number,
    userId: number,
    roles: string[],
  ): Promise<any> {
    return this.get(`/tasks/${taskId}/comments`, userId, roles);
  }

  /**
   * コメント作成
   */
  async createComment(
    taskId: number,
    dto: any,
    userId: number,
    roles: string[],
  ): Promise<any> {
    return this.post(`/tasks/${taskId}/comments`, dto, userId, roles);
  }

  /**
   * コメント更新
   */
  async updateComment(
    id: number,
    dto: any,
    userId: number,
    roles: string[],
  ): Promise<any> {
    return this.patch(`/comments/${id}`, dto, userId, roles);
  }

  /**
   * コメント削除
   */
  async deleteComment(
    id: number,
    userId: number,
    roles: string[],
  ): Promise<any> {
    return this.delete(`/comments/${id}`, userId, roles);
  }

  // ========== Tags ==========

  /**
   * タグ一覧取得
   */
  async getTags(
    userId: number,
    roles: string[],
    query?: Record<string, any>,
  ): Promise<any> {
    return this.get('/tags', userId, roles, query);
  }

  /**
   * タグ詳細取得
   */
  async getTag(id: number, userId: number, roles: string[]): Promise<any> {
    return this.get(`/tags/${id}`, userId, roles);
  }

  /**
   * タグ作成
   */
  async createTag(dto: any, userId: number, roles: string[]): Promise<any> {
    return this.post('/tags', dto, userId, roles);
  }

  /**
   * タグ更新
   */
  async updateTag(
    id: number,
    dto: any,
    userId: number,
    roles: string[],
  ): Promise<any> {
    return this.patch(`/tags/${id}`, dto, userId, roles);
  }

  /**
   * タグ削除
   */
  async deleteTag(id: number, userId: number, roles: string[]): Promise<any> {
    return this.delete(`/tags/${id}`, userId, roles);
  }

  /**
   * タスクにタグを追加
   */
  async addTagToTask(
    taskId: number,
    tagId: number,
    userId: number,
    roles: string[],
  ): Promise<any> {
    return this.post(`/tasks/${taskId}/tags/${tagId}`, null, userId, roles);
  }

  /**
   * タスクからタグを削除
   */
  async removeTagFromTask(
    taskId: number,
    tagId: number,
    userId: number,
    roles: string[],
  ): Promise<any> {
    return this.delete(`/tasks/${taskId}/tags/${tagId}`, userId, roles);
  }

  // ========== Private Methods ==========

  /**
   * GETリクエスト
   */
  private async get(
    path: string,
    userId: number,
    roles: string[],
    query?: Record<string, any>,
  ): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}${path}`, {
          ...this.createConfig(userId, roles),
          params: query,
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * POSTリクエスト
   */
  private async post(
    path: string,
    data: any,
    userId: number,
    roles: string[],
  ): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}${path}`,
          data,
          this.createConfig(userId, roles),
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * PATCHリクエスト
   */
  private async patch(
    path: string,
    data: any,
    userId: number,
    roles: string[],
  ): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.baseUrl}${path}`,
          data,
          this.createConfig(userId, roles),
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * DELETEリクエスト
   */
  private async delete(
    path: string,
    userId: number,
    roles: string[],
  ): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(
          `${this.baseUrl}${path}`,
          this.createConfig(userId, roles),
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * ヘッダ設定を作成
   */
  private createConfig(
    userId: number,
    roles: string[],
  ): { headers: Record<string, string> } {
    return {
      headers: {
        'X-User-Id': String(userId),
        'X-User-Roles': roles.join(','),
      },
    };
  }

  /**
   * エラーハンドリング
   */
  private handleError(error: unknown): never {
    if (error instanceof AxiosError) {
      // タイムアウト
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw new BffTimeoutException('task-service');
      }

      // 接続エラー
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new BffServiceUnavailableException('task-service');
      }

      // 下流サービスのHTTPエラーを透過
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
    }

    // その他のエラー
    throw new BffServiceUnavailableException('task-service');
  }
}
