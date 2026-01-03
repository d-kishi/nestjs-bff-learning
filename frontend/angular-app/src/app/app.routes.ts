/**
 * アプリケーションルーティング設定
 *
 * 認証フロー:
 * - 未認証: /login へリダイレクト
 * - 認証済み: /dashboard（デフォルト）
 * - 認証済みで/login: /dashboard へリダイレクト
 */
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // デフォルトルート
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  // 認証ページ（未認証のみアクセス可能）
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },

  // ダッシュボード（認証必須）
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },

  // プロジェクト一覧（認証必須）
  {
    path: 'projects',
    loadComponent: () =>
      import('./features/projects/project-list/project-list').then(
        (m) => m.ProjectListComponent
      ),
    canActivate: [authGuard],
  },

  // タスク一覧（認証必須）
  {
    path: 'tasks',
    loadComponent: () =>
      import('./features/tasks/task-list/task-list').then(
        (m) => m.TaskListComponent
      ),
    canActivate: [authGuard],
  },

  // プロフィール（認証必須）
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },

  // 管理者機能（ADMIN権限必須）
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/users/user-list/user-list').then(
            (m) => m.UserListComponent
          ),
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./features/admin/roles/role-list/role-list').then(
            (m) => m.RoleListComponent
          ),
      },
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full',
      },
    ],
  },

  // 404: ダッシュボードへリダイレクト
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
