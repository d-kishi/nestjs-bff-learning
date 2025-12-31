# タスクチェックリスト

中長期的なタスクを管理します。セッション単位のTodoWriteとは別に、Phase単位・プロジェクト単位のタスクを記録。

## Phase 1: task-service

### 環境構築
- [ ] DevContainer設定作成
- [ ] Oracle XE接続確認
- [ ] task-service雛形作成（nest new）

### エンティティ実装
- [ ] Project エンティティ
- [ ] Task エンティティ
- [ ] Comment エンティティ
- [ ] Tag エンティティ（多対多）

### API実装
- [ ] Project CRUD
- [ ] Task CRUD
- [ ] Comment CRUD
- [ ] Tag CRUD

### テスト
- [ ] Service層ユニットテスト
- [ ] API E2Eテスト

---

## Phase 2: user-service

### 環境構築
- [ ] user-service雛形作成

### エンティティ実装
- [ ] User エンティティ
- [ ] UserProfile エンティティ
- [ ] Role エンティティ（多対多）

### 認証・認可
- [ ] JWT認証実装
- [ ] RBACガード実装

---

## Phase 3: api-gateway (BFF)

- [ ] api-gateway雛形作成
- [ ] サービス間通信実装
- [ ] データ集約エンドポイント
- [ ] 部分失敗ハンドリング

---

## Phase 4: Angular統合

- [ ] Angular雛形作成
- [ ] 認証画面
- [ ] タスク管理画面
