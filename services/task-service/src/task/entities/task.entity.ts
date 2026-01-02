/**
 * Task エンティティ
 *
 * プロジェクト内のタスクを表す。
 * ステータス・優先度・期限・担当者などを持つ。
 *
 * リレーション:
 * - Project (N:1) - 所属プロジェクト
 * - Tag (M:N) - タグ（task_tags中間テーブル）
 * - Comment (1:N) - コメント
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinTable,
  JoinColumn,
  Index,
} from 'typeorm';
import { Project } from '../../project/entities/project.entity';
import { TaskStatus } from './task-status.enum';
import { TaskPriority } from './task-priority.enum';
import { Comment } from '../../comment/entities/comment.entity';
import { Tag } from '../../tag/entities/tag.entity';

@Entity('tasks')
@Index('idx_tasks_project_id', ['projectId'])
@Index('idx_tasks_status', ['status'])
@Index('idx_tasks_assignee_id', ['assigneeId'])
export class Task {
  /**
   * タスクID（自動生成）
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * タスクタイトル
   * - 必須、1-200文字
   */
  @Column({ name: 'title', type: 'varchar2', length: 200 })
  title: string;

  /**
   * タスク説明
   * - 任意、最大2000文字
   */
  @Column({
    name: 'description',
    type: 'varchar2',
    length: 2000,
    nullable: true,
  })
  description: string | null;

  /**
   * ステータス
   * - TODO, IN_PROGRESS, DONE
   * - デフォルト: TODO
   */
  @Column({
    name: 'status',
    type: 'varchar2',
    length: 20,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  /**
   * 優先度
   * - LOW, MEDIUM, HIGH
   * - デフォルト: MEDIUM
   */
  @Column({
    name: 'priority',
    type: 'varchar2',
    length: 10,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  /**
   * 期限日
   * - 任意
   */
  @Column({ name: 'due_date', type: 'timestamp', nullable: true })
  dueDate: Date | null;

  /**
   * 所属プロジェクトID
   * - 必須、外部キー
   */
  @Column({ name: 'project_id', type: 'number' })
  projectId: number;

  /**
   * 所属プロジェクト
   *
   * Why: onDelete: 'CASCADE'でプロジェクト削除時にタスクも削除
   */
  @ManyToOne(() => Project, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  /**
   * 担当者ユーザーID
   * - 任意、user-serviceへの論理参照（外部キー制約なし）
   */
  @Column({ name: 'assignee_id', type: 'number', nullable: true })
  assigneeId: number | null;

  /**
   * 関連タグ（M:N）
   *
   * Why: JoinTableで中間テーブル task_tags を自動生成
   */
  @ManyToMany(() => Tag, (tag) => tag.tasks)
  @JoinTable({
    name: 'task_tags',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];

  /**
   * 関連コメント（1:N）
   *
   * Why: cascade: true でタスク削除時にコメントも削除
   */
  @OneToMany(() => Comment, (comment) => comment.task, { cascade: true })
  comments: Comment[];

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
