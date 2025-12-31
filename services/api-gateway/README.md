# api-gateway

BFF（Backend for Frontend）層を担当するサービスです。

## 学習フェーズ

**Phase 3** で実装します。

## 役割

- フロントエンド（Angular）からの唯一の窓口
- 複数サービスからのデータ集約
- JWT検証・認可チェック
- フロントエンド向けレスポンス整形
- 部分失敗のハンドリング

## ディレクトリ構成（予定）

```
api-gateway/
├── src/
│   ├── dashboard/
│   │   ├── dashboard.controller.ts
│   │   ├── dashboard.service.ts
│   │   └── dashboard.module.ts
│   ├── auth/
│   │   ├── auth.controller.ts    # user-serviceへのプロキシ
│   │   └── ...
│   ├── tasks/
│   │   ├── tasks.controller.ts   # task-serviceへのプロキシ
│   │   └── ...
│   ├── common/
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   ├── interceptors/
│   │   │   └── timeout.interceptor.ts
│   │   └── filters/
│   │       └── service-exception.filter.ts
│   ├── clients/
│   │   ├── task-service.client.ts
│   │   └── user-service.client.ts
│   ├── config/
│   │   └── configuration.ts
│   ├── app.module.ts
│   └── main.ts
├── test/
│   └── *.e2e-spec.ts
├── .env.example
└── package.json
```

## 学習要素

### BFFパターン
- 複数サービスからのデータ集約（並列リクエスト）
- フロントエンド向けレスポンス整形
- 部分失敗のハンドリング

### 認証・認可の集約
- JWT検証・デコード
- Role確認（粗い粒度）
- 内部ヘッダ（X-User-Id, X-User-Roles）への変換

### エラーハンドリング
- サービス障害時のフォールバック
- タイムアウト処理
- エラーレスポンスの統一

## 主要ユースケース

### 1. データ集約

```
GET /api/dashboard

BFFが内部で:
  → GET task-service/tasks?userId=xxx
  → GET user-service/users/xxx

レスポンス:
{
  user: { name, email },
  tasks: [ ... ],
  summary: { total: 10, completed: 3 }  ← BFFで算出
}
```

### 2. 部分失敗のハンドリング

```
user-serviceがダウンしている場合:
{
  user: null,
  tasks: [ ... ],
  _errors: ["user-service unavailable"]
}
```

### 3. 認証フロー

```
Angular → BFF: GET /api/tasks (Authorization: Bearer <JWT>)
BFF: JWT検証・デコード
BFF → task-service: GET /tasks (X-User-Id: xxx, X-User-Roles: MEMBER)
```

## 環境変数（予定）

```env
TASK_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
JWT_SECRET=your-secret-key
```
