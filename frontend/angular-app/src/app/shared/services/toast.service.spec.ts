/**
 * ToastService テスト
 *
 * トースト通知の表示・管理をテスト
 */
import { TestBed } from '@angular/core/testing';
import { ToastService, Toast, ToastType } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastService],
    });
    service = TestBed.inject(ToastService);
  });

  describe('初期状態', () => {
    it('トースト一覧が空であること', () => {
      expect(service.toasts()).toEqual([]);
    });
  });

  describe('success()', () => {
    it('成功トーストを追加できること', () => {
      service.success('保存しました');

      const toasts = service.toasts();
      expect(toasts.length).toBe(1);
      expect(toasts[0].type).toBe('success');
      expect(toasts[0].message).toBe('保存しました');
    });

    it('ユニークなIDが割り当てられること', () => {
      service.success('メッセージ1');
      service.success('メッセージ2');

      const toasts = service.toasts();
      expect(toasts[0].id).not.toBe(toasts[1].id);
    });
  });

  describe('error()', () => {
    it('エラートーストを追加できること', () => {
      service.error('エラーが発生しました');

      const toasts = service.toasts();
      expect(toasts.length).toBe(1);
      expect(toasts[0].type).toBe('error');
      expect(toasts[0].message).toBe('エラーが発生しました');
    });
  });

  describe('warning()', () => {
    it('警告トーストを追加できること', () => {
      service.warning('注意してください');

      const toasts = service.toasts();
      expect(toasts.length).toBe(1);
      expect(toasts[0].type).toBe('warning');
      expect(toasts[0].message).toBe('注意してください');
    });
  });

  describe('info()', () => {
    it('情報トーストを追加できること', () => {
      service.info('お知らせ');

      const toasts = service.toasts();
      expect(toasts.length).toBe(1);
      expect(toasts[0].type).toBe('info');
      expect(toasts[0].message).toBe('お知らせ');
    });
  });

  describe('remove()', () => {
    it('指定IDのトーストを削除できること', () => {
      service.success('メッセージ1');
      service.success('メッセージ2');

      const toasts = service.toasts();
      const idToRemove = toasts[0].id;

      service.remove(idToRemove);

      expect(service.toasts().length).toBe(1);
      expect(service.toasts()[0].message).toBe('メッセージ2');
    });

    it('存在しないIDを指定しても他のトーストに影響しないこと', () => {
      service.success('メッセージ1');

      service.remove('non-existent-id');

      expect(service.toasts().length).toBe(1);
    });
  });

  describe('自動消去', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('デフォルトで5秒後に自動消去されること', () => {
      service.success('メッセージ');

      expect(service.toasts().length).toBe(1);

      // 5秒経過
      vi.advanceTimersByTime(5000);

      expect(service.toasts().length).toBe(0);
    });

    it('カスタム時間を指定できること', () => {
      service.success('メッセージ', 2000);

      expect(service.toasts().length).toBe(1);

      // 2秒経過
      vi.advanceTimersByTime(2000);

      expect(service.toasts().length).toBe(0);
    });

    it('duration=0の場合は自動消去されないこと', () => {
      service.success('メッセージ', 0);

      expect(service.toasts().length).toBe(1);

      // 10秒経過
      vi.advanceTimersByTime(10000);

      expect(service.toasts().length).toBe(1);
    });
  });

  describe('複数トースト', () => {
    it('複数のトーストを同時に管理できること', () => {
      service.success('成功');
      service.error('エラー');
      service.warning('警告');
      service.info('情報');

      expect(service.toasts().length).toBe(4);
    });
  });
});
