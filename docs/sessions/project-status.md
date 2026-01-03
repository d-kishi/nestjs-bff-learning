# プロジェクト状況

セッション間で引き継ぐプロジェクト状況を記録します。

## 現在のPhase

- **Phase**: Phase 3 完了 → Phase 4 準備中
- **状況**: **api-gateway（BFF）TDD実装完了**
- **次のステップ**: Phase 4 Angular統合（設計・実装）

## 全テスト状況

| サービス | テスト数 | 状況 |
|---------|---------|------|
| task-service | 155 | ✅ パス |
| user-service | 95 | ✅ パス |
| api-gateway | 166 | ✅ パス |
| **合計** | **416** | |

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

- [x] Phase 3 api-gateway TDD実装完了（166テスト）
- [x] CodeRabbitレビュー対応（10件の指摘修正）
- [x] ESLint/Prettier修正（BFF Proxyパターン対応）
- [x] Oracle Boolean型対応（RefreshToken.isRevoked, User.isActive）
- [x] USER_DB / USER_DB_TEST スキーマ作成

## 次回セッション推奨事項

### Phase 4: Angular統合

#### 設計作業（優先）
1. Angular画面設計
2. 認証フロー設計（JWT保存・Interceptor）
3. コンポーネント構成設計

#### 実装ステップ（推奨順序）
1. **認証UI**: ログイン、ユーザー登録画面
2. **共通機能**: AuthGuard、HTTP Interceptor（JWT付与）
3. **ダッシュボード**: api-gateway /dashboard呼び出し
4. **タスク管理**: プロジェクト一覧、タスク一覧・詳細

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

## メモ・申し送り

- Phase 4ではAngular Standalone Componentを使用（Angular 17+）
- 認証フローはJWT（Access Token + Refresh Token）
- BFF経由でバックエンドサービスと通信
