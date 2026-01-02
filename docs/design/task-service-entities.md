# task-service エンティティ詳細設計

## 概要

task-serviceは4つのエンティティで構成される。

```
Project ─1:N─ Task ─1:N─ Comment
              │
              └─ N:M ─ Tag（中間テーブル: task_tags）
```

## スキーマ情報

- **スキーマ名**: TASK_DB
- **テストスキーマ**: TASK_DB_TEST
- **synchronize**: true（開発時）

---

## 1. Project エンティティ

タスクをグルーピングするためのエンティティ。

### テーブル定義

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | NUMBER | PK, AUTO_INCREMENT | プロジェクトID |
| name | VARCHAR2(100) | NOT NULL | プロジェクト名 |
| description | VARCHAR2(1000) | NULL | プロジェクト説明 |
| owner_id | NUMBER | NOT NULL | 所有者のユーザーID（user-service参照） |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 更新日時 |

### TypeORM Entity定義

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Task } from './task.entity';

/**
 * プロジェクトエンティティ
 *
 * タスクをグルーピングするための親エンティティ。
 * owner_idはuser-serviceのUser.idを参照するが、
 * サービス間の独立性を保つため外部キー制約は設定しない。
 */
@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description: string | null;

  /**
   * プロジェクト所有者のユーザーID
   * user-serviceのUser.idを参照（論理参照、外部キーなし）
   */
  @Column({ name: 'owner_id', type: 'number' })
  ownerId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * プロジェクトに属するタスク一覧
   * カスケード削除：プロジェクト削除時にタスクも削除
   */
  @OneToMany(() => Task, (task) => task.project, { cascade: true })
  tasks: Task[];
}
```

### 設計判断

- **owner_idに外部キー制約を設定しない理由**: マイクロサービス間の独立性を保つため。user-serviceのUserテーブルへの参照は論理的なもので、物理的な外部キーは設定しない。
- **カスケード削除**: プロジェクト削除時に配下のタスクも削除される（学習用のためシンプルな設計）。

---

## 2. Task エンティティ

task-serviceの主エンティティ。プロジェクトに属し、コメントとタグを持つ。

### テーブル定義

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | NUMBER | PK, AUTO_INCREMENT | タスクID |
| title | VARCHAR2(200) | NOT NULL | タスクタイトル |
| description | VARCHAR2(2000) | NULL | タスク説明 |
| status | VARCHAR2(20) | NOT NULL, DEFAULT 'TODO' | ステータス |
| priority | VARCHAR2(10) | NOT NULL, DEFAULT 'MEDIUM' | 優先度 |
| due_date | TIMESTAMP | NULL | 期限日 |
| project_id | NUMBER | FK, NOT NULL | 所属プロジェクトID |
| assignee_id | NUMBER | NULL | 担当者のユーザーID（user-service参照） |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL | 更新日時 |

### ステータス・優先度の定義

```typescript
/**
 * タスクステータス
 */
export enum TaskStatus {
  TODO = 'TODO',           // 未着手
  IN_PROGRESS = 'IN_PROGRESS', // 進行中
  DONE = 'DONE',           // 完了
}

/**
 * タスク優先度
 */
export enum TaskPriority {
  LOW = 'LOW',       // 低
  MEDIUM = 'MEDIUM', // 中
  HIGH = 'HIGH',     // 高
}
```

### TypeORM Entity定義

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { Comment } from './comment.entity';
import { Tag } from './tag.entity';
import { TaskStatus, TaskPriority } from './task.enums';

/**
 * タスクエンティティ
 *
 * task-serviceの主エンティティ。
 * Project配下に属し、Comment・Tagと関連を持つ。
 */
@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  description: string | null;

  /**
   * タスクステータス
   * Oracle DBでは文字列として保存（ENUMカラム非対応のため）
   */
  @Column({
    type: 'varchar',
    length: 20,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  /**
   * タスク優先度
   */
  @Column({
    type: 'varchar',
    length: 10,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Column({ name: 'due_date', type: 'timestamp', nullable: true })
  dueDate: Date | null;

  /**
   * 所属プロジェクト（必須）
   */
  @ManyToOne(() => Project, (project) => project.tasks, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'project_id' })
  projectId: number;

  /**
   * 担当者のユーザーID
   * user-serviceのUser.idを参照（論理参照、外部キーなし）
   */
  @Column({ name: 'assignee_id', type: 'number', nullable: true })
  assigneeId: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * タスクに紐づくコメント一覧
   * カスケード削除：タスク削除時にコメントも削除
   */
  @OneToMany(() => Comment, (comment) => comment.task, { cascade: true })
  comments: Comment[];

  /**
   * タスクに紐づくタグ一覧
   * 多対多リレーション（中間テーブル: task_tags）
   */
  @ManyToMany(() => Tag, (tag) => tag.tasks)
  @JoinTable({
    name: 'task_tags',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];
}
```

### 設計判断

- **OracleでのENUM**: OracleはMySQL/PostgreSQLのようなENUM型をサポートしないため、VARCHAR + TypeScript enumで対応。
- **assignee_idに外部キー制約なし**: owner_idと同様、サービス間の独立性を保つ。
- **JoinTableの明示的定義**: 中間テーブル名・カラム名を明示してOracleの命名規則に対応。

---

## 3. Comment エンティティ

タスクへのコメントを管理するエンティティ。

### テーブル定義

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | NUMBER | PK, AUTO_INCREMENT | コメントID |
| content | VARCHAR2(2000) | NOT NULL | コメント内容 |
| task_id | NUMBER | FK, NOT NULL | 所属タスクID |
| author_id | NUMBER | NOT NULL | 投稿者のユーザーID（user-service参照） |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL | 更新日時 |

