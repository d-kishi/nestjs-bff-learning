# user-service エンティティ詳細設計

## 概要

user-serviceは3つのエンティティで構成される。認証・認可の基盤を提供する。

```
User ─1:1─ UserProfile
  │
  └─ N:M ─ Role（中間テーブル: user_roles）
```

## スキーマ情報

- **スキーマ名**: USER_DB
- **テストスキーマ**: USER_DB_TEST
- **synchronize**: true（開発時）

---

## 1. User エンティティ

認証情報を管理するコアエンティティ。JWT発行の主体。

### テーブル定義

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | NUMBER | PK, AUTO_INCREMENT | ユーザーID |
| email | VARCHAR2(255) | NOT NULL, UNIQUE | メールアドレス（ログインID） |
| password | VARCHAR2(255) | NOT NULL | ハッシュ化されたパスワード |
| is_active | NUMBER(1) | NOT NULL, DEFAULT 1 | アカウント有効フラグ |
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
  OneToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { Role } from './role.entity';

/**
 * ユーザーエンティティ
 *
 * 認証情報を管理するコアエンティティ。
 * パスワードはbcryptでハッシュ化して保存。
 * JWTのsubjectクレームにはこのエンティティのidを使用。
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * メールアドレス（ログインID）
   * UNIQUE制約により重複登録を防止
   */
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  /**
   * ハッシュ化されたパスワード
   * bcryptでハッシュ化（salt rounds: 10）
   * 平文パスワードは絶対に保存しない
   */
  @Column({ type: 'varchar', length: 255 })
  password: string;

  /**
   * アカウント有効フラグ
   * false: ログイン不可、トークン発行不可
   * 管理者によるアカウント停止に使用
   */
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * ユーザープロフィール（1対1）
   * カスケード作成：User作成時にProfileも同時作成可能
   */
  @OneToOne(() => UserProfile, (profile) => profile.user, { cascade: true })
  profile: UserProfile;

  /**
   * ユーザーに割り当てられたロール一覧
   * 多対多リレーション（中間テーブル: user_roles）
   */
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];
}
```

### 設計判断

- **emailをログインIDに使用**: 一般的なWebサービスの慣例に従う。別途usernameを設ける設計も可能だが、学習用のためシンプルに。
- **passwordのハッシュ化**: bcryptを使用（salt rounds: 10）。Argon2も選択肢だが、NestJSエコシステムでの実績からbcryptを採用。
- **isActiveフラグ**: 論理削除ではなく、アカウント停止用フラグとして使用。削除が必要な場合は物理削除。

---

## 2. UserProfile エンティティ

ユーザーの詳細プロフィール情報を管理するエンティティ。

### テーブル定義

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | NUMBER | PK, AUTO_INCREMENT | プロフィールID |
| user_id | NUMBER | FK, NOT NULL, UNIQUE | ユーザーID |
| first_name | VARCHAR2(100) | NULL | 名 |
| last_name | VARCHAR2(100) | NULL | 姓 |
| display_name | VARCHAR2(100) | NOT NULL | 表示名 |
| avatar_url | VARCHAR2(500) | NULL | アバター画像URL |
| bio | VARCHAR2(1000) | NULL | 自己紹介文 |
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
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

/**
 * ユーザープロフィールエンティティ
 *
 * 認証に不要な詳細情報を分離して管理。
 * User:UserProfile = 1:1 の関係。
 */
@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 名（ファーストネーム）
   * 任意項目。表示名とは別に正式名を保持
   */
  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName: string | null;

  /**
   * 姓（ラストネーム）
   * 任意項目
   */
  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName: string | null;

  /**
   * 表示名
   * UIで表示される名前。必須項目。
   * 初期値はメールアドレスのローカルパート
   */
  @Column({ name: 'display_name', type: 'varchar', length: 100 })
  displayName: string;

  /**
   * アバター画像URL
   * 外部ストレージ（S3等）へのURL
   * 本プロジェクトでは学習用のためURL文字列のみ保持
   */
  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  /**
   * 自己紹介文
   */
  @Column({ type: 'varchar', length: 1000, nullable: true })
  bio: string | null;

  /**
   * 関連するユーザー（1対1、オーナー側）
   * JoinColumnを持つ側がオーナー
   */
  @OneToOne(() => User, (user) => user.profile, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### 設計判断

- **UserとUserProfileを分離した理由**:
  1. 認証処理時に不要なデータをロードしない（パフォーマンス）
  2. プロフィール更新の頻度と認証情報更新の頻度が異なる
  3. 1対1リレーションの学習要素として
- **displayNameを必須に**: ログイン直後からUIで表示できるよう、初期値はメールのローカルパートで設定
- **avatarUrlは外部URL**: 画像ファイルのアップロード機能はスコープ外。URLのみ保持。

---

## 3. Role エンティティ

ユーザーに割り当てる権限（ロール）を管理するエンティティ。

### テーブル定義

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | NUMBER | PK, AUTO_INCREMENT | ロールID |
| name | VARCHAR2(50) | NOT NULL, UNIQUE | ロール名 |
| description | VARCHAR2(500) | NULL | ロールの説明 |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |

### ロール定義

| ロール名 | 説明 |
|---------|------|
| ADMIN | 管理者。全操作可能、他ユーザーのリソースも参照・編集可 |
| MEMBER | 一般ユーザー。自分のリソースのみCRUD可能 |

### TypeORM Entity定義

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { User } from './user.entity';

/**
 * ロールエンティティ
 *
 * RBAC（Role-Based Access Control）のためのロール定義。
 * 初期データとしてADMIN, MEMBERを投入。
 */
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * ロール名
   * UNIQUE制約により重複防止
   * 慣例として大文字スネークケース（ADMIN, MEMBER）
   */
  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  /**
   * ロールの説明
   * 管理画面での表示用
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * このロールを持つユーザー一覧
   * User側でJoinTableを定義しているため、ここでは定義不要
   */
  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
```

