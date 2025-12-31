# NestJS + BFF 学習プロジェクト 企画書

## プロジェクト概要

| 項目 | 内容 |
|------|------|
| プロジェクト名 | nestjs-bff-learning |
| リポジトリ | https://github.com/[username]/nestjs-bff-learning |

### 背景・目的

Node.js（NestJS）によるマイクロサービスAPI開発案件に向けた事前学習プロジェクト。
以下のスキル習得を目的とする：

- NestJSによるAPI構築
- JestによるUnit Test
- BFFパターンによるサービス集約

### 学習者のバックグラウンド

- C# MVC + Angular（.NET Framework 4.8 / C# 7.3）での開発経験あり
- Angular経験：のべ3年（SSR本格導入前まで）
- Node.js：未経験
- Jest：未経験

---

## 技術スタック

| レイヤー | 技術 | 備考 |
|---------|------|------|
| Frontend | Angular 17+ | Standalone Component推奨。学習の主役ではないため最小限 |
| BFF | NestJS | REST API。GraphQLは採用しない |
| Backend Services | NestJS + TypeORM | 各サービス独立したNestJSアプリケーション |
| Database | Oracle Database XE (21c) | 業務で使用するため。同一インスタンス・別スキーマ構成 |
| 認証 | Passport + JWT | `@nestjs/passport`, `@nestjs/jwt`, bcrypt |
| Test | Jest + supertest | Unit Test + API E2E（統合テスト） |
| API Documentation | Swagger | `@nestjs/swagger` を使用 |
| 開発環境 | DevContainer | Docker Compose構成 |

---

## アーキテクチャ方針

### 全体構成

```
┌─────────────┐
│   Angular   │
│  (Frontend) │
└──────┬──────┘
       │ HTTP (外部向けAPI)
┌──────▼──────┐
│     BFF     │  ← フロントエンド専用の窓口
│ (api-gateway)│
└──────┬──────┘
       │ HTTP (内部通信)
  ┌────┴────┐
  │         │
┌─▼───┐ ┌───▼──┐
│Task │ │User  │  ← 各サービスは独立したNestJSアプリ
│Svc  │ │Svc   │
└──┬──┘ └──┬───┘
   │       │
   └───┬───┘
   ┌───▼───┐
   │Oracle │
   │  XE   │
   │───────│
   │TASK_DB│ ← 別スキーマ
   │USER_DB│ ← 別スキーマ
   └───────┘
```

### NestJS アーキテクチャ方針

**クリーンアーキテクチャは採用しない。NestJS標準構成 + 意識的な設計とする。**

理由：
- NestJS自体がController / Service / Repository の層構造を強制する
- 学習対象を「NestJSの作法」に集中させる
- クリーンアーキテクチャの恩恵（テスタビリティ、関心の分離）はNestJS標準構成でも得られる

```
service/
├── src/
│   ├── [domain]/
│   │   ├── [domain].controller.ts    # HTTPリクエスト処理のみ（薄く）
│   │   ├── [domain].service.ts       # ビジネスロジック集中
│   │   ├── [domain].repository.ts    # DB操作の抽象化（テスト時モック可）
│   │   ├── dto/                      # Input/Output の型定義
│   │   ├── entities/                 # TypeORM Entity
│   │   └── [domain].module.ts
│   └── ...
└── test/
    └── [domain]/
        └── [domain].service.spec.ts  # Serviceのユニットテスト
```

---

## エンティティ設計

### task-service（4エンティティ）

```
Project ─1:N─ Task ─1:N─ Comment
              │
              └─ N:M ─ Tag（中間テーブル: TaskTag）
```

| エンティティ | 役割 | リレーション |
|-------------|------|-------------|
| Project | タスクのグルーピング | 1対多の親側 |
| Task | 主エンティティ | 1対多の子側、多対多 |
| Comment | タスクへのコメント | 1対多の子側 |
| Tag | タスクのラベル | 多対多 |

### user-service（3エンティティ）

```
User ─1:1─ UserProfile
  │
  └─ N:M ─ Role（中間テーブル: UserRole）
```

| エンティティ | 役割 | リレーション |
|-------------|------|-------------|
| User | 認証情報（email, password） | 1対1、多対多 |
| UserProfile | 詳細プロフィール（name, avatar等） | 1対1 |
| Role | 権限（ADMIN, MEMBER） | 多対多 |

### TypeORM学習要素のカバレッジ

| 学習要素 | 対応エンティティ |
|----------|-----------------|
| 基本CRUD | 全エンティティ |
| 1対多リレーション | Project-Task, Task-Comment |
| 多対多リレーション | Task-Tag, User-Role |
| 1対1リレーション | User-UserProfile |
| Eager / Lazy Loading | リレーション全般 |
| カスケード削除 | Project削除時のTask削除等 |

