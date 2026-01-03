# Angular アーキテクチャ設計

## 概要

Phase 4 Angular統合のアーキテクチャ設計書。Angular 21 Standalone Component構成を採用し、BFF（api-gateway）と連携。

## 技術スタック

| 項目 | 技術 | バージョン |
|------|------|-----------|
| フレームワーク | Angular | 21.0.0 |
| 言語 | TypeScript | 5.9 |
| スタイル | SCSS | - |
| HTTPクライアント | @angular/common/http | 21.0.0 |
| ルーティング | @angular/router | 21.0.0 |
| 状態管理 | Angular Signals | 21.0.0 |

---

## ディレクトリ構成

```
frontend/angular-app/src/app/
├── app.ts                      # ルートコンポーネント
├── app.config.ts               # アプリケーション設定（providers）
├── app.routes.ts               # ルート定義
│
├── core/                       # シングルトンサービス・ガード・インターセプター
│   ├── services/
│   │   ├── auth.service.ts     # 認証状態管理・トークン操作
│   │   └── api.service.ts      # HTTP共通処理（ベースURL）
│   │
│   ├── guards/
│   │   ├── auth.guard.ts       # 認証必須ルート保護
│   │   ├── guest.guard.ts      # 未認証時のみアクセス可
│   │   └── admin.guard.ts      # ADMIN権限チェック
│   │
│   ├── interceptors/
│   │   ├── auth.interceptor.ts # Bearer Token自動付与
│   │   └── error.interceptor.ts# 共通エラーハンドリング
│   │
│   └── models/
│       ├── api-response.model.ts   # API統一レスポンス型
│       ├── auth.model.ts           # 認証関連型
│       ├── user.model.ts           # ユーザー関連型
│       ├── project.model.ts        # プロジェクト関連型
│       ├── task.model.ts           # タスク関連型
│       └── dashboard.model.ts      # ダッシュボード関連型
│
├── shared/                     # 再利用可能コンポーネント
│   ├── components/
│   │   ├── header/
│   │   │   ├── header.ts
│   │   │   ├── header.html
│   │   │   └── header.scss
│   │   ├── loading-spinner/
│   │   │   ├── loading-spinner.ts
│   │   │   ├── loading-spinner.html
│   │   │   └── loading-spinner.scss
│   │   ├── toast/
│   │   │   ├── toast.ts
│   │   │   ├── toast.html
│   │   │   └── toast.scss
│   │   ├── confirm-dialog/
│   │   │   ├── confirm-dialog.ts
│   │   │   ├── confirm-dialog.html
│   │   │   └── confirm-dialog.scss
│   │   └── pagination/
│   │       ├── pagination.ts
│   │       ├── pagination.html
│   │       └── pagination.scss
│   │
│   └── pipes/
│       └── date-format.pipe.ts # 日付フォーマット
│
└── features/                   # 機能別モジュール（遅延ロード）
    ├── auth/
    │   ├── login/
    │   │   ├── login.ts
    │   │   ├── login.html
    │   │   └── login.scss
    │   └── auth.routes.ts
    │
    ├── dashboard/
    │   ├── dashboard.ts
    │   ├── dashboard.html
    │   ├── dashboard.scss
    │   └── dashboard.routes.ts
    │
    ├── projects/
    │   ├── project-list/
    │   │   ├── project-list.ts
    │   │   ├── project-list.html
    │   │   └── project-list.scss
    │   ├── project-dialog/
    │   │   ├── project-dialog.ts
    │   │   ├── project-dialog.html
    │   │   └── project-dialog.scss
    │   ├── projects.service.ts
    │   └── projects.routes.ts
    │
    ├── tasks/
    │   ├── task-list/
    │   │   ├── task-list.ts
    │   │   ├── task-list.html
    │   │   └── task-list.scss
    │   ├── task-dialog/
    │   │   ├── task-dialog.ts
    │   │   ├── task-dialog.html
    │   │   └── task-dialog.scss
    │   ├── tasks.service.ts
    │   └── tasks.routes.ts
    │
    ├── profile/
    │   ├── profile.ts
    │   ├── profile.html
    │   ├── profile.scss
    │   ├── password-dialog/
    │   │   ├── password-dialog.ts
    │   │   ├── password-dialog.html
    │   │   └── password-dialog.scss
    │   └── profile.routes.ts
    │
    └── admin/
        ├── users/
        │   ├── user-list/
        │   │   ├── user-list.ts
        │   │   ├── user-list.html
        │   │   └── user-list.scss
        │   ├── role-edit-dialog/
        │   │   ├── role-edit-dialog.ts
        │   │   ├── role-edit-dialog.html
        │   │   └── role-edit-dialog.scss
        │   └── users.service.ts
        │
        ├── roles/
        │   ├── role-list/
        │   │   ├── role-list.ts
        │   │   ├── role-list.html
        │   │   └── role-list.scss
        │   ├── role-dialog/
        │   │   ├── role-dialog.ts
        │   │   ├── role-dialog.html
        │   │   └── role-dialog.scss
        │   └── roles.service.ts
        │
        └── admin.routes.ts
```

