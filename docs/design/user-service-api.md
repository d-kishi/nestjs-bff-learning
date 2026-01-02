# user-service API設計

## 概要

user-serviceのREST API設計。認証（Auth）、ユーザー管理（Users）、ロール管理（Roles）の3つのドメインでAPIを提供する。

## 共通仕様

### ベースURL

```
http://localhost:3002
```

### レスポンス形式

task-serviceと統一したフォーマットを使用。

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
    "code": "USER_[ENTITY]_[ERROR_TYPE]",
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
| X-User-Id | 条件付き | リクエスト元ユーザーのID（認証済みエンドポイントのみ） |
| X-User-Roles | 条件付き | ユーザーのロール（カンマ区切り） |

**注意**: `/auth/register`、`/auth/login`、`/auth/refresh` は未認証でもアクセス可能なため、X-User-* ヘッダは不要。

### ページネーション

一覧取得APIは以下のクエリパラメータをサポート：

| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| page | number | 1 | ページ番号 |
| limit | number | 20 | 1ページあたりの件数（最大100） |

---

## Auth API（認証）

認証関連のエンドポイント。JWT発行・検証を担当。

### エンドポイント一覧

| メソッド | パス | 認証 | 説明 |
|---------|------|------|------|
| POST | /auth/register | 不要 | ユーザー登録 |
| POST | /auth/login | 不要 | ログイン（JWT発行） |
| POST | /auth/refresh | 不要 | トークンリフレッシュ |
| POST | /auth/logout | 必要 | ログアウト（Refresh Token無効化） |
| GET | /auth/me | 必要 | 現在のユーザー情報取得 |

---

### POST /auth/register

新規ユーザーを登録する。

#### リクエスト

