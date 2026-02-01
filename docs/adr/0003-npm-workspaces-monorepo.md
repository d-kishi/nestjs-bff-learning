# ADR-0003: npm workspacesによるmonorepo構成

## ステータス

置き換え（ADR-0006: pnpm + Bun移行）

## コンテキスト

複数のNestJSサービス（task-service, user-service, api-gateway）とAngularフロントエンドを管理する方法を決定する必要がある。

選択肢として、別リポジトリ管理、monorepo（npm workspaces, Nx, Turborepo）などがある。

## 決定

npm workspacesを使用したmonorepo構成を採用する。

```json
{
  "workspaces": [
    "services/*",
    "frontend/*"
  ]
}
```

## 理由

- 共通の依存関係を一括管理でき、`npm install` 一発で全サービスをセットアップ可能
- 各サービスは独立したpackage.jsonを持ち、個別の依存関係も管理できる
- 学習プロジェクトとしてシンプルで理解しやすい

### 検討した代替案

| 代替案 | 不採用理由 |
|-------|-----------|
| Nx | 学習コストが高く、このプロジェクトには過剰 |
| Turborepo | 同上 |
| 別リポジトリ管理 | 開発効率が下がる、依存関係管理が煩雑 |
| Lerna | メンテナンス状況が不安定、npm workspacesで十分 |

## 影響

- ルートにpackage.jsonを配置し、workspacesを定義
- `services/*` と `frontend/*` をワークスペースとして登録
- 共通の開発依存関係（husky, lint-staged等）はルートで管理
- 各サービス固有の依存関係は各サービスのpackage.jsonで管理
