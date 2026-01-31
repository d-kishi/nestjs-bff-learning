# プロジェクト状況

セッション間で引き継ぐプロジェクト状況を記録します。

## 現在のPhase

- **Phase**: Phase 5 完了 🎉
- **状況**: **プロジェクト完了**
- **次のステップ**: 機能拡張（任意）

## 全テスト状況

| サービス | テスト数 | 状況 |
|---------|---------|------|
| task-service | 155 | ✅ パス |
| user-service | 95 | ✅ パス |
| api-gateway | 166 | ✅ パス |
| angular-app | 358 | ✅ パス |
| E2E (Playwright) | 5 | ✅ パス |
| **合計** | **779** | |

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

- [x] 2026-01-31: Claude Code WSL環境移行（Issue #4完了）
  - npm版Claude Code・Voltaアンインストール
  - ネイティブインストール（WSL）
  - mise導入（Node.jsバージョン管理）
  - 設定ファイル移行・プラグイン再設定
- [x] 2026-01-29: BFFパターン学習資料作成
  - `bff-pattern.md` 新規作成（約600行）
  - サービスクライアント実装パターン
  - 認証ヘッダ伝播（X-User-Id, X-User-Roles）
  - データ集約・Promise.allSettled()
  - 部分失敗ハンドリング
  - BFF固有例外クラス
- [x] 2026-01-26: Claude Code Tasks機能でマルチエージェント実践・学習資料2件作成
  - `CLAUDE_CODE_TASK_LIST_ID` 環境変数でTask共有
  - 2ターミナルで並列作業実施
  - `guards.md` 新規作成（1121行）- JWT認証、ロールベースアクセス制御
  - `typeorm-entity.md` 新規作成（1044行）- リレーション、Cascade、Oracle対応
  - Qiita記事「Claude CodeのTasks機能でマルチエージェント開発を実現する方法」完成
- [x] 2026-01-20: 共通パッケージIssue作成・Filter/Interceptor学習資料改善
  - 共通パッケージ作成Issue（#5）を作成（3サービス間重複コード調査結果）
  - `filter-interceptor.md` をレビュー・改善
    - タイトル変更:「ExceptionFilter と Interceptor」
    - NestJSのFilterはExceptionFilter専用である旨のNote追加
    - Middleware vs Interceptorセクション追加（比較表、コード例、使い分け指針）
    - getNext()注釈、Controllerメソッド表現修正
- [x] 2026-01-19: NestJS学習・Filter/Interceptor詳解
  - `filter-interceptor.md` を新規作成
  - リクエストライフサイクル全体像（Middleware→Guard→Interceptor→Pipe→Controller→Filter）
  - ExceptionFilter（@Catch、ArgumentsHost、組み込み例外クラス、適用スコープ）
  - Interceptor（ExecutionContext、CallHandler、RxJSオペレータとの連携）
  - Filter vs Interceptorの使い分け
  - 本プロジェクトでの実装例（HttpExceptionFilter、ResponseInterceptor）
- [x] 2026-01-19: NestJS学習・DTOバリデーション詳解
  - `dto-validation.md` を新規作成
  - デコレータの共通オプション（message, each, groups等）
  - 基本デコレータ詳細（文字列系、数値系、日付系、配列・列挙型）
  - 型変換（class-transformer、@Type()デコレータ）
  - 条件付きバリデーション（@ValidateIf()）
  - ネストオブジェクトのバリデーション（@ValidateNested()）
  - カスタムバリデータ（registerDecorator, @ValidatorConstraint）
  - クラスレベルバリデーション
  - バリデーショングループ
  - 実プロジェクトでの実装例と参照
  - 日付バリデーション応用編（@MinDate/@MaxDateとタイムゾーン）
  - null/undefinedポリシーをRulesに追加（`.claude/rules/null-undefined-policy.md`）
- [x] 2026-01-18: NestJS学習・Controllerクラス実装方法
  - `nestjs-decorators.md` → `nestjs-controller.md` にリネーム・拡充
  - Controllerの責務、依存性注入、エラーハンドリング、非同期処理セクション追加
  - ルートパスのパターン、ファイルアップロードセクション追加
  - セクション構成調整、目次追加
  - ralph-loopプラグイン問題解決（Windows非対応、プラグイン無効化）
  - WSL環境移行計画策定（Issue #4作成）
