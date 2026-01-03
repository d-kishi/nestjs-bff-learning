---
name: coderabbit-review
description: CodeRabbit CLIでAIコードレビューを実行。「レビュー」「coderabbit」「CodeRabbit」「コードレビュー」時に使用。必ず--prompt-onlyオプションを使用すること。
---

# CodeRabbit Review

## 実行コマンド（DevContainer環境）

### 1. dbusセッション情報を取得

```bash
MSYS_NO_PATHCONV=1 docker exec -u node <container> bash -c "cat /home/node/.dbus/session-bus/*"
```

出力からDBUS_SESSION_BUS_ADDRESSを取得。

### 2. レビュー実行

```bash
MSYS_NO_PATHCONV=1 docker exec -u node <container> bash -c "
export DBUS_SESSION_BUS_ADDRESS='unix:path=/tmp/dbus-xxx' &&
export GNOME_KEYRING_CONTROL=/tmp/user/1000/keyring &&
cd /workspace &&
/home/node/.local/bin/coderabbit review --prompt-only --type uncommitted"
```

**重要**: `MSYS_NO_PATHCONV=1`はWindowsホストでのパス変換を防止。

## オプション

| オプション | 用途 | 使用可否 |
|-----------|------|---------|
| `--prompt-only` | AI向け簡潔出力 | **必須** |
| `--plain` | 人間向け詳細出力 | **禁止** |
| `--type uncommitted` | 未コミット変更 | 推奨 |

## レビュー対応フロー

1. コマンド実行（バックグラウンド推奨）
2. 指摘事項を確認
3. 修正実施
4. テスト実行で回帰確認
5. 必要に応じて再レビュー

## 認証（VSCodeターミナルで実施）

```bash
coderabbit auth login
```

ブラウザでログイン後、トークンをターミナルに貼り付け。
