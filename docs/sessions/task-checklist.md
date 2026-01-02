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

### user-service
- [ ] user-service雛形作成（nest new）
- [ ] TypeORM + Oracle接続設定
- [ ] 認証系パッケージ（@nestjs/passport, @nestjs/jwt, passport-jwt, bcrypt）
- [ ] database/init/02_create_user_schema.sql（USER_DB / USER_DB_TEST）

### api-gateway
- [ ] api-gateway雛形作成（nest new）
- [ ] サービス間通信パッケージ（@nestjs/axios）

### Angular
- [ ] Angular CLI インストール
- [ ] Angular雛形作成（ng new）

### 環境構築手順書
- [ ] 全サービス雛形完了後に作成

---

## Phase 1: task-service（TDDサイクルで実装）

### エンティティ実装
- [ ] Project エンティティ
- [ ] Task エンティティ
- [ ] Comment エンティティ
- [ ] Tag エンティティ（多対多）

### API実装
- [ ] Project CRUD
- [ ] Task CRUD
- [ ] Comment CRUD
- [ ] Tag CRUD

### テスト
- [ ] Service層ユニットテスト
- [ ] API E2Eテスト

---

## Phase 2: user-service

### 環境構築
- [ ] user-service雛形作成

### エンティティ実装
- [ ] User エンティティ
- [ ] UserProfile エンティティ
- [ ] Role エンティティ（多対多）

### 認証・認可
- [ ] JWT認証実装
- [ ] RBACガード実装

---

## Phase 3: api-gateway (BFF)

- [ ] api-gateway雛形作成
- [ ] サービス間通信実装
- [ ] データ集約エンドポイント
- [ ] 部分失敗ハンドリング

---

## Phase 4: Angular統合

- [ ] Angular雛形作成
- [ ] 認証画面
- [ ] タスク管理画面
