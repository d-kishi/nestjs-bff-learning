/**
 * Project コントローラー
 *
 * プロジェクト関連のHTTPリクエストを処理する。
 * Controllerは薄く保ち、ビジネスロジックはServiceに委譲。
 *
 * Why: 内部サービス間通信のためJWT認証は行わない
 * - BFFがJWT検証済み
 * - X-User-Id, X-User-Rolesヘッダで認証情報を受け取る
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
  UnauthorizedException,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { CurrentUserId } from '../common/decorators/current-user.decorator';
import { Project } from './entities/project.entity';
import { PaginatedResponse } from '../common/dto/api-response.dto';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  /**
   * プロジェクト作成
   *
   * POST /projects
   *
   * @param dto 作成データ
   * @param userId X-User-Idヘッダから取得したユーザーID
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateProjectDto,
    @CurrentUserId() userId: number | undefined,
  ): Promise<Project> {
    if (userId === undefined) {
      throw new UnauthorizedException('X-User-Id header is required');
    }
    return this.projectService.create(dto, userId);
  }

  /**
   * プロジェクト一覧取得
   *
   * GET /projects
   *
   * @param query ページネーション・フィルタパラメータ
   */
  @Get()
  async findAll(
    @Query() query: ProjectQueryDto,
  ): Promise<PaginatedResponse<Project>> {
    return this.projectService.findAll({
      ownerId: query.ownerId,
      page: query.page,
      limit: query.limit,
    });
  }

  /**
   * プロジェクト詳細取得
   *
   * GET /projects/:id
   *
   * @param id プロジェクトID
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Project> {
    return this.projectService.findOne(id);
  }

  /**
   * プロジェクト更新
   *
   * PATCH /projects/:id
   *
   * @param id プロジェクトID
   * @param dto 更新データ
   * @param userId X-User-Idヘッダから取得したユーザーID（権限チェック用）
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
    @CurrentUserId() userId: number | undefined,
  ): Promise<Project> {
    if (userId === undefined) {
      throw new UnauthorizedException('X-User-Id header is required');
    }
    return this.projectService.update(id, dto, userId);
  }

  /**
   * プロジェクト削除
   *
   * DELETE /projects/:id
   *
   * @param id プロジェクトID
   * @param userId X-User-Idヘッダから取得したユーザーID（権限チェック用）
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number | undefined,
  ): Promise<void> {
    if (userId === undefined) {
      throw new UnauthorizedException('X-User-Id header is required');
    }
    return this.projectService.delete(id, userId);
  }
}
