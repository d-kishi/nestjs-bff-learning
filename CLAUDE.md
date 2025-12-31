# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NestJS + BFF学習プロジェクト。マイクロサービスAPI開発の事前学習が目的。

## Architecture

```
Angular → BFF (api-gateway) → task-service / user-service → Oracle XE
```

- **api-gateway**: BFF層。JWT検証、サービス集約、部分失敗ハンドリング
- **task-service**: Project, Task, Comment, Tag エンティティ
- **user-service**: User, UserProfile, Role エンティティ。JWT発行担当
- 内部通信: X-User-Id, X-User-Roles ヘッダで認証情報を伝播

## Commands

```bash
# 全サービスの依存関係インストール
npm install

# 各サービスの起動
npm run start:task
npm run start:user
npm run start:gateway

# テスト
npm run test:task          # Unit Test
npm run test:task:e2e      # API E2E

# Lint & Format
npm run lint
npm run format
```

## NestJS Service Structure

クリーンアーキテクチャは不採用。NestJS標準構成を使用：

```
services/[service-name]/src/
├── [domain]/
│   ├── [domain].controller.ts   # HTTPリクエスト処理（薄く）
│   ├── [domain].service.ts      # ビジネスロジック集中
│   ├── [domain].repository.ts   # DB操作抽象化（モック可）
│   ├── dto/                     # Input/Output型
│   ├── entities/                # TypeORM Entity
│   └── [domain].module.ts
└── test/                        # E2Eテスト
```

## API Response Format

全サービスで統一：

```typescript
// 成功
{ data: {...}, meta: { timestamp } }

// 一覧（ページネーション）
{ data: [...], meta: { total, page, limit, timestamp } }

// エラー
{ error: { code: "[SERVICE]_[ENTITY]_[ERROR_TYPE]", message }, meta: { timestamp } }
```

## Testing

- **Unit Test**: Service層をモックでテスト（`*.spec.ts`）
- **API E2E**: supertest + @nestjs/testing（`test/`フォルダ）
- **テスト用DB**: TASK_DB_TEST, USER_DB_TEST スキーマ

## Authentication Flow

1. user-serviceがJWT発行
2. BFFがJWT検証・デコード
3. BFF→各サービスはX-User-Id, X-User-Rolesヘッダで伝播
4. 各サービスは内部ヘッダを信頼

## Conventions

- **ブランチ**: `feature/US001-task-creation` 形式
- **コミット**: Conventional Commits（`feat:`, `fix:`, `docs:`, `test:`, `chore:`）
- **DB**: 開発時はsynchronize: true（マイグレーション不使用）

## Documentation

- `docs/project-plan.md`: 企画書（詳細な設計・ADR含む）
- `docs/user-stories/`: ユーザーストーリー（Given/When/Then形式）
- `docs/adr/`: Architecture Decision Records
