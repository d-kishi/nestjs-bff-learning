/**
 * Roles コントローラー
 *
 * ロール管理のHTTPリクエストを処理する。
 * Controllerは薄く保ち、ビジネスロジックはServiceに委譲。
 *
 * Why: ロール一覧・詳細は認証済みユーザー全員がアクセス可能
 * - ロールのCRUDはADMIN専用（Step 6のRolesGuardで制御）
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
  UnauthorizedException,
} from '@nestjs/common';
import { RoleService, RoleDetailResponse } from './role.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { Role } from './entities/role.entity';
import {
  CurrentUserId,
  CurrentUserRoles,
} from '../common/decorators/current-user.decorator';
import { UserForbiddenException } from '../common/exceptions/business.exception';

@Controller('roles')
export class RolesController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * ロール一覧取得
   *
   * GET /roles
   *
   * 認証済みユーザーはアクセス可能。
   */
  @Get()
  async findAll(@CurrentUserId() userId: number | undefined): Promise<Role[]> {
    if (userId === undefined) {
      throw new UnauthorizedException('X-User-Id header is required');
    }

    return this.roleService.findAll();
  }

  /**
   * ロール詳細取得
   *
   * GET /roles/:id
   *
   * 認証済みユーザーはアクセス可能。ユーザー数も返す。
   *
   * @param id ロールID
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number | undefined,
  ): Promise<RoleDetailResponse> {
    if (userId === undefined) {
      throw new UnauthorizedException('X-User-Id header is required');
    }

    return this.roleService.findOne(id);
  }

  /**
   * ロール作成
   *
   * POST /roles
   *
   * ADMIN専用。
   *
   * @param dto 作成データ
   * @param userId X-User-Idヘッダから取得
   * @param roles X-User-Rolesヘッダから取得
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateRoleDto,
    @CurrentUserId() userId: number | undefined,
    @CurrentUserRoles() roles: string[],
  ): Promise<Role> {
    if (userId === undefined) {
      throw new UnauthorizedException('X-User-Id header is required');
    }

    // ADMIN権限チェック
    if (!roles.includes('ADMIN')) {
      throw new UserForbiddenException('ロールの作成にはADMIN権限が必要です');
    }

    return this.roleService.create(dto);
  }

  /**
   * ロール更新
   *
   * PATCH /roles/:id
   *
   * ADMIN専用。
   *
   * @param id ロールID
   * @param dto 更新データ
   * @param userId X-User-Idヘッダから取得
   * @param roles X-User-Rolesヘッダから取得
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
    @CurrentUserId() userId: number | undefined,
    @CurrentUserRoles() roles: string[],
  ): Promise<Role> {
    if (userId === undefined) {
      throw new UnauthorizedException('X-User-Id header is required');
    }

    // ADMIN権限チェック
    if (!roles.includes('ADMIN')) {
      throw new UserForbiddenException('ロールの更新にはADMIN権限が必要です');
    }

    return this.roleService.update(id, dto);
  }

  /**
   * ロール削除
   *
   * DELETE /roles/:id
   *
   * ADMIN専用。ユーザーが割り当てられているロールは削除不可。
   *
   * @param id ロールID
   * @param userId X-User-Idヘッダから取得
   * @param roles X-User-Rolesヘッダから取得
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number | undefined,
    @CurrentUserRoles() roles: string[],
  ): Promise<void> {
    if (userId === undefined) {
      throw new UnauthorizedException('X-User-Id header is required');
    }

    // ADMIN権限チェック
    if (!roles.includes('ADMIN')) {
      throw new UserForbiddenException('ロールの削除にはADMIN権限が必要です');
    }

    return this.roleService.delete(id);
  }
}
