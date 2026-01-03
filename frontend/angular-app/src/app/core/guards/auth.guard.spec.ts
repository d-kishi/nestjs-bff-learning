/**
 * authGuard テスト
 *
 * TDD: 認証ガードのテストケース
 */
import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authServiceSpy: { isAuthenticated: ReturnType<typeof vi.fn> };
  let routerSpy: { createUrlTree: ReturnType<typeof vi.fn> };
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;
  let mockUrlTree: UrlTree;

  beforeEach(() => {
    TestBed.resetTestingModule();

    // AuthServiceのモック
    authServiceSpy = {
      isAuthenticated: vi.fn(),
    };

    // UrlTreeのモック（実際のUrlTree構造を模倣）
    mockUrlTree = { toString: () => '/login' } as UrlTree;

    // Routerのモック（UrlTreeを返す）
    routerSpy = {
      createUrlTree: vi.fn().mockReturnValue(mockUrlTree),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/dashboard' } as RouterStateSnapshot;
  });

  it('認証済みの場合、trueを返すこと', () => {
    authServiceSpy.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(result).toBe(true);
  });

  it('未認証の場合、ログイン画面へのUrlTreeを返すこと', () => {
    authServiceSpy.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/dashboard' },
    });
    expect(result).toBe(mockUrlTree);
  });

  it('未認証の場合、returnUrlにアクセスしようとしたURLが含まれること', () => {
    authServiceSpy.isAuthenticated.mockReturnValue(false);
    mockState = { url: '/projects' } as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/projects' },
    });
    expect(result).toBe(mockUrlTree);
  });
});
