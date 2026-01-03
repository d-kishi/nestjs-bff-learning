/**
 * ProfileComponent
 *
 * プロフィール画面（Step 3で本実装）
 * - プロフィール編集
 * - パスワード変更
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  template: `
    <div class="profile">
      <h1>Profile</h1>
      <p>Coming in Step 3...</p>
    </div>
  `,
  styles: [
    `
      .profile {
        padding: 2rem;
      }
    `,
  ],
})
export class ProfileComponent {}
