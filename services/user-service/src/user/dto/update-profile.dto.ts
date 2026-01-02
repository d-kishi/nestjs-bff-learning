/**
 * プロフィール更新DTO
 *
 * US010: プロフィール更新のバリデーションルールを定義。
 */
import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsUrl,
} from 'class-validator';

export class UpdateProfileDto {
  /**
   * 表示名
   * 1〜100文字
   */
  @IsOptional()
  @IsString()
  @MinLength(1, { message: '表示名は1文字以上で入力してください' })
  @MaxLength(100)
  displayName?: string;

  /**
   * 名
   * 最大100文字
   */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  /**
   * 姓
   * 最大100文字
   */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  /**
   * アバターURL
   * 有効なURL形式
   */
  @IsOptional()
  @IsUrl({}, { message: '有効なURLを入力してください' })
  avatarUrl?: string;

  /**
   * 自己紹介
   * 最大1000文字
   */
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;
}