---

## 認証・認可

### 認証方式

**JWT（JSON Web Token）** を採用

理由：
- NestJSでの実装が標準的（`@nestjs/passport`, `@nestjs/jwt`）
- BFFパターンとの相性が良い
- ステートレスでマイクロサービス向き

### 認可方式

**RBAC（Role-Based Access Control）** を採用

理由：
- シンプルで学習に適している
- Roleエンティティを活かせる
- NestJSのGuardで自然に実装できる

### 認証・認可の責務配置

```
┌─────────────┐
│   Angular   │
└──────┬──────┘
       │ Authorization: Bearer <JWT>
┌──────▼──────┐
│     BFF     │ ← JWTの検証・デコード
│             │ ← 認可チェック（Role確認）
└──────┬──────┘
       │ X-User-Id / X-User-Roles（内部ヘッダ）
  ┌────┴────┐
┌─▼───┐ ┌───▼──┐
│Task │ │User  │ ← 内部ヘッダを信頼
│Svc  │ │Svc   │ ← リソースオーナー確認（細かい粒度）
└─────┘ └──────┘
```

| レイヤー | 認証 | 認可 |
|----------|------|------|
| BFF | JWT検証、トークンデコード | Role確認（粗い粒度） |
| 各Service | 内部ヘッダを信頼 | リソースオーナー確認（細かい粒度） |

### Role定義

| Role | 権限 |
|------|------|
| `ADMIN` | 全操作可能、他ユーザーのタスク・プロジェクトも参照・編集可 |
| `MEMBER` | 自分が所属するプロジェクトのタスクのみCRUD可能 |

### 認証関連エンドポイント（user-service）

```
POST /auth/register    # ユーザー登録
POST /auth/login       # ログイン → JWT発行
POST /auth/refresh     # トークンリフレッシュ
GET  /auth/me          # 現在のユーザー情報
```

---

## 学習フェーズ

### Phase 1：NestJS基礎 + Jest（1〜2週間）

task-service単体で以下を学ぶ：

**NestJS基礎：**
- Module / Controller / Service の基本構造
- DI（Dependency Injection）：`@Injectable()` とModule設定
- DTO + ValidationPipe：リクエストバリデーション
- Exception Filter：エラーハンドリング
- Swagger：APIドキュメント自動生成

**TypeORM：**
- Entity定義（Project, Task, Comment, Tag）
- 1対多リレーション（Project-Task, Task-Comment）
- 多対多リレーション（Task-Tag）
- カスタムRepository
- Oracle接続設定

**Jest：**
- Service層のユニットテスト
- モック・スタブの作成
- テストカバレッジ
- API E2E（統合テスト）：supertest + @nestjs/testing

### Phase 2：user-service + 認証基盤（1〜2週間）

user-serviceを追加し、認証・認可を実装：

**認証関連：**
- `@nestjs/passport`：認証フレームワーク
- `@nestjs/jwt`：JWTの生成・検証
- JWT Strategy：Passportの認証戦略
- bcrypt：パスワードハッシュ化

**認可関連：**
- AuthGuard：認証ガード
- RolesGuard：ロールベース認可ガード
- カスタムデコレータ：`@CurrentUser()`, `@Roles()`

**その他：**
- Interceptor：ログ、レスポンス整形
- 1対1リレーション（User-UserProfile）
- 多対多リレーション（User-Role）

### Phase 3：BFF実装（1〜2週間）

api-gateway（BFF）で以下を学ぶ：

- 複数サービスからのデータ集約（並列リクエスト）
- フロントエンド向けレスポンス整形
- 部分失敗のハンドリング
- 認証・認可の集約（トークン検証はBFF、サービス間は内部通信）
- エラーハンドリングの統一

### Phase 4：Angular統合（1週間）

- 最小限のフロント実装
- HttpClientでBFFを叩いて動作確認

---

## BFF学習で実装すべきユースケース

### ユースケース1：データ集約

```
GET /api/dashboard

BFFが内部で:
  → GET task-service/tasks?userId=xxx
  → GET user-service/users/xxx
  
レスポンス:
{
  user: { name, email },
  tasks: [ ... ],
  summary: { total: 10, completed: 3 }  ← BFFで算出
}
```

### ユースケース2：部分失敗のハンドリング

```
user-serviceがダウンしている場合:
{
  user: null,
  tasks: [ ... ],
  _errors: ["user-service unavailable"]
}
```

### ユースケース3：認証フロー

