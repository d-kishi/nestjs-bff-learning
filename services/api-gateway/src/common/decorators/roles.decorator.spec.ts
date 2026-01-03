/**
 * @Roles() デコレータのテスト
 *
 * TDD Red Phase
 */
import { ROLES_KEY, Roles } from './roles.decorator';

describe('@Roles() decorator', () => {
  it('should set ROLES_KEY metadata with specified roles', () => {
    class TestController {
      @Roles('ADMIN')
      testMethod() {}
    }

    const roles = Reflect.getMetadata(
      ROLES_KEY,
      TestController.prototype.testMethod,
    );
    expect(roles).toEqual(['ADMIN']);
  });

  it('should handle multiple roles', () => {
    class TestController {
      @Roles('ADMIN', 'MANAGER')
      testMethod() {}
    }

    const roles = Reflect.getMetadata(
      ROLES_KEY,
      TestController.prototype.testMethod,
    );
    expect(roles).toEqual(['ADMIN', 'MANAGER']);
  });
});
