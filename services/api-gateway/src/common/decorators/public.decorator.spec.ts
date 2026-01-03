/**
 * @Public() デコレータのテスト
 *
 * TDD Red Phase
 */
import { IS_PUBLIC_KEY, Public } from './public.decorator';

describe('@Public() decorator', () => {
  it('should set IS_PUBLIC_KEY metadata to true', () => {
    // ダミーのクラスとメソッド
    class TestController {
      @Public()
      testMethod() {}
    }

    // メタデータを取得して確認
    const isPublic = Reflect.getMetadata(
      IS_PUBLIC_KEY,
      TestController.prototype.testMethod,
    );
    expect(isPublic).toBe(true);
  });

  it('should export IS_PUBLIC_KEY constant', () => {
    expect(IS_PUBLIC_KEY).toBe('isPublic');
  });
});
