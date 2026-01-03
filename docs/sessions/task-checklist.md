# タスクチェックリスト

中長期的なタスクを管理します。セッション単位のTodoWriteとは別に、Phase単位・プロジェクト単位のタスクを記録。

## Phase 0: 初期セットアップ ✅ 完了

- [x] README.md / CLAUDE.md作成
- [x] ディレクトリ構造作成
- [x] package.json（npm workspaces）
- [x] 各ディレクトリREADME.md
- [x] セッション管理Command
- [x] ADRファイル

---

## 次回タスク（Phase 1準備）

### Rules/Skills作成
- [ ] CLAUDE.mdからRulesに移動（アーキテクチャ設計、APIレスポンスフォーマット）→ **後日検討**
- [x] AskUserQuestion使用ルール追加 → CLAUDE.mdに追記済み

### 開発環境セットアップ
- [x] Docker Desktop採用決定（ADR-0005）
- [x] Docker Desktopインストール・WSL2統合
- [x] Oracle Container Registryログイン（Auth Token方式）
- [x] Oracle XEイメージpull確認

### DevContainer設定
- [x] devcontainer.json作成
- [x] docker-compose.yml作成
- [x] Dockerfile作成
- [x] DevContainer起動確認

### Phase 1設計作業 ✅ 完了
- [x] task-serviceエンティティ詳細設計 → `docs/design/task-service-entities.md`
- [x] task-service API設計 → `docs/design/task-service-api.md`
- [x] ユーザーストーリー作成 → `docs/user-stories/US001〜US007`

### TDD準備 ✅ 完了
- [x] TDD Skills作成（Red-Green-Refactorワークフロー定義）→ `.claude/skills/tdd/SKILL.md`
- [x] Forced Eval Hook導入（Issue #9716回避策）→ `.claude/hooks/`

---

## 環境構築フェーズ（全サービス雛形作成）

### task-service ✅ 完了
- [x] Oracle XE接続確認（A5M2直接接続 + IPv6）
- [x] task-service雛形作成（nest new）
- [x] TypeORM + Oracle接続設定
- [x] database/init/01_create_task_schema.sql（TASK_DB / TASK_DB_TEST）
- [x] 共通レスポンス型作成（ApiResponse, PaginatedResponse, ErrorResponse）

### user-service ✅ 完了
- [x] user-service雛形作成（nest new）
- [x] TypeORM + Oracle接続設定
- [x] 認証系パッケージ（@nestjs/passport, @nestjs/jwt, passport-jwt, bcrypt）
- [x] database/init/02_create_user_schema.sql（USER_DB / USER_DB_TEST）

### api-gateway ✅ 完了
- [x] api-gateway雛形作成（nest new）
- [x] サービス間通信パッケージ（@nestjs/axios）

### Angular ✅ 完了
- [x] Angular CLI インストール
- [x] Angular雛形作成（ng new --standalone）

### DevContainer設定更新 ✅ 完了
- [x] docker-compose.yml環境変数追加
- [x] devcontainer.jsonポート・拡張機能追加
- [x] 全設定ファイルに日本語コメント追加（Docker学習用）

### 環境構築手順書 ✅ 完了
- [x] docs/environment-setup/README.md作成

---

## Phase 1: task-service（TDDサイクルで実装）

### 共通基盤 ✅ 完了
- [x] ExceptionFilter（統一エラーレスポンス）
- [x] ResponseInterceptor（統一成功レスポンス）
- [x] カスタムデコレータ（X-User-Id/X-User-Roles取得）
- [x] 共通DTO（PaginationQueryDto）
- [x] ビジネス例外クラス

### エンティティ実装
- [x] Project エンティティ（Entity, DTO, Repository, Service, Controller）✅
- [x] Task エンティティ（Entity, DTO, Repository, Service, Controller）✅
- [x] Comment エンティティ（Entity, DTO, Repository, Service, Controller）✅
- [x] Tag エンティティ（多対多、Entity, DTO, Repository, Service, Controller）✅

### テスト状況
- [x] Project: 25テスト
- [x] Task: 35テスト
- [x] 共通基盤: 35テスト
- [x] Comment: 23テスト
- [x] Tag: 37テスト

**合計: 155テスト パス**

### CodeRabbitレビュー ✅ 完了
- [x] CodeRabbit CLIインストール・認証
- [x] レビュー実行・6件の指摘修正
- [x] ESLint/Prettier修正

---

## Phase 2: user-service ✅ 完了

