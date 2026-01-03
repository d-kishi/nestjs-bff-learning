/**
 * ステータス更新DTO
 *
 * PATCH /api/users/:id/status のリクエストボディ
 */
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateStatusDto {
  /**
   * アクティブ状態
   */
  @IsNotEmpty({ message: 'isActive is required' })
  @IsBoolean()
  isActive: boolean;
}
