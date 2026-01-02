# api-gateway（BFF）型定義設計

## 概要

api-gateway（BFF層）で使用するDTO、内部型、レスポンス型の定義。BFFは下流サービス（task-service, user-service）と独立してDTOを定義し、サービス間の疎結合を維持する。

## 設計方針

- **DTO再定義**: BFFで独自にDTOを定義（共通パッケージは使用しない）
- **バリデーション**: class-validatorで入力検証
- **型安全性**: TypeScriptの型システムを活用

---

## 内部型定義

### JWTペイロード

```typescript
/**
 * JWTペイロード構造
 * user-serviceで発行されるJWTの内容
 */
interface JwtPayload {
  sub: number;      // ユーザーID
  email: string;    // メールアドレス
  roles: string[];  // ロール配列（例: ["MEMBER", "ADMIN"]）
  iat: number;      // 発行時刻（Unix timestamp）
  exp: number;      // 有効期限（Unix timestamp）
}
```

### 認証済みユーザー

```typescript
/**
 * JWT検証後に利用可能なユーザー情報
 * @CurrentUser() デコレータで取得
 */
interface UserFromJwt {
  id: number;
  email: string;
  roles: string[];
}
```

---

## Auth DTO

### RegisterDto（ユーザー登録）

```typescript
import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

/**
 * ユーザー登録DTO
 */
export class RegisterDto {
  /**
   * メールアドレス
   * - 有効なメールアドレス形式
   */
  @IsEmail({}, { message: '有効なメールアドレスを入力してください' })
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

  /**
   * 表示名（任意）
   * - 省略時はメールのローカルパートが設定される
   */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;
}
```

### LoginDto（ログイン）

```typescript
import { IsEmail, IsString } from 'class-validator';

/**
 * ログインDTO
 */
export class LoginDto {
  @IsEmail({}, { message: '有効なメールアドレスを入力してください' })
  email: string;

  @IsString()
  password: string;
}
```

### RefreshTokenDto（トークンリフレッシュ）

```typescript
import { IsString, IsNotEmpty } from 'class-validator';

/**
 * トークンリフレッシュDTO
 */
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'refreshTokenは必須です' })
  refreshToken: string;
}
```

### LogoutDto（ログアウト）

```typescript
import { IsString, IsNotEmpty } from 'class-validator';

/**
 * ログアウトDTO
 */
export class LogoutDto {
  @IsString()
  @IsNotEmpty({ message: 'refreshTokenは必須です' })
  refreshToken: string;
}
```

---

## Project DTO

### CreateProjectDto（プロジェクト作成）

```typescript
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

/**
 * プロジェクト作成DTO
 */
export class CreateProjectDto {
  /**
   * プロジェクト名
   * - 1〜100文字
   */
  @IsString()
  @MinLength(1, { message: 'プロジェクト名は必須です' })
  @MaxLength(100)
  name: string;

  /**
   * 説明（任意）
   * - 最大1000文字
   */
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
```

### UpdateProjectDto（プロジェクト更新）

```typescript
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

/**
 * プロジェクト更新DTO
 */
export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
```

### ProjectQueryDto（プロジェクト検索）

```typescript
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * プロジェクト検索DTO
 */
export class ProjectQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ownerId?: number;
}
```

---

## Task DTO

### CreateTaskDto（タスク作成）

```typescript
import {
  IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsArray,
  MinLength, MaxLength
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * タスクステータス
 */
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

/**
 * タスク優先度
 */
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

/**
 * タスク作成DTO
 */
export class CreateTaskDto {
  /**
   * 所属プロジェクトID
   */
  @Type(() => Number)
  @IsNumber()
  projectId: number;

  /**
   * タスクタイトル
   * - 1〜200文字
   */
  @IsString()
  @MinLength(1, { message: 'タイトルは必須です' })
  @MaxLength(200)
  title: string;

  /**
   * 説明（任意）
   */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  /**
   * ステータス（任意、デフォルト: TODO）
   */
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus = TaskStatus.TODO;

  /**
   * 優先度（任意、デフォルト: MEDIUM）
   */
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority = TaskPriority.MEDIUM;

  /**
   * 期限（任意）
   */
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  /**
   * 担当者ID（任意）
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  assigneeId?: number;

  /**
   * タグID配列（任意）
   */
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  tagIds?: number[];
}
```

### UpdateTaskDto（タスク更新）

```typescript
import {
  IsString, IsOptional, IsNumber, IsEnum, IsDateString,
  MinLength, MaxLength
} from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus, TaskPriority } from './create-task.dto';

/**
 * タスク更新DTO
 */
export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  assigneeId?: number;
}
```

### TaskQueryDto（タスク検索）

```typescript
import { IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus, TaskPriority } from './create-task.dto';

/**
 * タスク検索DTO
 */
export class TaskQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  projectId?: number;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  assigneeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tagId?: number;
}
```

---

## Comment DTO

### CreateCommentDto（コメント作成）

```typescript
import { IsString, MinLength, MaxLength } from 'class-validator';

/**
 * コメント作成DTO
 */
export class CreateCommentDto {
  /**
   * コメント本文
   * - 1〜2000文字
   */
  @IsString()
  @MinLength(1, { message: 'コメントは必須です' })
  @MaxLength(2000)
  content: string;
}
```

### UpdateCommentDto（コメント更新）

```typescript
import { IsString, MinLength, MaxLength } from 'class-validator';

/**
 * コメント更新DTO
 */
export class UpdateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}
```

---

## Tag DTO

### CreateTagDto（タグ作成）

