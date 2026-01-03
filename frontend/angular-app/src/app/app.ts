/**
 * AppComponent（ルートコンポーネント）
 *
 * アプリケーションのルートコンポーネント
 *
 * 責務:
 * - 認証状態に応じたレイアウト制御
 * - 共通コンポーネント（Header, Toast）の配置
 * - RouterOutletによる画面切り替え
 */
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { HeaderComponent } from './shared/components/header/header';
import { ToastComponent } from './shared/components/toast/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly authService = inject(AuthService);
}
