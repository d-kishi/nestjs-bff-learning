/**
 * ロールエンティティ
 *
 * RBAC（Role-Based Access Control）のためのロール定義。
 * 初期データとしてADMIN, MEMBERを投入。
 *
 * Why: RBACを採用した理由は、シンプルで学習に適しているため。
 * ABACやPBACは複雑で、学習用プロジェクトには過剰。
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * ロール名
   *
   * UNIQUE制約により重複防止。
   * 慣例として大文字スネークケース（ADMIN, MEMBER）を使用。
   */
  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  /**
   * ロールの説明
   *
   * 管理画面での表示用。任意項目。
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * このロールを持つユーザー一覧
   *
   * User側でJoinTableを定義しているため、ここでは逆参照のみ。
   * 双方向リレーションにより、ロールからユーザーを辿れる。
   */
  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