```
1. ログイン
   Angular → BFF: POST /api/auth/login { email, password }
   BFF → user-service: POST /auth/login { email, password }
   user-service → BFF: { accessToken, refreshToken }
   BFF → Angular: { accessToken, refreshToken }

2. 認証済みリクエスト
   Angular → BFF: GET /api/tasks (Authorization: Bearer <JWT>)
   BFF: JWTを検証・デコード → userId, roles を取得
   BFF → task-service: GET /tasks (X-User-Id: xxx, X-User-Roles: MEMBER)
   task-service: 内部ヘッダを信頼してデータ返却

3. 認可チェック
   BFF: エンドポイントごとに必要なRoleを確認
   task-service: リソースオーナー確認（自分のタスクか？）
```

---

## 開発環境

### DevContainer構成

```
nestjs-bff-learning/
├── .devcontainer/
│   ├── devcontainer.json
│   ├── docker-compose.yml
│   └── Dockerfile          # Node.js + Oracle Instant Client
├── services/
│   ├── task-service/
│   ├── user-service/
│   └── api-gateway/
├── frontend/
│   └── angular-app/
├── database/
│   └── init/               # スキーマ初期化SQL
└── README.md
```

### Oracle接続に必要な設定

- Oracle Instant Client（appコンテナ内にインストール）
- node-oracledb（NestJSからの接続ドライバ）
- TypeORMのOracle設定

### 注意点

- Oracle XEの初回起動には数分かかる
- node-oracledbとInstant Clientのバージョン互換性に注意
- 開発マシン：Intel/AMD (x86_64)

---

## スコープ外（今回は実施しない）

- Playwright / Cypress（フロントエンドE2Eテスト）
- Angularのユニットテスト
- GraphQL
- メッセージキュー（サービス間通信はHTTPのみ）
- サービスディスカバリ（環境変数で直指定）
- CI/CD

---

## テスト方針

### テストの種類と範囲

| 種類 | 範囲 | ツール | 採用 |
|------|------|--------|------|
| Unit Test | Service層のロジック | Jest + モック | ◎ 必須 |
| API E2E（統合テスト） | HTTP → Controller → Service → DB | Jest + supertest | ○ 含める |
| フロントエンドE2E | Browser → Angular → API → DB | Playwright等 | ✕ スコープ外 |

```
テスト範囲
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Unit Test:      [Service] ←モック→ [Repository]

API E2E:        [HTTP] → [Controller] → [Service] → [Repository] → [DB]
                ↑
                今回ここまでカバー

フロントE2E:    [Browser] → [Angular] → [BFF] → [Services] → [DB]
                （将来的にPlaywrightで実装可能）
```

### Unit Test

Serviceの メソッドを検証。Repositoryはモック化。

```typescript
describe('TaskService', () => {
  it('should create a task', async () => {
    const mockRepository = { save: jest.fn().mockResolvedValue(task) };
    const result = await service.create(dto);
    expect(result).toEqual(task);
  });
});
```

### API E2E（統合テスト）

実際にHTTPリクエストを送信し、DBまで往復する統合動作を検証。

```typescript
describe('TaskController (e2e)', () => {
  it('POST /tasks', async () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Test Task', projectId: 1 })
      .expect(201)
      .expect((res) => {
        expect(res.body.data.title).toBe('Test Task');
      });
  });
});
```

### テスト用DB

| 環境 | スキーマ |
|------|---------|
| 開発 | TASK_DB, USER_DB |
| テスト | TASK_DB_TEST, USER_DB_TEST |

テスト実行前にテスト用スキーマを初期化し、テストデータをシードする。

### 将来的なフロントエンドE2E対応

ユーザーストーリードキュメントは、将来的にPlaywrightでE2Eテストを追加する際のテストシナリオとして活用できるよう設計する。具体的には：

- 各ユーザーストーリーに「テストシナリオ」セクションを含める
- Given / When / Then 形式で記述
- 正常系・異常系を明記

---

## コード品質・レビュー方針

### ツール構成

| ツール | 役割 | 特性 |
|--------|------|------|
| **ESLint** | 構文チェック、コード品質 | 決定論的、即座、自動修正可能 |
| **Prettier** | コードフォーマット | 決定論的、即座、自動修正可能 |
| **husky + lint-staged** | コミット時の自動チェック | Git hookで強制 |
| **CodeRabbit CLI** | AIコードレビュー（ローカル） | コミット前、Claude Code連携可 |
| **CodeRabbit SaaS** | AIコードレビュー（PR） | PR作成時に自動実行 |

### 役割の棲み分け