```typescript
// Request Body
interface RegisterDto {
  email: string;       // 必須, 有効なメールアドレス形式
  password: string;    // 必須, 8〜100文字, 英字と数字を含む
  displayName?: string; // 任意, 表示名（省略時はemailのローカルパート）
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
        "displayName": "山田太郎",
        "firstName": null,
        "lastName": null,
        "avatarUrl": null,
        "bio": null
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

**400 Bad Request** - バリデーションエラー

```json
{
  "error": {
    "code": "USER_AUTH_VALIDATION_ERROR",
    "message": "パスワードは8文字以上で入力してください"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

**409 Conflict** - メールアドレス重複

```json
{
  "error": {
    "code": "USER_AUTH_EMAIL_ALREADY_EXISTS",
    "message": "Email 'user@example.com' is already registered"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

#### 処理フロー

1. バリデーション（email形式、password要件）
2. email重複チェック
3. パスワードをbcryptでハッシュ化
4. User + UserProfile を同時作成（トランザクション）
5. MEMBERロールを付与
6. JWT（Access Token + Refresh Token）を発行
7. Refresh TokenをDBに保存

---

### POST /auth/login

ログインしてJWTを発行する。

#### リクエスト

```typescript
// Request Body
interface LoginDto {
  email: string;     // 必須
  password: string;  // 必須
}
```

```json
{
  "email": "user@example.com",
  "password": "Password123"
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
      "isActive": true,
      "profile": {
        "displayName": "山田太郎",
        "avatarUrl": null
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

**401 Unauthorized** - 認証失敗

```json
{
  "error": {
    "code": "USER_AUTH_INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

**403 Forbidden** - アカウント停止

```json
{
  "error": {
    "code": "USER_AUTH_ACCOUNT_DISABLED",
    "message": "Account is disabled"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

#### 処理フロー

1. emailでユーザー検索
2. パスワード照合（bcrypt.compare）
3. isActiveチェック
4. JWT発行
5. 古いRefresh Tokenを無効化（同一ユーザーの既存トークン）
6. 新しいRefresh TokenをDBに保存

---

### POST /auth/refresh

Refresh TokenでAccess Tokenを再発行する。

#### リクエスト

```typescript
// Request Body
interface RefreshTokenDto {
  refreshToken: string;  // 必須
}
```

```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
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

**401 Unauthorized** - トークン無効

```json
{
  "error": {
    "code": "USER_AUTH_INVALID_REFRESH_TOKEN",
    "message": "Refresh token is invalid or expired"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

#### 処理フロー

1. Refresh TokenをDBで検索
2. 有効期限・無効化フラグをチェック
3. 新しいAccess Token + Refresh Tokenを発行
4. 古いRefresh Tokenを無効化
5. 新しいRefresh TokenをDBに保存

#### 設計判断

**Refresh Token Rotation**を採用。リフレッシュ時に毎回新しいRefresh Tokenを発行することで、トークン漏洩時のリスクを軽減。

---

### POST /auth/logout

ログアウトしてRefresh Tokenを無効化する。

#### リクエスト

```typescript
// Request Body
interface LogoutDto {
  refreshToken: string;  // 必須
}
```

```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
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

#### 処理フロー

1. Refresh TokenをDBで検索
2. isRevokedをtrueに更新

**注意**: Access Tokenはステートレスのため即座に無効化できない。BFF側でブラックリスト管理するか、有効期限が切れるまで待つ。

---

### GET /auth/me

現在認証中のユーザー情報を取得する。

#### ヘッダ

```
X-User-Id: 1
X-User-Roles: MEMBER
```

#### レスポンス

**200 OK**

```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "isActive": true,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z",
    "profile": {
      "id": 1,
      "displayName": "山田太郎",
      "firstName": "太郎",
      "lastName": "山田",
      "avatarUrl": "https://example.com/avatar.png",
      "bio": "エンジニアです"
    },
    "roles": ["MEMBER"]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

## Users API（ユーザー管理）

ユーザー情報の参照・更新を担当。

### エンドポイント一覧

| メソッド | パス | 認証 | 権限 | 説明 |
|---------|------|------|------|------|
| GET | /users | 必要 | ADMIN | ユーザー一覧取得 |
| GET | /users/:id | 必要 | 本人 or ADMIN | ユーザー詳細取得 |
| PATCH | /users/:id | 必要 | 本人 or ADMIN | ユーザー情報更新 |
| DELETE | /users/:id | 必要 | ADMIN | ユーザー削除 |
| PATCH | /users/:id/profile | 必要 | 本人 or ADMIN | プロフィール更新 |
| PATCH | /users/:id/password | 必要 | 本人 | パスワード変更 |
| PATCH | /users/:id/roles | 必要 | ADMIN | ロール更新 |
| PATCH | /users/:id/status | 必要 | ADMIN | アカウント有効/無効切替 |

---

### GET /users

ユーザー一覧を取得する（ADMIN専用）。

#### クエリパラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| page | number | ページ番号 |
| limit | number | 1ページあたりの件数 |
| email | string | メールアドレス部分一致検索 |
| isActive | boolean | 有効/無効フィルタ |
| roleId | number | ロールIDでフィルタ |

#### レスポンス

**200 OK**

```json
{
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "isActive": true,
      "createdAt": "2025-01-15T10:30:00Z",
      "profile": {
        "displayName": "山田太郎",
        "avatarUrl": null
      },
      "roles": ["MEMBER"]
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

**403 Forbidden** - ADMIN以外がアクセス

---

### GET /users/:id

ユーザー詳細を取得する。

#### パスパラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | number | ユーザーID |

#### レスポンス

**200 OK**

```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "isActive": true,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z",
    "profile": {
      "id": 1,
      "displayName": "山田太郎",
      "firstName": "太郎",
      "lastName": "山田",
      "avatarUrl": "https://example.com/avatar.png",
      "bio": "エンジニアです",
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    },
    "roles": ["MEMBER", "ADMIN"]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

**403 Forbidden** - 本人以外かつADMIN以外がアクセス

**404 Not Found** - ユーザーが存在しない

---

### PATCH /users/:id

ユーザー基本情報を更新する。

#### リクエスト

```typescript
// Request Body
interface UpdateUserDto {
  email?: string;  // メールアドレス変更（本人のみ）
}
```

```json
{
  "email": "new-email@example.com"
}
```

#### レスポンス

**200 OK** - 更新後のユーザー情報

**409 Conflict** - 新しいメールアドレスが既に使用されている

---

### DELETE /users/:id

ユーザーを削除する（ADMIN専用）。

#### レスポンス

**204 No Content**

**403 Forbidden** - ADMIN以外が削除しようとした

**404 Not Found** - ユーザーが存在しない

#### 設計判断

- 物理削除を採用（学習用のためシンプルに）
- task-serviceのowner_id, assignee_id, author_idは残存する（サービス間独立のため）

---

### PATCH /users/:id/profile

プロフィールを更新する。

#### リクエスト

```typescript
// Request Body
interface UpdateProfileDto {
  displayName?: string;  // 1-100文字
  firstName?: string;    // 1-100文字
  lastName?: string;     // 1-100文字
  avatarUrl?: string;    // 有効なURL形式
  bio?: string;          // 最大1000文字
}
```

```json
{
  "displayName": "山田太郎",
  "firstName": "太郎",
  "lastName": "山田",
  "bio": "更新後の自己紹介"
}
```

#### レスポンス

**200 OK** - 更新後のプロフィール

---

### PATCH /users/:id/password

パスワードを変更する（本人のみ）。

#### リクエスト

```typescript
// Request Body
interface ChangePasswordDto {
  currentPassword: string;  // 現在のパスワード
  newPassword: string;      // 新しいパスワード（8〜100文字, 英字と数字を含む）
}
```

```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

#### レスポンス

**200 OK**

```json
{
  "data": {
    "message": "Password changed successfully"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

**400 Bad Request** - 新しいパスワードが要件を満たさない

**401 Unauthorized** - 現在のパスワードが間違っている

---

### PATCH /users/:id/roles

ユーザーのロールを更新する（ADMIN専用）。

#### リクエスト

```typescript
// Request Body
interface UpdateRolesDto {
  roleIds: number[];  // 設定するロールIDの配列
}
```

```json
{
  "roleIds": [1, 2]
}
```

#### レスポンス

**200 OK** - 更新後のユーザー（roles含む）

#### 設計判断

- ロールは「追加」ではなく「置換」方式（送信したroleIdsで完全に置き換え）
- 空配列を送信した場合、全ロールが削除される

---

### PATCH /users/:id/status

アカウントの有効/無効を切り替える（ADMIN専用）。

#### リクエスト

```typescript
// Request Body
interface UpdateStatusDto {
  isActive: boolean;
}
```

```json
{
  "isActive": false
}
```

#### レスポンス

**200 OK** - 更新後のユーザー

#### 処理フロー

1. isActiveを更新
2. 無効化した場合、該当ユーザーの全Refresh Tokenを無効化

---

## Roles API（ロール管理）

ロールの参照・管理を担当。

### エンドポイント一覧

| メソッド | パス | 認証 | 権限 | 説明 |
|---------|------|------|------|------|
| GET | /roles | 必要 | - | ロール一覧取得 |
| GET | /roles/:id | 必要 | - | ロール詳細取得 |
| POST | /roles | 必要 | ADMIN | ロール作成 |
| PATCH | /roles/:id | 必要 | ADMIN | ロール更新 |
| DELETE | /roles/:id | 必要 | ADMIN | ロール削除 |

---

### GET /roles

ロール一覧を取得する。

#### レスポンス

**200 OK**

```json
{
  "data": [
    {
      "id": 1,
      "name": "ADMIN",
      "description": "管理者。全操作可能。",
      "createdAt": "2025-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "name": "MEMBER",
      "description": "一般ユーザー。自分のリソースのみ操作可能。",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 20,
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

### GET /roles/:id

ロール詳細を取得する（該当ロールを持つユーザー数含む）。

#### レスポンス

**200 OK**

```json
{
  "data": {
    "id": 1,
    "name": "ADMIN",
    "description": "管理者。全操作可能。",
    "createdAt": "2025-01-15T10:30:00Z",
    "userCount": 5
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

### POST /roles

新しいロールを作成する（ADMIN専用）。

#### リクエスト

```typescript
// Request Body
interface CreateRoleDto {
  name: string;         // 必須, 1-50文字, ユニーク
  description?: string; // 任意, 最大500文字
}
```

```json
{
  "name": "EDITOR",
  "description": "編集者。コンテンツの編集が可能。"
}
```

#### レスポンス

**201 Created**

```json
{
  "data": {
    "id": 3,
    "name": "EDITOR",
    "description": "編集者。コンテンツの編集が可能。",
    "createdAt": "2025-01-15T10:30:00Z"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

**409 Conflict** - 同名のロールが既に存在

---

### PATCH /roles/:id

ロールを更新する（ADMIN専用）。

#### リクエスト

```json
{
  "name": "SUPER_ADMIN",
  "description": "スーパー管理者"
}
```

#### レスポンス

**200 OK** - 更新後のロール

**409 Conflict** - 変更後の名前が既存ロールと重複

---

### DELETE /roles/:id

ロールを削除する（ADMIN専用）。

#### レスポンス

**204 No Content**

**400 Bad Request** - 該当ロールを持つユーザーが存在する

```json
{
  "error": {
    "code": "USER_ROLE_HAS_USERS",
    "message": "Cannot delete role with assigned users. 5 users have this role."
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

## エラーコード一覧

### Auth API

| コード | HTTPステータス | 説明 |
|--------|---------------|------|
| USER_AUTH_VALIDATION_ERROR | 400 | バリデーションエラー |
| USER_AUTH_EMAIL_ALREADY_EXISTS | 409 | メールアドレス重複 |
| USER_AUTH_INVALID_CREDENTIALS | 401 | 認証情報不正 |
| USER_AUTH_ACCOUNT_DISABLED | 403 | アカウント無効 |
| USER_AUTH_INVALID_REFRESH_TOKEN | 401 | Refresh Token無効 |

### Users API

| コード | HTTPステータス | 説明 |
|--------|---------------|------|
| USER_USER_NOT_FOUND | 404 | ユーザーが存在しない |
| USER_USER_VALIDATION_ERROR | 400 | バリデーションエラー |
| USER_USER_FORBIDDEN | 403 | アクセス権限がない |
| USER_USER_EMAIL_ALREADY_EXISTS | 409 | メールアドレス重複 |
| USER_USER_INVALID_PASSWORD | 401 | 現在のパスワードが不正 |

### Roles API

| コード | HTTPステータス | 説明 |
|--------|---------------|------|
| USER_ROLE_NOT_FOUND | 404 | ロールが存在しない |
| USER_ROLE_VALIDATION_ERROR | 400 | バリデーションエラー |
| USER_ROLE_ALREADY_EXISTS | 409 | 同名ロール重複 |
| USER_ROLE_HAS_USERS | 400 | ユーザーが割り当て済みのロールを削除 |

---

## DTOバリデーションルール

### 共通ルール

| ルール | 説明 |
|--------|------|
| @IsEmail() | メールアドレス形式チェック |
| @IsString() | 文字列型チェック |
| @IsBoolean() | 真偽値チェック |
| @IsNumber() | 数値型チェック |
| @IsOptional() | 任意フィールド |
| @MinLength(n) | 最小文字数 |
| @MaxLength(n) | 最大文字数 |
| @Matches(regex) | 正規表現マッチ |
| @IsUrl() | URL形式チェック |
| @IsArray() | 配列チェック |

### 実装例

```typescript
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsUrl,
} from 'class-validator';

/**
 * ユーザー登録DTO
 */
export class RegisterDto {
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

  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;
}

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

---

## 認証・認可フロー

### BFF経由の認証フロー

```
1. ログイン
   Angular → BFF: POST /api/auth/login { email, password }
   BFF → user-service: POST /auth/login { email, password }
   user-service → BFF: { accessToken, refreshToken }
   BFF → Angular: { accessToken, refreshToken }

2. 認証済みリクエスト
   Angular → BFF: GET /api/tasks (Authorization: Bearer <JWT>)
   BFF: JWTを検証・デコード → userId, roles を取得
   BFF → task-service: GET /tasks (X-User-Id: 123, X-User-Roles: MEMBER)
   task-service: 内部ヘッダを信頼してデータ返却

3. トークンリフレッシュ
   Angular → BFF: POST /api/auth/refresh { refreshToken }
   BFF → user-service: POST /auth/refresh { refreshToken }
   user-service → BFF: { accessToken, refreshToken }
   BFF → Angular: { accessToken, refreshToken }
```

### 権限チェック実装

```typescript
/**
 * ロールガード
 * 指定されたロールを持つユーザーのみアクセス許可
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRoles = request.headers['x-user-roles']?.split(',') || [];

    return requiredRoles.some((role) => userRoles.includes(role));
  }
}

/**
 * @Roles() デコレータ
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

/**
 * 使用例
 */
@Controller('users')
export class UsersController {
  @Get()
  @Roles('ADMIN')
  findAll() {
    // ADMINのみアクセス可能
  }
}
```

---

## 備考

### task-serviceとの連携

user-serviceで発行したUser.idは、task-serviceから論理参照される。BFF層でユーザーの存在確認を行い、存在しないユーザーIDが指定された場合はエラーを返す。

### セキュリティ考慮事項

1. **パスワード**: 平文保存禁止、bcryptでハッシュ化
2. **JWT**: 秘密鍵は環境変数で管理、Access Tokenの有効期限は短く設定
3. **Refresh Token**: DBで管理し、無効化を可能に
4. **Rate Limiting**: `/auth/login`, `/auth/register` には将来的にレートリミットを設定
5. **ブルートフォース対策**: ログイン失敗回数によるアカウントロックは本プロジェクトではスコープ外