### 設計 ✅ 完了
- [x] user-serviceエンティティ詳細設計 → `docs/design/user-service-entities.md`
- [x] user-service API設計 → `docs/design/user-service-api.md`
- [x] ユーザーストーリー作成 → `docs/user-stories/US008〜US012`

### 共通基盤（task-serviceから移植）✅ 完了
- [x] ExceptionFilter（統一エラーレスポンス）
- [x] ResponseInterceptor（統一成功レスポンス）
- [x] カスタムデコレータ（X-User-Id/X-User-Roles取得）
- [x] 共通DTO（PaginationQueryDto）
- [x] ビジネス例外クラス（USER_*エラーコード）

### エンティティ実装 ✅ 完了
- [x] User エンティティ（bcryptパスワードハッシュ）
- [x] UserProfile エンティティ（1:1リレーション）
- [x] Role エンティティ（N:Mリレーション）
- [x] RefreshToken エンティティ

### 認証・認可 ✅ 完了
- [x] Auth Service（register, login, refresh, logout, me）
- [x] JWT設定（Access Token: 900秒、Refresh Token: 7日）
- [x] RolesGuard実装
- [x] シードデータ（ADMIN, MEMBER ロール）

### Users/Roles API ✅ 完了
- [x] Users Controller（一覧、詳細、プロフィール更新、パスワード変更、ロール更新、ステータス更新、削除）
- [x] Roles Controller（一覧、詳細、作成、更新、削除）

### テスト ✅ 完了（95テスト パス）
- [x] 共通基盤テスト（Filter, Interceptor, Decorator, Guard）: 45テスト
- [x] AuthService テスト: 13テスト
- [x] UserService テスト: 24テスト
- [x] RoleService テスト: 13テスト

---

## Phase 3: api-gateway (BFF) ✅ 完了

### 設計 ✅ 完了
- [x] api-gateway雛形作成（環境構築フェーズで完了）
- [x] api-gateway API設計 → `docs/design/api-gateway-api.md`
- [x] api-gateway 型定義設計 → `docs/design/api-gateway-types.md`
- [x] ユーザーストーリー作成 → `docs/user-stories/US013, US014`

### 実装（TDD）✅ 完了
- [x] 共通基盤（JwtAuthGuard, RolesGuard, デコレータ）
- [x] サービスクライアント（TaskServiceClient, UserServiceClient）
- [x] Auth Proxy（/api/auth/*）
- [x] Projects/Tasks Proxy（/api/projects/*, /api/tasks/*）
- [x] Comments/Tags Proxy
- [x] Users/Roles Proxy
- [x] Dashboard（データ集約、部分失敗ハンドリング）
- [x] E2E Tests（Auth, Dashboard）

### テスト状況
- [x] 共通基盤: 35テスト
- [x] サービスクライアント: 20テスト
- [x] Auth Proxy: 22テスト
- [x] Dashboard: 15テスト
- [x] Proxy Controllers: 54テスト
- [x] E2E: 20テスト

**合計: 166テスト パス**

### CodeRabbitレビュー ✅ 完了
- [x] レビュー実行・10件の指摘修正
- [x] ESLint/Prettier修正（BFF Proxyパターン対応）

---

## Phase 4: Angular統合

### 設計 ✅ 完了
- [x] Angular雛形作成（環境構築フェーズで完了）
- [x] UI設計 → `docs/design/angular-ui-design.md`
- [x] アーキテクチャ設計 → `docs/design/angular-architecture.md`
- [x] ユーザーストーリー作成 → `docs/user-stories/US015〜US020`
- [x] ADR-0006 Playwright E2Eテストは認証フローのみに限定
- [x] Playwright MCP設定（.mcp.json、devcontainer.json更新）

### Step 1: 認証基盤 ✅ 完了
- [x] Vitestテスト環境セットアップ
- [x] 型定義作成（api-response, auth, user）
- [x] AuthService実装（18テスト）
- [x] Interceptor実装（auth: 8テスト, error: 4テスト）
- [x] Guard実装（auth: 3, guest: 2, admin: 3テスト）
- [x] ログイン画面実装（11テスト）
- [x] 設定ファイル更新（app.config, routes, proxy）
- [x] CodeRabbit CLIレビュー完了

**合計: 49テスト パス**

### 実装（次回セッション以降）
- [ ] Step 2: ダッシュボード・共通コンポーネント
- [ ] Step 3: CRUD機能（プロジェクト、タスク、プロフィール）
- [ ] Step 4: ADMIN機能・テーマ適用・E2Eテスト

### Planファイル

次回セッションでは以下のPlanファイルを再利用:
```
C:\Users\ka837\.claude\plans\witty-nibbling-dewdrop.md
```
