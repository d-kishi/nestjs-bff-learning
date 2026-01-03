/**
 * UserListComponent
 *
 * ユーザー管理画面（Step 4で本実装）
 * - ユーザー一覧
 * - ロール編集
 * - ADMIN権限必須
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-user-list',
  standalone: true,
  template: `
    <div class="user-list">
      <h1>User Management</h1>
      <p>Coming in Step 4...</p>
    </div>
  `,
  styles: [
    `
      .user-list {
        padding: 2rem;
      }
    `,
  ],
})
export class UserListComponent {}
