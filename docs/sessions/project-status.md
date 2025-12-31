# プロジェクト状況

セッション間で引き継ぐプロジェクト状況を記録します。

## 現在のPhase

- **Phase**: Phase 0（初期セットアップ）→ **完了**
- **状況**: 基本セットアップ・ドキュメント整備完了
- **次のPhase**: Phase 1（task-service実装）の前にRules/Skills作成・DevContainer設定

## 直近の完了事項

- [x] README.md作成
- [x] CLAUDE.md作成
- [x] ディレクトリ構造作成
- [x] package.json（npm workspaces）作成
- [x] 各ディレクトリのREADME.md作成
- [x] セッション管理Command移植（session-start/session-end）
- [x] ADRファイル作成（5件）

## 次回セッション推奨事項

### 最優先
1. **Rules/Skills作成**
   - CLAUDE.mdのアーキテクチャ設計・APIレスポンスフォーマットをRulesに移動
   - 2件以上の質問時はAskUserQuestion使用のルール追加
2. **DevContainer設定**（基本部分のみ）

### その後
- Phase 1設計作業（task-serviceエンティティ・API設計）
- 設計完了後に開発環境構築（Oracle接続、スキーマSQL等）

### 読み込み推奨ファイル
- `docs/project-plan.md` - 企画書（Phase 1の詳細）
- `CLAUDE.md` - Rules移動対象の確認
- `.claude/commands/session-start.md` - セッション開始手順

## 重要な制約・注意点

- Oracle XE接続にはInstant Clientが必要
- node-oracledbとInstant Clientのバージョン互換性に注意
- 開発マシン: Intel/AMD (x86_64)
- 開発環境構築は設計作業の後に実施する方針

## メモ・申し送り

- 作業順序: Rules/Skills → DevContainer → 設計 → 開発環境構築 → 実装
- CLAUDE.md/README.mdで十分カバーできる設計判断はADRファイル化不要という方針を採用
