# 学習資料

NestJS BFF学習プロジェクトの学習資料です。

## 資料一覧

| ファイル | 内容 |
|---------|------|
| [nestjs-code-structure.md](./nestjs-code-structure.md) | NestJSコード構造と起動フロー解説 |
| [nestjs-controller.md](./nestjs-controller.md) | Controllerクラスの実装方法（デコレータ、DI、非同期処理） |
| [nestjs-validation-pipe.md](./nestjs-validation-pipe.md) | ValidationPipeと入力検証の仕組み |
| [dto-validation.md](./dto-validation.md) | DTOバリデーション詳解（class-validator応用） |
| [filter-interceptor.md](./filter-interceptor.md) | ExceptionFilter/Interceptor（リクエストライフサイクル、エラー処理） |
| [typeorm-transaction.md](./typeorm-transaction.md) | TypeORMトランザクション管理 |

## 学習の進め方

1. **コード構造の理解** - `nestjs-code-structure.md` でNestJSの基本構造を理解
2. **コードリーディング** - VSCodeのF12（定義へ移動）を使って実際のコードを追跡
3. **設計ドキュメント参照** - `docs/design/` で各サービスの詳細設計を確認

## VSCode Tips

### F12（定義へ移動）が動作しない場合

1. **Ctrl+Shift+P** → **TypeScript: Restart TS Server** を実行
2. それでも動作しない場合は **Developer: Reload Window** を実行

### 便利なショートカット

| キー | 機能 |
|-----|------|
| F12 | 定義へ移動 |
| Alt+F12 | 定義をピーク表示 |
| Ctrl+Shift+O | シンボル検索（現在のファイル） |
| Ctrl+T | シンボル検索（ワークスペース全体） |
| Ctrl+クリック | 定義へ移動（マウス版） |
