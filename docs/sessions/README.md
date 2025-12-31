# docs/sessions/

セッション管理・作業記録を格納するディレクトリです。

## 構成

```
sessions/
├── daily/                    # 日次セッション記録
│   └── YYYY-MM-DD.md
├── project-status.md         # プロジェクト状況（セッション間で引き継ぐ情報）
└── task-checklist.md         # タスクチェックリスト
```

## 用途

| ファイル | 役割 | 更新タイミング |
|---------|------|---------------|
| daily/YYYY-MM-DD.md | 日次の作業記録 | セッション終了時 |
| project-status.md | Phase進捗、次回予定、重要制約 | 変更時 |
| task-checklist.md | 中長期タスクの管理 | 変更時 |

## 関連Command

- `/session-start` - セッション開始時の初期化プロセス
- `/session-end` - セッション終了時の記録プロセス