---

## 認証フロー設計

### JWT保存方式

**localStorage を採用**

```typescript
// 保存するデータ構造
interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    displayName: string;
    roles: string[];
  };
}

// キー名
const AUTH_STORAGE_KEY = 'auth';
```

**判断理由**:
- 学習プロジェクトのため、シンプルさを優先
- タブ・ウィンドウ間で共有可能
- リロード後も状態維持

**注意点**:
- XSS脆弱性のリスクあり（プロダクションではhttpOnly Cookie推奨）

### 認証フロー図

```
[ログイン]
    │
    v
POST /api/auth/login
    │
    v
{ accessToken, refreshToken, user } を受信
    │
    v
localStorage に保存
    │
    v
AuthService.currentUser$（Signal）を更新
    │
    v
/dashboard へリダイレクト


[認証必須リクエスト]
    │
    v
authInterceptor が Authorization ヘッダを付与
    │
    ├──(200 OK)──> データ取得成功
    │
    └──(401 Unauthorized)──> refreshToken で再取得試行
                                   │
                                   ├──(成功)──> 新トークン保存 → リトライ
                                   │
                                   └──(失敗)──> ログアウト → /login へ


[ログアウト]
    │
    v
POST /api/auth/logout（refreshToken送信）
    │
    v
localStorage クリア
    │
    v
/login へリダイレクト
```

### AuthService 設計

```typescript
// core/services/auth.service.ts

@Injectable({ providedIn: 'root' })
export class AuthService {
  // 現在のユーザー（Signal）
  private currentUserSignal = signal<User | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();

  // 認証状態（computed）
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly isAdmin = computed(() =>
    this.currentUserSignal()?.roles.includes('ADMIN') ?? false
  );

  // ログイン
  login(email: string, password: string): Observable<AuthResponse>;

  // 登録
  register(email: string, password: string, displayName: string): Observable<AuthResponse>;

  // ログアウト
  logout(): Observable<void>;

  // トークンリフレッシュ
  refreshToken(): Observable<TokenPair>;

  // アクセストークン取得
  getAccessToken(): string | null;

  // 初期化（アプリ起動時にlocalStorageから復元）
  initialize(): void;
}
```

### Guard 設計

```typescript
// core/guards/auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // 認証失敗時はログインページへ（returnUrl保持）
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};

// core/guards/guest.guard.ts
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // 認証済みはダッシュボードへ
  router.navigate(['/dashboard']);
  return false;
};

// core/guards/admin.guard.ts
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  // ADMIN権限なしはダッシュボードへ
  router.navigate(['/dashboard']);
  return false;
};
```

### Interceptor 設計

```typescript
// core/interceptors/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // 公開エンドポイントはスキップ
  const publicUrls = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];
  if (publicUrls.some(url => req.url.includes(url))) {
    return next(req);
  }

  const token = authService.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/api/auth/refresh')) {
        // リフレッシュ試行
        return authService.refreshToken().pipe(
          switchMap((tokens) => {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${tokens.accessToken}` }
            });
            return next(retryReq);
          }),
          catchError(() => {
            authService.logout();
            return throwError(() => error);
          })
        );
      }
      return throwError(() => error);
    })
  );
};

// core/interceptors/error.interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // BFFエラーレスポンス解析
      if (error.error?.error?.message) {
        toastService.error(error.error.error.message);
      } else {
        toastService.error('エラーが発生しました');
      }
      return throwError(() => error);
    })
  );
};
```

---

## ルーティング設計

### app.routes.ts

```typescript
export const routes: Routes = [
  // 認証不要ルート
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
  },

  // 認証必須ルート
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./features/projects/project-list/project-list').then(m => m.ProjectListComponent)
      },
      {
        path: 'tasks',
        loadComponent: () => import('./features/tasks/task-list/task-list').then(m => m.TaskListComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then(m => m.ProfileComponent)
      },

      // ADMIN専用ルート
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          {
            path: 'users',
            loadComponent: () => import('./features/admin/users/user-list/user-list').then(m => m.UserListComponent)
          },
          {
            path: 'roles',
            loadComponent: () => import('./features/admin/roles/role-list/role-list').then(m => m.RoleListComponent)
          }
        ]
      }
    ]
  },

  // 404
  { path: '**', redirectTo: 'dashboard' }
];
```

---

## 型定義

### API共通レスポンス型

```typescript
// core/models/api-response.model.ts