### TypeORM Entity定義

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from './task.entity';

/**
 * コメントエンティティ
 *
 * タスクに対するコメントを管理。
 * 投稿者情報はuser-serviceのUser.idを論理参照。
 */
@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 2000 })
  content: string;

  /**
   * 所属タスク（必須）
   */
  @ManyToOne(() => Task, (task) => task.comments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ name: 'task_id' })
  taskId: number;

  /**
   * コメント投稿者のユーザーID
   * user-serviceのUser.idを参照（論理参照、外部キーなし）
   */
  @Column({ name: 'author_id', type: 'number' })
  authorId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

---

## 4. Tag エンティティ

タスクに付与するラベル（タグ）を管理するエンティティ。

### テーブル定義

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | NUMBER | PK, AUTO_INCREMENT | タグID |
| name | VARCHAR2(50) | NOT NULL, UNIQUE | タグ名 |
| color | VARCHAR2(7) | NULL | タグの色（HEXカラー例: #FF5733） |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |

### TypeORM Entity定義

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Task } from './task.entity';

/**
 * タグエンティティ
 *
 * タスクに付与するラベル。
 * 複数のタスクで共有される（多対多リレーション）。
 */
@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  /**
   * タグの表示色（HEXカラー）
   * 例: #FF5733
   */
  @Column({ type: 'varchar', length: 7, nullable: true })
  color: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * このタグが付与されているタスク一覧
   * Task側でJoinTableを定義しているため、ここでは定義不要
   */
  @ManyToMany(() => Task, (task) => task.tags)
  tasks: Task[];
}
```

### 設計判断

- **nameにUNIQUE制約**: 同名のタグが重複して作成されることを防ぐ。
- **updatedAtなし**: タグは作成後に更新されることが少ないため省略。

---

## 5. task_tags 中間テーブル

Task-Tag の多対多リレーションを管理する中間テーブル。
TypeORMの `@JoinTable` デコレータにより自動生成される。

### テーブル定義

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| task_id | NUMBER | FK, PK | タスクID |
| tag_id | NUMBER | FK, PK | タグID |

### 設計判断

- **複合主キー**: (task_id, tag_id) の組み合わせを主キーとする。
- **TypeORMで自動生成**: エンティティクラスは不要。

---

## リレーション図

```
┌─────────────┐
│   Project   │
├─────────────┤
│ id          │
│ name        │
│ description │
│ owner_id    │◇──────────────────────────────────┐
│ created_at  │                                    │
│ updated_at  │                                    │
└──────┬──────┘                                    │
       │ 1:N                                       │
       │                                           │
┌──────▼──────┐          ┌─────────────┐           │
│    Task     │          │     Tag     │           │
├─────────────┤          ├─────────────┤           │
│ id          │          │ id          │           │
│ title       │   N:M    │ name        │           │
│ description │◆────────◆│ color       │           │
│ status      │          │ created_at  │           │
│ priority    │          └─────────────┘           │
│ due_date    │                                    │
│ project_id  │──────────────────────────────────┘ │
│ assignee_id │◇─────────────────────────────────┐ │
│ created_at  │                                  │ │
│ updated_at  │                                  │ │
└──────┬──────┘                                  │ │
       │ 1:N                                     │ │
       │                                         │ │
┌──────▼──────┐                                  │ │
│   Comment   │                                  │ │
├─────────────┤                                  │ │
│ id          │                                  │ │
│ content     │                                  │ │
│ task_id     │                                  │ │
│ author_id   │◇─────────────────────────────────┼─┘
│ created_at  │                                  │
│ updated_at  │                                  │
└─────────────┘                                  │
                                                 │
                      ┌──────────────────────────┘
                      │
                      ▼
              ┌─────────────────┐
              │  user-service   │
              │  (外部参照)      │
              │  User.id        │
              └─────────────────┘

◆──◆ : 多対多（中間テーブル task_tags）
◇─── : 論理参照（外部キー制約なし）
```

---

## インデックス設計

### 推奨インデックス

| テーブル | カラム | 種類 | 理由 |
|---------|--------|------|------|
| tasks | project_id | INDEX | プロジェクト別タスク検索 |
| tasks | status | INDEX | ステータス別検索 |
| tasks | assignee_id | INDEX | 担当者別検索 |
| comments | task_id | INDEX | タスク別コメント検索 |
| tags | name | UNIQUE INDEX | タグ名重複防止（自動生成） |

### TypeORMでのインデックス定義

```typescript
// Task エンティティに追加
@Entity('tasks')
@Index('idx_tasks_project_id', ['projectId'])
@Index('idx_tasks_status', ['status'])
@Index('idx_tasks_assignee_id', ['assigneeId'])
export class Task {
  // ...
}
```

---

## 備考

### サービス間参照について

owner_id, assignee_id, author_id は user-service の User.id を参照するが、以下の理由で外部キー制約は設定しない：

1. **サービス独立性**: task-serviceは user-service のDBに依存しない
2. **参照整合性**: API呼び出し時に user-service で存在確認を行う（BFF層で実施）
3. **削除時の挙動**: ユーザー削除時にタスク・コメントをどうするかは業務要件次第（本プロジェクトでは学習用のため考慮外）

### Oracle固有の考慮事項

- ENUMは文字列カラムで代替
- カラム名は小文字スネークケースを明示（`@Column({ name: 'xxx' })`）
- シーケンスによる自動採番は TypeORM が自動設定
