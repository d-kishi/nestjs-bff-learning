# US014: BFFデータ集約

## ストーリー

Angularアプリケーションのユーザーとして、
ダッシュボード画面に表示するデータをBFFから一括で取得したい。
それにより、複数のAPIを個別に呼び出す必要がなく、効率的にデータを取得できる。

## 受け入れ基準

- BFFがtask-serviceとuser-serviceから並列でデータを取得し、集約して返却する
- 一部のサービスがダウンしている場合でも、動作可能なサービスからはデータを返却する（部分失敗ハンドリング）
- 部分失敗時は `_errors` 配列でエラー情報を通知する
- タスクとプロジェクトのサマリー情報（件数、ステータス別内訳）を算出して返却する

## アンチパターン（これは仕様に含まない）

- クライアント側でのデータ集約は行わない（BFFの責務）
- 全サービス障害時にキャッシュからデータを返却する機能は実装しない
- リアルタイム更新（WebSocket）は本フェーズではスコープ外

## テストシナリオ

### 正常系

#### シナリオ1: ダッシュボードデータ取得（全サービス正常）

- **Given（前提）**: 認証済みユーザー（userId=1）、タスク3件、プロジェクト2件が存在
- **When（操作）**: GET /api/dashboard に `Authorization: Bearer <access_token>` でリクエスト
- **Then（結果）**:
  - HTTPステータス 200 が返る
  - レスポンスに以下が含まれる:
    - `user`: ユーザー情報
    - `taskSummary`: タスクサマリー（total, todo, inProgress, done）
    - `projectSummary`: プロジェクトサマリー（total, owned）
    - `recentTasks`: 直近タスク一覧
  - `_errors` は含まれない

```json
{
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "profile": {
        "displayName": "山田太郎"
      }
    },
    "taskSummary": {
      "total": 3,
      "todo": 1,
      "inProgress": 1,
      "done": 1
    },
    "projectSummary": {
      "total": 2,
      "owned": 2
    },
    "recentTasks": [
      {
        "id": 1,
        "title": "タスクA",
        "status": "IN_PROGRESS",
        "priority": "HIGH",
        "dueDate": "2025-01-20T00:00:00Z",
        "projectId": 1,
        "projectName": "プロジェクトA"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

#### シナリオ2: タスクがない場合

- **Given（前提）**: 認証済みユーザー、タスク0件、プロジェクト1件
- **When（操作）**: GET /api/dashboard にリクエスト
- **Then（結果）**:
  - HTTPステータス 200 が返る
  - `taskSummary.total` が 0
  - `recentTasks` が空配列

### 部分失敗系

#### シナリオ3: user-serviceがダウン

- **Given（前提）**: user-serviceが停止中、task-serviceは正常
- **When（操作）**: GET /api/dashboard にリクエスト
- **Then（結果）**:
  - HTTPステータス 200 が返る
  - `user` が `null`
  - `taskSummary`, `projectSummary`, `recentTasks` は正常に返却
  - `_errors` 配列に `"user-service unavailable"` が含まれる

```json
{
  "data": {
    "user": null,
    "taskSummary": {
      "total": 3,
      "todo": 1,
      "inProgress": 1,
      "done": 1
    },
    "projectSummary": {
      "total": 2,
      "owned": 2
    },
    "recentTasks": [...]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  },
  "_errors": ["user-service unavailable"]
}
```

#### シナリオ4: task-serviceがダウン

- **Given（前提）**: task-serviceが停止中、user-serviceは正常
- **When（操作）**: GET /api/dashboard にリクエスト
- **Then（結果）**:
  - HTTPステータス 200 が返る
  - `user` は正常に返却
  - `taskSummary` は全て0
  - `projectSummary` は全て0
  - `recentTasks` は空配列
  - `_errors` 配列に `"task-service unavailable"` が含まれる

```json
{
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "profile": {
        "displayName": "山田太郎"
      }
    },
    "taskSummary": {
      "total": 0,
      "todo": 0,
      "inProgress": 0,
      "done": 0
    },
    "projectSummary": {
      "total": 0,
      "owned": 0
    },
    "recentTasks": []
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  },
  "_errors": ["task-service unavailable"]
}
```

#### シナリオ5: 両サービスがダウン

- **Given（前提）**: task-serviceとuser-serviceが両方停止中
- **When（操作）**: GET /api/dashboard にリクエスト
- **Then（結果）**:
  - HTTPステータス 200 が返る
  - 全てのデータがデフォルト値（null, 0, 空配列）
  - `_errors` 配列に両サービスのエラーが含まれる

```json
{
  "data": {
    "user": null,
    "taskSummary": {
      "total": 0,
      "todo": 0,
      "inProgress": 0,
      "done": 0
    },
    "projectSummary": {
      "total": 0,
      "owned": 0
    },
    "recentTasks": []
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  },
  "_errors": [
    "user-service unavailable",
    "task-service unavailable"
  ]
}
```

### 異常系

#### シナリオ6: 未認証でアクセス

- **Given（前提）**: Authorizationヘッダなし
- **When（操作）**: GET /api/dashboard にリクエスト
- **Then（結果）**:
  - HTTPステータス 401 が返る
  - エラーコード `BFF_UNAUTHORIZED` が返る

#### シナリオ7: 無効なJWTでアクセス

- **Given（前提）**: 期限切れまたは改ざんされたJWT
- **When（操作）**: GET /api/dashboard に `Authorization: Bearer <invalid_token>` でリクエスト
- **Then（結果）**:
  - HTTPステータス 401 が返る
  - エラーコード `BFF_UNAUTHORIZED` が返る

## BFFデータ集約フロー図

```
┌─────────┐         ┌─────────┐         ┌──────────────┐
│ Angular │────────▶│   BFF   │────────▶│ user-service │
└─────────┘         └─────────┘         └──────────────┘
                         │
                         │              ┌──────────────┐
                         └─────────────▶│ task-service │
                                        └──────────────┘

