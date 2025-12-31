# ADR-0004: CodeRabbitによるレビュー戦略

## ステータス

承認

## コンテキスト

学習プロジェクトにおいてコードレビューの仕組みを導入したい。また、ESLint + PrettierとAIレビューの役割分担を明確にする必要がある。

## 決定

CodeRabbit CLIとCodeRabbit SaaSを併用し、ESLint + Prettierと役割を分担する。

### 役割分担

| ツール | 役割 |
|-------|------|
| ESLint + Prettier | フォーマット、構文、コードスタイル（決定論的） |
| CodeRabbit | ロジックエラー、セキュリティ、設計問題（AI） |

### 実行タイミング

| タイミング | ツール |
|-----------|--------|
| コミット前 | ESLint + Prettier（husky + lint-staged） |
| コミット前（任意） | CodeRabbit CLI |
| PR作成後 | CodeRabbit SaaS（自動） |

## 理由

- ESLint + PrettierはNestJS CLIのデフォルトで含まれており、追加コストなし
- 決定論的なチェックはツールで自動化すべき
- CodeRabbit CLI無料プランは1 review/hourの制限があり、フォーマット指摘で枠を消費するのは非効率
- AIには本質的な問題（ロジックエラー、セキュリティ脆弱性）の検出に集中させる

## 影響

- husky + lint-stagedでコミット時にESLint + Prettierを強制
- CodeRabbit CLIは手動実行（重要な問題の検出に使用）
- CodeRabbit SaaSはPR作成時に自動実行（OSS無料）
- `.coderabbit.yaml` でNestJS向けのカスタム指示を設定
