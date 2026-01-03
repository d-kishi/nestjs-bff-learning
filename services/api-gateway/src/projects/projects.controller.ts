/**
 * ProjectsController
 *
 * プロジェクトエンドポイントを提供。
 * 認証必須（JwtAuthGuard適用）。
 *
 * Why: BFFはControllerを薄く保ち、Serviceに委譲
 * - @CurrentUser()でJWTから認証情報を取得
 * - 下流サービスのレスポンスをそのまま返却
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
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserFromJwt } from '../common/types';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';

@Controller('api/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * プロジェクト一覧取得
   *
   * GET /api/projects
   */
  @Get()
  async findAll(
    @CurrentUser() user: UserFromJwt,
    @Query() query: ProjectQueryDto,
  ): Promise<any> {
    return this.projectsService.findAll(user, query);
  }

  /**
   * プロジェクト詳細取得
   *
   * GET /api/projects/:id
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserFromJwt,
  ): Promise<any> {
    return this.projectsService.findOne(id, user);
  }

  /**
   * プロジェクト作成
   *
   * POST /api/projects
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateProjectDto,
    @CurrentUser() user: UserFromJwt,
  ): Promise<any> {
    return this.projectsService.create(dto, user);
  }

  /**
   * プロジェクト更新
   *
   * PATCH /api/projects/:id
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: UserFromJwt,
  ): Promise<any> {
    return this.projectsService.update(id, dto, user);
  }

  /**
   * プロジェクト削除
   *
   * DELETE /api/projects/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserFromJwt,
  ): Promise<void> {
    return this.projectsService.delete(id, user);
  }
}
