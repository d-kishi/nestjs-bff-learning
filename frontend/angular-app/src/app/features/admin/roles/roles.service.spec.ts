/**
 * RolesService テスト
 *
 * ADMIN機能: ロール管理サービスの単体テスト
 * - ロール一覧取得
 * - ロールCRUD（作成・更新・削除）
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RolesService } from './roles.service';
import { Role, ApiResponse } from '../../../core/models';

describe('RolesService', () => {
  let service: RolesService;
  let httpMock: HttpTestingController;

  /** テスト用モックロール */
  const mockRoles: Role[] = [
    { id: 1, name: 'ADMIN', description: '管理者' },
    { id: 2, name: 'MEMBER', description: '一般メンバー' },
    { id: 3, name: 'VIEWER', description: '閲覧のみ' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), RolesService],
    });
    service = TestBed.inject(RolesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('初期状態', () => {
    it('rolesは空配列', () => {
      expect(service.roles()).toEqual([]);
    });

    it('isLoadingはfalse', () => {
      expect(service.isLoading()).toBe(false);
    });

    it('errorはnull', () => {
      expect(service.error()).toBeNull();
    });
  });

  describe('loadRoles', () => {
    it('ロール一覧を取得しSignalを更新', () => {
      const response: ApiResponse<Role[]> = {
        data: mockRoles,
        meta: { timestamp: new Date().toISOString() },
      };

      service.loadRoles();

      expect(service.isLoading()).toBe(true);

      const req = httpMock.expectOne('/api/admin/roles');
      expect(req.request.method).toBe('GET');
      req.flush(response);

      expect(service.isLoading()).toBe(false);
      expect(service.roles()).toEqual(mockRoles);
      expect(service.error()).toBeNull();
    });

    it('エラー時にerrorSignalを更新', () => {
      service.loadRoles();

      const req = httpMock.expectOne('/api/admin/roles');
      req.flush({ message: 'サーバーエラー' }, { status: 500, statusText: 'Internal Server Error' });

      expect(service.isLoading()).toBe(false);
      expect(service.error()).toBeTruthy();
      expect(service.roles()).toEqual([]);
    });
  });

  describe('getRole', () => {
    it('指定IDのロールを取得', () => {
      const response: ApiResponse<Role> = {
        data: mockRoles[0],
        meta: { timestamp: new Date().toISOString() },
      };

      let result: Role | undefined;
      service.getRole(1).subscribe((role) => {
        result = role;
      });

      const req = httpMock.expectOne('/api/admin/roles/1');
      expect(req.request.method).toBe('GET');
      req.flush(response);

      expect(result).toEqual(mockRoles[0]);
    });
  });

  describe('createRole', () => {
    it('ロールを作成し一覧に追加', () => {
      const newRole: Role = { id: 4, name: 'EDITOR', description: '編集者' };
      const response: ApiResponse<Role> = {
        data: newRole,
        meta: { timestamp: new Date().toISOString() },
      };

      // 事前にロール一覧を設定
      service['rolesSignal'].set([...mockRoles]);

      let result: Role | undefined;
      service.createRole({ name: 'EDITOR', description: '編集者' }).subscribe((role) => {
        result = role;
      });

      const req = httpMock.expectOne('/api/admin/roles');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: 'EDITOR', description: '編集者' });
      req.flush(response);

      expect(result).toEqual(newRole);
      expect(service.roles()).toContainEqual(newRole);
    });
  });

  describe('updateRole', () => {
    it('ロールを更新し一覧を反映', () => {
      const updatedRole: Role = { id: 2, name: 'MEMBER', description: '更新された説明' };
      const response: ApiResponse<Role> = {
        data: updatedRole,
        meta: { timestamp: new Date().toISOString() },
      };

      service['rolesSignal'].set([...mockRoles]);

      let result: Role | undefined;
      service.updateRole(2, { description: '更新された説明' }).subscribe((role) => {
        result = role;
      });

      const req = httpMock.expectOne('/api/admin/roles/2');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ description: '更新された説明' });
      req.flush(response);

      expect(result).toEqual(updatedRole);
      expect(service.roles().find((r) => r.id === 2)?.description).toBe('更新された説明');
    });
  });

  describe('deleteRole', () => {
    it('ロールを削除し一覧から除去', () => {
      service['rolesSignal'].set([...mockRoles]);

      service.deleteRole(3).subscribe();

      const req = httpMock.expectOne('/api/admin/roles/3');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      expect(service.roles().find((r) => r.id === 3)).toBeUndefined();
      expect(service.roles().length).toBe(2);
    });
  });

  describe('システムロール', () => {
    it('システムロール（ADMIN, MEMBER）は削除不可として判定', () => {
      expect(service.isSystemRole(mockRoles[0])).toBe(true); // ADMIN
      expect(service.isSystemRole(mockRoles[1])).toBe(true); // MEMBER
      expect(service.isSystemRole(mockRoles[2])).toBe(false); // VIEWER
    });
  });
});
