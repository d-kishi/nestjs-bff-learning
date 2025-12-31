# task-service

タスク管理を担当するマイクロサービスです。

## 学習フェーズ

**Phase 1** で実装します。

## エンティティ

```
Project ─1:N─ Task ─1:N─ Comment
              │
              └─ N:M ─ Tag（中間テーブル: TaskTag）
```

| エンティティ | 役割 | リレーション |
|-------------|------|-------------|
| Project | タスクのグルーピング | 1対多（親） |
| Task | 主エンティティ | 1対多（子）、多対多 |
| Comment | タスクへのコメント | 1対多（子） |
| Tag | タスクのラベル | 多対多 |

## ディレクトリ構成（予定）

```
task-service/
├── src/
│   ├── project/
│   │   ├── project.controller.ts
│   │   ├── project.service.ts
│   │   ├── project.repository.ts
│   │   ├── project.module.ts
│   │   ├── dto/
│   │   └── entities/
│   ├── task/
│   │   └── ...
│   ├── comment/
│   │   └── ...
│   ├── tag/
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

## 学習要素

### NestJS基礎
- Module / Controller / Service
- DI（Dependency Injection）
- DTO + ValidationPipe
- Exception Filter
- Swagger

### TypeORM
- Entity定義
- 1対多リレーション（Project-Task, Task-Comment）
- 多対多リレーション（Task-Tag）
- カスタムRepository
- Oracle接続

### Jest
- Service層のユニットテスト
- モック・スタブ
- API E2E（supertest）

## データベース

- スキーマ: `TASK_DB`
- テスト用: `TASK_DB_TEST`
