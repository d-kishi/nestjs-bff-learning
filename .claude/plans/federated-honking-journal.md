# Tasks機能マルチエージェント実践計画

## 目的

Claude CodeのTasks機能を使い、2件の学習資料を並行作成。その過程をキャプチャしてQiita記事を完成させる。

## 全体フロー

```
Phase 1: Plan承認 → Phase 2: Tasks登録・停止 → Phase 3: 並列実行 → Phase 4: 記事完成
```

---

## Phase 1: 環境準備

### 1-1. 環境変数付きでClaude Code起動

```powershell
$env:CLAUDE_CODE_TASK_LIST_ID = "learning-docs"; claude
```

**キャプチャポイント**: 起動後の画面（記事のStep 1用）

---

## Phase 2: Tasks登録

### 2-1. Plan承認後の指示

```
計画を承認します。
Tasksを作成したら実行せずに停止してください。
マルチエージェントで並列実行したいです。
```

### 2-2. 登録するTasks（4件）

| Task ID | Subject | Owner |
|---------|---------|-------|
| 1 | Guards学習資料作成 - 概要〜認可Guard | Agent1 |
| 2 | Guards学習資料作成 - JWT認証フロー〜まとめ | Agent1 |
| 3 | TypeORMエンティティ学習資料作成 - 概要〜リレーション | Agent2 |
| 4 | TypeORMエンティティ学習資料作成 - Transformer〜まとめ | Agent2 |

**キャプチャポイント**: TaskList表示（Ctrl+T）、登録完了時の画面

---

## Phase 3: マルチエージェント並列実行

### 3-1. ターミナル2を起動

```powershell
$env:CLAUDE_CODE_TASK_LIST_ID = "learning-docs"; claude
```

### 3-2. 各ターミナルへの指示

**ターミナル1（Agent1）**:
```
TaskListを確認して、Task 1と2（Guards学習資料）を担当してください。
```

**ターミナル2（Agent2）**:
```
TaskListを確認して、Task 3と4（TypeORMエンティティ学習資料）を担当してください。
```

**キャプチャポイント**: 2つのターミナルで並列作業中の画面

---

## Phase 4: 学習資料の内容

### 4-1. Guards学習資料（docs/learning/guards.md）

```
1. 概要（50行）
2. リクエストライフサイクルにおけるGuardの位置（80行）
3. CanActivateインターフェース（100行）
4. 認証Guard - JwtAuthGuard（150行）
5. 認可Guard - RolesGuard（200行）
6. カスタムデコレータとの連携（100行）
7. Guardの適用スコープ（80行）
8. JWT認証フロー全体像（150行）
9. Guard vs Middleware vs Interceptor（80行）
10. 本プロジェクトでの実装まとめ（80行）
11. まとめ（50行）
```

**想定行数**: 約1100行

**参照ファイル**:
- `services/api-gateway/src/common/guards/jwt-auth.guard.ts`
- `services/api-gateway/src/common/guards/roles.guard.ts`
- `services/user-service/src/common/guards/roles.guard.ts`
- `services/api-gateway/src/common/decorators/public.decorator.ts`
- `services/api-gateway/src/common/strategies/jwt.strategy.ts`

### 4-2. TypeORMエンティティ学習資料（docs/learning/typeorm-entity.md）

```
1. 概要（50行）
2. エンティティ定義の基本（150行）
3. データ型とOracle固有対応（100行）
4. Enumの扱い（80行）
5. リレーション詳解（250行）
   - OneToMany / ManyToOne
   - OneToOne
   - ManyToMany
6. インデックス定義（60行）
7. Value Transformer（80行）
8. Cascade設定の詳細（80行）
9. 外部キーと論理参照（100行）
10. エンティティ設計のベストプラクティス（80行）
11. 本プロジェクトのエンティティ一覧（80行）
12. まとめ（50行）
```

**想定行数**: 約1200行

**参照ファイル**:
- `services/task-service/src/task/entities/task.entity.ts`
- `services/task-service/src/project/entities/project.entity.ts`
- `services/user-service/src/user/entities/user.entity.ts`
- `services/user-service/src/user/entities/user-profile.entity.ts`

---

## Phase 5: Qiita記事完成

### 5-1. 更新対象

`C:\Develop\qiita-tech-blog\public\claude-code-tasks-multiagent.md`

### 5-2. 解決するTODO

| 行 | 現在のTODO | 解決方法 |
|----|-----------|---------|
| 74 | Ctrl+T でタスクリスト表示のスクリーンショット | Phase 2でキャプチャ |
| 177 | 環境変数付き起動のスクリーンショット | Phase 1でキャプチャ |
| 209 | TaskList登録完了のスクリーンショット | Phase 2でキャプチャ |
| 252 | 2つのターミナルで並列作業のスクリーンショット | Phase 3でキャプチャ |

---

## 検証方法

1. **学習資料の確認**
   - `docs/learning/guards.md` が存在し、約1100行
   - `docs/learning/typeorm-entity.md` が存在し、約1200行
   - `docs/learning/README.md` に新資料が追加されている

2. **フォーマット確認**
   - 既存資料（filter-interceptor.md）と同様の構成
   - mermaid図、テーブル、コード例が含まれている
   - プロジェクト内実装例への参照がある

3. **Qiita記事確認**
   - TODO コメントがすべて解決されている
   - スクリーンショットが適切な位置に配置されている

---

## 作業の独立性

- Guards資料: `guards/`, `decorators/`, `strategies/`を参照
- TypeORM資料: `entities/`を参照
- ファイル競合なし、概念も独立

**注意**: `docs/learning/README.md`の更新は両作業完了後に1回で実施
