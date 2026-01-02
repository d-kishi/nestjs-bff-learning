/**
 * Project エンティティ
 *
 * タスクをグルーピングするプロジェクトを表す。
 * 1人のオーナー（owner_id）が管理し、複数のタスクを持つ。
 *
 * Why: owner_idは外部キー制約なし（論理参照）
 * - user-serviceとの独立性を維持
 * - サービス間の結合度を下げる
 * - 存在確認はBFF層で実施
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Task } from '../../task/entities/task.entity';

@Entity('projects')
export class Project {
  /**
   * プロジェクトID（自動生成）
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * プロジェクト名
   * - 必須、1-100文字
   */
  @Column({ name: 'name', type: 'varchar2', length: 100 })
  name: string;

  /**
   * プロジェクト説明
   * - 任意、最大1000文字
   */
  @Column({
    name: 'description',
    type: 'varchar2',
    length: 1000,
    nullable: true,
  })
  description: string | null;

  /**
   * オーナーユーザーID
   * - 必須、user-serviceへの論理参照（外部キー制約なし）
   *
   * Why: BFFから伝播されるX-User-Idを使用して設定
   */
  @Column({ name: 'owner_id', type: 'number' })
  ownerId: number;

  /**
   * 作成日時
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * 更新日時
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * 関連タスク（1:N）
   *
   * Why: cascade: trueでプロジェクト削除時にタスクも削除
   */
  @OneToMany(() => Task, (task) => task.project, { cascade: true })
  tasks: Task[];
}