- [x] 2026-01-15: NestJS学習・学習資料作成
  - コード構造と起動フロー解説資料作成
  - ValidationPipe解説資料作成
  - トランザクション管理解説資料作成
  - ProjectServiceにトランザクション実装（学習目的）
- [x] 2026-01-07: 開発環境モダナイゼーション計画策定
  - 案件環境調査（mise/pnpm/Deno + NestJS構成）
  - 移行計画策定（5フェーズ）
  - GitHub Issue #2 作成
  - ralph-wiggum活用計画
- [x] 2026-01-06: VSCodeデバッグ設定・hook問題解決
  - `.vscode/launch.json` 作成（F5デバッグ対応）
  - UserPromptSubmit hook error解決（`.claude/hooks/`ビルド）
  - jqインストール（ralph-wiggum用）
  - ralph-wiggum Windows問題Issue作成（#1）
- [x] 2026-01-04: DevContainer・Angular環境改善
  - devcontainer.jsonに`git config core.autocrlf input`追加（改行コード問題解決）
  - angular.jsonに`host: "0.0.0.0"`追加（外部アクセス対応）
  - 動作確認用テストユーザー作成（admin@example.com / Password123 / ADMIN）
- [x] Phase 5 Step 2: NestJSコマンド資料作成完了
  - README.mdにnpm workspaces/NestJS CLI/Angular CLI対比表を追記
- [x] Phase 5 Step 1: 動作確認・統合テスト完了
  - 4サービス起動確認（task:3001, user:3002, gateway:3000, angular:4200）
  - API疎通確認（ヘルスチェック、認証フロー、CRUD操作）
  - Playwright E2Eテスト5ケース パス
  - Dockerfile更新（Playwright依存パッケージ追加）
- [x] Phase 4 Step 4: ADMIN機能・テーマ・E2Eテスト完了（358テスト）
  - UsersService/UserListComponent/RoleEditDialogComponent
  - RolesService/RoleListComponent/RoleDialogComponent
  - styles.scss テーマシステム（CSS変数）
  - Playwright E2Eテスト（認証フロー5ケース）

## 機能拡張候補（将来）

1. **コメント機能UI** - TaskDialogにコメント一覧・投稿機能追加
2. **タグ管理機能UI** - タグCRUD画面、タスクへのタグ付与

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
- DevContainerリビルド後はOracleスキーマの再作成が必要（database/init/参照）
- ユーザー登録APIは`isActive: true`で作成されるよう修正済み

### 次回セッション優先事項

- [x] NestJS学習（完了）
  - 学習資料は `docs/learning/` 配下に作成
  - 詳細は `docs/sessions/daily/2026-01-19.md` 参照
- [x] Claude Code WSL環境移行（Issue #4完了）
  - miseも導入済み
  - 詳細は `docs/sessions/daily/2026-01-31.md` 参照
- [ ] 開発環境モダナイゼーション（Issue #2）
  - **前提条件**: Issue #4完了 ✅
  - Phase 1: mise導入（DevContainer内）+ ralph-wiggum学習
  - Phase 2: pnpm移行
  - Phase 3: Deno + NestJS設定
  - 詳細は `.claude/plans/peaceful-spinning-haven.md` 参照
- [ ] VSCodeデバッグ設定の動作確認・調整（任意）
  - package.jsonのstart:debugスクリプト（ポート指定）の再設定
  - devcontainer.jsonのデバッグポート（9229-9231）追加
  - 詳細は `docs/sessions/daily/2026-01-06.md` 参照

### 既知の問題

- ralph-wiggumのstop-hook.shがWindows環境でエディタで開かれる（Issue #1、上流修正待ち）
- ~~WSL環境移行が必要（Issue #4）~~ → ✅ 完了（2026-01-31）

### WSL環境情報

| 項目 | 値 |
|------|-----|
| WSLユーザー | ka837 |
| Claude Codeパス | ~/.local/bin/claude |
| 設定ディレクトリ | ~/.claude/ |
| プロジェクトパス | /mnt/c/Develop/nestjs-bff-learning |
| Node.js管理 | mise（~/.local/bin/mise） |
