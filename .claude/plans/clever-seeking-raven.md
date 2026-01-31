# GitHub Issue #4: Claude Code WSL環境移行 - 実行計画

## 概要

Windows環境からWSL環境へClaude Codeを移行する。
**作業者**: ユーザー（私は手順案内・状況管理を担当）

## 設定情報

| 項目 | 値 |
|------|-----|
| WSLユーザー名 | ka837 |
| WSLホームディレクトリ | /home/ka837 |
| プロジェクトパス | /mnt/c/Develop/nestjs-bff-learning |
| Windows設定パス | /mnt/c/Users/ka837/.claude |

---

## Phase 0: WSL既存環境のクリーンアップ（追加）

**目的**: 既存のnpmインストール済みClaude Codeをアンインストール

```bash
# WSL内で実行

# 1. グローバルインストールの確認
npm list -g @anthropic-ai/claude-code

# 2. アンインストール
npm uninstall -g @anthropic-ai/claude-code

# 3. 削除確認
which claude  # 何も表示されないことを確認
claude --version  # command not found になること

# 4. 既存の設定ディレクトリがあれば確認（バックアップ検討）
ls -la ~/.claude/
```

---

## Phase 1: WSL環境の準備

```bash
# 1. WSL2確認
wsl -l -v
# VERSION が 2 であること

# 2. Docker Desktop設定確認（Settings → Resources → WSL Integration）
# Ubuntu ディストリビューションが有効であること
```

---

## Phase 2: Claude Codeネイティブインストール

```bash
# WSL内で実行

# 1. ネイティブインストール
curl -fsSL https://claude.ai/install.sh | bash

# 2. インストール確認
claude --version
claude doctor

# 3. 認証
claude auth
```

---

## Phase 3: ユーザー設定の移行

```bash
# Windows側設定のパス
WIN_CLAUDE="/mnt/c/Users/ka837/.claude"

# 1. 設定ファイルのコピー
cp "$WIN_CLAUDE/settings.json" ~/.claude/
cp "$WIN_CLAUDE/statusline.js" ~/.claude/
cp -r "$WIN_CLAUDE/plugins" ~/.claude/
cp -r "$WIN_CLAUDE/projects" ~/.claude/

# 2. dos2unix インストール（必要な場合）
sudo apt install dos2unix

# 3. 改行コード変換
dos2unix ~/.claude/statusline.js
dos2unix ~/.claude/settings.json

# 4. 実行権限付与
chmod +x ~/.claude/statusline.js
```

---

## Phase 4: 設定の調整

```bash
# 1. settings.json のパス修正
# C:/Users/ka837/.claude → /home/ka837/.claude
sed -i 's|C:/Users/ka837/.claude|/home/ka837/.claude|g' ~/.claude/settings.json

# 2. 設定確認
cat ~/.claude/settings.json
```

---

## Phase 5: プロジェクトへのアクセス確認

```bash
# /mnt/c/ 経由で既存プロジェクトにアクセス
cd /mnt/c/Develop/nestjs-bff-learning

# 確認
ls -la
git status
```

---

## Phase 6: 動作確認

```bash
# 1. Claude Code 起動
claude

# 2. プラグイン確認
claude plugin list

# 3. ステータスライン・日本語設定確認

# 4. インストール状態確認
claude doctor
```

---

## 進捗チェックリスト

| Phase | タスク | 状態 |
|-------|--------|------|
| 0 | npm版アンインストール | ⬜ |
| 1 | WSL2環境確認 | ⬜ |
| 2 | ネイティブインストール | ⬜ |
| 2 | 認証（claude auth） | ⬜ |
| 3 | 設定ファイルコピー | ⬜ |
| 3 | 改行コード変換 | ⬜ |
| 4 | パス修正 | ⬜ |
| 5 | /mnt/c/Develop/... アクセス確認 | ⬜ |
| 6 | 動作確認 | ⬜ |

---

## 問題発生時の代替手順（Phase 4.5）

プラグイン移行で問題がある場合：

```bash
# プラグイン再インストール
claude plugin install anthropic-agent-skills
claude plugin install claude-plugins-official

# プラグイン有効化
claude plugin enable example-skills@anthropic-agent-skills
claude plugin enable document-skills@anthropic-agent-skills
claude plugin enable commit-commands@claude-plugins-official
claude plugin enable typescript-lsp@claude-plugins-official
claude plugin enable csharp-lsp@claude-plugins-official
```
