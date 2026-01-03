/**
 * JWTペイロード型
 *
 * user-serviceが発行するJWTのペイロード構造。
 * BFFでJWT検証後、この型にデコードされる。
 */
export interface JwtPayload {
  /** ユーザーID（subject） */
  sub: number;

  /** メールアドレス */
  email: string;

  /** ロール配列 */
  roles: string[];

  /** 発行日時（Unix timestamp） */
  iat: number;

  /** 有効期限（Unix timestamp） */
  exp: number;
}
