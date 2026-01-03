/**
 * HeaderComponent テスト
 *
 * ヘッダーナビゲーションの表示・操作をテスト
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { HeaderComponent } from './header';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authServiceMock: Partial<AuthService>;
  let router: Router;
  let currentUserSignal: ReturnType<typeof signal<User | null>>;
  let isAdminSignal: ReturnType<typeof signal<boolean>>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    profile: {
      displayName: 'Test User',
      bio: null,
      avatarUrl: null,
    },
    roles: [{ id: 1, name: 'MEMBER', description: null }],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  };

  const mockAdminUser: User = {
    ...mockUser,
    roles: [
      { id: 1, name: 'MEMBER', description: null },
      { id: 2, name: 'ADMIN', description: null },
    ],
  };

  beforeEach(async () => {
    currentUserSignal = signal<User | null>(mockUser);
    isAdminSignal = signal<boolean>(false);

    authServiceMock = {
      currentUser: currentUserSignal.asReadonly(),
      isAdmin: isAdminSignal.asReadonly(),
      logout: vi.fn().mockReturnValue(of(undefined)),
    };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        provideRouter([]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('コンポーネントが作成されること', () => {
    expect(component).toBeTruthy();
  });

  describe('ロゴ', () => {
    it('ロゴが表示されること', () => {
      const logo = fixture.nativeElement.querySelector('.header__logo');
      expect(logo).toBeTruthy();
      expect(logo.textContent).toContain('Task Manager');
    });

    it('ロゴクリックでダッシュボードに遷移すること', () => {
      const logo = fixture.nativeElement.querySelector('.header__logo');
      expect(logo.getAttribute('href')).toBe('/dashboard');
    });
  });

  describe('ナビゲーション', () => {
    it('Dashboard, Projects, Tasksリンクが表示されること', () => {
      const navLinks = fixture.nativeElement.querySelectorAll('.header__nav-link');
      const linkTexts = Array.from(navLinks).map((link: any) => link.textContent.trim());

      expect(linkTexts).toContain('Dashboard');
      expect(linkTexts).toContain('Projects');
      expect(linkTexts).toContain('Tasks');
    });
  });

  describe('ユーザーメニュー', () => {
    it('ユーザー名が表示されること', () => {
      const userName = fixture.nativeElement.querySelector('.header__user-name');
      expect(userName.textContent).toContain('Test User');
    });

    it('ユーザーメニュークリックでドロップダウンが表示されること', () => {
      const userBtn = fixture.nativeElement.querySelector('.header__user-btn');
      userBtn.click();
      fixture.detectChanges();

      const dropdown = fixture.nativeElement.querySelector('.header__dropdown');
      expect(dropdown).toBeTruthy();
    });

    it('プロフィールリンクが表示されること', () => {
      const userBtn = fixture.nativeElement.querySelector('.header__user-btn');
      userBtn.click();
      fixture.detectChanges();

      const profileLink = fixture.nativeElement.querySelector('.header__dropdown-link[href="/profile"]');
      expect(profileLink).toBeTruthy();
    });

    it('ログアウトボタンが表示されること', () => {
      const userBtn = fixture.nativeElement.querySelector('.header__user-btn');
      userBtn.click();
      fixture.detectChanges();

      const logoutBtn = fixture.nativeElement.querySelector('.header__logout-btn');
      expect(logoutBtn).toBeTruthy();
    });

    it('ログアウトボタンをクリックするとlogout()が呼ばれること', () => {
      const userBtn = fixture.nativeElement.querySelector('.header__user-btn');
      userBtn.click();
      fixture.detectChanges();

      const logoutBtn = fixture.nativeElement.querySelector('.header__logout-btn');
      logoutBtn.click();

      expect(authServiceMock.logout).toHaveBeenCalled();
    });
  });

  describe('Adminメニュー', () => {
    it('ADMIN権限がない場合、Adminメニューが表示されないこと', () => {
      isAdminSignal.set(false);
      fixture.detectChanges();

      const adminMenu = fixture.nativeElement.querySelector('.header__admin');
      expect(adminMenu).toBeFalsy();
    });

    it('ADMIN権限がある場合、Adminメニューが表示されること', () => {
      isAdminSignal.set(true);
      fixture.detectChanges();

      const adminMenu = fixture.nativeElement.querySelector('.header__admin');
      expect(adminMenu).toBeTruthy();
    });

    it('Adminメニュークリックでドロップダウンが表示されること', () => {
      isAdminSignal.set(true);
      fixture.detectChanges();

      const adminBtn = fixture.nativeElement.querySelector('.header__admin-btn');
      adminBtn.click();
      fixture.detectChanges();

      const dropdown = fixture.nativeElement.querySelector('.header__admin-dropdown');
      expect(dropdown).toBeTruthy();
    });

    it('Users, Rolesリンクが表示されること', () => {
      isAdminSignal.set(true);
      fixture.detectChanges();

      const adminBtn = fixture.nativeElement.querySelector('.header__admin-btn');
      adminBtn.click();
      fixture.detectChanges();

      const usersLink = fixture.nativeElement.querySelector('.header__dropdown-link[href="/admin/users"]');
      const rolesLink = fixture.nativeElement.querySelector('.header__dropdown-link[href="/admin/roles"]');

      expect(usersLink).toBeTruthy();
      expect(rolesLink).toBeTruthy();
    });
  });

  describe('ドロップダウン制御', () => {
    it('外側をクリックするとドロップダウンが閉じること', () => {
      const userBtn = fixture.nativeElement.querySelector('.header__user-btn');
      userBtn.click();
      fixture.detectChanges();

      // ドロップダウンが開いている
      expect(fixture.nativeElement.querySelector('.header__dropdown')).toBeTruthy();

      // 外側をクリック（ドキュメントクリック）
      document.body.click();
      fixture.detectChanges();

      // ドロップダウンが閉じている
      expect(fixture.nativeElement.querySelector('.header__dropdown')).toBeFalsy();
    });
  });
});