```
ESLint + Prettier
─────────────────────────────────────
- フォーマット、構文、コードスタイル
- 決定論的（同じ入力なら同じ出力）
- 即座に実行、無制限
- 自動修正可能

CodeRabbit
─────────────────────────────────────
- ロジックエラー、race condition
- セキュリティ脆弱性
- 設計上の問題、ベストプラクティス
- AI駆動（7〜30分かかる場合あり）
- 無料プラン: 1 review/hour
```

### 開発フロー

```
コーディング ──┬─── コミット前 ───┬─── PR作成 ───┬─── develop
               │                  │              │
          ┌────▼────┐        ┌────▼────┐   ┌────▼────┐
          │CodeRabbit│        │ ESLint │   │CodeRabbit│
          │ CLI      │        │ Prettier│   │ SaaS     │
          │(手動)    │        │ Jest   │   │(自動)    │
          └────┬────┘        │ (CI)   │   └────┬────┘
               │              └────┬────┘        │
          ┌────▼────┐              │        ┌────▼────┐
          │Claude   │              │        │ 自己    │
          │Codeで   │──────────────┘        │ レビュー│
          │修正     │                       │ (学習)  │
          └─────────┘                       └─────────┘
```

| タイミング | 実行内容 |
|-----------|---------|
| 保存時 | Prettier（エディタ連携で自動フォーマット） |
| コミット前 | ESLint + Prettier（husky + lint-staged） |
| コミット前（任意） | CodeRabbit CLI（重要な問題の検出） |
| CI | ESLint + Jest（必須通過） |
| PR作成後 | CodeRabbit SaaS（包括的レビュー） |

### ESLint + Prettier

NestJS CLIで生成されるプロジェクトには最初から含まれている。

```bash
nest new my-app
# → .eslintrc.js, .prettierrc が自動生成される
```

追加設定：

```json
// package.json scripts
{
  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
  "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
  "format:check": "prettier --check \"src/**/*.ts\" \"test/**/*.ts\""
}
```

### husky + lint-staged

コミット時の自動チェックを強制する。

```bash
npm install -D husky lint-staged
npx husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### CodeRabbit CLI

DevContainer内にインストールする。

```dockerfile
# Dockerfile に追加
RUN curl -fsSL https://cli.coderabbit.ai/install.sh | sh
```

または `postCreateCommand` で：

```json
// devcontainer.json
{
  "postCreateCommand": "curl -fsSL https://cli.coderabbit.ai/install.sh | sh && npm install"
}
```

使用方法：

```bash
# インタラクティブモード（デフォルト）
coderabbit

# AIエージェント向けモード（Claude Code連携）
coderabbit --prompt-only

# 特定のレビュータイプ
coderabbit --prompt-only --type uncommitted

# ベースブランチ指定
coderabbit --prompt-only --base develop
```

Claude Codeとの連携例：

```
Please implement the task creation feature and then run coderabbit --prompt-only,
let it run as long as it needs (run it in the background) and fix any issues.
```

### CodeRabbit SaaS

GitHub Appとしてインストールする（OSS無料）。

カスタム設定ファイル：

```yaml
# .coderabbit.yaml
language: "ja"

reviews:
  request_changes_workflow: false
  high_level_summary: true
  poem: false

instructions: |
  このプロジェクトはNestJS学習用リポジトリです。
  以下の観点でレビューしてください：
  
  - NestJSのベストプラクティスに沿っているか
  - DIの使い方が適切か
  - Serviceにビジネスロジックが集中しているか
  - DTOでバリデーションが適切に行われているか
  - テストが書かれているか

  以下は指摘不要です：
  - 学習用のため、本番環境向けのセキュリティ設定
  - パフォーマンス最適化の細かい指摘
```

### レート制限に関する注意

| プラン | レート制限 |
|--------|-----------|
| 無料（CLI） | 1 review/hour |
| 無料（SaaS/OSS） | 無制限 |

CodeRabbit CLIの無料プランは1時間に1回のレビュー制限があるため、フォーマットや構文エラーはESLint + Prettierで先に解決し、AIには本質的な問題の検出に集中させる。

---

## 仕様駆動開発の方針

### SDDツールについて

Spec Kit、Kiro、OpenSpec等のSDDツールは**採用しない**。

理由：
- NestJS + Jest + BFFの学習が主目的であり、SDDツール自体の学習は本筋ではない
- SDDツールはMarkdownファイルを大量生成し、ワークフローが重くなる傾向がある
- ツールなしでも、構造化された仕様ドキュメントがあればClaude Codeは十分活用できる

### 採用するアプローチ

**AI-DLCの考え方を参考にした独自テンプレート**を使用する。

- Intent（目的）、User Story、Unit（作業単位）という概念を採用
- 仕様ドキュメントは手動 + Claude Codeで作成・管理
- アンチパターン記述をユーザーストーリーの標準項目として定義

### 仕様ドキュメント構成

```
docs/
├── intent.md                    # プロジェクトの目的・スコープ
├── user-stories/
│   ├── US001_タスク作成.md
│   ├── US002_タスク一覧取得.md
│   └── ...
└── units/                       # 作業単位（Phase相当）
    ├── unit1_task-service.md
    ├── unit2_user-service.md
    └── unit3_bff.md
