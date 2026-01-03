/**
 * ProjectListComponent
 *
 * プロジェクト一覧画面（Step 3で本実装）
 * - プロジェクトCRUD
 * - ページネーション
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-project-list',
  standalone: true,
  template: `
    <div class="project-list">
      <h1>Projects</h1>
      <p>Coming in Step 3...</p>
    </div>
  `,
  styles: [
    `
      .project-list {
        padding: 2rem;
      }
    `,
  ],
})
export class ProjectListComponent {}
