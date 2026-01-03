/**
 * TaskListComponent
 *
 * タスク一覧画面（Step 3で本実装）
 * - タスクCRUD
 * - フィルター（ステータス、優先度、プロジェクト）
 * - ソート（期限日、優先度）
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-task-list',
  standalone: true,
  template: `
    <div class="task-list">
      <h1>Tasks</h1>
      <p>Coming in Step 3...</p>
    </div>
  `,
  styles: [
    `
      .task-list {
        padding: 2rem;
      }
    `,
  ],
})
export class TaskListComponent {}
