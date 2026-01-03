/**
 * UsersController
 *
 * ユーザー管理エンドポイントを提供。
 * 一部エンドポイントはADMIN専用。
 *
 * Why: BFFレベルでADMIN専用エンドポイントをガード
 * - @Roles('ADMIN')でガード
 * - 詳細な権限チェック（本人 or ADMIN）は下流サービスで実施
 */
import {
  Controller,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserFromJwt } from '../common/types';
import { UserQueryDto } from './dto/user-query.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateRolesDto } from './dto/update-roles.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * ユーザー一覧取得（ADMIN専用）
   *
   * GET /api/users
   */
  @Get()
  @Roles('ADMIN')
  async findAll(
    @CurrentUser() user: UserFromJwt,
    @Query() query: UserQueryDto,
  ): Promise<any> {
    return this.usersService.findAll(user, query);
  }

  /**
   * ユーザー詳細取得
   *
   * GET /api/users/:id
   *
   * 権限チェックは下流サービスで実施（本人 or ADMIN）
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserFromJwt,
  ): Promise<any> {
    return this.usersService.findOne(id, user);
  }

  /**
   * ユーザー削除（ADMIN専用）
   *
   * DELETE /api/users/:id
   */
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserFromJwt,
  ): Promise<void> {
    return this.usersService.delete(id, user);
  }

  /**
   * プロフィール更新
   *
   * PATCH /api/users/:id/profile
   *
   * 権限チェックは下流サービスで実施（本人 or ADMIN）
   */
  @Patch(':id/profile')
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProfileDto,
    @CurrentUser() user: UserFromJwt,
  ): Promise<any> {
    return this.usersService.updateProfile(id, dto, user);
  }

  /**
   * パスワード変更
   *
   * PATCH /api/users/:id/password
   *
   * 権限チェックは下流サービスで実施（本人のみ）
   */
  @Patch(':id/password')
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: UserFromJwt,
  ): Promise<any> {
    return this.usersService.changePassword(id, dto, user);
  }

  /**
   * ロール更新（ADMIN専用）
   *
   * PATCH /api/users/:id/roles
   */
  @Patch(':id/roles')
  @Roles('ADMIN')
  async updateRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRolesDto,
    @CurrentUser() user: UserFromJwt,
  ): Promise<any> {
    return this.usersService.updateRoles(id, dto, user);
  }

  /**
   * ステータス更新（ADMIN専用）
   *
   * PATCH /api/users/:id/status
   */
  @Patch(':id/status')
  @Roles('ADMIN')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: UserFromJwt,
  ): Promise<any> {
    return this.usersService.updateStatus(id, dto, user);
  }
}