```

### ユーザーストーリー テンプレート

アンチパターン記述とテストシナリオを含む標準テンプレート：

```markdown
# US000: [ストーリータイトル]

## ストーリー
[ロール]として、
[達成したいこと]したい。
それにより、[得られる価値]。

## 受け入れ基準
- [基準1]
- [基準2]
- [基準3]

## アンチパターン（これは仕様に含まない）
- [誤解されやすい解釈1]ではない
- [スコープ外の機能1]は含まない
- [制約事項1]

## テストシナリオ

### 正常系

#### シナリオ1: [シナリオ名]
- **Given（前提）**: [初期状態]
- **When（操作）**: [ユーザーの操作]
- **Then（結果）**: [期待される結果]

### 異常系

#### シナリオ2: [シナリオ名]
- **Given（前提）**: [初期状態]
- **When（操作）**: [ユーザーの操作]
- **Then（結果）**: [期待されるエラー]

## 関連
- US000: [関連ストーリー]
```

### テストシナリオの活用

| 段階 | 用途 |
|------|------|
| 開発時 | API E2E テストケースの元ネタ |
| 将来 | Playwright E2E テストシナリオとして直接利用可能 |

テストシナリオは Given / When / Then 形式（Gherkin風）で記述することで、将来的にPlaywrightや他のE2Eテストツールに移行しやすくなる。

### アンチパターン記述の目的

日本語の曖昧さによる誤解釈を防ぐため、「AであるがBではない」という否定的記述で仕様を補完する。

例：
- ✅「ユーザーはタスクを完了できる」
- ✅ **ただし**「完了とはステータス変更のみを指し、タスクの削除を意味しない」

この記述により：
- AIの誤解釈を防止
- 後日E2Eテストを追加する際の土台となる
- レビュー時の認識齟齬を減らす

---

## 開発規約

### Gitブランチ戦略

**GitHub Flow（簡易版）** を採用

```
main ─────────────────────────────────────────────→
       ↑         ↑         ↑
       │         │         │
feature/xxx   feature/yyy   feature/zzz
```

| 項目 | 内容 |
|------|------|
| メインブランチ | `main`（常にデプロイ可能な状態） |
| 機能ブランチ | `feature/US001-task-creation` のように命名 |
| developブランチ | 不要（1人開発のため） |

理由：
- 学習プロジェクトにはGitHub Flowで十分
- Git Flowは過剰

### monorepo構成

**npm workspaces** を使用

```
nestjs-bff-learning/
├── package.json              # ルート（workspaces定義）
├── services/
│   ├── task-service/
│   │   └── package.json
│   ├── user-service/
│   │   └── package.json
│   └── api-gateway/
│       └── package.json
└── frontend/
    └── angular-app/
        └── package.json
