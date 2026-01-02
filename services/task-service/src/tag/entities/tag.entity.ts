/**
 * Tag エンティティ
 *
 * タスクに付与できるラベル（タグ）を表す。
 * 複数のタスクに同じタグを付与可能（M:N）。
 *
 * リレーション:
 * - Task (M:N) - task_tags中間テーブルで関連付け
 *
 * 制約:
 * - name: UNIQUE（同名タグ禁止）
 * - color: HEXカラー形式（#RRGGBB）、任意
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Task } from '../../task/entities/task.entity';

@Entity('tags')
export class Tag {
  /**
   * タグID（自動生成）
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * タグ名
   * - 必須、1-50文字、ユニーク
   */
  @Column({ type: 'varchar2', length: 50, unique: true })
  name: string;

  /**
   * タグ色（HEXカラー）
   * - 任意、#RRGGBB形式
   */
  @Column({ type: 'varchar2', length: 7, nullable: true })
  color: string | null;

  /**
   * 作成日時
   *
   * Why: タグは作成後に更新されることが少ないため、updatedAtは持たない
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * 関連タスク（M:N）
   *
   * Why: Task側で@JoinTableを定義しているため、こちらは逆方向のみ
   */
  @ManyToMany(() => Task, (task) => task.tags)
  tasks: Task[];
}