### 設計判断

- **RBACを採用した理由**: シンプルで学習に適している。ABACやPBACは複雑。
- **ロールはマスタデータ**: アプリケーション起動時のシードデータとして投入。
- **updatedAtなし**: ロールは作成後に更新されることがほぼないため省略。

---

## 4. user_roles 中間テーブル

User-Role の多対多リレーションを管理する中間テーブル。
TypeORMの `@JoinTable` デコレータにより自動生成される。

### テーブル定義

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| user_id | NUMBER | FK, PK | ユーザーID |
| role_id | NUMBER | FK, PK | ロールID |

### 設計判断

- **複合主キー**: (user_id, role_id) の組み合わせを主キーとする
- **TypeORMで自動生成**: エンティティクラスは不要

---

## リレーション図

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id              │
│ email           │  UNIQUE
│ password        │  bcrypt hashed
│ is_active       │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    │ 1:1     │ N:M
    │         │
┌───▼───┐ ┌───▼─────────────┐
│User   │ │   user_roles    │
│Profile│ ├─────────────────┤
├───────┤ │ user_id (PK,FK) │
│ id    │ │ role_id (PK,FK) │
│ user_id│ └───────┬─────────┘
│ first_ │         │
│ name   │         │ N:M
│ last_  │         │
│ name   │ ┌───────▼─────────┐
│display_│ │      Role       │
│ name   │ ├─────────────────┤
│avatar_ │ │ id              │
│ url    │ │ name     UNIQUE │
│ bio    │ │ description     │
│created │ │ created_at      │
│updated │ └─────────────────┘
└────────┘
```

---

## インデックス設計

### 推奨インデックス

| テーブル | カラム | 種類 | 理由 |
|---------|--------|------|------|
| users | email | UNIQUE INDEX | ログイン時の検索（自動生成） |
| user_profiles | user_id | UNIQUE INDEX | 1:1リレーションのFK（自動生成） |
| roles | name | UNIQUE INDEX | ロール名検索（自動生成） |
| user_roles | (user_id, role_id) | PRIMARY KEY | 複合キー（自動生成） |

### TypeORMでのインデックス定義

基本的なインデックスはUNIQUE制約により自動生成されるため、追加のインデックス定義は不要。

---

## 初期データ（シード）

### roles テーブル

```sql
-- ロールの初期データ
INSERT INTO roles (name, description, created_at)
VALUES ('ADMIN', '管理者。全操作可能。', CURRENT_TIMESTAMP);

INSERT INTO roles (name, description, created_at)
VALUES ('MEMBER', '一般ユーザー。自分のリソースのみ操作可能。', CURRENT_TIMESTAMP);
```

### NestJSでのシード実装

```typescript
/**
 * アプリケーション起動時にロールを初期化
 * 既存データがある場合はスキップ（upsert）
 */
@Injectable()
export class RoleSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    const roles = [
      { name: 'ADMIN', description: '管理者。全操作可能。' },
      { name: 'MEMBER', description: '一般ユーザー。自分のリソースのみ操作可能。' },
    ];

    for (const role of roles) {
      const exists = await this.roleRepository.findOne({
        where: { name: role.name },
      });
      if (!exists) {
        await this.roleRepository.save(role);
      }
    }
  }
}
```

---

## JWT設計

### JWTペイロード

```typescript
interface JwtPayload {
  sub: number;        // User.id
  email: string;      // User.email
  roles: string[];    // Role.name の配列（例: ['ADMIN', 'MEMBER']）
  iat: number;        // issued at
  exp: number;        // expiration
}
```

### トークン種類

| トークン | 有効期限 | 用途 |
|---------|---------|------|
| Access Token | 15分 | API認証 |
| Refresh Token | 7日 | Access Token再発行 |

### Refresh Token保存方式

| 方式 | 採用 | 理由 |
|------|------|------|
| DBに保存 | ○ | トークン無効化（ログアウト、セキュリティ対応）が可能 |
| 保存しない | - | 無効化不可のため非推奨 |

```typescript
/**
 * リフレッシュトークンエンティティ（オプション）
 *
 * 本プロジェクトでは学習のため実装するが、
 * 本番環境ではRedis等の外部ストレージ推奨
 */
@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  token: string;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'is_revoked', default: false })
  isRevoked: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

---

## パスワードポリシー

### バリデーションルール

| ルール | 値 | 理由 |
|--------|-----|------|
| 最小文字数 | 8 | セキュリティの基本要件 |
| 最大文字数 | 100 | DoS防止（ハッシュ計算コスト） |
| 必須文字種 | 英字+数字 | 簡易的なセキュリティ要件 |

### バリデーション実装

```typescript
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  /**
   * パスワード
   * - 8〜100文字
   * - 英字と数字を含む
   */
  @IsString()
  @MinLength(8, { message: 'パスワードは8文字以上で入力してください' })
  @MaxLength(100)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/, {
    message: 'パスワードは英字と数字を含める必要があります',
  })
  password: string;
}
```

---

## 備考

### task-serviceとの連携

user-serviceで発行したUser.idは、task-serviceの以下のフィールドから論理参照される：

| task-service フィールド | 参照 |
|------------------------|------|
| Project.ownerId | User.id |
| Task.assigneeId | User.id |
| Comment.authorId | User.id |

サービス間の独立性を保つため、外部キー制約は設定しない。

### Oracle固有の考慮事項

- BOOLEANは NUMBER(1) で代替（0=false, 1=true）
- カラム名は小文字スネークケースを明示
- シーケンスによる自動採番は TypeORM が自動設定
