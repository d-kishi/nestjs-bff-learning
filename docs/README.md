# docs/

プロジェクトの仕様ドキュメントを格納するディレクトリです。

## 構成

```
docs/
├── project-plan.md      # 企画書（設計・ADR含む）
├── intent.md            # プロジェクトの目的・スコープ（予定）
├── user-stories/        # ユーザーストーリー
├── units/               # 作業単位（Phase相当）
└── adr/                 # Architecture Decision Records
```

## ドキュメント体系

AI-DLCの考え方を参考にした独自テンプレートを使用します。

| ドキュメント | 役割 |
|-------------|------|
| project-plan.md | プロジェクト全体の設計・方針 |
| intent.md | プロジェクトの目的・スコープ定義 |
| user-stories/ | 機能単位の仕様書 |
| units/ | 学習フェーズごとの作業計画 |
| adr/ | 設計判断の記録 |

## 仕様駆動開発の方針

SDDツール（Spec Kit、Kiro等）は採用せず、構造化されたMarkdownで管理します。

理由:
- NestJS + Jest + BFFの学習が主目的
- SDDツールの学習コストを省く
- Claude Codeは構造化されたドキュメントで十分活用可能
