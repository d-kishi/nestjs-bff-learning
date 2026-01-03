/**
 * UsersService テスト
 *
 * ADMIN機能: ユーザー管理サービスの単体テスト
 * - ユーザー一覧取得（ページネーション）
 * - ユーザーロール更新
 * - ユーザーステータス更新
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UsersService } from './users.service';
import { User, Role, PaginatedResponse, ApiResponse } from '../../../core/models';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;

  /** テスト用モックロール */
  const mockRoles: Role[] = [
    { id: 1, name: 'ADMIN', description: '管理者' },
    { id: 2, name: 'MEMBER', description: '一般メンバー' },
  ];

  /** テスト用モックユーザー */
  const mockUsers: User[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      profile: { displayName: '管理者', bio: null, avatarUrl: null },
      roles: [mockRoles[0]],
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      username: 'user1',
      email: 'user1@example.com',
      profile: { displayName: 'ユーザー1', bio: 'テスト', avatarUrl: null },
      roles: [mockRoles[1]],
      isActive: true,
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
    {
      id: 3,
      username: 'user2',
      email: 'user2@example.com',
      profile: { displayName: 'ユーザー2', bio: null, avatarUrl: null },
      roles: [mockRoles[1]],
      isActive: false,
      createdAt: '2024-01-03T00:00:00.000Z',
      updatedAt: '2024-01-03T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), UsersService],
    });
    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('初期状態', () => {
    it('usersは空配列', () => {
      expect(service.users()).toEqual([]);
    });

    it('isLoadingはfalse', () => {
      expect(service.isLoading()).toBe(false);
    });

    it('errorはnull', () => {
      expect(service.error()).toBeNull();
    });

    it('totalCountは0', () => {
      expect(service.totalCount()).toBe(0);
    });

    it('currentPageは1', () => {
      expect(service.currentPage()).toBe(1);
    });
  });

  describe('loadUsers', () => {
    it('ユーザー一覧を取得しSignalを更新', () => {
      const response: PaginatedResponse<User> = {
        data: mockUsers,
        meta: {
          total: 3,
          page: 1,
          limit: 20,
          timestamp: new Date().toISOString(),
        },
      };

      service.loadUsers();

      expect(service.isLoading()).toBe(true);

      const req = httpMock.expectOne('/api/admin/users');
      expect(req.request.method).toBe('GET');
      req.flush(response);

      expect(service.isLoading()).toBe(false);
      expect(service.users()).toEqual(mockUsers);
      expect(service.totalCount()).toBe(3);
      expect(service.currentPage()).toBe(1);
      expect(service.error()).toBeNull();
    });

    it('ページネーションパラメータを送信', () => {
      const response: PaginatedResponse<User> = {
        data: [mockUsers[1]],
        meta: {
          total: 3,
          page: 2,
          limit: 10,
          timestamp: new Date().toISOString(),
        },
      };

      service.loadUsers({ page: 2, limit: 10 });

      const req = httpMock.expectOne('/api/admin/users?page=2&limit=10');
      expect(req.request.method).toBe('GET');
      req.flush(response);

      expect(service.currentPage()).toBe(2);
    });

    it('検索パラメータを送信', () => {
      const response: PaginatedResponse<User> = {
        data: [mockUsers[0]],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          timestamp: new Date().toISOString(),
        },
      };

      service.loadUsers({ search: 'admin' });

      const req = httpMock.expectOne('/api/admin/users?search=admin');
      expect(req.request.method).toBe('GET');
      req.flush(response);
    });

    it('ステータスフィルタを送信', () => {
      const response: PaginatedResponse<User> = {
        data: mockUsers.filter((u) => u.isActive),
        meta: {
          total: 2,
          page: 1,
          limit: 20,
          timestamp: new Date().toISOString(),
        },
      };

      service.loadUsers({ isActive: true });

      const req = httpMock.expectOne('/api/admin/users?isActive=true');
      expect(req.request.method).toBe('GET');
      req.flush(response);
    });

    it('エラー時にerrorSignalを更新', () => {
      service.loadUsers();

      const req = httpMock.expectOne('/api/admin/users');
      req.flush({ message: 'サーバーエラー' }, { status: 500, statusText: 'Internal Server Error' });

      expect(service.isLoading()).toBe(false);
      expect(service.error()).toBeTruthy();
      expect(service.users()).toEqual([]);
    });
  });

  describe('getUser', () => {
    it('指定IDのユーザーを取得', () => {
      const response: ApiResponse<User> = {
        data: mockUsers[0],
        meta: { timestamp: new Date().toISOString() },
      };

      let result: User | undefined;
      service.getUser(1).subscribe((user) => {
        result = user;
      });

      const req = httpMock.expectOne('/api/admin/users/1');
      expect(req.request.method).toBe('GET');
      req.flush(response);

      expect(result).toEqual(mockUsers[0]);
    });
  });

  describe('updateUserRoles', () => {
    it('ユーザーのロールを更新', () => {
      const updatedUser: User = {
        ...mockUsers[1],
        roles: [mockRoles[0], mockRoles[1]],
      };
      const response: ApiResponse<User> = {
        data: updatedUser,
        meta: { timestamp: new Date().toISOString() },
      };

      // 事前にユーザー一覧を設定
      service['usersSignal'].set([...mockUsers]);

      let result: User | undefined;
      service.updateUserRoles(2, [1, 2]).subscribe((user) => {
        result = user;
      });

      const req = httpMock.expectOne('/api/admin/users/2/roles');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ roleIds: [1, 2] });
      req.flush(response);

      expect(result).toEqual(updatedUser);
      // 一覧内のユーザーも更新されること
      expect(service.users().find((u) => u.id === 2)?.roles).toEqual([mockRoles[0], mockRoles[1]]);
    });
  });

  describe('updateUserStatus', () => {
    it('ユーザーを無効化', () => {
      const updatedUser: User = {
        ...mockUsers[0],
        isActive: false,
      };
      const response: ApiResponse<User> = {
        data: updatedUser,
        meta: { timestamp: new Date().toISOString() },
      };

      service['usersSignal'].set([...mockUsers]);

      let result: User | undefined;
      service.updateUserStatus(1, false).subscribe((user) => {
        result = user;
      });

      const req = httpMock.expectOne('/api/admin/users/1/status');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ isActive: false });
      req.flush(response);

      expect(result?.isActive).toBe(false);
      expect(service.users().find((u) => u.id === 1)?.isActive).toBe(false);
    });

    it('ユーザーを有効化', () => {
      const updatedUser: User = {
        ...mockUsers[2],
        isActive: true,
      };
      const response: ApiResponse<User> = {
        data: updatedUser,
        meta: { timestamp: new Date().toISOString() },
      };

      service['usersSignal'].set([...mockUsers]);

      let result: User | undefined;
      service.updateUserStatus(3, true).subscribe((user) => {
        result = user;
      });

      const req = httpMock.expectOne('/api/admin/users/3/status');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ isActive: true });
      req.flush(response);

      expect(result?.isActive).toBe(true);
      expect(service.users().find((u) => u.id === 3)?.isActive).toBe(true);
    });
  });

  describe('totalPages', () => {
    it('総ページ数を計算', () => {
      const response: PaginatedResponse<User> = {
        data: mockUsers,
        meta: {
          total: 45,
          page: 1,
          limit: 20,
          timestamp: new Date().toISOString(),
        },
      };

      service.loadUsers();
      httpMock.expectOne('/api/admin/users').flush(response);

      expect(service.totalPages()).toBe(3); // 45 / 20 = 2.25 → 3
    });

    it('0件の場合は0ページ', () => {
      expect(service.totalPages()).toBe(0);
    });
  });

  describe('availableRoles', () => {
    it('利用可能なロール一覧を取得', () => {
      const response: ApiResponse<Role[]> = {
        data: mockRoles,
        meta: { timestamp: new Date().toISOString() },
      };

      service.loadAvailableRoles();

      const req = httpMock.expectOne('/api/admin/roles');
      expect(req.request.method).toBe('GET');
      req.flush(response);

      expect(service.availableRoles()).toEqual(mockRoles);
    });
  });
});
