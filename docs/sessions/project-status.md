# プロジェクト状況

セッション間で引き継ぐプロジェクト状況を記録します。

## 現在のPhase

- **Phase**: Phase 1（task-service実装）雛形完了 → エンティティ実装待ち
- **状況**: task-service雛形作成完了、TypeORM + Oracle接続設定完了
- **次のステップ**: エンティティ実装（TDDサイクル）

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

## 次回セッション推奨事項

### 優先度1: エンティティ実装（TDDサイクル）

1. **Projectエンティティ**
   - `docs/design/task-service-entities.md` 参照
   - テスト作成 → 実装 → リファクタリング

2. **Taskエンティティ**
   - Project との1:N リレーション

3. **Comment / Tagエンティティ**
   - Task との関連（1:N, N:M）

### 優先度2: API実装

- Project CRUD → Task CRUD → Comment CRUD → Tag CRUD
- `docs/design/task-service-api.md` 参照

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

- 作業順序: ~~Rules/Skills~~ → ~~DevContainer~~ → ~~設計~~ → ~~TDD準備~~ → ~~雛形作成~~ → **エンティティ実装**
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
