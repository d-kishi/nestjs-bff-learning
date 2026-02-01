# ADR-0006: pnpm + Bun移行

## ステータス

承認

## コンテキスト

ADR-0003でnpm workspacesを採用していたが、以下の理由で開発環境のモダナイゼーションを行う必要があった：

- パッケージマネージャの高速化
- ランタイムの高速化（テスト実行、開発サーバー起動）
- ツールバージョン管理の一元化（mise導入済み）

## 決定

npm workspaces → **pnpm workspaces** に移行し、ランタイムとして **Bun** を導入する。

### 構成

```
パッケージマネージャ: pnpm (workspaces)
ランタイム: Bun
ツール管理: mise (node, bun, pnpm)
```

### 変更内容

| 項目 | Before | After |
|------|--------|-------|
| パッケージマネージャ | npm | pnpm |
| ランタイム | Node.js | Bun |
| ロックファイル | package-lock.json | pnpm-lock.yaml |
| ワークスペース定義 | package.json workspaces | pnpm-workspace.yaml |
| bcrypt | bcrypt（ネイティブ） | bcryptjs（Pure JS） |

## 理由

### pnpm採用理由

- npmより高速なインストール
- 厳格な依存関係管理（phantom dependency防止）
- ディスク容量効率が良い（ハードリンク）
- workspaces機能はnpmと同等

### Bun採用理由

- Node.jsより高速な起動・実行
- npm/pnpmスクリプトの実行にも使用可能
- Node.js互換（既存コードがそのまま動作）
- TypeScript/JSXのネイティブサポート

### bcrypt → bcryptjs 変更理由

- bcryptはネイティブモジュールでBun非互換
- bcryptjsはPure JavaScript実装でBun互換
- API互換性あり（import文の変更のみ）

## 影響

### ファイル変更

- `pnpm-workspace.yaml` 新規作成
- `package.json` workspaces削除、scripts更新
- `mise.toml` bun/pnpm追加
- `.devcontainer/Dockerfile` Bun/pnpmインストール追加
- `services/user-service/` bcrypt → bcryptjs

### 開発者への影響

```bash
# Before
npm install
npm run start:task

# After
pnpm install
pnpm run start:task  # 内部でbun runを使用
```

## 備考

- 互換性検証（oracledb、Angular CLI）を実施し、問題なく動作することを確認
- 全741テストがBunで正常にパス
