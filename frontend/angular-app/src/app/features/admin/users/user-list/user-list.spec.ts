/**
 * UserListComponent テスト
 *
 * ADMIN機能: ユーザー管理画面の単体テスト
 * - ユーザー一覧表示
 * - フィルター（検索、ステータス）
 * - ページネーション
 * - ロール編集ダイアログ
 * - ステータス変更
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { UserListComponent } from './user-list';
import { UsersService } from '../users.service';
import { User, Role } from '../../../../core/models';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let usersServiceMock: {
    users: ReturnType<typeof signal<User[]>>;
    isLoading: ReturnType<typeof signal<boolean>>;
    error: ReturnType<typeof signal<string | null>>;
    totalCount: ReturnType<typeof signal<number>>;
    currentPage: ReturnType<typeof signal<number>>;
    totalPages: ReturnType<typeof signal<number>>;
    availableRoles: ReturnType<typeof signal<Role[]>>;
    loadUsers: ReturnType<typeof vi.fn>;
    loadAvailableRoles: ReturnType<typeof vi.fn>;
    updateUserRoles: ReturnType<typeof vi.fn>;
    updateUserStatus: ReturnType<typeof vi.fn>;
  };

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

  beforeEach(async () => {
    usersServiceMock = {
      users: signal<User[]>([]),
      isLoading: signal(false),
      error: signal<string | null>(null),
      totalCount: signal(0),
      currentPage: signal(1),
      totalPages: signal(0),
      availableRoles: signal<Role[]>([]),
      loadUsers: vi.fn(),
      loadAvailableRoles: vi.fn(),
      updateUserRoles: vi.fn().mockReturnValue(of(mockUsers[0])),
      updateUserStatus: vi.fn().mockReturnValue(of(mockUsers[0])),
    };

    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [{ provide: UsersService, useValue: usersServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
  });

  describe('初期化', () => {
    it('コンポーネントが作成される', () => {
      expect(component).toBeTruthy();
    });

    it('初期化時にloadUsersとloadAvailableRolesが呼ばれる', () => {
      fixture.detectChanges();

      expect(usersServiceMock.loadUsers).toHaveBeenCalled();
      expect(usersServiceMock.loadAvailableRoles).toHaveBeenCalled();
    });
  });

  describe('ユーザー一覧表示', () => {
    it('ユーザー一覧が表示される', () => {
      usersServiceMock.users.set(mockUsers);
      fixture.detectChanges();

      const rows = fixture.nativeElement.querySelectorAll('.user-row');
      expect(rows.length).toBe(3);
    });

    it('ユーザー情報が正しく表示される', () => {
      usersServiceMock.users.set([mockUsers[0]]);
      fixture.detectChanges();

      const row = fixture.nativeElement.querySelector('.user-row');
      expect(row.textContent).toContain('admin@example.com');
      expect(row.textContent).toContain('管理者');
      expect(row.textContent).toContain('ADMIN');
    });

    it('ユーザーがいない場合は空メッセージを表示', () => {
      usersServiceMock.users.set([]);
      fixture.detectChanges();

      const emptyMessage = fixture.nativeElement.querySelector('.user-list__empty');
      expect(emptyMessage).toBeTruthy();
      expect(emptyMessage.textContent).toContain('ユーザーがいません');
    });
  });

  describe('ローディング状態', () => {
    it('ローディング中はスピナーを表示', () => {
      usersServiceMock.isLoading.set(true);
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('app-loading-spinner');
      expect(spinner).toBeTruthy();
    });

    it('ローディング完了後はスピナーを非表示', () => {
      usersServiceMock.isLoading.set(false);
      usersServiceMock.users.set(mockUsers);
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('app-loading-spinner');
      expect(spinner).toBeFalsy();
    });
  });

  describe('エラー状態', () => {
    it('エラー時はエラーメッセージを表示', () => {
      usersServiceMock.error.set('サーバーエラー');
      fixture.detectChanges();

      const errorMessage = fixture.nativeElement.querySelector('.user-list__error');
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.textContent).toContain('サーバーエラー');
    });

    it('再試行ボタンでloadUsersを再呼び出し', () => {
      usersServiceMock.error.set('エラー');
      fixture.detectChanges();

      const retryButton = fixture.nativeElement.querySelector('.user-list__retry-btn');
      retryButton.click();

      expect(usersServiceMock.loadUsers).toHaveBeenCalledTimes(2); // 初期化 + リトライ
    });
  });

  describe('フィルター', () => {
    it('検索キーワードでフィルターできる', () => {
      fixture.detectChanges();
      usersServiceMock.loadUsers.mockClear();

      component.searchKeyword.set('admin');
      component.onFilterChange();

      expect(usersServiceMock.loadUsers).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'admin' })
      );
    });

    it('ステータスフィルターでフィルターできる', () => {
      fixture.detectChanges();
      usersServiceMock.loadUsers.mockClear();

      component.statusFilter.set('active');
      component.onFilterChange();

      expect(usersServiceMock.loadUsers).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true })
      );
    });

    it('非アクティブでフィルターできる', () => {
      fixture.detectChanges();
      usersServiceMock.loadUsers.mockClear();

      component.statusFilter.set('inactive');
      component.onFilterChange();

      expect(usersServiceMock.loadUsers).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false })
      );
    });
  });

  describe('ページネーション', () => {
    it('総ページ数が2以上の場合にページネーションを表示', () => {
      usersServiceMock.users.set(mockUsers);
      usersServiceMock.totalPages.set(3);
      fixture.detectChanges();

      const pagination = fixture.nativeElement.querySelector('app-pagination');
      expect(pagination).toBeTruthy();
    });

    it('ページ変更でloadUsersを呼び出す', () => {
      fixture.detectChanges();
      usersServiceMock.loadUsers.mockClear();

      component.onPageChange(2);

      expect(usersServiceMock.loadUsers).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
    });
  });

  describe('ロール編集ダイアログ', () => {
    it('編集ボタンクリックでダイアログを開く', () => {
      usersServiceMock.users.set(mockUsers);
      usersServiceMock.availableRoles.set(mockRoles);
      fixture.detectChanges();

      const editButton = fixture.nativeElement.querySelector('.user-row__edit-btn');
      editButton.click();
      fixture.detectChanges();

      expect(component.isDialogOpen()).toBe(true);
      expect(component.editingUser()).toEqual(mockUsers[0]);
    });

    it('キャンセルでダイアログを閉じる', () => {
      usersServiceMock.users.set(mockUsers);
      usersServiceMock.availableRoles.set(mockRoles);
      fixture.detectChanges();

      component.openRoleEditDialog(mockUsers[0]);
      fixture.detectChanges();

      component.closeDialog();
      fixture.detectChanges();

      expect(component.isDialogOpen()).toBe(false);
      expect(component.editingUser()).toBeNull();
    });

    it('保存でupdateUserRolesを呼び出す', () => {
      usersServiceMock.users.set(mockUsers);
      usersServiceMock.availableRoles.set(mockRoles);
      fixture.detectChanges();

      component.openRoleEditDialog(mockUsers[1]);
      fixture.detectChanges();

      component.onSaveRoles([1, 2]);

      expect(usersServiceMock.updateUserRoles).toHaveBeenCalledWith(2, [1, 2]);
    });
  });

  describe('ステータス変更', () => {
    it('アクティブユーザーを無効化できる', () => {
      usersServiceMock.users.set(mockUsers);
      fixture.detectChanges();

      component.onToggleStatus(mockUsers[0]);

      expect(usersServiceMock.updateUserStatus).toHaveBeenCalledWith(1, false);
    });

    it('非アクティブユーザーを有効化できる', () => {
      usersServiceMock.users.set(mockUsers);
      fixture.detectChanges();

      component.onToggleStatus(mockUsers[2]);

      expect(usersServiceMock.updateUserStatus).toHaveBeenCalledWith(3, true);
    });
  });

  describe('ステータスバッジ', () => {
    it('アクティブユーザーは緑のバッジを表示', () => {
      usersServiceMock.users.set([mockUsers[0]]);
      fixture.detectChanges();

      const badge = fixture.nativeElement.querySelector('.user-row__status-badge--active');
      expect(badge).toBeTruthy();
    });

    it('非アクティブユーザーは赤のバッジを表示', () => {
      usersServiceMock.users.set([mockUsers[2]]);
      fixture.detectChanges();

      const badge = fixture.nativeElement.querySelector('.user-row__status-badge--inactive');
      expect(badge).toBeTruthy();
    });
  });
});
