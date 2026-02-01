# NestJS + BFF 学習プロジェクト

Node.js（NestJS）によるマイクロサービスAPI開発の学習プロジェクトです。

## 学習目標

- NestJSによるAPI構築
- JestによるUnit Test
- BFFパターンによるサービス集約

## 技術スタック

| レイヤー | 技術 | 備考 |
|---------|------|------|
| Frontend | Angular 21+ | Standalone Component |
| BFF | NestJS 11 | REST API |
| Backend Services | NestJS 11 + TypeORM | 各サービス独立したNestJSアプリ |
| Database | Oracle Database XE (21c) | 同一インスタンス・別スキーマ構成 |
| 認証 | Passport + JWT | `@nestjs/passport`, `@nestjs/jwt`, bcryptjs |
| Test | Jest + Vitest | Unit Test + API E2E |
| Runtime | Bun | 高速なJavaScript/TypeScriptランタイム |
| Package Manager | pnpm | workspaces構成 |
| 開発環境 | DevContainer + mise | Docker Compose構成、ツールバージョン管理 |

## アーキテクチャ

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
   └───────┘
```

## プロジェクト構成

```
nestjs-bff-learning/
├── .devcontainer/          # DevContainer設定
├── services/
│   ├── task-service/       # タスク管理サービス
│   ├── user-service/       # ユーザー・認証サービス
│   └── api-gateway/        # BFF
├── frontend/
│   └── angular-app/        # Angularフロントエンド
├── database/
│   └── init/               # スキーマ初期化SQL
└── docs/                   # 仕様ドキュメント
    ├── project-plan.md     # 企画書
    ├── intent.md           # プロジェクトの目的・スコープ
    ├── user-stories/       # ユーザーストーリー
    ├── units/              # 作業単位
    └── adr/                # Architecture Decision Records
```

## 学習フェーズ

### Phase 1：NestJS基礎 + Jest
- task-service単体でNestJS基礎、TypeORM、Jestを学ぶ

### Phase 2：user-service + 認証基盤
- user-serviceを追加し、認証・認可（JWT + RBAC）を実装

### Phase 3：BFF実装
- api-gateway（BFF）でサービス集約パターンを学ぶ

### Phase 4：Angular統合
- 最小限のフロント実装で動作確認

## 開発環境セットアップ

### 前提条件

- Docker Desktop
- VS Code + Dev Containers拡張

### 起動方法

1. リポジトリをクローン
2. VS Codeで開く
3. 「Reopen in Container」を選択
4. 初回起動時はOracle XEの起動に数分かかります

### コマンド一覧

#### 基本コマンド（pnpm workspaces + Bun）

```bash
# 全サービスの依存関係をインストール
pnpm install

# 各サービスの起動（Bun経由）
pnpm run start:task      # task-service (port 3001)
pnpm run start:user      # user-service (port 3002)
pnpm run start:gateway   # api-gateway (port 3000)
pnpm run start:angular   # Angular (port 4200)

# 各サービスのテスト実行（Bun経由）
pnpm run test:task       # task-service Unit Test
pnpm run test:user       # user-service Unit Test
pnpm run test:gateway    # api-gateway Unit Test

# E2Eテスト
pnpm run test:task:e2e   # task-service API E2E
pnpm run test:user:e2e   # user-service API E2E
pnpm run test:gateway:e2e # api-gateway API E2E

# Lint & Format
pnpm run lint            # 全サービスのESLint実行
pnpm run format          # 全サービスのPrettier実行
```

#### NestJS CLIコマンド

NestJS CLIは `bunx nest` コマンドで利用できます（DevContainer内）。

| コマンド | 説明 | 使用例 |
|---------|------|--------|
| `bunx nest new` | 新規プロジェクト作成 | `bunx nest new my-service --package-manager pnpm` |
| `bunx nest generate` | コード生成（モジュール、コントローラー等） | `bunx nest g resource users` |
| `bunx nest build` | TypeScriptビルド | `bunx nest build` |
| `bunx nest start` | アプリケーション起動 | `bunx nest start --watch` |
| `bunx nest info` | NestJS環境情報表示 | `bunx nest info` |

**generate サブコマンド（短縮形: `g`）**

```bash
# モジュール生成
bunx nest g module users

