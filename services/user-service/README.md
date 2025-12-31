# user-service

ユーザー管理と認証を担当するマイクロサービスです。

## 学習フェーズ

**Phase 2** で実装します。

## エンティティ

```
User ─1:1─ UserProfile
  │
  └─ N:M ─ Role（中間テーブル: UserRole）
```

| エンティティ | 役割 | リレーション |
|-------------|------|-------------|
| User | 認証情報（email, password） | 1対1、多対多 |
| UserProfile | 詳細プロフィール（name, avatar等） | 1対1 |
| Role | 権限（ADMIN, MEMBER） | 多対多 |

## ディレクトリ構成（予定）

```
user-service/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   └── dto/
│   ├── user/
│   │   └── ...
│   ├── role/
│   │   └── ...
│   ├── config/
│   │   └── configuration.ts
│   ├── app.module.ts
│   └── main.ts
├── test/
│   └── *.e2e-spec.ts
├── .env.example
└── package.json
```

## 認証エンドポイント

```
POST /auth/register    # ユーザー登録
POST /auth/login       # ログイン → JWT発行
POST /auth/refresh     # トークンリフレッシュ
GET  /auth/me          # 現在のユーザー情報
```

## 学習要素

### 認証
- `@nestjs/passport`: 認証フレームワーク
- `@nestjs/jwt`: JWTの生成・検証
- JWT Strategy: Passportの認証戦略
- bcrypt: パスワードハッシュ化

### 認可
- AuthGuard: 認証ガード
- RolesGuard: ロールベース認可ガード
- カスタムデコレータ: `@CurrentUser()`, `@Roles()`

### TypeORM
- 1対1リレーション（User-UserProfile）
- 多対多リレーション（User-Role）

## Role定義

| Role | 権限 |
|------|------|
| `ADMIN` | 全操作可能 |
| `MEMBER` | 自分のリソースのみ操作可能 |

## データベース

- スキーマ: `USER_DB`
- テスト用: `USER_DB_TEST`
