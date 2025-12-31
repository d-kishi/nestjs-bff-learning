# database/

データベース関連のファイルを格納するディレクトリです。

## 構成

```
database/
└── init/    # スキーマ初期化SQL
```

## データベース構成

Oracle Database XE (21c) を使用し、同一インスタンス内で別スキーマとして分離します。

| スキーマ | 用途 | 使用サービス |
|---------|------|-------------|
| TASK_DB | タスク管理データ | task-service |
| USER_DB | ユーザー・認証データ | user-service |
| TASK_DB_TEST | テスト用 | task-service（テスト時） |
| USER_DB_TEST | テスト用 | user-service（テスト時） |

## マイグレーション戦略

| 環境 | synchronize | マイグレーション |
|------|-------------|-----------------|
| 開発（DevContainer） | true | 使用しない |
| 本番想定 | false | 使用する |

開発段階では `synchronize: true` でスキーマを自動同期し、マイグレーション管理の学習コストを省きます。
