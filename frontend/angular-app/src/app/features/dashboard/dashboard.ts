/**
 * DashboardComponent
 *
 * ダッシュボード画面（Step 2で本実装）
 * - ユーザー情報表示
 * - タスクサマリー
 * - プロジェクトサマリー
 * - 直近タスク5件
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>
      <p>Coming in Step 2...</p>
    </div>
  `,
  styles: [
    `
      .dashboard {
        padding: 2rem;
      }
    `,
  ],
})
export class DashboardComponent {}
