/**
 * ユーザーエンティティ
 *
 * 認証情報を管理するコアエンティティ。
 * パスワードはbcryptでハッシュ化して保存。
 * JWTのsubjectクレームにはこのエンティティのidを使用。
 *
 * Why: emailをログインIDに使用するのは一般的なWebサービスの慣例に従うため。
 * 別途usernameを設ける設計も可能だが、学習用のためシンプルに。
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { Role } from '../../role/entities/role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * メールアドレス（ログインID）
   *
   * UNIQUE制約により重複登録を防止。
   * ログイン時の検索に使用されるため、インデックスが自動生成される。
   */
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  /**
   * ハッシュ化されたパスワード
   *
   * bcryptでハッシュ化（salt rounds: 10）。
   * 平文パスワードは絶対に保存しない。
   * APIレスポンスでは常に除外すること。
   */
  @Column({ type: 'varchar', length: 255 })
  password: string;

  /**
   * アカウント有効フラグ
   *
   * false: ログイン不可、トークン発行不可。
   * 管理者によるアカウント停止に使用。
   * 論理削除ではなく、停止機能として使用。
   */
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * ユーザープロフィール（1対1）
   *
   * Why: UserとUserProfileを分離した理由
   * 1. 認証処理時に不要なデータをロードしない（パフォーマンス）
   * 2. プロフィール更新と認証情報更新の頻度が異なる
   * 3. 1対1リレーションの学習要素として
   *
   * cascade: true でUser作成時にProfileも同時作成可能
   */
  @OneToOne(() => UserProfile, (profile) => profile.user, { cascade: true })
  profile: UserProfile;

  /**
   * ユーザーに割り当てられたロール一覧
   *
   * 多対多リレーション。中間テーブル: user_roles。
   * JoinTableをUser側で定義（オーナー側）。
   */
  @ManyToMany(() => Role, (role) => role.users, { eager: false })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];
}
