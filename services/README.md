# services/

バックエンドサービス群を格納するディレクトリです。

## 構成

```
services/
├── task-service/    # タスク管理サービス
├── user-service/    # ユーザー・認証サービス
└── api-gateway/     # BFF（Backend for Frontend）
```

## 各サービスの役割

| サービス | 役割 | ポート（予定） |
|---------|------|---------------|
| task-service | タスク・プロジェクト管理 | 3001 |
| user-service | ユーザー管理・JWT発行 | 3002 |
| api-gateway | フロントエンド向けAPI集約 | 3000 |

## アーキテクチャ

```
┌──────────────┐
│  api-gateway │ ← フロントエンドからの唯一の窓口
└──────┬───────┘
       │ HTTP（内部通信）
  ┌────┴────┐
  │         │
┌─▼───┐ ┌───▼──┐
│task │ │user  │
│svc  │ │svc   │
└─────┘ └──────┘
```

## サービス間通信

- **外部 → api-gateway**: JWT認証（Authorization: Bearer）
- **api-gateway → 各サービス**: 内部ヘッダ（X-User-Id, X-User-Roles）

## 開発順序

1. **Phase 1**: task-service（NestJS基礎 + TypeORM + Jest）
2. **Phase 2**: user-service（認証・認可）
3. **Phase 3**: api-gateway（BFFパターン）
