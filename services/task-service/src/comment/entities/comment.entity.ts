/**
 * Comment エンティティ
 *
 * タスクに対するコメントを表す。
 * 投稿者（author_id）とタスク（task_id）への参照を持つ。
 *
 * リレーション:
 * - Task (N:1) - 所属タスク（CASCADE削除）
 *
 * Why: author_idは外部キー制約なし（論理参照）
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
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Task } from '../../task/entities/task.entity';

@Entity('comments')
@Index('idx_comments_task_id', ['taskId'])
export class Comment {
  /**
   * コメントID（自動生成）
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * コメント内容
   * - 必須、1-2000文字
   */
  @Column({ type: 'varchar2', length: 2000 })
  content: string;

  /**
   * 所属タスクID
   * - 必須、外部キー
   */
  @Column({ name: 'task_id', type: 'number' })
  taskId: number;

  /**
   * 所属タスク
   *
   * Why: onDelete: 'CASCADE'でタスク削除時にコメントも削除
   */
  @ManyToOne(() => Task, (task) => task.comments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  /**
   * 投稿者ユーザーID
   * - 必須、user-serviceへの論理参照（外部キー制約なし）
   *
   * Why: BFFから伝播されるX-User-Idを使用して設定
   */
  @Column({ name: 'author_id', type: 'number' })
  authorId: number;

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
}