```

```json
// ルート package.json
{
  "name": "nestjs-bff-learning",
  "workspaces": [
    "services/*",
    "frontend/*"
  ]
}
```

メリット：
- 共通の依存関係を一括管理
- `npm install` 一発で全サービスセットアップ
- 各サービスは独立したpackage.jsonを持つ

### Node.js / npmバージョン

| 項目 | バージョン | 理由 |
|------|-----------|------|
| Node.js | 20 LTS | 2024年10月〜2026年4月がActive LTS |
| npm | 10.x | Node.js 20同梱版 |

```json
// package.json
{
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

### APIレスポンス形式

全サービスで統一フォーマットを使用

```typescript
// 成功時
{
  "data": { ... },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}

// 一覧取得時（ページネーション）
{
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "timestamp": "2025-01-15T10:30:00Z"
  }
}

// エラー時
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task with id 123 not found",
    "details": { ... }  // オプション
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### エラーハンドリング規約

**エラーコード体系**

```
[SERVICE]_[ENTITY]_[ERROR_TYPE]

例：
- TASK_TASK_NOT_FOUND
- TASK_PROJECT_ALREADY_EXISTS
- USER_AUTH_INVALID_CREDENTIALS
- USER_AUTH_TOKEN_EXPIRED
- BFF_SERVICE_UNAVAILABLE
```

**HTTPステータスコードとの対応**

| HTTPステータス | 用途 |
|---------------|------|
| 400 | バリデーションエラー |
| 401 | 認証エラー |
| 403 | 認可エラー |
| 404 | リソース不在 |
| 409 | 競合（重複等） |
| 500 | サーバーエラー |
| 503 | サービス利用不可（BFF用） |

### DBマイグレーション戦略

| 環境 | synchronize | マイグレーション |
|------|-------------|-----------------|
| 開発（DevContainer） | true | 使用しない |
| 本番想定 | false | 使用する |

理由：
- 学習段階ではスキーマ変更が頻繁
- マイグレーション管理は学習コストが高い
- Phase 4完了後、余裕があればマイグレーションに移行

### 環境変数管理

**NestJS ConfigModule + .envファイル** を使用

```
services/task-service/
├── .env.example          # Git管理（テンプレート）
├── .env                  # Git無視（実際の値）
└── src/
    └── config/
        └── configuration.ts
```

```typescript
// configuration.ts
export default () => ({
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 1521,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    serviceName: process.env.DB_SERVICE_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
});
```

### コミットメッセージ規約

**Conventional Commits（簡易版）** を採用

```
<type>: <subject>

type:
- feat: 新機能
- fix: バグ修正
- docs: ドキュメント
- refactor: リファクタリング
- test: テスト
- chore: その他（設定変更等）

例：
feat: タスク作成APIを実装
fix: JWT検証時のnullチェックを追加
docs: README.mdにセットアップ手順を追加
test: TaskServiceのユニットテストを追加
```

※ スコープ（`feat(task):`）は省略可（学習プロジェクトなので簡易に）

### テストファイル配置

**コロケーション（同一ディレクトリ）** を採用

```
src/
└── task/
    ├── task.controller.ts
    ├── task.controller.spec.ts    # ← 同じ場所に配置
    ├── task.service.ts
    ├── task.service.spec.ts       # ← 同じ場所に配置
    └── task.module.ts
```

理由：
- NestJS CLIのデフォルト
- 関連ファイルが近くにあり見通しが良い
- `test/` フォルダはE2Eテスト用に予約

---

## ADR（Architecture Decision Records）

### ADRとは

設計上の重要な決定とその理由を記録するドキュメント。後から「なぜこうなっているのか」を追跡できる。

### ディレクトリ構成

```
docs/
└── adr/
    ├── 0000-template.md
    ├── 0001-nestjs-standard-architecture.md
    ├── 0002-jwt-rbac-authentication.md
    └── ...
```

### ADRテンプレート

```markdown
# ADR-0000: [タイトル]

## ステータス
承認 / 提案中 / 廃止 / 置き換え（ADR-XXXX）

## コンテキスト
[この決定が必要になった背景・状況]

## 決定
[何を決定したか]

## 理由
[なぜその決定をしたか、検討した代替案]

## 影響
[この決定による影響、トレードオフ]
```

### 学習プロジェクトでの活用

| 用途 | 効果 |
|------|------|
| 技術選定の理由を明文化 | 学習の整理になる |
| 「なぜこの設計か」の記録 | 後で振り返れる |
| 失敗した選択も記録 | 同じ失敗を繰り返さない |

---

## ADR一覧（企画段階）

### ADR-0001: NestJS標準アーキテクチャの採用

**ステータス**: 承認

**コンテキスト**:
マイクロサービスAPI開発の学習にあたり、アーキテクチャパターンを決定する必要がある。クリーンアーキテクチャやオニオンアーキテクチャなどの選択肢がある。

**決定**:
クリーンアーキテクチャは採用せず、NestJS標準構成（Controller / Service / Repository）を使用する。

**理由**:
- NestJS自体がController / Service / Repositoryの層構造を強制しており、これがすでに関心の分離を実現している
- 学習対象を「NestJSの作法」に集中させるため、追加のアーキテクチャ概念は導入しない
- クリーンアーキテクチャの恩恵（テスタビリティ、関心の分離）はNestJS標準構成でも十分得られる
- 過度な抽象化は学習コストを増大させる

**影響**:
- Domain層、UseCase層といった追加レイヤーは作成しない
- ビジネスロジックはServiceに集中させる
- Repositoryはカスタム実装でDB操作を抽象化し、テスト時のモックを容易にする

---

### ADR-0002: JWT + RBACによる認証・認可

**ステータス**: 承認

**コンテキスト**:
マイクロサービス構成における認証・認可方式を決定する必要がある。セッションベース、JWT、OAuth2などの選択肢がある。

**決定**:
- 認証方式：JWT（JSON Web Token）
- 認可方式：RBAC（Role-Based Access Control）

**理由**:
- JWTはNestJSでの実装が標準的（`@nestjs/passport`, `@nestjs/jwt`）
- ステートレスでマイクロサービス向き
- BFFパターンとの相性が良い（BFFでトークン検証、内部通信は信頼）
- RBACはシンプルで学習に適しており、User-Roleエンティティを活かせる
- ABACやPBACはこのプロジェクトには過剰

**影響**:
- user-serviceがJWTの発行を担当
- BFFがJWTの検証・デコードを行い、内部ヘッダ（X-User-Id, X-User-Roles）で各サービスに伝播
- 各サービスは内部ヘッダを信頼し、リソースオーナー確認のみ行う

---

### ADR-0003: Oracle同一インスタンス・別スキーマ構成

**ステータス**: 承認

**コンテキスト**:
マイクロサービスごとにデータベースを分離する方針を決定する必要がある。PostgreSQL/MySQL、Oracle、別インスタンス/同一インスタンスなどの選択肢がある。

**決定**:
Oracle Database XE (21c) を使用し、同一インスタンス内で別スキーマ（TASK_DB, USER_DB）として分離する。

**理由**:
- 業務でOracleを使用するため、学習段階で経験しておくべき
- PostgreSQL/MySQLより環境構築が面倒だが、その経験自体が学習価値
- 別インスタンスはリソース消費が大きく、開発マシンには過剰
- 同一インスタンス・別スキーマでも論理的な分離は実現できる

**影響**:
- DevContainerにOracle XEコンテナを含める
- node-oracledb + Oracle Instant Clientのセットアップが必要
- 初回起動に数分かかる
- 各サービスは自スキーマのみアクセス可能とする

---

### ADR-0004: BFFパターンの採用

**ステータス**: 承認

**コンテキスト**:
フロントエンド（Angular）とバックエンドサービス間の通信方式を決定する必要がある。直接通信、API Gateway、BFFなどの選択肢がある。

**決定**:
BFF（Backend for Frontend）パターンを採用し、api-gatewayサービスとして実装する。

**理由**:
- フロントエンド専用の窓口として、複数サービスからのデータ集約を行える
- 認証・認可の集約点として機能（JWTの検証はBFFで一元化）
- 部分失敗のハンドリングなど、実践的なパターンを学習できる
- 業務案件でBFFパターンを使用するため、事前学習として適切

**影響**:
- Angularは直接task-service/user-serviceにアクセスしない
- BFFがフロントエンド向けにレスポンスを整形する責務を持つ
- サービス間通信はHTTP（内部通信）で行う

---

### ADR-0005: SDDツール不採用

**ステータス**: 承認

**コンテキスト**:
仕様駆動開発（SDD）のためのツール（Spec Kit、Kiro、OpenSpec等）を採用するか決定する必要がある。

**決定**:
SDDツールは採用せず、AI-DLCの考え方を参考にした独自テンプレートを使用する。

**理由**:
- NestJS + Jest + BFFの学習が主目的であり、SDDツール自体の学習は本筋ではない
- SDDツールは大量のMarkdownファイルを生成し、ワークフローが重くなる傾向がある
- ツールなしでも、構造化された仕様ドキュメント（Intent、User Story、Unit）があればClaude Codeは十分活用できる
- アンチパターン記述を標準項目として定義し、AIの誤解釈を防止する

**影響**:
- 仕様ドキュメントは手動 + Claude Codeで作成・管理
- docs/intent.md、docs/user-stories/、docs/units/ の構成で管理
- SDDツールの学習コストを節約し、本筋の学習に集中できる

---

### ADR-0006: CodeRabbit CLI + SaaS併用によるコードレビュー自動化

**ステータス**: 承認

**コンテキスト**:
学習プロジェクトにおいてコードレビューの仕組みを導入したい。CodeRabbit、Qodo Merge、GitHub Copilotなどの選択肢がある。

**決定**:
CodeRabbit CLIとCodeRabbit SaaSを併用する。

**理由**:
- CodeRabbit CLIはコミット前にローカルでレビューでき、Claude Codeとの連携が可能（`--prompt-only`オプション）
- CodeRabbit SaaSはPR作成時に自動で包括的なレビューを実行
- OSSリポジトリはSaaS版が無料で無制限に利用可能
- DevContainer（Linux）環境でCLIが動作する
- 日本語でのレビュー出力が可能

**影響**:
- DevContainerにCodeRabbit CLIをインストール
- GitHubリポジトリにCodeRabbit GitHub Appをインストール
- `.coderabbit.yaml` でNestJS向けのカスタム指示を設定
- CLI無料プランは1 review/hourの制限があるため、ESLint + Prettierとの役割分担が重要

---

### ADR-0007: ESLint + Prettierによる静的解析とCodeRabbitとの役割分担

**ステータス**: 承認

**コンテキスト**:
コード品質管理において、ESLint + PrettierとCodeRabbitの役割分担を明確にする必要がある。

**決定**:
- ESLint + Prettier：フォーマット、構文、コードスタイル（決定論的チェック）
- CodeRabbit：ロジックエラー、セキュリティ、設計上の問題（AIによるチェック）

**理由**:
- ESLint + PrettierはNestJS CLIのデフォルトで含まれており、追加コストなし
- 決定論的なチェック（同じ入力なら同じ出力）はツールで自動化すべき
- CodeRabbit CLI無料プランは1 review/hourの制限があり、フォーマット指摘でレビュー枠を消費するのは非効率
- AIには本質的な問題（race condition、セキュリティ脆弱性、設計問題）の検出に集中させる

**影響**:
- husky + lint-stagedでコミット時にESLint + Prettierを強制
- CodeRabbit CLIは手動実行（重要な問題の検出に使用）
- CodeRabbit SaaSはPR作成時に自動実行

---

### ADR-0008: npm workspacesによるmonorepo構成

**ステータス**: 承認

**コンテキスト**:
複数のNestJSサービス（task-service, user-service, api-gateway）とAngularフロントエンドを管理する方法を決定する必要がある。別リポジトリ、monorepo（npm workspaces, Nx, Turborepo）などの選択肢がある。

**決定**:
npm workspacesを使用したmonorepo構成を採用する。

**理由**:
- 共通の依存関係を一括管理でき、`npm install` 一発で全サービスをセットアップ可能
- 各サービスは独立したpackage.jsonを持ち、個別の依存関係も管理できる
- Nx や Turborepo は学習コストが高く、このプロジェクトには過剰
- 別リポジトリ管理は開発効率が下がる

**影響**:
- ルートにpackage.jsonを配置し、workspacesを定義
- services/* と frontend/* をワークスペースとして登録
- 共通の開発依存関係（husky, lint-staged等）はルートで管理

---

### ADR-0009: GitHub Flowブランチ戦略

**ステータス**: 承認

**コンテキスト**:
Gitブランチ戦略を決定する必要がある。Git Flow、GitHub Flow、GitLab Flow、トランクベース開発などの選択肢がある。

**決定**:
GitHub Flow（簡易版）を採用する。mainブランチとfeatureブランチのみ使用し、developブランチは使用しない。

**理由**:
- 学習プロジェクト（1人開発）にはGitHub Flowで十分
- Git Flowのdevelop/release/hotfixブランチは過剰
- mainブランチを常にデプロイ可能な状態に保つシンプルなルール
- CodeRabbitのPRレビューと相性が良い

**影響**:
- featureブランチは `feature/US001-task-creation` のように命名
- PRはmainブランチに対して作成
- mainへのマージ前にCodeRabbit SaaSによるレビューを受ける

---

### ADR-0010: テスト戦略（Unit Test + API E2E）

**ステータス**: 承認

**コンテキスト**:
NestJSアプリケーションのテスト戦略を決定する必要がある。Unit Test、統合テスト（API E2E）、フロントエンドE2E（Playwright/Cypress）などの選択肢がある。

**決定**:
- Unit Test：必須（Service層のロジック検証）
- API E2E（統合テスト）：含める（HTTP〜DB往復の統合動作検証）
- フロントエンドE2E（Playwright等）：スコープ外

**理由**:
- Unit TestはJest学習の主目的であり必須
- API E2EはNestJS公式ドキュメントで推奨されており、supertestを使用してJestの延長で書ける
- Unit Testだけでは検証できないController〜Service〜Repository〜DBの統合動作を確認できる
- 実際の業務でもAPI E2Eは必ず求められる
- フロントエンドE2E（Playwright/Cypress）はAngularテスト環境構築を含め学習コストが高く、本筋から外れる

**影響**:
- テスト用DBスキーマ（TASK_DB_TEST, USER_DB_TEST）を用意
- ユーザーストーリーにテストシナリオ（Given/When/Then）を含め、将来的なPlaywright導入に備える
- supertestと@nestjs/testingを使用してAPI E2Eテストを実装

---

## 成果物

- 動作する学習用アプリケーション一式
- 各Phase完了時点でのJest Unit Test
- 各Phase完了時点でのAPI E2E（統合テスト）
- SwaggerによるAPI仕様書
- 仕様ドキュメント一式（Intent、User Stories、Units）
- ADRドキュメント一式
