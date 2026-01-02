/**
 * CurrentUser デコレータ ユニットテスト
 *
 * BFF内部ヘッダからユーザー情報を取得するデコレータの動作を検証する。
 * - X-User-IdからユーザーIDが取得できること
 * - X-User-Rolesからロール配列が取得できること
 * - ヘッダが存在しない場合の挙動
 */
import { hasRole, isAdmin } from './current-user.decorator';

describe('CurrentUser Decorators', () => {
  /**
   * createParamDecoratorの実行関数を取得するヘルパー
   * Note: createParamDecoratorは直接テストできないため、
   * ヘルパー関数（hasRole, isAdmin）のテストを中心に行う
   */
  describe('hasRole', () => {
    it('ロールが含まれている場合trueを返す', () => {
      const roles = ['MEMBER', 'ADMIN'];
      expect(hasRole(roles, 'ADMIN')).toBe(true);
    });

    it('ロールが含まれていない場合falseを返す', () => {
      const roles = ['MEMBER'];
      expect(hasRole(roles, 'ADMIN')).toBe(false);
    });

    it('空配列の場合falseを返す', () => {
      const roles: string[] = [];
      expect(hasRole(roles, 'ADMIN')).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('ADMINロールがある場合trueを返す', () => {
      const roles = ['MEMBER', 'ADMIN'];
      expect(isAdmin(roles)).toBe(true);
    });

    it('ADMINロールがない場合falseを返す', () => {
      const roles = ['MEMBER'];
      expect(isAdmin(roles)).toBe(false);
    });

    it('空配列の場合falseを返す', () => {
      const roles: string[] = [];
      expect(isAdmin(roles)).toBe(false);
    });
  });

  /**
   * デコレータの実装ロジックをテストするためのヘルパー関数
   * 実際のデコレータはNestJSが呼び出すため、ロジック部分を抽出してテスト
   */
  describe('CurrentUserId logic', () => {
    const extractUserId = (
      headers: Record<string, string | string[] | undefined>,
    ): number | undefined => {
      const userIdHeader = headers['x-user-id'];
      if (!userIdHeader) return undefined;
      const userIdString = Array.isArray(userIdHeader)
        ? userIdHeader[0]
        : userIdHeader;
      const userId = parseInt(userIdString, 10);
      return isNaN(userId) ? undefined : userId;
    };

    it('X-User-Idヘッダから数値を取得できる', () => {
      const headers = { 'x-user-id': '123' };
      expect(extractUserId(headers)).toBe(123);
    });

    it('X-User-Idが配列の場合最初の値を使用する', () => {
      const headers = { 'x-user-id': ['456', '789'] };
      expect(extractUserId(headers)).toBe(456);
    });

    it('X-User-Idがない場合undefinedを返す', () => {
      const headers = {};
      expect(extractUserId(headers)).toBeUndefined();
    });

    it('X-User-Idが数値でない場合undefinedを返す', () => {
      const headers = { 'x-user-id': 'invalid' };
      expect(extractUserId(headers)).toBeUndefined();
    });

    it('X-User-Idが空文字の場合undefinedを返す', () => {
      const headers = { 'x-user-id': '' };
      expect(extractUserId(headers)).toBeUndefined();
    });
  });

  describe('CurrentUserRoles logic', () => {
    const extractRoles = (
      headers: Record<string, string | string[] | undefined>,
    ): string[] => {
      const rolesHeader = headers['x-user-roles'];
      if (!rolesHeader) return [];
      const rolesString = Array.isArray(rolesHeader)
        ? rolesHeader[0]
        : rolesHeader;
      return rolesString
        .split(',')
        .map((role) => role.trim())
        .filter((role) => role.length > 0);
    };

    it('X-User-Rolesヘッダからロール配列を取得できる', () => {
      const headers = { 'x-user-roles': 'MEMBER,ADMIN' };
      expect(extractRoles(headers)).toEqual(['MEMBER', 'ADMIN']);
    });

    it('単一ロールの場合も配列で返す', () => {
      const headers = { 'x-user-roles': 'MEMBER' };
      expect(extractRoles(headers)).toEqual(['MEMBER']);
    });

    it('空白がトリムされる', () => {
      const headers = { 'x-user-roles': ' MEMBER , ADMIN ' };
      expect(extractRoles(headers)).toEqual(['MEMBER', 'ADMIN']);
    });

    it('X-User-Rolesが配列の場合最初の値を使用する', () => {
      const headers = { 'x-user-roles': ['MEMBER,ADMIN', 'GUEST'] };
      expect(extractRoles(headers)).toEqual(['MEMBER', 'ADMIN']);
    });

    it('X-User-Rolesがない場合空配列を返す', () => {
      const headers = {};
      expect(extractRoles(headers)).toEqual([]);
    });

    it('X-User-Rolesが空文字の場合空配列を返す', () => {
      const headers = { 'x-user-roles': '' };
      expect(extractRoles(headers)).toEqual([]);
    });

    it('空のロールがフィルタされる', () => {
      const headers = { 'x-user-roles': 'MEMBER,,ADMIN,' };
      expect(extractRoles(headers)).toEqual(['MEMBER', 'ADMIN']);
    });
  });
});
