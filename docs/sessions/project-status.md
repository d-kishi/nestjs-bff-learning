# プロジェクト状況

セッション間で引き継ぐプロジェクト状況を記録します。

## 現在のPhase

- **Phase**: Phase 3 設計完了 → 実装準備中
- **状況**: **api-gateway設計ドキュメント完成**
- **次のステップ**: Phase 3 api-gateway（BFF）TDD実装開始

## Phase 1 実装進捗

| エンティティ | 状況 | テスト数 |
|-------------|------|---------|
| 共通基盤 | ✅ 完了 | 35 |
| Project | ✅ 完了 | 25 |
| Task | ✅ 完了 | 35 |
| Comment | ✅ 完了 | 23 |
| Tag | ✅ 完了 | 37 |
| **合計** | | **155** |

## Phase 2 実装進捗

| カテゴリ | 状況 | テスト数 |
|---------|------|---------|
| 共通基盤（Filter, Interceptor, Decorator, Guard） | ✅ 完了 | 45 |
| AuthService | ✅ 完了 | 13 |
| UserService | ✅ 完了 | 24 |
| RoleService | ✅ 完了 | 13 |
| **合計** | | **95** |

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
- [x] **共通基盤整備**（ExceptionFilter, ResponseInterceptor, カスタムデコレータ）
- [x] **Project エンティティ実装**（Entity, DTO, Repository, Service, Controller）
- [x] **Task エンティティ実装**（Entity, DTO, Repository, Service, Controller）
- [x] **Comment エンティティ実装**（Entity, DTO, Repository, Service, Controller）
- [x] **Tag エンティティ実装**（M:Nリレーション、Entity, DTO, Repository, Service, Controller）
- [x] **CodeRabbitレビュー・修正**（6件の指摘対応）
- [x] **user-serviceエンティティ詳細設計**（`docs/design/user-service-entities.md`）
- [x] **user-service API設計**（`docs/design/user-service-api.md`）
- [x] **ユーザーストーリー作成**（US008〜US012）
- [x] **Phase 2 user-service TDD実装完了**（95テスト パス）
- [x] **api-gateway API設計**（`docs/design/api-gateway-api.md`）
- [x] **api-gateway 型定義設計**（`docs/design/api-gateway-types.md`）
- [x] **ユーザーストーリー作成**（US013〜US014）

## 次回セッション推奨事項

### Phase 3実装: api-gateway（BFF）TDD実装

#### 読み込み推奨ファイル
- `docs/design/api-gateway-api.md` （BFF API設計）
- `docs/design/api-gateway-types.md` （BFF型定義設計）
- `docs/user-stories/US013_BFF認証.md` （認証ユーザーストーリー）
- `docs/user-stories/US014_BFFデータ集約.md` （データ集約ユーザーストーリー）

#### 実装ステップ（推奨順序）
1. **共通基盤**: JwtAuthGuard, RolesGuard, デコレータ
2. **サービスクライアント**: TaskServiceClient, UserServiceClient
3. **Auth Proxy**: /api/auth/* エンドポイント
4. **Projects/Tasks Proxy**: /api/projects/*, /api/tasks/*
5. **Comments/Tags Proxy**: /api/comments/*, /api/tags/*
6. **Users/Roles Proxy**: /api/users/*, /api/roles/*
7. **Dashboard**: データ集約エンドポイント

#### 追加パッケージ
```bash
npm install @nestjs/passport passport passport-jwt @nestjs/jwt
npm install -D @types/passport-jwt
```

#### 環境
- api-gateway: ポート3000
- task-service: ポート3001
- user-service: ポート3002

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
| `docs/design/task-service-entities.md` | task-service エンティティ詳細設計 |
| `docs/design/task-service-api.md` | task-service API設計 |
| `docs/design/user-service-entities.md` | user-service エンティティ詳細設計 |
| `docs/design/user-service-api.md` | user-service API設計 |
| `docs/design/api-gateway-api.md` | api-gateway（BFF）API設計 |
| `docs/design/api-gateway-types.md` | api-gateway（BFF）型定義設計 |

## ユーザーストーリー一覧

### task-service（US001〜US007）

| ID | タイトル | 概要 |
|----|---------|------|
| US001 | プロジェクト作成 | プロジェクトの新規作成 |
| US002 | プロジェクト一覧取得 | ページネーション・フィルタリング |
| US003 | タスク作成 | プロジェクト内にタスク作成 |
| US004 | タスク一覧取得 | 条件検索・フィルタリング |
| US005 | タスクステータス更新 | ステータス変更・項目更新 |
| US006 | コメント投稿 | タスクへのコメント管理 |
| US007 | タグ管理 | タグのCRUD・タスクへの付与 |

### user-service（US008〜US012）

| ID | タイトル | 概要 |
|----|---------|------|
| US008 | ユーザー登録 | メール・パスワードでの新規登録 |
| US009 | ログイン | JWT発行・認証 |
| US010 | プロフィール更新 | 表示名・アバター等の更新 |
| US011 | パスワード変更 | 本人によるパスワード変更 |
| US012 | ユーザー管理 | ADMIN向けユーザー管理機能 |

### api-gateway（US013〜US014）

| ID | タイトル | 概要 |
|----|---------|------|
| US013 | BFF認証 | JWT検証・ヘッダ伝播・認証フロー |
| US014 | BFFデータ集約 | ダッシュボード・部分失敗ハンドリング |
