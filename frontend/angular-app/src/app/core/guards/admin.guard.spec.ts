/**
 * adminGuard テスト
 *
 * TDD: ADMIN権限ガードのテストケース
 */
import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  let authServiceSpy: { isAuthenticated: ReturnType<typeof vi.fn>; isAdmin: ReturnType<typeof vi.fn> };
  let routerSpy: { createUrlTree: ReturnType<typeof vi.fn> };
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    TestBed.resetTestingModule();

    // AuthServiceのモック
    authServiceSpy = {
      isAuthenticated: vi.fn(),
      isAdmin: vi.fn(),
    };

    // Routerのモック
    routerSpy = {
      createUrlTree: vi.fn().mockReturnValue('/dashboard'),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/admin/users' } as RouterStateSnapshot;
  });

  it('ADMIN権限がある場合、trueを返すこと', () => {
    authServiceSpy.isAuthenticated.mockReturnValue(true);
    authServiceSpy.isAdmin.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));

    expect(result).toBe(true);
  });

  it('認証済みだがADMIN権限がない場合、ダッシュボードへのUrlTreeを返すこと', () => {
    authServiceSpy.isAuthenticated.mockReturnValue(true);
    authServiceSpy.isAdmin.mockReturnValue(false);

    TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
  });

  it('未認証の場合、ログイン画面へのUrlTreeを返すこと', () => {
    authServiceSpy.isAuthenticated.mockReturnValue(false);
    authServiceSpy.isAdmin.mockReturnValue(false);
    routerSpy.createUrlTree.mockReturnValue('/login' as any);

    TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/admin/users' },
    });
  });
});
