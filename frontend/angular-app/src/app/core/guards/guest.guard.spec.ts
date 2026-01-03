/**
 * guestGuard テスト
 *
 * TDD: 未認証ガードのテストケース
 */
import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { guestGuard } from './guest.guard';

describe('guestGuard', () => {
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
    mockUrlTree = { toString: () => '/dashboard' } as UrlTree;

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
    mockState = { url: '/login' } as RouterStateSnapshot;
  });

  it('未認証の場合、trueを返すこと', () => {
    authServiceSpy.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => guestGuard(mockRoute, mockState));

    expect(result).toBe(true);
  });

  it('認証済みの場合、ダッシュボードへのUrlTreeを返すこと', () => {
    authServiceSpy.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => guestGuard(mockRoute, mockState));

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
    expect(result).toBe(mockUrlTree);
  });
});
