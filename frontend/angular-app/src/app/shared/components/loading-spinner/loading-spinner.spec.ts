/**
 * LoadingSpinnerComponent テスト
 *
 * ローディング表示のテスト
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('コンポーネントが作成されること', () => {
    expect(component).toBeTruthy();
  });

  describe('表示', () => {
    it('スピナー要素が表示されること', () => {
      const spinner = fixture.nativeElement.querySelector('.loading-spinner');
      expect(spinner).toBeTruthy();
    });

    it('デフォルトで「Loading...」が表示されること', () => {
      const text = fixture.nativeElement.querySelector('.loading-spinner__text');
      expect(text.textContent).toContain('Loading...');
    });

    it('カスタムメッセージを表示できること', () => {
      fixture.componentRef.setInput('message', 'データを読み込み中');
      fixture.detectChanges();

      const text = fixture.nativeElement.querySelector('.loading-spinner__text');
      expect(text.textContent).toContain('データを読み込み中');
    });
  });

  describe('オーバーレイモード', () => {
    it('overlayがtrueの場合、オーバーレイが表示されること', () => {
      fixture.componentRef.setInput('overlay', true);
      fixture.detectChanges();

      const overlay = fixture.nativeElement.querySelector('.loading-spinner--overlay');
      expect(overlay).toBeTruthy();
    });

    it('overlayがfalseの場合、オーバーレイが表示されないこと', () => {
      fixture.componentRef.setInput('overlay', false);
      fixture.detectChanges();

      const overlay = fixture.nativeElement.querySelector('.loading-spinner--overlay');
      expect(overlay).toBeFalsy();
    });
  });

  describe('サイズ', () => {
    it('デフォルトサイズがmediumであること', () => {
      const spinner = fixture.nativeElement.querySelector('.loading-spinner');
      expect(spinner.classList.contains('loading-spinner--medium')).toBe(true);
    });

    it('smallサイズを指定できること', () => {
      fixture.componentRef.setInput('size', 'small');
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('.loading-spinner');
      expect(spinner.classList.contains('loading-spinner--small')).toBe(true);
    });

    it('largeサイズを指定できること', () => {
      fixture.componentRef.setInput('size', 'large');
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('.loading-spinner');
      expect(spinner.classList.contains('loading-spinner--large')).toBe(true);
    });
  });
});