```typescript
import { IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

/**
 * タグ作成DTO
 */
export class CreateTagDto {
  /**
   * タグ名
   * - 1〜50文字
   * - ユニーク制約あり
   */
  @IsString()
  @MinLength(1, { message: 'タグ名は必須です' })
  @MaxLength(50)
  name: string;

  /**
   * 色（任意）
   * - HEXカラー形式（#RRGGBB）
   */
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: '色は#RRGGBB形式で入力してください' })
  color?: string;
}
```

### UpdateTagDto（タグ更新）

```typescript
import { IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

/**
 * タグ更新DTO
 */
export class UpdateTagDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: '色は#RRGGBB形式で入力してください' })
  color?: string;
}
```

### TagQueryDto（タグ検索）

```typescript
import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * タグ検索DTO
 */
export class TagQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;
}
```

---

## User DTO

### UserQueryDto（ユーザー検索）

```typescript
import { IsOptional, IsNumber, IsString, IsBoolean, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * ユーザー検索DTO
 */
export class UserQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  roleId?: number;
}
```

### UpdateProfileDto（プロフィール更新）

```typescript
import { IsString, IsOptional, IsUrl, MinLength, MaxLength } from 'class-validator';

/**
 * プロフィール更新DTO
 */
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsUrl({}, { message: '有効なURLを入力してください' })
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;
}
```

### ChangePasswordDto（パスワード変更）

```typescript
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

/**
 * パスワード変更DTO
 */
export class ChangePasswordDto {
  /**
   * 現在のパスワード
   */
  @IsString()
  currentPassword: string;

  /**
   * 新しいパスワード
   * - 8〜100文字
   * - 英字と数字を含む
   */
  @IsString()
  @MinLength(8, { message: '新しいパスワードは8文字以上で入力してください' })
  @MaxLength(100)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/, {
    message: '新しいパスワードは英字と数字を含める必要があります',
  })
  newPassword: string;
}
```

### UpdateRolesDto（ロール更新）

```typescript
import { IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * ロール更新DTO
 * ロールは「追加」ではなく「置換」方式
 */
export class UpdateRolesDto {
  /**
   * 設定するロールIDの配列
   * - 空配列で全ロール削除
   */
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  roleIds: number[];
}
```

### UpdateStatusDto（ステータス更新）

```typescript
import { IsBoolean } from 'class-validator';

/**
 * アカウントステータス更新DTO
 */
export class UpdateStatusDto {
  /**
   * アカウント有効/無効
   */
  @IsBoolean()
  isActive: boolean;
}
```

---

## Role DTO

### CreateRoleDto（ロール作成）

```typescript
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

/**
 * ロール作成DTO
 */
export class CreateRoleDto {
  /**
   * ロール名
   * - 1〜50文字
   * - ユニーク制約あり
   */
  @IsString()
  @MinLength(1, { message: 'ロール名は必須です' })
  @MaxLength(50)
  name: string;

  /**
   * 説明（任意）
   */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
```

### UpdateRoleDto（ロール更新）

```typescript
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

/**
 * ロール更新DTO
 */
export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
```

---

## Dashboard レスポンス型

### DashboardResponse

```typescript
/**
 * ダッシュボードレスポンス
 */
export interface DashboardResponse {
  user: UserSummary | null;
  taskSummary: TaskSummary;
  projectSummary: ProjectSummary;
  recentTasks: RecentTask[];
  _errors?: string[];
}

/**
 * ユーザーサマリー
 */
export interface UserSummary {
  id: number;
  email: string;
  profile: {
    displayName: string;
    avatarUrl: string | null;
  };
}

/**
 * タスクサマリー
 */
export interface TaskSummary {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
}

/**
 * プロジェクトサマリー
 */
export interface ProjectSummary {
  total: number;
  owned: number;
}

/**
 * 直近タスク
 */
export interface RecentTask {
  id: number;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  projectId: number;
  projectName: string;
}
```

---

## 共通DTO

### PaginationQueryDto（ページネーション）

```typescript
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * ページネーション共通DTO
 */
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
```

---

## ディレクトリ構成

```
services/api-gateway/src/
├── auth/
│   └── dto/
│       ├── register.dto.ts
│       ├── login.dto.ts
│       ├── refresh-token.dto.ts
│       ├── logout.dto.ts
│       └── index.ts
├── projects/
│   └── dto/
│       ├── create-project.dto.ts
│       ├── update-project.dto.ts
│       ├── project-query.dto.ts
│       └── index.ts
├── tasks/
│   └── dto/
│       ├── create-task.dto.ts
│       ├── update-task.dto.ts
│       ├── task-query.dto.ts
│       └── index.ts
├── comments/
│   └── dto/
│       ├── create-comment.dto.ts
│       ├── update-comment.dto.ts
│       └── index.ts
├── tags/
│   └── dto/
│       ├── create-tag.dto.ts
│       ├── update-tag.dto.ts
│       ├── tag-query.dto.ts
│       └── index.ts
├── users/
│   └── dto/
│       ├── user-query.dto.ts
│       ├── update-profile.dto.ts
│       ├── change-password.dto.ts
│       ├── update-roles.dto.ts
│       ├── update-status.dto.ts
│       └── index.ts
├── roles/
│   └── dto/
│       ├── create-role.dto.ts
│       ├── update-role.dto.ts
│       └── index.ts
├── dashboard/
│   └── dto/
│       ├── dashboard-response.dto.ts
│       └── index.ts
└── common/
    ├── dto/
    │   ├── api-response.dto.ts    # 既存
    │   ├── pagination.dto.ts
    │   └── index.ts
    └── types/
        ├── jwt-payload.interface.ts
        ├── user-from-jwt.interface.ts
        └── index.ts
```

---

## 関連ドキュメント

- [api-gateway API設計](./api-gateway-api.md)
- [task-service エンティティ設計](./task-service-entities.md)
- [user-service エンティティ設計](./user-service-entities.md)
