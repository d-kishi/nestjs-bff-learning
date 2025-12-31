# プロジェクト状況

セッション間で引き継ぐプロジェクト状況を記録します。

## 現在のPhase

- **Phase**: Phase 0（初期セットアップ）完了 → Phase 1準備中
- **状況**: DevContainer環境構築完了、Phase 1設計作業待ち
- **次のPhase**: Phase 1（task-service実装）

## 直近の完了事項

- [x] README.md作成
- [x] CLAUDE.md作成
- [x] ディレクトリ構造作成
- [x] package.json（npm workspaces）作成
- [x] 各ディレクトリのREADME.md作成
- [x] セッション管理Command移植（session-start/session-end）
- [x] ADRファイル作成（6件）
- [x] CLAUDE.mdにCommunication Guidelines追加
- [x] Docker Desktopインストール・WSL2統合
- [x] Oracle Container Registryログイン成功（Auth Token方式）
- [x] Oracle XEイメージpull
- [x] DevContainerファイル作成・起動確認
- [x] コードコメント規約ルール追加（`.claude/rules/code-comments.md`）
- [x] CLAUDE.md実行環境注意書き追加
- [x] Qiita記事素材作成（qiita-tech-blog/drafts/）

## 次回セッション推奨事項

### Phase 1設計作業

1. **task-serviceエンティティ詳細設計**
   - Project, Task, Comment, Tag エンティティ
   - リレーション設計

2. **task-service API設計**
   - CRUD エンドポイント
   - レスポンスフォーマット

3. **ユーザーストーリー作成**
   - Given/When/Then形式

### 読み込み推奨ファイル
- `docs/project-plan.md` - 企画書（Phase 1の詳細）
- `docs/user-stories/README.md` - ユーザーストーリーテンプレート

## 重要な制約・注意点

- Oracle Container Registry認証には**Auth Token**が必要（通常パスワードは不可）
- node-oracledbとInstant Clientのバージョン互換性に注意
- 開発マシン: Intel/AMD (x86_64)
- Rules/Skills移行は後日検討（現時点ではCLAUDE.mdで十分）

## DevContainer環境情報

| 項目 | バージョン/状態 |
|------|----------------|
| Node.js | v20.19.6 |
| npm | 10.8.2 |
| Oracle Instant Client | 23.4 |
| Oracle XE | 21.3.0-xe |
| Oracle接続 | XEPDB1 (port 1521) |

## メモ・申し送り

- 作業順序: ~~Rules/Skills~~ → ~~DevContainer~~ → **設計** → 開発環境構築 → 実装
- CLAUDE.md/README.mdで十分カバーできる設計判断はADRファイル化不要という方針を採用
- Oracle Container Registry認証手順は `docs/sessions/daily/2025-12-31.md` に詳細記載（技術記事化予定）
- Debian TrixieではlibaioパッケージがlibaioXt64にリネームされている点に注意
