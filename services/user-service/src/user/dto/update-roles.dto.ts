/**
 * ロール更新DTO
 *
 * US012: ユーザーのロールを更新するためのDTO。
 * 送信したroleIdsで既存ロールを完全に置き換える。
 */
import { IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRolesDto {
  /**
   * 設定するロールIDの配列
   * 空配列で全ロールを削除
   */
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  roleIds: number[];
}
