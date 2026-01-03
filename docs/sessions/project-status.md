# プロジェクト状況

セッション間で引き継ぐプロジェクト状況を記録します。

## 現在のPhase

- **Phase**: Phase 4 完了
- **状況**: **Angular統合 全Step完了（358テスト）**
- **次のステップ**: Phase 5 統合テスト・デプロイ準備 または 機能拡張

## 全テスト状況

| サービス | テスト数 | 状況 |
|---------|---------|------|
| task-service | 155 | ✅ パス |
| user-service | 95 | ✅ パス |
| api-gateway | 166 | ✅ パス |
| angular-app | 358 | ✅ パス |
| **合計** | **774** | |

## Phase 1 実装進捗 ✅ 完了

| エンティティ | 状況 | テスト数 |
|-------------|------|---------|
| 共通基盤 | ✅ 完了 | 35 |
| Project | ✅ 完了 | 25 |
| Task | ✅ 完了 | 35 |
| Comment | ✅ 完了 | 23 |
| Tag | ✅ 完了 | 37 |
| **合計** | | **155** |

## Phase 2 実装進捗 ✅ 完了

| カテゴリ | 状況 | テスト数 |
|---------|------|---------|
| 共通基盤（Filter, Interceptor, Decorator, Guard） | ✅ 完了 | 45 |
| AuthService | ✅ 完了 | 13 |
| UserService | ✅ 完了 | 24 |
| RoleService | ✅ 完了 | 13 |
| **合計** | | **95** |

## Phase 3 実装進捗 ✅ 完了

| カテゴリ | 状況 | テスト数 |
|---------|------|---------|
| 共通基盤（Guard, Filter, Interceptor, Decorator） | ✅ 完了 | 35 |
| サービスクライアント（TaskServiceClient, UserServiceClient） | ✅ 完了 | 20 |
| Auth Proxy | ✅ 完了 | 22 |
| Dashboard（データ集約） | ✅ 完了 | 15 |
| Projects/Tasks/Comments/Tags/Users/Roles Proxy | ✅ 完了 | 54 |
| E2E Tests | ✅ 完了 | 20 |
| **合計** | | **166** |

## 直近の完了事項

- [x] Phase 4 Step 4: ADMIN機能・テーマ・E2Eテスト完了（358テスト）
  - UsersService/UserListComponent/RoleEditDialogComponent
  - RolesService/RoleListComponent/RoleDialogComponent
  - styles.scss テーマシステム（CSS変数）
  - Playwright E2Eテスト（認証フロー5ケース）
- [x] Phase 4 Step 3: CRUD機能完了（265テスト）
  - Projects/Tasks/Profile 各コンポーネント
- [x] Phase 4 Step 2: ダッシュボード・共通コンポーネント完了（148テスト）
- [x] Phase 4 Step 1: 認証基盤実装完了（49テスト）

## 次回セッション推奨事項

### Phase 5 候補: 統合テスト・デプロイ準備

1. **全サービス結合テスト**
   - Angular ↔ api-gateway ↔ task-service/user-service
   - Playwright E2Eテスト実行

2. **Docker Compose本番設定**
   - 本番用docker-compose.prod.yml
   - 環境変数管理

3. **CI/CD設定**
   - GitHub Actions
   - CodeRabbit GitHub App連携

### 機能拡張候補

1. **コメント機能UI** - TaskDialogにコメント一覧・投稿機能追加
2. **タグ管理機能UI** - タグCRUD画面、タスクへのタグ付与
3. **通知機能** - タスク期限通知

#### ポート構成
- Angular: 4200
- api-gateway: 3000
- task-service: 3001
- user-service: 3002

## 重要な制約・注意点

- Oracle Boolean型は`type: 'number', width: 1`とtransformerで対応
- BFF Proxyパターンでは`any`型を許容（ESLint unsafe-*ルール緩和）
- 本番環境ではJWT_SECRET環境変数必須

## DevContainer環境情報

| 項目 | バージョン/状態 |
|------|----------------|
| Node.js | v20.19.6 |
| npm | 10.8.2 |
| Oracle Instant Client | 23.4 |
| Oracle XE | 21.3.0-xe |
| Oracle接続 | XEPDB1 (port 1521) |

## DB接続情報

| スキーマ | ユーザー | パスワード | 用途 |
|---------|---------|-----------|------|
| TASK_DB | TASK_DB | task_password | task-service本番 |
| TASK_DB_TEST | TASK_DB_TEST | task_test_password | task-serviceテスト |
| USER_DB | USER_DB | user_password | user-service本番 |
| USER_DB_TEST | USER_DB_TEST | user_test_password | user-serviceテスト |
| - | SYSTEM | password | 管理者 |

**接続方式**: 直接接続（OCI不使用）+ IPv6有効
**サーバー名**: `localhost:1521/XEPDB1`

## 設計ドキュメント一覧

| ファイル | 内容 |
|---------|------|
| `docs/design/task-service-entities.md` | task-service エンティティ詳細設計 |
| `docs/design/task-service-api.md` | task-service API設計 |
| `docs/design/user-service-entities.md` | user-service エンティティ詳細設計 |
| `docs/design/user-service-api.md` | user-service API設計 |
| `docs/design/api-gateway-api.md` | api-gateway（BFF）API設計 |
| `docs/design/api-gateway-types.md` | api-gateway（BFF）型定義設計 |
| `docs/design/angular-ui-design.md` | Angular UI設計（7画面、ワイヤーフレーム） |
| `docs/design/angular-architecture.md` | Angular アーキテクチャ設計（認証フロー、E2E） |

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

### Angular（US015〜US020）

| ID | タイトル | 概要 |
|----|---------|------|
| US015 | Angularログイン | ログイン・新規登録画面 |
| US016 | ダッシュボード表示 | サマリー・直近タスク表示 |
| US017 | プロジェクト管理 | プロジェクトCRUD |
| US018 | タスク管理 | タスクCRUD・フィルター・ソート |
| US019 | プロフィール管理 | プロフィール編集・パスワード変更 |
| US020 | ADMIN機能 | ユーザー管理・ロール管理 |

## メモ・申し送り

- Phase 4ではAngular Standalone Componentを使用（Angular 17+）
- 認証フローはJWT（Access Token + Refresh Token）
- BFF経由でバックエンドサービスと通信