GET /api/dashboard のフロー:

1. [Angular] GET /api/dashboard (Authorization: Bearer <JWT>)

2. [BFF] JWT検証・デコード
   → userId=1, roles=["MEMBER"]

3. [BFF] 並列リクエスト発行（Promise.allSettled）
   ┌──────────────────────────────────────────────────┐
   │                                                  │
   │  → GET /users/1 (X-User-Id: 1) → user-service    │
   │  → GET /tasks?assigneeId=1    → task-service     │
   │  → GET /projects?ownerId=1    → task-service     │
   │                                                  │
   └──────────────────────────────────────────────────┘

4. [BFF] 結果を集約・整形
   - 成功したリクエストからデータ抽出
   - 失敗したリクエストは _errors に記録
   - タスク/プロジェクトのサマリーを算出

5. [BFF] → [Angular]
   {
     user: {...} | null,
     taskSummary: {...},
     projectSummary: {...},
     recentTasks: [...],
     _errors?: [...]
   }
```

## 実装ポイント

### 並列リクエストと部分失敗ハンドリング

```typescript
// dashboard/dashboard.service.ts
@Injectable()
export class DashboardService {
  constructor(
    private readonly userClient: UserServiceClient,
    private readonly taskClient: TaskServiceClient,
  ) {}

  async getDashboard(user: UserFromJwt): Promise<DashboardResponse> {
    const errors: string[] = [];

    // 並列リクエスト（Promise.allSettled で全結果を待つ）
    const [userResult, tasksResult, projectsResult] = await Promise.allSettled([
      this.userClient.getUser(user.id, user.id, user.roles),
      this.taskClient.getTasks(user.id, user.roles, { assigneeId: user.id }),
      this.taskClient.getProjects(user.id, user.roles, { ownerId: user.id }),
    ]);

    // user-service 結果処理
    const userInfo = this.processResult(
      userResult,
      null,
      'user-service unavailable',
      errors,
    );

    // task-service（タスク）結果処理
    const tasks = this.processResult(
      tasksResult,
      { data: [], meta: { total: 0 } },
      'task-service unavailable',
      errors,
    );

    // task-service（プロジェクト）結果処理
    const projects = this.processResult(
      projectsResult,
      { data: [], meta: { total: 0 } },
      'task-service unavailable',
      errors,
    );

    // サマリー算出
    const taskSummary = this.summarizeTasks(tasks.data);
    const projectSummary = this.summarizeProjects(projects.data, user.id);
    const recentTasks = this.extractRecentTasks(tasks.data, 5);

    return {
      user: userInfo,
      taskSummary,
      projectSummary,
      recentTasks,
      ...(errors.length > 0 && { _errors: [...new Set(errors)] }), // 重複排除
    };
  }

