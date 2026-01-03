/**
 * RolesController
 *
 * ロール管理エンドポイントを提供。
 * CUD（作成・更新・削除）はADMIN専用。
 */
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserFromJwt } from '../common/types';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('api/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * ロール一覧取得
   *
   * GET /api/roles
   *
   * 認証済みユーザー全員がアクセス可能。
   */
  @Get()
  async findAll(@CurrentUser() user: UserFromJwt): Promise<any> {
    return this.rolesService.findAll(user);
  }

  /**
   * ロール詳細取得
   *
   * GET /api/roles/:id
   *
   * 認証済みユーザー全員がアクセス可能。
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserFromJwt,
  ): Promise<any> {
    return this.rolesService.findOne(id, user);
  }

  /**
   * ロール作成（ADMIN専用）
   *
   * POST /api/roles
   */
  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateRoleDto,
    @CurrentUser() user: UserFromJwt,
  ): Promise<any> {
    return this.rolesService.create(dto, user);
  }

  /**
   * ロール更新（ADMIN専用）
   *
   * PATCH /api/roles/:id
   */
  @Patch(':id')
  @Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() user: UserFromJwt,
  ): Promise<any> {
    return this.rolesService.update(id, dto, user);
  }

  /**
   * ロール削除（ADMIN専用）
   *
   * DELETE /api/roles/:id
   */
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserFromJwt,
  ): Promise<void> {
    return this.rolesService.delete(id, user);
  }
}