# コントローラー生成
bunx nest g controller users

# サービス生成
bunx nest g service users

# CRUD一式生成（推奨）
bunx nest g resource users
# → module, controller, service, dto, entity を一括生成

# ガード生成
bunx nest g guard auth/jwt

# インターセプター生成
bunx nest g interceptor logging

# フィルター生成
bunx nest g filter http-exception
```

**各サービスディレクトリで実行**

```bash
# task-serviceで新しいリソースを追加する場合
cd services/task-service
bunx nest g resource comments --no-spec
```

#### Angular CLIコマンドとの対比

| 用途 | Angular CLI | NestJS CLI |
|------|-------------|------------|
| 新規プロジェクト | `bun ng new` | `bunx nest new` |
| コンポーネント/リソース生成 | `bun ng generate component` | `bunx nest generate resource` |
| ビルド | `bun ng build` | `bunx nest build` |
| 開発サーバー起動 | `bun ng serve` | `bunx nest start --watch` |
| テスト実行 | `bun ng test` | `pnpm run test` (Jest) |
| E2Eテスト | `bun ng e2e` (Playwright) | `pnpm run test:e2e` (supertest) |
| Lint | `bun ng lint` | `pnpm run lint` (ESLint) |
| 環境情報表示 | `bun ng version` | `bunx nest info` |

**生成コマンドの対比**

| 生成対象 | Angular CLI | NestJS CLI |
|---------|-------------|------------|
| 基本単位 | `ng g component` | `nest g controller` |
| サービス | `ng g service` | `nest g service` |
| モジュール | `ng g module` | `nest g module` |
| ガード | `ng g guard` | `nest g guard` |
| インターセプター | `ng g interceptor` | `nest g interceptor` |
| パイプ | `ng g pipe` | `nest g pipe` |
| 一括生成 | - | `nest g resource` |

#### 各サービス個別のscripts

**task-service / user-service / api-gateway 共通**

```bash
cd services/task-service  # または user-service, api-gateway

bun run start        # 本番モード起動
bun run start:dev    # 開発モード（ホットリロード）
bun run start:debug  # デバッグモード
bun run build        # TypeScriptビルド
bun run test         # Unit Test実行
bun run test:watch   # テストウォッチモード
bun run test:cov     # カバレッジ付きテスト
bun run test:e2e     # E2Eテスト
bun run lint         # ESLint実行
bun run format       # Prettier実行
```

**angular-app**

```bash
cd frontend/angular-app

bun run start        # 開発サーバー起動 (port 4200)
bun run build        # 本番ビルド
bun run test         # Vitest Unit Test
bun run test:watch   # テストウォッチモード
bun run test:e2e     # Playwright E2Eテスト
bun run test:e2e:ui  # Playwright UIモード
```

#### 開発時のサービス起動手順

```bash
# 1. 全サービスを起動（別々のターミナルで）
pnpm run start:task      # ターミナル1
pnpm run start:user      # ターミナル2
pnpm run start:gateway   # ターミナル3
pnpm run start:angular   # ターミナル4

# 2. ブラウザでアクセス
# http://localhost:4200 → Angular
# http://localhost:3000 → api-gateway (BFF)

# E2Eテスト実行時は全サービスが起動している必要があります
cd frontend/angular-app
bun run test:e2e
```

## 開発規約

- **ブランチ戦略**: GitHub Flow（main + featureブランチ）
- **コミットメッセージ**: Conventional Commits
- **コード品質**: ESLint + Prettier + CodeRabbit

詳細は [docs/project-plan.md](docs/project-plan.md) を参照してください。

## ドキュメント

- [企画書](docs/project-plan.md) - プロジェクトの詳細な計画・設計
- [ADR](docs/adr/) - 設計判断の記録

## License

Private - 学習目的のプロジェクトです
