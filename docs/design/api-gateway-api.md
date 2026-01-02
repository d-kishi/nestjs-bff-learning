# api-gateway（BFF）API設計

## 概要

api-gateway（BFF層）のREST API設計。フロントエンド（Angular）に対して統一されたエンドポイントを提供し、内部でtask-serviceとuser-serviceに振り分ける。

## アーキテクチャ

```
Angular → BFF (api-gateway:3000) → task-service:3001 / user-service:3002 → Oracle XE
```

## BFFの責務

| 責務 | 説明 |
|------|------|
| JWT検証 | Authorizationヘッダからトークン検証・デコード |
| 認可（粗い粒度） | エンドポイント別のロール確認 |
| ヘッダ伝播 | X-User-Id, X-User-Roles を下流サービスに伝播 |
| データ集約 | 複数サービスから並列取得、レスポンス整形 |
| 部分失敗ハンドリング | サービス障害時のgraceful degradation |

## 共通仕様

### ベースURL

```
http://localhost:3000/api
```

### レスポンス形式

下流サービス（task-service, user-service）と統一したフォーマットを使用。

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
    "code": "BFF_[ERROR_TYPE]",
    "message": "エラーメッセージ"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}

// 部分失敗時（データ集約エンドポイント）
{
  "data": { ... },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  },
  "_errors": ["user-service unavailable"]
}
```

### 認証ヘッダ

| ヘッダ名 | 必須 | 説明 |
|---------|------|------|
| Authorization | 条件付き | Bearer <JWT>形式（認証必須エンドポイント） |

### ページネーション

一覧取得APIは以下のクエリパラメータをサポート：

| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| page | number | 1 | ページ番号 |
| limit | number | 20 | 1ページあたりの件数（最大100） |

---

## エンドポイント一覧

### 認証不要（公開）エンドポイント

| メソッド | パス | 下流サービス | 説明 |
|---------|------|-------------|------|
| POST | /api/auth/register | user-service | ユーザー登録 |
| POST | /api/auth/login | user-service | ログイン |
| POST | /api/auth/refresh | user-service | トークンリフレッシュ |
| GET | / | - | ヘルスチェック |

### 認証必須エンドポイント

#### Auth API

| メソッド | パス | 下流サービス | 説明 |
|---------|------|-------------|------|
| POST | /api/auth/logout | user-service | ログアウト |
| GET | /api/auth/me | user-service | 現在のユーザー情報取得 |

#### Projects API

| メソッド | パス | 下流サービス | 説明 |
|---------|------|-------------|------|
| POST | /api/projects | task-service | プロジェクト作成 |
| GET | /api/projects | task-service | プロジェクト一覧取得 |
| GET | /api/projects/:id | task-service | プロジェクト詳細取得 |
| PATCH | /api/projects/:id | task-service | プロジェクト更新 |
| DELETE | /api/projects/:id | task-service | プロジェクト削除 |

#### Tasks API

| メソッド | パス | 下流サービス | 説明 |
|---------|------|-------------|------|
| POST | /api/tasks | task-service | タスク作成 |
| GET | /api/tasks | task-service | タスク一覧取得 |
| GET | /api/tasks/:id | task-service | タスク詳細取得 |
| PATCH | /api/tasks/:id | task-service | タスク更新 |
| DELETE | /api/tasks/:id | task-service | タスク削除 |

#### Comments API

| メソッド | パス | 下流サービス | 説明 |
|---------|------|-------------|------|
| POST | /api/tasks/:taskId/comments | task-service | コメント作成 |
| GET | /api/tasks/:taskId/comments | task-service | コメント一覧取得 |
| PATCH | /api/comments/:id | task-service | コメント更新 |
| DELETE | /api/comments/:id | task-service | コメント削除 |

#### Tags API

| メソッド | パス | 下流サービス | 説明 |
|---------|------|-------------|------|
| POST | /api/tags | task-service | タグ作成 |
| GET | /api/tags | task-service | タグ一覧取得 |
| GET | /api/tags/:id | task-service | タグ詳細取得 |
| PATCH | /api/tags/:id | task-service | タグ更新 |
| DELETE | /api/tags/:id | task-service | タグ削除 |
| POST | /api/tasks/:taskId/tags | task-service | タスクにタグ追加 |
| DELETE | /api/tasks/:taskId/tags/:tagId | task-service | タスクからタグ削除 |

#### Users API

| メソッド | パス | ロール | 下流サービス | 説明 |
|---------|------|--------|-------------|------|
| GET | /api/users | ADMIN | user-service | ユーザー一覧取得 |
| GET | /api/users/:id | - | user-service | ユーザー詳細取得 |
| DELETE | /api/users/:id | ADMIN | user-service | ユーザー削除 |
| PATCH | /api/users/:id/profile | - | user-service | プロフィール更新 |
| PATCH | /api/users/:id/password | - | user-service | パスワード変更 |
| PATCH | /api/users/:id/roles | ADMIN | user-service | ロール更新 |
| PATCH | /api/users/:id/status | ADMIN | user-service | ステータス更新 |

#### Roles API

| メソッド | パス | ロール | 下流サービス | 説明 |
|---------|------|--------|-------------|------|
| GET | /api/roles | - | user-service | ロール一覧取得 |
| GET | /api/roles/:id | - | user-service | ロール詳細取得 |
| POST | /api/roles | ADMIN | user-service | ロール作成 |
| PATCH | /api/roles/:id | ADMIN | user-service | ロール更新 |
| DELETE | /api/roles/:id | ADMIN | user-service | ロール削除 |

#### Dashboard API（データ集約）

| メソッド | パス | 下流サービス | 説明 |
|---------|------|-------------|------|
| GET | /api/dashboard | task-service + user-service | ダッシュボードデータ取得 |

---

## Auth API 詳細

### POST /api/auth/register

ユーザーを登録してJWTを発行する。

#### リクエスト

```typescript
interface RegisterDto {
  email: string;       // 必須, 有効なメールアドレス形式
  password: string;    // 必須, 8〜100文字, 英字と数字を含む
  displayName?: string; // 任意, 表示名
}
```

```json
{
  "email": "user@example.com",
  "password": "Password123",
  "displayName": "山田太郎"
}
```

#### レスポンス

**201 Created**

```json
{
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "isActive": true,
      "createdAt": "2025-01-15T10:30:00Z",
      "profile": {
        "id": 1,
        "displayName": "山田太郎"
      },
      "roles": ["MEMBER"]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

#### 処理フロー

```
Angular → BFF: POST /api/auth/register { email, password, displayName }
BFF: バリデーション（DTO検証）
BFF → user-service: POST /auth/register { email, password, displayName }
user-service → BFF: { user, accessToken, refreshToken }
BFF → Angular: { user, accessToken, refreshToken }
```

---

### POST /api/auth/login

ログインしてJWTを発行する。

#### リクエスト

```typescript
interface LoginDto {
  email: string;     // 必須
  password: string;  // 必須
}
```

#### レスポンス

**200 OK**

```json
{
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "profile": {
        "displayName": "山田太郎"
      },
      "roles": ["MEMBER"]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

### POST /api/auth/refresh

Refresh TokenでAccess Tokenを再発行する。

#### リクエスト

```typescript
interface RefreshTokenDto {
  refreshToken: string;  // 必須
}
```

#### レスポンス

**200 OK**

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "bmV3IHJlZnJlc2ggdG9rZW4..."
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

### POST /api/auth/logout

ログアウトしてRefresh Tokenを無効化する。

#### ヘッダ

```
Authorization: Bearer <JWT>
```

#### リクエスト

```typescript
interface LogoutDto {
  refreshToken: string;  // 必須
}
```

#### レスポンス

**200 OK**

```json
{
  "data": {
    "message": "Logged out successfully"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

### GET /api/auth/me

現在認証中のユーザー情報を取得する。

#### ヘッダ

```
Authorization: Bearer <JWT>
```

#### レスポンス

**200 OK**

```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "isActive": true,
    "profile": {
      "displayName": "山田太郎",
      "firstName": "太郎",
      "lastName": "山田",
      "avatarUrl": null,
      "bio": "エンジニアです"
    },
    "roles": ["MEMBER"]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

#### 処理フロー

```
Angular → BFF: GET /api/auth/me (Authorization: Bearer <JWT>)
BFF: JWT検証・デコード → userId=1, roles=["MEMBER"]
BFF → user-service: GET /auth/me (X-User-Id: 1, X-User-Roles: MEMBER)
user-service → BFF: { user }
BFF → Angular: { user }
```

---

## Dashboard API 詳細

### GET /api/dashboard

ダッシュボードに表示するデータを集約して取得する。task-serviceとuser-serviceから並列でデータを取得し、整形して返却する。

#### ヘッダ

```
Authorization: Bearer <JWT>
```

#### レスポンス

**200 OK（正常）**

```json
{
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "profile": {
        "displayName": "山田太郎"
      }
    },
    "taskSummary": {
      "total": 25,
      "todo": 10,
      "inProgress": 8,
      "done": 7
    },
    "projectSummary": {
      "total": 5,
      "owned": 3
    },
    "recentTasks": [
      {
        "id": 1,
        "title": "APIエンドポイント実装",
        "status": "IN_PROGRESS",
        "dueDate": "2025-01-20T00:00:00Z"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

**200 OK（部分失敗）**

user-serviceがダウンしている場合:

```json
{
  "data": {
    "user": null,
    "taskSummary": {
      "total": 25,
      "todo": 10,
      "inProgress": 8,
      "done": 7
    },
    "projectSummary": {
      "total": 5,
      "owned": 3
    },
    "recentTasks": [...]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  },
  "_errors": ["user-service unavailable"]
}
```

#### 処理フロー

```
Angular → BFF: GET /api/dashboard (Authorization: Bearer <JWT>)
BFF: JWT検証・デコード → userId=1, roles=["MEMBER"]

// 並列リクエスト
BFF → user-service: GET /users/1 (X-User-Id: 1, X-User-Roles: MEMBER)
BFF → task-service: GET /tasks?assigneeId=1 (X-User-Id: 1, X-User-Roles: MEMBER)
BFF → task-service: GET /projects?ownerId=1 (X-User-Id: 1, X-User-Roles: MEMBER)

// Promise.allSettled で結果を集約
BFF: レスポンス整形（サマリー計算）
BFF → Angular: { user, taskSummary, projectSummary, recentTasks, _errors? }
```

#### レスポンス型定義

```typescript
interface DashboardResponse {
  user: UserSummary | null;
  taskSummary: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
  };
  projectSummary: {
    total: number;
    owned: number;
  };
  recentTasks: RecentTask[];
  _errors?: string[];
}

interface UserSummary {
  id: number;
  email: string;
  profile: {
    displayName: string;
  };
}

interface RecentTask {
  id: number;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate: string | null;
}
```

---

## 認証・認可フロー

### 認証フロー図

```
┌─────────┐     ┌─────────┐     ┌──────────────┐     ┌──────────────┐
│ Angular │────▶│   BFF   │────▶│ user-service │────▶│   Oracle XE  │
└─────────┘     └─────────┘     └──────────────┘     └──────────────┘
                     │
                     │          ┌──────────────┐
                     └─────────▶│ task-service │
                                └──────────────┘

1. ログイン
   [Angular] POST /api/auth/login { email, password }
        ↓
   [BFF] POST /auth/login { email, password } → user-service
        ↓
   [user-service] JWT発行（Access Token + Refresh Token）
        ↓
   [BFF] → [Angular] { accessToken, refreshToken }

2. 認証済みリクエスト
   [Angular] GET /api/tasks (Authorization: Bearer <JWT>)
        ↓
   [BFF] JWT検証（Passport JWT Strategy）
        ↓ デコード → { sub: 1, email: "...", roles: ["MEMBER"] }
   [BFF] GET /tasks (X-User-Id: 1, X-User-Roles: MEMBER) → task-service
        ↓
   [task-service] 内部ヘッダを信頼、データ返却
        ↓
   [BFF] → [Angular] { tasks }
```

### JWT検証実装

BFFはPassport JWT Strategyを使用してトークンを検証する。

```typescript
// JWTペイロード構造
interface JwtPayload {
  sub: number;      // ユーザーID
  email: string;    // メールアドレス
  roles: string[];  // ロール配列
  iat: number;      // 発行時刻
  exp: number;      // 有効期限
}

// 検証後に利用可能なユーザー情報
interface UserFromJwt {
  id: number;
  email: string;
  roles: string[];
}
```

### ヘッダ伝播

BFFが下流サービスに伝播するヘッダ:

| ヘッダ名 | 値 | 説明 |
|---------|-----|------|
| X-User-Id | JWTのsub値 | 認証済みユーザーのID |
| X-User-Roles | JWTのroles値（カンマ区切り） | ユーザーのロール |

```typescript
// BFFのサービスクライアントでヘッダ付与
const headers = {
  'X-User-Id': String(user.id),
  'X-User-Roles': user.roles.join(','),
};
```

---

## 認可（ロールベースアクセス制御）

### BFF層での認可

BFFは「粗い粒度」の認可を担当。エンドポイント単位でロールを検証する。

```typescript
// ADMIN専用エンドポイント
@Get('/users')
@Roles('ADMIN')
findAllUsers() { ... }

// 認証のみ（ロール制限なし）
@Get('/tasks')
findAllTasks() { ... }
```

### ADMIN専用エンドポイント一覧

| エンドポイント | 説明 |
|---------------|------|
| GET /api/users | ユーザー一覧取得 |
| DELETE /api/users/:id | ユーザー削除 |
| PATCH /api/users/:id/roles | ロール更新 |
| PATCH /api/users/:id/status | ステータス更新 |
| POST /api/roles | ロール作成 |
| PATCH /api/roles/:id | ロール更新 |
| DELETE /api/roles/:id | ロール削除 |

### 下流サービスでの認可

下流サービス（task-service, user-service）は「細かい粒度」の認可を担当:

- **リソースオーナー確認**: プロジェクト所有者、コメント投稿者の確認
- **本人確認**: パスワード変更は本人のみ、プロフィール閲覧は本人またはADMIN

---

## エラーハンドリング

### BFF固有エラーコード

| コード | HTTPステータス | 説明 |
|--------|---------------|------|
| BFF_UNAUTHORIZED | 401 | JWT未提供または無効 |
| BFF_FORBIDDEN | 403 | ロール不足 |
| BFF_SERVICE_UNAVAILABLE | 503 | 下流サービス接続エラー |
| BFF_TIMEOUT | 504 | 下流サービスタイムアウト |
| BFF_VALIDATION_ERROR | 400 | リクエストバリデーションエラー |

### 下流サービスエラーの変換

下流サービスからのエラーは、BFFでエラーレスポンスをそのまま透過的に返却する。

```typescript
// 下流サービスが404を返した場合
// task-service: { error: { code: "TASK_PROJECT_NOT_FOUND", message: "..." } }
// BFF: そのまま404で返却
```

### タイムアウト設定

| 設定 | 値 | 説明 |
|------|-----|------|
| HTTP_TIMEOUT | 5000ms | 下流サービスへのリクエストタイムアウト |

---

## 環境変数

```bash
# サーバー設定
PORT=3000

# JWT設定（user-serviceと同じシークレット）
JWT_SECRET=dev-secret-key

# サービスURL
TASK_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002

# HTTP設定
HTTP_TIMEOUT=5000
```

---

## 関連ドキュメント

- [task-service API設計](./task-service-api.md)
- [user-service API設計](./user-service-api.md)
- [api-gateway 型定義](./api-gateway-types.md)
