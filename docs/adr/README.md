# docs/adr/

Architecture Decision Records（ADR）を格納するディレクトリです。

## ADRとは

設計上の重要な決定とその理由を記録するドキュメントです。後から「なぜこうなっているのか」を追跡できます。

## ファイル命名規則

```
[番号]-[タイトル].md

例:
0000-template.md
0001-nestjs-standard-architecture.md
0002-jwt-rbac-authentication.md
```

## テンプレート

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

## ADR一覧

| ADR | タイトル | ステータス |
|-----|---------|-----------|
| [0000](0000-template.md) | テンプレート | - |
| [0001](0001-oracle-same-instance-separate-schema.md) | Oracle同一インスタンス・別スキーマ構成 | 承認 |
| [0002](0002-no-sdd-tools.md) | SDDツール不採用 | 承認 |
| [0003](0003-npm-workspaces-monorepo.md) | npm workspacesによるmonorepo構成 | 承認 |
| [0004](0004-coderabbit-review-strategy.md) | CodeRabbitによるレビュー戦略 | 承認 |
| [0005](0005-docker-desktop.md) | Docker Desktop採用 | 承認 |
| [0006](0006-playwright-e2e-auth-only.md) | Playwright E2Eテストは認証フローのみに限定 | 承認 |

### CLAUDE.md/README.mdでカバーしている設計判断

以下はADRファイルとして独立させず、既存ドキュメントで管理：

- NestJS標準アーキテクチャの採用 → CLAUDE.md「NestJS Service Structure」
- JWT + RBACによる認証・認可 → CLAUDE.md「Authentication Flow」
- BFFパターンの採用 → CLAUDE.md「Architecture」、README.md「アーキテクチャ」
- GitHub Flowブランチ戦略 → CLAUDE.md「Conventions」、README.md「開発規約」
- テスト戦略 → CLAUDE.md「Testing」

※ 全設計判断の詳細は [project-plan.md](../project-plan.md) を参照

## 学習プロジェクトでの活用

| 用途 | 効果 |
|------|------|
| 技術選定の理由を明文化 | 学習の整理になる |
| 「なぜこの設計か」の記録 | 後で振り返れる |
| 失敗した選択も記録 | 同じ失敗を繰り返さない |
