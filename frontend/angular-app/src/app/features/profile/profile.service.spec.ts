/**
 * ProfileService テスト
 *
 * プロフィール取得・更新のAPIテスト
 */
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { ProfileService } from './profile.service';
import { User, ApiResponse } from '../../core/models';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    profile: {
      displayName: 'Test User',
      bio: 'Bio text',
      avatarUrl: null,
    },
    roles: [{ id: 1, name: 'USER', description: null }],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProfileService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('loadProfile', () => {
    it('プロフィールを取得できること', () => {
      const response: ApiResponse<User> = {
        data: mockUser,
        meta: { timestamp: '2024-01-01T00:00:00Z' },
      };

      service.loadProfile();

      const req = httpMock.expectOne('/api/profile');
      expect(req.request.method).toBe('GET');
      req.flush(response);

      expect(service.profile()).toEqual(mockUser);
      expect(service.isLoading()).toBe(false);
      expect(service.error()).toBeNull();
    });

    it('ローディング状態が正しく管理されること', () => {
      expect(service.isLoading()).toBe(false);

      service.loadProfile();
      expect(service.isLoading()).toBe(true);

      const response: ApiResponse<User> = {
        data: mockUser,
        meta: { timestamp: '2024-01-01T00:00:00Z' },
      };
      httpMock.expectOne('/api/profile').flush(response);

      expect(service.isLoading()).toBe(false);
    });

    it('エラー時にエラー状態が設定されること', () => {
      service.loadProfile();

      httpMock.expectOne('/api/profile').error(new ProgressEvent('error'));

      expect(service.profile()).toBeNull();
      expect(service.error()).toBeTruthy();
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('updateProfile', () => {
    it('プロフィールを更新できること', async () => {
      const updateRequest = { displayName: 'New Name', bio: 'New Bio' };
      const updatedUser = {
        ...mockUser,
        profile: { ...mockUser.profile, displayName: 'New Name', bio: 'New Bio' },
      };
      const response: ApiResponse<User> = {
        data: updatedUser,
        meta: { timestamp: '2024-01-01T00:00:00Z' },
      };

      const resultPromise = firstValueFrom(service.updateProfile(updateRequest));

      const req = httpMock.expectOne('/api/profile');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(response);

      const result = await resultPromise;
      expect(result).toEqual(updatedUser);
      expect(service.profile()).toEqual(updatedUser);
    });
  });

  describe('changePassword', () => {
    it('パスワードを変更できること', async () => {
      const passwordRequest = {
        currentPassword: 'old123',
        newPassword: 'new12345',
        confirmPassword: 'new12345',
      };

      const resultPromise = firstValueFrom(service.changePassword(passwordRequest));

      const req = httpMock.expectOne('/api/profile/password');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(passwordRequest);
      req.flush({});

      await resultPromise;
    });
  });

  describe('clearProfile', () => {
    it('プロフィール状態をクリアできること', () => {
      // まずプロフィールを設定
      const response: ApiResponse<User> = {
        data: mockUser,
        meta: { timestamp: '2024-01-01T00:00:00Z' },
      };
      service.loadProfile();
      httpMock.expectOne('/api/profile').flush(response);

      expect(service.profile()).toEqual(mockUser);

      // クリア
      service.clearProfile();
      expect(service.profile()).toBeNull();
    });
  });
});
