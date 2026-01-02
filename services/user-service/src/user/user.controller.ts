/**
 * Users コントローラー
 *
 * ユーザー管理のHTTPリクエストを処理する。
 * Controllerは薄く保ち、ビジネスロジックはServiceに委譲。
 *
 * Why: 権限チェックはServiceで行う
 * - 本人 or ADMIN判定など複雑なロジックはServiceに委譲
 * - Controllerは単純なパラメータ取得と委譲のみ
 */
import {
  Controller,
  Get,
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
import { UserService, UserListResponse, UserResponse } from './user.service';
import {
  UserQueryDto,
  UpdateProfileDto,
  ChangePasswordDto,
  UpdateRolesDto,
  UpdateStatusDto,
} from './dto';
import { UserProfile } from './entities/user-profile.entity';
import {
  CurrentUserId,
  CurrentUserRoles,
} from '../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  /**
   * ユーザー一覧取得
   *
   * GET /users
   *
   * ADMIN専用。ページネーション、フィルタリングをサポート。
   *
   * @param query 検索条件
   * @param userId X-User-Idヘッダから取得
   * @param roles X-User-Rolesヘッダから取得
   */
  @Get()
  async findAll(
    @Query() query: UserQueryDto,
    @CurrentUserId() userId: number | undefined,
    @CurrentUserRoles() roles: string[],
  ): Promise<UserListResponse> {
    if (userId === undefined) {
      throw new UnauthorizedException('X-User-Id header is required');
    }

    return this.userService.findAll(
      {
        email: query.email,
        isActive: query.isActive,
        roleId: query.roleId,
        page: query.page,
        limit: query.limit,
      },
      userId,
      roles,
    );
  }

  /**
   * ユーザー詳細取得
   *
   * GET /users/:id
   *
   * 本人またはADMINのみアクセス可能。
   *
   * @param id ユーザーID
   * @param userId X-User-Idヘッダから取得
   * @param roles X-User-Rolesヘッダから取得
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number | undefined,
    @CurrentUserRoles() roles: string[],
  ): Promise<UserResponse> {
    if (userId === undefined) {
      throw new UnauthorizedException('X-User-Id header is required');
    }

    return this.userService.findOne(id, userId, roles);
  }

  /**
   * ユーザー削除
   *
   * DELETE /users/:id
   *
   * ADMIN専用。物理削除を行う。
   *
   * @param id ユーザーID
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

    return this.userService.delete(id, userId, roles);
  }

  /**
   * プロフィール更新
   *
   * PATCH /users/:id/profile
   *
   * 本人またはADMINのみ更新可能。
   *
   * @param id ユーザーID
   * @param dto 更新データ
   * @param userId X-User-Idヘッダから取得
   * @param roles X-User-Rolesヘッダから取得
   */
  @Patch(':id/profile')
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProfileDto,
    @CurrentUserId() userId: number | undefined,
    @CurrentUserRoles() roles: string[],
  ): Promise<UserProfile> {
    if (userId === undefined) {
      throw new UnauthorizedException('X-User-Id header is required');
    }

    return this.userService.updateProfile(id, dto, userId, roles);
  }

  /**
   * パスワード変更
   *
   * PATCH /users/:id/password
   *
   * 本人のみ変更可能。ADMINでも他人のパスワードは変更不可。
   *
   * @param id ユーザーID
   * @param dto パスワード変更データ
   * @param userId X-User-Idヘッダから取得
   */
  @Patch(':id/password')
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangePasswordDto,
    @CurrentUserId() userId: number | undefined,
  ): Promise<{ message: string }> {
    if (userId === undefined) {
      throw new UnauthorizedException('X-User-Id header is required');
    }

    await this.userService.changePassword(id, dto, userId);
    return { message: 'Password changed successfully' };
  }

  /**
   * ロール更新
   *
   * PATCH /users/:id/roles
   *
   * ADMIN専用。送信したroleIdsで既存ロールを完全に置き換える。
   *
   * @param id ユーザーID
   * @param dto ロール更新データ
   * @param userId X-User-Idヘッダから取得
   * @param roles X-User-Rolesヘッダから取得
   */
  @Patch(':id/roles')
  async updateRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRolesDto,
    @CurrentUserId() userId: number | undefined,
    @CurrentUserRoles() roles: string[],
  ): Promise<UserResponse> {
    if (userId === undefined) {
      throw new UnauthorizedException('X-User-Id header is required');
    }

    return this.userService.updateRoles(id, dto, userId, roles);
  }

  /**
   * ステータス更新
   *
   * PATCH /users/:id/status
   *
   * ADMIN専用。アカウントの有効/無効を切り替える。
   * 無効化時は該当ユーザーの全リフレッシュトークンを失効させる。
   *
   * @param id ユーザーID
   * @param dto ステータス更新データ
   * @param userId X-User-Idヘッダから取得
   * @param roles X-User-Rolesヘッダから取得
   */
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
    @CurrentUserId() userId: number | undefined,
    @CurrentUserRoles() roles: string[],
  ): Promise<UserResponse> {
    if (userId === undefined) {
      throw new UnauthorizedException('X-User-Id header is required');
    }

    return this.userService.updateStatus(id, dto, userId, roles);
  }
}
