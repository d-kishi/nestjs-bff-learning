/**
 * @CurrentUser() デコレータのテスト
 *
 * TDD Red Phase
 */
import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CurrentUser } from './current-user.decorator';

/**
 * カスタムパラメータデコレータのファクトリを取得するヘルパー
 */
function getParamDecoratorFactory(decorator: () => ParameterDecorator) {
  class Test {
    public test(@decorator() _value: unknown) {}
  }

  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
  return args[Object.keys(args)[0]].factory;
}

describe('@CurrentUser() decorator', () => {
  it('should extract UserFromJwt from request.user', () => {
    const mockUser = { id: 1, email: 'test@example.com', roles: ['MEMBER'] };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user: mockUser }),
      }),
    } as ExecutionContext;

    const factory = getParamDecoratorFactory(CurrentUser);
    const result = factory(undefined, mockContext);

    expect(result).toEqual(mockUser);
  });

  it('should return undefined when request.user is not set', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as ExecutionContext;

    const factory = getParamDecoratorFactory(CurrentUser);
    const result = factory(undefined, mockContext);

    expect(result).toBeUndefined();
  });

  it('should handle data parameter for partial extraction', () => {
    const mockUser = { id: 1, email: 'test@example.com', roles: ['MEMBER'] };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user: mockUser }),
      }),
    } as ExecutionContext;

    const factory = getParamDecoratorFactory(CurrentUser);
    // data='id' を渡した場合
    const result = factory('id', mockContext);

    expect(result).toBe(1);
  });
});
