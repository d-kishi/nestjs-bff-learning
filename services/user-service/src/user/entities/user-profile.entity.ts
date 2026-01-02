/**
 * ユーザープロフィールエンティティ
 *
 * 認証に不要な詳細情報を分離して管理。
 * User:UserProfile = 1:1 の関係。
 *
 * Why: Userと分離した理由
 * 1. 認証処理時に不要なデータをロードしない（パフォーマンス）
 * 2. プロフィール更新の頻度と認証情報更新の頻度が異なる
 * 3. 1対1リレーションの学習要素として
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 名（ファーストネーム）
   *
   * 任意項目。表示名とは別に正式名を保持。
   */
  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName: string | null;

  /**
   * 姓（ラストネーム）
   *
   * 任意項目。
   */
  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName: string | null;

  /**
   * 表示名
   *
   * UIで表示される名前。必須項目。
   * 初期値はメールアドレスのローカルパート（@より前）。
   */
  @Column({ name: 'display_name', type: 'varchar', length: 100 })
  displayName: string;

  /**
   * アバター画像URL
   *
   * 外部ストレージ（S3等）へのURL。
   * 本プロジェクトでは学習用のためURL文字列のみ保持。
   * 画像アップロード機能はスコープ外。
   */
  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  /**
   * 自己紹介文
   *
   * 任意項目。最大1000文字。
   */
  @Column({ type: 'varchar', length: 1000, nullable: true })
  bio: string | null;

  /**
   * 関連するユーザー（1対1、オーナー側）
   *
   * JoinColumnを持つ側がオーナー。
   * onDelete: 'CASCADE' でユーザー削除時にプロフィールも削除。
   */
  @OneToOne(() => User, (user) => user.profile, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * ユーザーID（外部キー）
   *
   * userリレーションとは別にカラムとして公開。
   * クエリでuser_idのみ必要な場合に便利。
   */
  @Column({ name: 'user_id' })
  userId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
