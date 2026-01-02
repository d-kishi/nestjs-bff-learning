/**
 * リフレッシュトークンエンティティ
 *
 * JWT Refresh Tokenの無効化管理用。
 * DBに保存することでログアウトやセキュリティ対応時にトークンを無効化可能。
 *
 * Why: DBに保存する理由
 * - トークン無効化（ログアウト、セキュリティ対応）が可能
 * - Refresh Token Rotation実装のため
 *
 * Note: 本番環境ではRedis等の外部ストレージを推奨。
 * 学習用のためRDBMSに保存。
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * トークン文字列
   *
   * JWT形式のリフレッシュトークン。
   * 十分な長さを確保（500文字）。
   */
  @Column({ type: 'varchar', length: 500 })
  token: string;

  /**
   * ユーザーID
   *
   * Userエンティティへの論理参照。
   * 外部キー制約は設定しない（柔軟性のため）。
   */
  @Column({ name: 'user_id' })
  userId: number;

  /**
   * 有効期限
   *
   * この日時を過ぎたトークンは無効。
   * デフォルトは発行から7日後。
   */
  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  /**
   * 無効化フラグ
   *
   * true: ログアウト済み、または強制無効化済み。
   * Refresh Token Rotationで新トークン発行時にも旧トークンを無効化。
   */
  @Column({ name: 'is_revoked', type: 'boolean', default: false })
  isRevoked: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
