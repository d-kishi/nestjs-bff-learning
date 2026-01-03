/**
 * PaginationComponent テスト
 *
 * ページネーションの表示・操作をテスト
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;

    // 必須inputを初期化してからdetectChanges
    fixture.componentRef.setInput('currentPage', 1);
    fixture.componentRef.setInput('totalPages', 1);
    fixture.detectChanges();
  });

  it('コンポーネントが作成されること', () => {
    expect(component).toBeTruthy();
  });

  describe('表示', () => {
    it('現在のページが表示されること', () => {
      fixture.componentRef.setInput('currentPage', 3);
      fixture.componentRef.setInput('totalPages', 10);
      fixture.detectChanges();

      const pageInfo = fixture.nativeElement.querySelector('.pagination__info');
      expect(pageInfo.textContent).toContain('3');
      expect(pageInfo.textContent).toContain('10');
    });

    it('totalPagesが0の場合も正しく表示されること', () => {
      fixture.componentRef.setInput('currentPage', 1);
      fixture.componentRef.setInput('totalPages', 0);
      fixture.detectChanges();

      const pageInfo = fixture.nativeElement.querySelector('.pagination__info');
      expect(pageInfo.textContent).toContain('1');
      expect(pageInfo.textContent).toContain('0');
    });
  });

  describe('前へボタン', () => {
    it('最初のページでは前へボタンが無効化されること', () => {
      fixture.componentRef.setInput('currentPage', 1);
      fixture.componentRef.setInput('totalPages', 5);
      fixture.detectChanges();

      const prevBtn = fixture.nativeElement.querySelector('.pagination__prev');
      expect(prevBtn.disabled).toBe(true);
    });

    it('2ページ目以降では前へボタンが有効化されること', () => {
      fixture.componentRef.setInput('currentPage', 2);
      fixture.componentRef.setInput('totalPages', 5);
      fixture.detectChanges();

      const prevBtn = fixture.nativeElement.querySelector('.pagination__prev');
      expect(prevBtn.disabled).toBe(false);
    });

    it('前へボタンをクリックするとpageChangeイベントが発火すること', () => {
      fixture.componentRef.setInput('currentPage', 3);
      fixture.componentRef.setInput('totalPages', 5);
      fixture.detectChanges();

      const pageChangeSpy = vi.fn();
      component.pageChange.subscribe(pageChangeSpy);

      const prevBtn = fixture.nativeElement.querySelector('.pagination__prev');
      prevBtn.click();

      expect(pageChangeSpy).toHaveBeenCalledWith(2);
    });
  });

  describe('次へボタン', () => {
    it('最後のページでは次へボタンが無効化されること', () => {
      fixture.componentRef.setInput('currentPage', 5);
      fixture.componentRef.setInput('totalPages', 5);
      fixture.detectChanges();

      const nextBtn = fixture.nativeElement.querySelector('.pagination__next');
      expect(nextBtn.disabled).toBe(true);
    });

    it('最後のページより前では次へボタンが有効化されること', () => {
      fixture.componentRef.setInput('currentPage', 4);
      fixture.componentRef.setInput('totalPages', 5);
      fixture.detectChanges();

      const nextBtn = fixture.nativeElement.querySelector('.pagination__next');
      expect(nextBtn.disabled).toBe(false);
    });

    it('次へボタンをクリックするとpageChangeイベントが発火すること', () => {
      fixture.componentRef.setInput('currentPage', 3);
      fixture.componentRef.setInput('totalPages', 5);
      fixture.detectChanges();

      const pageChangeSpy = vi.fn();
      component.pageChange.subscribe(pageChangeSpy);

      const nextBtn = fixture.nativeElement.querySelector('.pagination__next');
      nextBtn.click();

      expect(pageChangeSpy).toHaveBeenCalledWith(4);
    });
  });

  describe('totalPagesが0の場合', () => {
    it('両方のボタンが無効化されること', () => {
      fixture.componentRef.setInput('currentPage', 1);
      fixture.componentRef.setInput('totalPages', 0);
      fixture.detectChanges();

      const prevBtn = fixture.nativeElement.querySelector('.pagination__prev');
      const nextBtn = fixture.nativeElement.querySelector('.pagination__next');

      expect(prevBtn.disabled).toBe(true);
      expect(nextBtn.disabled).toBe(true);
    });
  });
});
