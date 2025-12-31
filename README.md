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

### コマンド

```bash
# 全サービスの依存関係をインストール
npm install

# task-serviceの開発サーバー起動
npm run start:task

# テスト実行
npm run test:task

# Lint
npm run lint
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