/** メタ情報 */
export interface ResponseMeta {
  timestamp: string;
}

/** ページネーションメタ情報 */
export interface PaginationMeta extends ResponseMeta {
  total: number;
  page: number;
  limit: number;
}

/** 成功レスポンス（単一リソース） */
export interface ApiResponse<T> {
  data: T;
  meta: ResponseMeta;
}

/** 成功レスポンス（一覧） */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/** エラーレスポンス */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
  meta: ResponseMeta;
}
```

### 認証関連型

```typescript
// core/models/auth.model.ts

/** ログインリクエスト */
export interface LoginRequest {
  email: string;
  password: string;
}

/** 登録リクエスト */
export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

/** 認証レスポンス */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/** トークンペア */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
```

### ユーザー関連型

```typescript
// core/models/user.model.ts

/** ユーザー */
export interface User {
  id: number;
  email: string;
  profile: UserProfile;
  roles: Role[];
  isActive: boolean;
  createdAt: string;
}

/** ユーザープロフィール */
export interface UserProfile {
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
}

/** ロール */
export interface Role {
  id: number;
  name: string;
  description: string | null;
}
```

### プロジェクト関連型

```typescript
// core/models/project.model.ts

/** プロジェクト */
export interface Project {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

/** プロジェクト作成リクエスト */
export interface CreateProjectRequest {
  name: string;
  description?: string;
}

/** プロジェクト更新リクエスト */
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}
```

### タスク関連型

```typescript
// core/models/task.model.ts

/** タスクステータス */
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

/** タスク優先度 */
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

/** タスク */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  projectId: number;
  assigneeId: number | null;
  createdAt: string;
  updatedAt: string;
}

/** タスク作成リクエスト */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  projectId: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}

/** タスク更新リクエスト */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}
```

### ダッシュボード関連型

```typescript
// core/models/dashboard.model.ts

/** ダッシュボードレスポンス */
export interface DashboardResponse {
  user: UserSummary | null;
  taskSummary: TaskSummary;
  projectSummary: ProjectSummary;
  recentTasks: RecentTask[];
  _errors?: string[];
}

/** ユーザーサマリー */
export interface UserSummary {
  id: number;
  email: string;
  profile: {
    displayName: string;
    avatarUrl: string | null;
  };
}

/** タスクサマリー */
export interface TaskSummary {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
}

/** プロジェクトサマリー */
export interface ProjectSummary {
  total: number;
  owned: number;
}

/** 直近タスク */
export interface RecentTask {
  id: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  projectId: number;
  projectName: string;
}
```

---

## app.config.ts 設定

```typescript
// app.config.ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    )
  ]
};
```

---

## Proxy設定（CORS対策）

### proxy.conf.json

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

### angular.json 追記

```json
{
  "projects": {
    "angular-app": {
      "architect": {
        "serve": {
          "options": {
            "proxyConfig": "proxy.conf.json"
          }
        }
      }
    }
  }
}
```

---

## 状態管理

### Angular Signals 採用

```typescript
// シンプルな状態管理にはSignalsを使用
@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
}
```

**判断理由**:
- NgRxは過剰（学習プロジェクトの規模に対して）
- Angular 21のSignalsで十分対応可能
- ボイラープレート削減

---

## Skills活用方針

### /frontend-design

**対象**: 全画面・コンポーネントの実装

**プロンプト例**:
```
/frontend-design を使用して、以下の仕様でログイン画面を実装してください。

## 技術要件
- Angular 21 Standalone Component
- SCSSでスタイリング
- Reactive Forms

## 画面仕様
- タブ形式でログイン/新規登録を切替
- バリデーション: 必須、Email形式、パスワード8文字以上
- エラーメッセージ表示

## デザイン方針
- シンプルで見やすいUI
- 余白を十分に確保
- フォームは中央配置
```

### /theme-factory

**対象**: 全画面実装後のテーマ統一

**プロンプト例**:
```
/theme-factory を使用して、シンプルなテーマを適用してください。

## 要件
- プライマリカラー: 青系（#1976d2程度）
- セカンダリカラー: グレー系
- フォント: システムフォント
- ボタン・フォームのスタイル統一
- 余白・サイズの統一
```

### /webapp-testing

**対象**: E2Eテスト（認証フロー優先）

**プロンプト例**:
```
/webapp-testing を使用して、認証フローのE2Eテストを作成してください。

