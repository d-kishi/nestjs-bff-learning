/**
 * JWT検証後のユーザー情報
 *
 * JwtStrategyのvalidateメソッドで返される型。
 * request.userに格納され、@CurrentUser()デコレータで取得可能。
 *
 * Why: classとして定義することで、TypeScript 5.5以降の
 * isolatedModules + emitDecoratorMetadata 環境でも
 * デコレータのパラメータ型として使用可能にする。
 */
export class UserFromJwt {
  /** ユーザーID */
  id: number;

  /** メールアドレス */
  email: string;

  /** ロール配列 */
  roles: string[];
}
