/**
 * プロフィール更新DTO
 *
 * PATCH /api/users/:id/profile のリクエストボディ
 */
import { IsOptional, IsString, MaxLength, IsUrl } from 'class-validator';

export class UpdateProfileDto {
  /**
   * 表示名
   */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  /**
   * アバターURL
   */
  @IsOptional()
  @IsUrl({}, { message: 'avatarUrl must be a valid URL' })
  avatarUrl?: string;

  /**
   * 自己紹介
   */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}
