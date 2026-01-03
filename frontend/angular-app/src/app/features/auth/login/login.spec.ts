/**
 * LoginComponent テスト
 *
 * TDD: ログイン画面のテストケース
 */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginComponent } from './login';
import { AuthService } from '../../../core/services/auth.service';
import { AuthResponse } from '../../../core/models/auth.model';
import { User } from '../../../core/models/user.model';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: { login: ReturnType<typeof vi.fn>; register: ReturnType<typeof vi.fn> };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    profile: { displayName: 'Test User', bio: null, avatarUrl: null },
    roles: [{ id: 1, name: 'MEMBER', description: null }],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const mockAuthResponse: AuthResponse = {
    user: mockUser,
    accessToken: 'mock-token',
    refreshToken: 'mock-refresh-token',
  };

  beforeEach(() => {
    TestBed.resetTestingModule();

    authServiceSpy = {
      login: vi.fn(),
      register: vi.fn(),
    };

    routerSpy = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('初期表示', () => {
    it('ログインタブがアクティブであること', () => {
      expect(component.activeTab()).toBe('login');
    });

    it('ログインフォームが表示されること', () => {
      const emailInput = fixture.debugElement.query(By.css('[data-testid="email"]'));
      const passwordInput = fixture.debugElement.query(By.css('[data-testid="password"]'));
      const loginButton = fixture.debugElement.query(By.css('[data-testid="login-button"]'));

      expect(emailInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
      expect(loginButton).toBeTruthy();
    });

    it('表示名入力が非表示であること（ログインタブ）', () => {
      const displayNameInput = fixture.debugElement.query(By.css('[data-testid="display-name"]'));
      expect(displayNameInput).toBeFalsy();
    });
  });

  describe('タブ切り替え', () => {
    it('新規登録タブをクリックすると表示名入力が表示されること', () => {
      const registerTab = fixture.debugElement.query(By.css('[data-testid="register-tab"]'));
      registerTab.nativeElement.click();
      fixture.detectChanges();

      expect(component.activeTab()).toBe('register');
      const displayNameInput = fixture.debugElement.query(By.css('[data-testid="display-name"]'));
      expect(displayNameInput).toBeTruthy();
    });

    it('新規登録タブでは登録ボタンが表示されること', () => {
      component.activeTab.set('register');
      fixture.detectChanges();

      const registerButton = fixture.debugElement.query(By.css('[data-testid="register-button"]'));
      expect(registerButton).toBeTruthy();
    });
  });

  describe('ログイン', () => {
    it('ログインボタン押下時、AuthService.login()が呼ばれること', () => {
      authServiceSpy.login.mockReturnValue(of(mockAuthResponse));

      component.loginForm.setValue({
        email: 'test@example.com',
        password: 'Password123',
      });
      fixture.detectChanges();

      const loginButton = fixture.debugElement.query(By.css('[data-testid="login-button"]'));
      loginButton.nativeElement.click();

      expect(authServiceSpy.login).toHaveBeenCalledWith('test@example.com', 'Password123');
    });

    it('ログインエラー時、エラーメッセージが表示されること', () => {
      const errorResponse = new HttpErrorResponse({
        error: { error: { message: 'メールアドレスまたはパスワードが正しくありません' } },
        status: 401,
      });
      authServiceSpy.login.mockReturnValue(throwError(() => errorResponse));

      component.loginForm.setValue({
        email: 'test@example.com',
        password: 'WrongPassword',
      });
      component.onLogin();
      fixture.detectChanges();

      expect(component.errorMessage()).toBeTruthy();
    });
  });

  describe('新規登録', () => {
    beforeEach(() => {
      component.activeTab.set('register');
      fixture.detectChanges();
    });

    it('登録ボタン押下時、AuthService.register()が呼ばれること', () => {
      authServiceSpy.register.mockReturnValue(of(mockAuthResponse));

      component.registerForm.setValue({
        email: 'new@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        displayName: 'New User',
      });
      fixture.detectChanges();

      const registerButton = fixture.debugElement.query(By.css('[data-testid="register-button"]'));
      registerButton.nativeElement.click();

      expect(authServiceSpy.register).toHaveBeenCalledWith(
        'new@example.com',
        'Password123',
        'New User'
      );
    });
  });

  describe('バリデーション', () => {
    it('メールアドレスが空の場合、ログインボタンが無効であること', () => {
      component.loginForm.setValue({
        email: '',
        password: 'Password123',
      });
      fixture.detectChanges();

      const loginButton = fixture.debugElement.query(By.css('[data-testid="login-button"]'));
      expect(loginButton.nativeElement.disabled).toBe(true);
    });

    it('パスワードが空の場合、ログインボタンが無効であること', () => {
      component.loginForm.setValue({
        email: 'test@example.com',
        password: '',
      });
      fixture.detectChanges();

      const loginButton = fixture.debugElement.query(By.css('[data-testid="login-button"]'));
      expect(loginButton.nativeElement.disabled).toBe(true);
    });

    it('確認パスワードが一致しない場合、登録ボタンが無効であること', () => {
      component.activeTab.set('register');
      fixture.detectChanges();

      component.registerForm.setValue({
        email: 'new@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword',
        displayName: 'New User',
      });
      fixture.detectChanges();

      const registerButton = fixture.debugElement.query(By.css('[data-testid="register-button"]'));
      expect(registerButton.nativeElement.disabled).toBe(true);
    });
  });
});