## テストシナリオ
1. ログイン成功 → ダッシュボード表示
2. ログイン失敗 → エラーメッセージ表示
3. 未認証時 → ログイン画面リダイレクト
4. ログアウト → ログイン画面遷移
```

---

## 開発環境

### ポート構成

| サービス | ポート |
|---------|-------|
| Angular | 4200 |
| api-gateway | 3000 |
| task-service | 3001 |
| user-service | 3002 |

### 起動コマンド

```bash
# Angular開発サーバー起動
cd frontend/angular-app
npm start

# BFF起動
npm run start:gateway

# バックエンドサービス起動
npm run start:task
npm run start:user
```

---

## E2Eテスト設計（Playwright）

### 方針

**認証フローのみE2Eテストを実施**（正常系のみ）

| 対象 | テスト有無 | 理由 |
|------|-----------|------|
| 認証フロー | ✅ E2E | Interceptor・Guard連携が複雑、手動では見落としやすい |
| CRUD操作 | ❌ 手動 | BFF側でテスト済み、シンプルな操作 |

### ディレクトリ構成

```
frontend/angular-app/
├── e2e/
│   ├── auth.spec.ts          # 認証フローテスト
│   ├── fixtures/
│   │   └── test-user.ts      # テストユーザー情報
│   └── support/
│       └── commands.ts       # カスタムコマンド（ログイン等）
├── playwright.config.ts      # Playwright設定
└── package.json              # @playwright/test追加
```

### テストシナリオ（5ケース）

```typescript
// e2e/auth.spec.ts

describe('認証フロー', () => {
  // 1. ログイン成功
  test('正しい認証情報でログインするとダッシュボードに遷移する', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'Password123');
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
  });

  // 2. 新規登録成功
  test('新規ユーザーを登録するとダッシュボードに遷移する', async ({ page }) => {
    const uniqueEmail = `test-${Date.now()}@example.com`;

    await page.goto('/login');
    await page.click('[data-testid="register-tab"]');
    await page.fill('[data-testid="email"]', uniqueEmail);
    await page.fill('[data-testid="password"]', 'Password123');
    await page.fill('[data-testid="display-name"]', 'テストユーザー');
    await page.click('[data-testid="register-button"]');

    await expect(page).toHaveURL('/dashboard');
  });

  // 3. 未認証時リダイレクト
  test('未認証で認証必須ページにアクセスするとログイン画面にリダイレクトされる', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login/);
  });

  // 4. ログアウト
  test('ログアウトするとログイン画面に遷移する', async ({ page }) => {
    // ログイン済み状態をセットアップ
    await loginAsTestUser(page);

    await page.click('[data-testid="logout-button"]');

    await expect(page).toHaveURL('/login');
    // localStorageがクリアされていることを確認
    const auth = await page.evaluate(() => localStorage.getItem('auth'));
    expect(auth).toBeNull();
  });

  // 5. ログイン状態維持
  test('リロード後もログイン状態が維持される', async ({ page }) => {
    await loginAsTestUser(page);
    await expect(page).toHaveURL('/dashboard');

    await page.reload();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
  });
});
```

### Playwright設定

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Angular開発サーバー起動（テスト実行前）
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### package.json追記

```json
{
  "devDependencies": {
    "@playwright/test": "^1.40.0"
  },
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

### テスト実行前提条件

E2Eテスト実行時は以下のサービスが起動している必要がある：

```bash
# 1. バックエンドサービス起動
npm run start:task
npm run start:user
npm run start:gateway

# 2. E2Eテスト実行（Angular開発サーバーは自動起動）
cd frontend/angular-app
npm run test:e2e
```

### Playwright MCP連携

`/webapp-testing` スキルでPlaywright MCPを活用：

```
/webapp-testing を使用して、認証フローのE2Eテストを実行・検証してください。

## 対象シナリオ
1. ログイン成功 → ダッシュボード表示
2. 新規登録成功 → ダッシュボード表示
3. 未認証時リダイレクト
4. ログアウト
5. ログイン状態維持

## 確認ポイント
- URL遷移が正しいか
- localStorageにトークンが保存/削除されるか
- ユーザー名が表示されるか
```

### data-testid属性

テスト対象要素には`data-testid`属性を付与：

| 要素 | data-testid |
|------|-------------|
| Emailフィールド | `email` |
| Passwordフィールド | `password` |
| Display Nameフィールド | `display-name` |
| ログインボタン | `login-button` |
| 登録ボタン | `register-button` |
| 登録タブ | `register-tab` |
| ログアウトボタン | `logout-button` |
| ユーザー名表示 | `user-name` |

---

## 備考

- レスポンシブ対応は最小限（デスクトップ優先）
- ダークモード未対応
- アニメーションは控えめに
- アクセシビリティ対応は基本的な範囲のみ