  /**
   * Promise.allSettledの結果を処理
   * 成功時: 値を返却
   * 失敗時: デフォルト値を返却し、エラーを記録
   */
  private processResult<T>(
    result: PromiseSettledResult<T>,
    defaultValue: T,
    errorMessage: string,
    errors: string[],
  ): T {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      errors.push(errorMessage);
      return defaultValue;
    }
  }

  /**
   * タスクサマリー算出
   */
  private summarizeTasks(tasks: Task[]): TaskSummary {
    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'TODO').length,
      inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      done: tasks.filter((t) => t.status === 'DONE').length,
    };
  }

  /**
   * プロジェクトサマリー算出
   */
  private summarizeProjects(projects: Project[], userId: number): ProjectSummary {
    return {
      total: projects.length,
      owned: projects.filter((p) => p.ownerId === userId).length,
    };
  }

  /**
   * 直近タスク抽出（更新日時降順、上位N件）
   */
  private extractRecentTasks(tasks: Task[], limit: number): RecentTask[] {
    return tasks
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit)
      .map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        projectId: task.projectId,
        projectName: task.project?.name || 'Unknown',
      }));
  }
}
```

### レスポンス型定義

```typescript
// dashboard/dto/dashboard-response.dto.ts

export interface DashboardResponse {
  user: UserSummary | null;
  taskSummary: TaskSummary;
  projectSummary: ProjectSummary;
  recentTasks: RecentTask[];
  _errors?: string[];
}

export interface UserSummary {
  id: number;
  email: string;
  profile: {
    displayName: string;
    avatarUrl: string | null;
  };
}

export interface TaskSummary {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
}

export interface ProjectSummary {
  total: number;
  owned: number;
}

export interface RecentTask {
  id: number;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  projectId: number;
  projectName: string;
}
```

### コントローラ

```typescript
// dashboard/dashboard.controller.ts
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * ダッシュボードデータ取得
   * 複数サービスから並列でデータを取得し、集約して返却
   */
  @Get()
  async getDashboard(@CurrentUser() user: UserFromJwt): Promise<DashboardResponse> {
    return this.dashboardService.getDashboard(user);
  }
}
```

## 学習ポイント

### 1. Promise.allSettled vs Promise.all

| 方式 | 挙動 | 用途 |
|------|------|------|
| `Promise.all` | 1つでも失敗すると全体が失敗 | 全リクエスト成功が必須の場合 |
| `Promise.allSettled` | 成功・失敗を個別に取得 | 部分失敗を許容する場合 |

本実装では部分失敗ハンドリングのため `Promise.allSettled` を使用。

### 2. 部分失敗パターン

- **クライアント通知**: `_errors` 配列でエラー情報を返却
- **デフォルト値**: 失敗したデータはnullまたは空配列で返却
- **HTTPステータス**: 部分失敗でも200を返却（5xxは全サービス障害時のみ）

### 3. パフォーマンス考慮

- 並列リクエストで応答時間を最小化
- タイムアウト設定（5秒）で長時間待機を防止
- 必要なフィールドのみ返却（過剰なデータ取得を回避）

## 関連

- US013: BFF認証（認証済みリクエストの基盤）
- [api-gateway API設計](../design/api-gateway-api.md)
- [api-gateway 型定義](../design/api-gateway-types.md)
