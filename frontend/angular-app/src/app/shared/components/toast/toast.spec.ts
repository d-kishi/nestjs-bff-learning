/**
 * ToastComponent テスト
 *
 * トースト通知の表示をテスト
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ToastComponent } from './toast';
import { ToastService, Toast } from '../../services/toast.service';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let toastServiceMock: Partial<ToastService>;
  let toastsSignal: ReturnType<typeof signal<Toast[]>>;

  beforeEach(async () => {
    toastsSignal = signal<Toast[]>([]);
    toastServiceMock = {
      toasts: toastsSignal.asReadonly(),
      remove: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [{ provide: ToastService, useValue: toastServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('コンポーネントが作成されること', () => {
    expect(component).toBeTruthy();
  });

  describe('トースト表示', () => {
    it('トーストが存在しない場合、何も表示されないこと', () => {
      const container = fixture.nativeElement.querySelector('.toast-container');
      expect(container.children.length).toBe(0);
    });

    it('成功トーストが正しく表示されること', () => {
      toastsSignal.set([{ id: '1', type: 'success', message: '保存しました' }]);
      fixture.detectChanges();

      const toast = fixture.nativeElement.querySelector('.toast');
      expect(toast).toBeTruthy();
      expect(toast.classList.contains('toast--success')).toBe(true);
      expect(toast.textContent).toContain('保存しました');
    });

    it('エラートーストが正しく表示されること', () => {
      toastsSignal.set([{ id: '1', type: 'error', message: 'エラーが発生しました' }]);
      fixture.detectChanges();

      const toast = fixture.nativeElement.querySelector('.toast');
      expect(toast.classList.contains('toast--error')).toBe(true);
    });

    it('警告トーストが正しく表示されること', () => {
      toastsSignal.set([{ id: '1', type: 'warning', message: '警告' }]);
      fixture.detectChanges();

      const toast = fixture.nativeElement.querySelector('.toast');
      expect(toast.classList.contains('toast--warning')).toBe(true);
    });

    it('情報トーストが正しく表示されること', () => {
      toastsSignal.set([{ id: '1', type: 'info', message: '情報' }]);
      fixture.detectChanges();

      const toast = fixture.nativeElement.querySelector('.toast');
      expect(toast.classList.contains('toast--info')).toBe(true);
    });

    it('複数のトーストが表示されること', () => {
      toastsSignal.set([
        { id: '1', type: 'success', message: '成功1' },
        { id: '2', type: 'error', message: 'エラー1' },
        { id: '3', type: 'warning', message: '警告1' },
      ]);
      fixture.detectChanges();

      const toasts = fixture.nativeElement.querySelectorAll('.toast');
      expect(toasts.length).toBe(3);
    });
  });

  describe('トースト削除', () => {
    it('閉じるボタンをクリックするとremove()が呼ばれること', () => {
      toastsSignal.set([{ id: 'test-id', type: 'success', message: '成功' }]);
      fixture.detectChanges();

      const closeButton = fixture.nativeElement.querySelector('.toast__close');
      closeButton.click();

      expect(toastServiceMock.remove).toHaveBeenCalledWith('test-id');
    });
  });

  describe('アイコン表示', () => {
    it('成功トーストにチェックアイコンが表示されること', () => {
      toastsSignal.set([{ id: '1', type: 'success', message: '成功' }]);
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.toast__icon');
      expect(icon.textContent).toContain('✓');
    });

    it('エラートーストにバツアイコンが表示されること', () => {
      toastsSignal.set([{ id: '1', type: 'error', message: 'エラー' }]);
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.toast__icon');
      expect(icon.textContent).toContain('✗');
    });

    it('警告トーストに警告アイコンが表示されること', () => {
      toastsSignal.set([{ id: '1', type: 'warning', message: '警告' }]);
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.toast__icon');
      expect(icon.textContent).toContain('⚠');
    });

    it('情報トーストに情報アイコンが表示されること', () => {
      toastsSignal.set([{ id: '1', type: 'info', message: '情報' }]);
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.toast__icon');
      expect(icon.textContent).toContain('ℹ');
    });
  });
});
