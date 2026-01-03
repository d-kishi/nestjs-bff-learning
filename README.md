# NestJS + BFF 学習プロジェクト

Node.js（NestJS）によるマイクロサービスAPI開発の学習プロジェクトです。

## 学習目標

- NestJSによるAPI構築
- JestによるUnit Test
- BFFパターンによるサービス集約

## 技術スタック

| レイヤー | 技術 | 備考 |
|---------|------|------|
| Frontend | Angular 17+ | Standalone Component推奨 |
| BFF | NestJS | REST API |
| Backend Services | NestJS + TypeORM | 各サービス独立したNestJSアプリ |
| Database | Oracle Database XE (21c) | 同一インスタンス・別スキーマ構成 |
| 認証 | Passport + JWT | `@nestjs/passport`, `@nestjs/jwt`, bcrypt |
| Test | Jest + supertest | Unit Test + API E2E |
| API Documentation | Swagger | `@nestjs/swagger` |
| 開発環境 | DevContainer | Docker Compose構成 |

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

#### 基本コマンド（npm workspaces）

```bash
# 全サービスの依存関係をインストール
npm install

# 各サービスの起動
npm run start:task      # task-service (port 3001)
npm run start:user      # user-service (port 3002)
npm run start:gateway   # api-gateway (port 3000)
npm run start:angular   # Angular (port 4200)

# 各サービスのテスト実行
npm run test:task       # task-service Unit Test
npm run test:user       # user-service Unit Test
npm run test:gateway    # api-gateway Unit Test

# E2Eテスト
npm run test:task:e2e   # task-service API E2E
npm run test:user:e2e   # user-service API E2E
npm run test:gateway:e2e # api-gateway API E2E

# Lint & Format
npm run lint            # 全サービスのESLint実行
npm run format          # 全サービスのPrettier実行
```

#### NestJS CLIコマンド

NestJS CLIは `nest` コマンドで利用できます（DevContainer内にグローバルインストール済み）。

| コマンド | 説明 | 使用例 |
|---------|------|--------|
| `nest new` | 新規プロジェクト作成 | `nest new my-service --package-manager npm` |
| `nest generate` | コード生成（モジュール、コントローラー等） | `nest g resource users` |
| `nest build` | TypeScriptビルド | `nest build` |
| `nest start` | アプリケーション起動 | `nest start --watch` |
| `nest info` | NestJS環境情報表示 | `nest info` |

**generate サブコマンド（短縮形: `g`）**

```bash
# モジュール生成
nest g module users

# コントローラー生成
nest g controller users

# サービス生成
nest g service users

# CRUD一式生成（推奨）
nest g resource users
# → module, controller, service, dto, entity を一括生成

# ガード生成
nest g guard auth/jwt

# インターセプター生成
nest g interceptor logging

# フィルター生成
nest g filter http-exception
```

**各サービスディレクトリで実行**

```bash
# task-serviceで新しいリソースを追加する場合
cd services/task-service
nest g resource comments --no-spec
```

#### Angular CLIコマンドとの対比

| 用途 | Angular CLI | NestJS CLI |
|------|-------------|------------|
| 新規プロジェクト | `ng new` | `nest new` |
| コンポーネント/リソース生成 | `ng generate component` | `nest generate resource` |
| ビルド | `ng build` | `nest build` |
| 開発サーバー起動 | `ng serve` | `nest start --watch` |
| テスト実行 | `ng test` | `npm run test` (Jest) |
| E2Eテスト | `ng e2e` (Playwright) | `npm run test:e2e` (supertest) |
| Lint | `ng lint` | `npm run lint` (ESLint) |
| 環境情報表示 | `ng version` | `nest info` |

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

#### 各サービス個別のnpm scripts

**task-service / user-service / api-gateway 共通**

```bash
cd services/task-service  # または user-service, api-gateway

npm run start        # 本番モード起動
npm run start:dev    # 開発モード（ホットリロード）
npm run start:debug  # デバッグモード
npm run build        # TypeScriptビルド
npm run test         # Unit Test実行
npm run test:watch   # テストウォッチモード
npm run test:cov     # カバレッジ付きテスト
npm run test:e2e     # E2Eテスト
npm run lint         # ESLint実行
npm run format       # Prettier実行
```

**angular-app**

```bash
cd frontend/angular-app

npm run start        # 開発サーバー起動 (port 4200)
npm run build        # 本番ビルド
npm run test         # Vitest Unit Test
npm run test:watch   # テストウォッチモード
npm run test:e2e     # Playwright E2Eテスト
npm run test:e2e:ui  # Playwright UIモード
```

#### 開発時のサービス起動手順

```bash
# 1. 全サービスを起動（別々のターミナルで）
npm run start:task      # ターミナル1
npm run start:user      # ターミナル2
npm run start:gateway   # ターミナル3
npm run start:angular   # ターミナル4

# 2. ブラウザでアクセス
# http://localhost:4200 → Angular
# http://localhost:3000 → api-gateway (BFF)

# E2Eテスト実行時は全サービスが起動している必要があります
cd frontend/angular-app
npm run test:e2e
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
