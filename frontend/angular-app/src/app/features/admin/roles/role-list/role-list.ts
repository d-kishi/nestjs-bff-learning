/**
 * RoleListComponent
 *
 * ロール管理画面（Step 4で本実装）
 * - ロール一覧
 * - ロールCRUD
 * - ADMIN権限必須
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-role-list',
  standalone: true,
  template: `
    <div class="role-list">
      <h1>Role Management</h1>
      <p>Coming in Step 4...</p>
    </div>
  `,
  styles: [
    `
      .role-list {
        padding: 2rem;
      }
    `,
  ],
})
export class RoleListComponent {}
