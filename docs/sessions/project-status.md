# プロジェクト状況

セッション間で引き継ぐプロジェクト状況を記録します。

## 現在のPhase

- **Phase**: Phase 1 - task-service実装（TDDサイクル）
- **状況**: 環境構築完了、実装フェーズ開始待ち
- **次のステップ**: Project → Task → Comment → Tag の順でTDD実装

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
- [x] **task-serviceエンティティ詳細設計**（`docs/design/task-service-entities.md`）
- [x] **task-service API設計**（`docs/design/task-service-api.md`）
- [x] **ユーザーストーリー作成**（US001〜US007）
- [x] **TDD Skills作成**（`.claude/skills/tdd/SKILL.md`）
- [x] **Forced Eval Hook導入**（Issue #9716回避策）
- [x] **task-service雛形作成**（nest new + TypeORM設定）
- [x] **Oracleスキーマ作成**（TASK_DB / TASK_DB_TEST）
- [x] **共通レスポンス型作成**（ApiResponse, PaginatedResponse, ErrorResponse）
- [x] **user-service雛形作成**（nest new + 認証系パッケージ）
- [x] **api-gateway雛形作成**（nest new + HTTPクライアント）
- [x] **Angular雛形作成**（ng new --standalone）
- [x] **USER_DB/USER_DB_TESTスキーマ作成**
- [x] **DevContainer設定ファイルに日本語コメント追加**（Docker学習用）
- [x] **環境構築手順書作成**（`docs/environment-setup/README.md`）

## 次回セッション推奨事項

### Phase 1: task-service実装（TDDサイクル）

実装順序: **Project → Task → Comment → Tag**

各エンティティごとに以下のサイクルを実施：
1. エンティティ定義（TypeORM Entity）
2. Repository層（DB操作）
3. Service層（ビジネスロジック）
4. Controller層（HTTP API）
5. ユニットテスト + E2Eテスト

### 読み込み推奨ファイル
- `docs/design/task-service-entities.md` - エンティティ詳細設計
- `docs/design/task-service-api.md` - API設計
- `docs/user-stories/US001〜US007` - ユーザーストーリー（テストシナリオ含む）

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

## DB接続情報（A5M2用）

| 項目 | 値 |
|------|-----|
| 接続方式 | **直接接続（OCI不使用）+ IPv6有効** |
| サーバー名 | `localhost:1521/XEPDB1` |
| ユーザーID | `TASK_DB` |
| パスワード | `task_password` |

**注意**: Docker Desktop + WSL2環境ではIPv4ポートフォワーディングが不安定なため、IPv6を使用。

## メモ・申し送り

- 作業順序: ~~Rules/Skills~~ → ~~DevContainer~~ → ~~設計~~ → ~~TDD準備~~ → ~~task-service雛形~~ → **全サービス雛形** → **環境構築手順書** → 実装
- CLAUDE.md/README.mdで十分カバーできる設計判断はADRファイル化不要という方針を採用
- Oracle Container Registry認証手順は `docs/sessions/daily/2025-12-31.md` に詳細記載（技術記事化予定）
- Debian TrixieではlibaioパッケージがlibaioXt64にリネームされている点に注意
- OCI接続（Instant Client使用）はIPv4問題により非推奨、直接接続を使用

## Forced Eval Hook情報

Issue #9716（Skills自動発動問題）の回避策として導入済み。

| 項目 | 内容 |
|------|------|
| Hook種別 | UserPromptSubmit |
| 設定ファイル | `.claude/settings.local.json` |
| トリガー定義 | `.claude/hooks/skills-triggers.json`（自動生成） |
| 有効/無効切替 | `.claude/hooks/config.json` の `skillsEvalEnabled` |

### 新規Skills追加時の手順
1. `.claude/skills/[skill-name]/SKILL.md`を作成
2. descriptionに「」付きキーワードを記載
3. `.claude/hooks`で`npm run build`を実行

## 設計ドキュメント一覧

| ファイル | 内容 |
|---------|------|
| `docs/design/task-service-entities.md` | エンティティ詳細設計（フィールド・TypeORM設定） |
| `docs/design/task-service-api.md` | API設計（エンドポイント・DTO・エラーコード） |

## ユーザーストーリー一覧

| ID | タイトル | 概要 |
|----|---------|------|
| US001 | プロジェクト作成 | プロジェクトの新規作成 |
| US002 | プロジェクト一覧取得 | ページネーション・フィルタリング |
| US003 | タスク作成 | プロジェクト内にタスク作成 |
| US004 | タスク一覧取得 | 条件検索・フィルタリング |
| US005 | タスクステータス更新 | ステータス変更・項目更新 |
| US006 | コメント投稿 | タスクへのコメント管理 |
| US007 | タグ管理 | タグのCRUD・タスクへの付与 |
