# プロジェクト状況

セッション間で引き継ぐプロジェクト状況を記録します。

## 現在のPhase

- **Phase**: Phase 0（初期セットアップ）
- **状況**: ディレクトリ構造・基本設定完了
- **次のPhase**: Phase 1（task-service実装）

## 直近の完了事項

- [x] README.md作成
- [x] CLAUDE.md作成
- [x] ディレクトリ構造作成
- [x] package.json（npm workspaces）作成
- [x] 各ディレクトリのREADME.md作成

## 次回セッション推奨事項

### 最優先
- DevContainer設定の作成（.devcontainer/）
- または task-service の `nest new` で雛形作成

### 読み込み推奨ファイル
- `docs/project-plan.md` - 企画書（Phase 1の詳細）
- `services/task-service/README.md` - task-serviceの設計

## 重要な制約・注意点

- Oracle XE接続にはInstant Clientが必要
- node-oracledbとInstant Clientのバージョン互換性に注意
- 開発マシン: Intel/AMD (x86_64)

## メモ・申し送り

（セッション間で伝えたい情報があればここに記載）
