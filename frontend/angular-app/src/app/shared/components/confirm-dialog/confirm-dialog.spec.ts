/**
 * ConfirmDialogComponent テスト
 *
 * 確認ダイアログの表示・操作をテスト
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('コンポーネントが作成されること', () => {
    expect(component).toBeTruthy();
  });

  describe('表示制御', () => {
    it('isOpenがfalseの場合、ダイアログが表示されないこと', () => {
      fixture.componentRef.setInput('isOpen', false);
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector('.confirm-dialog');
      expect(dialog).toBeFalsy();
    });

    it('isOpenがtrueの場合、ダイアログが表示されること', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector('.confirm-dialog');
      expect(dialog).toBeTruthy();
    });
  });

  describe('コンテンツ表示', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
    });

    it('タイトルが表示されること', () => {
      fixture.componentRef.setInput('title', '削除確認');
      fixture.detectChanges();

      const title = fixture.nativeElement.querySelector('.confirm-dialog__title');
      expect(title.textContent).toContain('削除確認');
    });

    it('メッセージが表示されること', () => {
      fixture.componentRef.setInput('message', '本当に削除しますか？');
      fixture.detectChanges();

      const message = fixture.nativeElement.querySelector('.confirm-dialog__message');
      expect(message.textContent).toContain('本当に削除しますか？');
    });

    it('デフォルトの確認ボタンテキストが表示されること', () => {
      const confirmBtn = fixture.nativeElement.querySelector('.confirm-dialog__confirm');
      expect(confirmBtn.textContent).toContain('確認');
    });

    it('カスタム確認ボタンテキストが表示されること', () => {
      fixture.componentRef.setInput('confirmText', '削除する');
      fixture.detectChanges();

      const confirmBtn = fixture.nativeElement.querySelector('.confirm-dialog__confirm');
      expect(confirmBtn.textContent).toContain('削除する');
    });

    it('デフォルトのキャンセルボタンテキストが表示されること', () => {
      const cancelBtn = fixture.nativeElement.querySelector('.confirm-dialog__cancel');
      expect(cancelBtn.textContent).toContain('キャンセル');
    });

    it('カスタムキャンセルボタンテキストが表示されること', () => {
      fixture.componentRef.setInput('cancelText', '閉じる');
      fixture.detectChanges();

      const cancelBtn = fixture.nativeElement.querySelector('.confirm-dialog__cancel');
      expect(cancelBtn.textContent).toContain('閉じる');
    });
  });

  describe('ボタン操作', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
    });

    it('確認ボタンをクリックするとconfirmイベントが発火すること', () => {
      const confirmSpy = vi.fn();
      component.confirm.subscribe(confirmSpy);

      const confirmBtn = fixture.nativeElement.querySelector('.confirm-dialog__confirm');
      confirmBtn.click();

      expect(confirmSpy).toHaveBeenCalled();
    });

    it('キャンセルボタンをクリックするとcancelイベントが発火すること', () => {
      const cancelSpy = vi.fn();
      component.cancel.subscribe(cancelSpy);

      const cancelBtn = fixture.nativeElement.querySelector('.confirm-dialog__cancel');
      cancelBtn.click();

      expect(cancelSpy).toHaveBeenCalled();
    });

    it('オーバーレイをクリックするとcancelイベントが発火すること', () => {
      const cancelSpy = vi.fn();
      component.cancel.subscribe(cancelSpy);

      const overlay = fixture.nativeElement.querySelector('.confirm-dialog__overlay');
      overlay.click();

      expect(cancelSpy).toHaveBeenCalled();
    });
  });

  describe('タイプ別スタイル', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
    });

    it('デフォルトタイプがconfirmであること', () => {
      const dialog = fixture.nativeElement.querySelector('.confirm-dialog__content');
      expect(dialog.classList.contains('confirm-dialog__content--confirm')).toBe(true);
    });

    it('dangerタイプを指定できること', () => {
      fixture.componentRef.setInput('type', 'danger');
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector('.confirm-dialog__content');
      expect(dialog.classList.contains('confirm-dialog__content--danger')).toBe(true);
    });
  });
});
