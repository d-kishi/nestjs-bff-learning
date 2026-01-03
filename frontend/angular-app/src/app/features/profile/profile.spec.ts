/**
 * ProfileComponent テスト
 *
 * プロフィール画面の表示・編集をテスト
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ProfileComponent } from './profile';
import { ProfileService } from './profile.service';
import { ToastService } from '../../shared/services/toast.service';
import { User } from '../../core/models';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let profileServiceMock: Partial<ProfileService>;
  let toastServiceMock: Partial<ToastService>;
  let profileSignal: ReturnType<typeof signal<User | null>>;
  let isLoadingSignal: ReturnType<typeof signal<boolean>>;
  let errorSignal: ReturnType<typeof signal<string | null>>;

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

  beforeEach(async () => {
    profileSignal = signal<User | null>(null);
    isLoadingSignal = signal<boolean>(false);
    errorSignal = signal<string | null>(null);

    profileServiceMock = {
      profile: profileSignal.asReadonly(),
      isLoading: isLoadingSignal.asReadonly(),
      error: errorSignal.asReadonly(),
      loadProfile: vi.fn(),
      updateProfile: vi.fn().mockReturnValue(of(mockUser)),
      changePassword: vi.fn().mockReturnValue(of(undefined)),
    };

    toastServiceMock = {
      success: vi.fn(),
      error: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        { provide: ProfileService, useValue: profileServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('コンポーネントが作成されること', () => {
    expect(component).toBeTruthy();
  });

  describe('初期化', () => {
    it('初期化時にloadProfile()が呼ばれること', () => {
      expect(profileServiceMock.loadProfile).toHaveBeenCalled();
    });
  });

  describe('ローディング表示', () => {
    it('ローディング中にスピナーが表示されること', () => {
      isLoadingSignal.set(true);
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('app-loading-spinner');
      expect(spinner).toBeTruthy();
    });
  });

  describe('プロフィール表示', () => {
    beforeEach(() => {
      profileSignal.set(mockUser);
      fixture.detectChanges();
    });

    it('ユーザー名が表示されること', () => {
      const username = fixture.nativeElement.querySelector('.profile__username');
      expect(username.textContent).toContain('testuser');
    });

    it('メールアドレスが表示されること', () => {
      const email = fixture.nativeElement.querySelector('.profile__email');
      expect(email.textContent).toContain('test@example.com');
    });

    it('表示名が表示されること', () => {
      const displayName = fixture.nativeElement.querySelector('.profile__display-name');
      expect(displayName.textContent).toContain('Test User');
    });
  });

  describe('プロフィール編集', () => {
    beforeEach(() => {
      profileSignal.set(mockUser);
      fixture.detectChanges();
    });

    it('編集ボタンをクリックすると編集モードになること', () => {
      const editBtn = fixture.nativeElement.querySelector('.profile__edit-btn');
      editBtn.click();
      fixture.detectChanges();

      expect(component.isEditing()).toBe(true);
    });

    it('保存成功時にトーストが表示されること', () => {
      component.isEditing.set(true);
      component.editDisplayName.set('New Name');
      fixture.detectChanges();

      component.saveProfile();
      fixture.detectChanges();

      expect(profileServiceMock.updateProfile).toHaveBeenCalled();
      expect(toastServiceMock.success).toHaveBeenCalledWith('プロフィールを更新しました');
    });

    it('保存失敗時にエラートーストが表示されること', () => {
      profileServiceMock.updateProfile = vi.fn().mockReturnValue(
        throwError(() => new Error('Update failed'))
      );

      component.isEditing.set(true);
      component.editDisplayName.set('New Name');
      fixture.detectChanges();

      component.saveProfile();
      fixture.detectChanges();

      expect(toastServiceMock.error).toHaveBeenCalledWith('プロフィールの更新に失敗しました');
    });

    it('キャンセルボタンで編集モードが終了すること', () => {
      component.isEditing.set(true);
      fixture.detectChanges();

      const cancelBtn = fixture.nativeElement.querySelector('.profile__cancel-btn');
      cancelBtn.click();
      fixture.detectChanges();

      expect(component.isEditing()).toBe(false);
    });
  });

  describe('パスワード変更', () => {
    beforeEach(() => {
      profileSignal.set(mockUser);
      fixture.detectChanges();
    });

    it('パスワード変更ボタンでモーダルが開くこと', () => {
      const passwordBtn = fixture.nativeElement.querySelector('.profile__password-btn');
      passwordBtn.click();
      fixture.detectChanges();

      expect(component.isPasswordDialogOpen()).toBe(true);
    });

    it('パスワード変更成功時にトーストが表示されること', () => {
      component.isPasswordDialogOpen.set(true);
      component.currentPassword.set('old12345');
      component.newPassword.set('new12345');
      component.confirmPassword.set('new12345');
      fixture.detectChanges();

      component.changePassword();
      fixture.detectChanges();

      expect(profileServiceMock.changePassword).toHaveBeenCalled();
      expect(toastServiceMock.success).toHaveBeenCalledWith('パスワードを変更しました');
    });

    it('パスワード不一致時にエラーが表示されること', () => {
      component.isPasswordDialogOpen.set(true);
      component.currentPassword.set('old12345');
      component.newPassword.set('new12345');
      component.confirmPassword.set('different');
      fixture.detectChanges();

      component.changePassword();
      fixture.detectChanges();

      expect(component.passwordError()).toBe('新しいパスワードが一致しません');
      expect(profileServiceMock.changePassword).not.toHaveBeenCalled();
    });
  });

  describe('エラー表示', () => {
    it('エラー時にエラーメッセージが表示されること', () => {
      errorSignal.set('読み込みエラー');
      fixture.detectChanges();

      const errorMsg = fixture.nativeElement.querySelector('.profile__error');
      expect(errorMsg).toBeTruthy();
      expect(errorMsg.textContent).toContain('読み込みエラー');
    });
  });
});
