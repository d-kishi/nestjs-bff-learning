# task-service API設計

## 概要

task-serviceのREST API設計。各エンティティ（Project, Task, Comment, Tag）に対するCRUD操作を提供する。

## 共通仕様

### ベースURL

```
http://localhost:3001
```

### レスポンス形式

企画書で定義された統一フォーマットを使用。

```typescript
// 成功時（単一リソース）
{
  "data": { ... },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}

// 成功時（一覧）
{
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "timestamp": "2025-01-15T10:30:00Z"
  }
}

// エラー時
{
  "error": {
    "code": "TASK_[ENTITY]_[ERROR_TYPE]",
    "message": "エラーメッセージ"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### 共通ヘッダ

内部通信時にBFFから受け取るヘッダ：

| ヘッダ名 | 必須 | 説明 |
|---------|------|------|
| X-User-Id | Yes | リクエスト元ユーザーのID |
| X-User-Roles | Yes | ユーザーのロール（カンマ区切り） |

### ページネーション

一覧取得APIは以下のクエリパラメータをサポート：

| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| page | number | 1 | ページ番号 |
| limit | number | 20 | 1ページあたりの件数（最大100） |

---

## Project API

### エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| POST | /projects | プロジェクト作成 |
| GET | /projects | プロジェクト一覧取得 |
| GET | /projects/:id | プロジェクト詳細取得 |
| PATCH | /projects/:id | プロジェクト更新 |
| DELETE | /projects/:id | プロジェクト削除 |

---

### POST /projects

プロジェクトを作成する。

#### リクエスト

```typescript
// Request Body
interface CreateProjectDto {
  name: string;          // 必須, 1-100文字
  description?: string;  // 任意, 最大1000文字
}
```

```json
{
  "name": "新規プロジェクト",
  "description": "プロジェクトの説明"
}
```

#### レスポンス

**201 Created**

```json
{
  "data": {
    "id": 1,
    "name": "新規プロジェクト",
    "description": "プロジェクトの説明",
    "ownerId": 123,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

**400 Bad Request** - バリデーションエラー

```json
{
  "error": {
    "code": "TASK_PROJECT_VALIDATION_ERROR",
    "message": "name is required"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

### GET /projects

プロジェクト一覧を取得する。

#### クエリパラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| page | number | ページ番号 |
| limit | number | 1ページあたりの件数 |
| ownerId | number | 所有者IDでフィルタ（任意） |

#### レスポンス

**200 OK**

```json
{
  "data": [
    {
      "id": 1,
      "name": "プロジェクトA",
      "description": "説明A",
      "ownerId": 123,
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

### GET /projects/:id

プロジェクト詳細を取得する。

#### パスパラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | number | プロジェクトID |

#### レスポンス

**200 OK**

```json
{
  "data": {
    "id": 1,
    "name": "プロジェクトA",
    "description": "説明A",
    "ownerId": 123,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z",
    "tasks": [
      {
        "id": 1,
        "title": "タスク1",
        "status": "TODO"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

**404 Not Found**

```json
{
  "error": {
    "code": "TASK_PROJECT_NOT_FOUND",
    "message": "Project with id 999 not found"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

### PATCH /projects/:id

プロジェクトを更新する。

#### リクエスト

```typescript
// Request Body
interface UpdateProjectDto {
  name?: string;         // 1-100文字
  description?: string;  // 最大1000文字
}
```

```json
{
  "name": "更新後のプロジェクト名"
}
```

#### レスポンス

**200 OK**

```json
{
  "data": {
    "id": 1,
    "name": "更新後のプロジェクト名",
    "description": "説明A",
    "ownerId": 123,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T11:00:00Z"
  },
  "meta": {
    "timestamp": "2025-01-15T11:00:00Z"
  }
}
```

**403 Forbidden** - 権限エラー

```json
{
  "error": {
    "code": "TASK_PROJECT_FORBIDDEN",
    "message": "You do not have permission to update this project"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

### DELETE /projects/:id

プロジェクトを削除する（配下のタスク・コメントも削除）。

#### レスポンス

**204 No Content**

（レスポンスボディなし）

**403 Forbidden** - 権限エラー

**404 Not Found** - プロジェクトが存在しない

---

## Task API

### エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| POST | /tasks | タスク作成 |
| GET | /tasks | タスク一覧取得 |
| GET | /tasks/:id | タスク詳細取得 |
| PATCH | /tasks/:id | タスク更新 |
| DELETE | /tasks/:id | タスク削除 |
| POST | /tasks/:id/tags | タスクにタグを追加 |
| DELETE | /tasks/:id/tags/:tagId | タスクからタグを削除 |

---

### POST /tasks

タスクを作成する。

#### リクエスト

```typescript
// Request Body
interface CreateTaskDto {
  title: string;           // 必須, 1-200文字
  description?: string;    // 任意, 最大2000文字
  status?: TaskStatus;     // 任意, デフォルト: TODO
  priority?: TaskPriority; // 任意, デフォルト: MEDIUM
  dueDate?: string;        // 任意, ISO8601形式
  projectId: number;       // 必須
  assigneeId?: number;     // 任意
  tagIds?: number[];       // 任意, 既存タグのID配列
}
```

```json
{
  "title": "新規タスク",
  "description": "タスクの説明",
  "projectId": 1,
  "priority": "HIGH",
  "dueDate": "2025-01-31T23:59:59Z",
  "tagIds": [1, 2]
}
```

#### レスポンス

**201 Created**

```json
{
  "data": {
    "id": 1,
    "title": "新規タスク",
    "description": "タスクの説明",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2025-01-31T23:59:59Z",
    "projectId": 1,
    "assigneeId": null,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z",
    "tags": [
      { "id": 1, "name": "urgent", "color": "#FF0000" },
      { "id": 2, "name": "frontend", "color": "#00FF00" }
    ]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

### GET /tasks

タスク一覧を取得する。

#### クエリパラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| page | number | ページ番号 |
| limit | number | 1ページあたりの件数 |
| projectId | number | プロジェクトIDでフィルタ |
| status | string | ステータスでフィルタ（TODO, IN_PROGRESS, DONE） |
| priority | string | 優先度でフィルタ（LOW, MEDIUM, HIGH） |
| assigneeId | number | 担当者IDでフィルタ |
| tagId | number | タグIDでフィルタ |

#### レスポンス

**200 OK**

```json
{
  "data": [
    {
      "id": 1,
      "title": "タスク1",
      "status": "TODO",
      "priority": "HIGH",
      "dueDate": "2025-01-31T23:59:59Z",
      "projectId": 1,
      "assigneeId": 123,
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z",
      "tags": [
        { "id": 1, "name": "urgent", "color": "#FF0000" }
      ]
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

### GET /tasks/:id

タスク詳細を取得する（コメント・タグ含む）。

#### レスポンス

**200 OK**

```json
{
  "data": {
    "id": 1,
    "title": "タスク1",
    "description": "タスクの詳細説明",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "dueDate": "2025-01-31T23:59:59Z",
    "projectId": 1,
    "assigneeId": 123,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T11:00:00Z",
    "project": {
      "id": 1,
      "name": "プロジェクトA"
    },
    "tags": [
      { "id": 1, "name": "urgent", "color": "#FF0000" }
    ],
    "comments": [
      {
        "id": 1,
        "content": "進捗報告です",
        "authorId": 456,
        "createdAt": "2025-01-15T12:00:00Z"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-15T12:30:00Z"
  }
}
```

---

### PATCH /tasks/:id

タスクを更新する。

#### リクエスト

```typescript
// Request Body
interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;  // nullで期限削除
  assigneeId?: number | null;
}
```

```json
{
  "status": "IN_PROGRESS",
  "assigneeId": 123
}
```

#### レスポンス

**200 OK** - 更新後のタスク

---

### DELETE /tasks/:id

タスクを削除する（配下のコメントも削除）。

#### レスポンス

**204 No Content**

---

### POST /tasks/:id/tags

タスクにタグを追加する。

#### リクエスト

```json
{
  "tagId": 3
}
```

#### レスポンス

**200 OK** - 更新後のタスク（tags含む）

**409 Conflict** - 既にタグが付与されている

```json
{
  "error": {
    "code": "TASK_TASK_TAG_ALREADY_EXISTS",
    "message": "Tag 3 is already assigned to task 1"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

### DELETE /tasks/:id/tags/:tagId

タスクからタグを削除する。

#### レスポンス

**204 No Content**

---

## Comment API

### エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| POST | /tasks/:taskId/comments | コメント作成 |
| GET | /tasks/:taskId/comments | コメント一覧取得 |
| PATCH | /comments/:id | コメント更新 |
| DELETE | /comments/:id | コメント削除 |

### 設計判断

コメントはタスクに紐づくため、作成・一覧取得は `/tasks/:taskId/comments` としてネストする。
更新・削除は `/comments/:id` として直接アクセス可能にする（RESTの慣例）。

---

### POST /tasks/:taskId/comments

コメントを作成する。

#### リクエスト

```typescript
// Request Body
interface CreateCommentDto {
  content: string;  // 必須, 1-2000文字
}
```

```json
{
  "content": "進捗報告です。50%完了しました。"
}
```

#### レスポンス

**201 Created**

```json
{
  "data": {
    "id": 1,
    "content": "進捗報告です。50%完了しました。",
    "taskId": 1,
    "authorId": 123,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

### GET /tasks/:taskId/comments

タスクのコメント一覧を取得する。

#### クエリパラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| page | number | ページ番号 |
| limit | number | 1ページあたりの件数 |

#### レスポンス

**200 OK**

```json
{
  "data": [
    {
      "id": 1,
      "content": "進捗報告です。",
      "taskId": 1,
      "authorId": 123,
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

### PATCH /comments/:id

コメントを更新する（投稿者のみ）。

#### リクエスト

```json
{
  "content": "更新後のコメント内容"
}
```

#### レスポンス

**200 OK** - 更新後のコメント

**403 Forbidden** - 投稿者以外が更新しようとした

---

### DELETE /comments/:id

コメントを削除する（投稿者またはADMINのみ）。

#### レスポンス

**204 No Content**

---

## Tag API

### エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| POST | /tags | タグ作成 |
| GET | /tags | タグ一覧取得 |
| GET | /tags/:id | タグ詳細取得 |
| PATCH | /tags/:id | タグ更新 |
| DELETE | /tags/:id | タグ削除 |

---

### POST /tags

タグを作成する。

#### リクエスト

```typescript
// Request Body
interface CreateTagDto {
  name: string;    // 必須, 1-50文字, ユニーク
  color?: string;  // 任意, HEXカラー（#RRGGBB形式）
}
```

```json
{
  "name": "urgent",
  "color": "#FF0000"
}
```

#### レスポンス

**201 Created**

```json
{
  "data": {
    "id": 1,
    "name": "urgent",
    "color": "#FF0000",
    "createdAt": "2025-01-15T10:30:00Z"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

**409 Conflict** - 同名のタグが既に存在

```json
{
  "error": {
    "code": "TASK_TAG_ALREADY_EXISTS",
    "message": "Tag with name 'urgent' already exists"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

### GET /tags

タグ一覧を取得する。

#### クエリパラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| page | number | ページ番号 |
| limit | number | 1ページあたりの件数 |
| search | string | タグ名で部分一致検索 |

#### レスポンス

**200 OK**

```json
{
  "data": [
    { "id": 1, "name": "urgent", "color": "#FF0000", "createdAt": "2025-01-15T10:30:00Z" },
    { "id": 2, "name": "frontend", "color": "#00FF00", "createdAt": "2025-01-15T10:30:00Z" }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

### GET /tags/:id

タグ詳細を取得する（紐づくタスク数含む）。

#### レスポンス

**200 OK**

```json
{
  "data": {
    "id": 1,
    "name": "urgent",
    "color": "#FF0000",
    "createdAt": "2025-01-15T10:30:00Z",
    "taskCount": 5
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

### PATCH /tags/:id

タグを更新する。

#### リクエスト

```json
{
  "name": "critical",
  "color": "#FF5500"
}
```

#### レスポンス

**200 OK** - 更新後のタグ

**409 Conflict** - 変更後の名前が既存タグと重複

---

### DELETE /tags/:id

タグを削除する（タスクとの関連も削除）。

#### レスポンス

**204 No Content**

---

## エラーコード一覧

| コード | HTTPステータス | 説明 |
|--------|---------------|------|
| TASK_PROJECT_NOT_FOUND | 404 | プロジェクトが存在しない |
| TASK_PROJECT_VALIDATION_ERROR | 400 | プロジェクトのバリデーションエラー |
| TASK_PROJECT_FORBIDDEN | 403 | プロジェクトへのアクセス権限がない |
| TASK_TASK_NOT_FOUND | 404 | タスクが存在しない |
| TASK_TASK_VALIDATION_ERROR | 400 | タスクのバリデーションエラー |
| TASK_TASK_FORBIDDEN | 403 | タスクへのアクセス権限がない |
| TASK_TASK_TAG_ALREADY_EXISTS | 409 | タスクに既にタグが付与されている |
| TASK_COMMENT_NOT_FOUND | 404 | コメントが存在しない |
| TASK_COMMENT_VALIDATION_ERROR | 400 | コメントのバリデーションエラー |
| TASK_COMMENT_FORBIDDEN | 403 | コメントへのアクセス権限がない |
| TASK_TAG_NOT_FOUND | 404 | タグが存在しない |
| TASK_TAG_VALIDATION_ERROR | 400 | タグのバリデーションエラー |
| TASK_TAG_ALREADY_EXISTS | 409 | 同名のタグが既に存在 |

---

## DTOバリデーションルール

### 共通ルール

| ルール | 説明 |
|--------|------|
| @IsNotEmpty() | 必須フィールドの空文字チェック |
| @IsString() | 文字列型チェック |
| @IsNumber() | 数値型チェック |
| @IsOptional() | 任意フィールド |
| @MaxLength(n) | 最大文字数 |
| @IsEnum() | 列挙型チェック |
| @IsISO8601() | ISO8601日付形式チェック |
| @Matches(/^#[0-9A-Fa-f]{6}$/) | HEXカラー形式チェック |

### 実装例

```typescript
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsEnum, IsNumber, IsISO8601, Matches, IsArray } from 'class-validator';
import { TaskStatus, TaskPriority } from '../entities/task.enums';

/**
 * タスク作成DTO
 */
export class CreateTaskDto {
  @IsNotEmpty({ message: 'title is required' })
  @IsString()
  @MaxLength(200)
  title: string;

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
  @IsISO8601()
  dueDate?: string;

  @IsNotEmpty({ message: 'projectId is required' })
  @IsNumber()
  projectId: number;

  @IsOptional()
  @IsNumber()
  assigneeId?: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tagIds?: number[];
}
```
