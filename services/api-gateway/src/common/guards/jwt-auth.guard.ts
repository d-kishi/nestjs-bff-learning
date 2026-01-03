/**
 * JWT認証ガード
 *
 * Passport JWT Strategyを使用した認証ガード。
 * @Public()デコレータが付与されたエンドポイントはスキップ。
 *
 * Why: グローバルに適用して全エンドポイントをデフォルトで認証必須とし、
 * 公開エンドポイントのみ@Public()で除外する設計。
 *
 * @example
 * // main.ts でグローバル適用
 * app.useGlobalGuards(new JwtAuthGuard(reflector));
 *
 * // 公開エンドポイント
 * @Public()
 * @Post('login')
 * login() { ... }
 */
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { BffUnauthorizedException } from '../exceptions/bff.exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  /**
   * アクセス可否を判定
   *
   * 1. @Public()デコレータがあればスキップ
   * 2. なければPassport JWT認証を実行
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // @Public()デコレータをチェック
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Passport JWT認証を実行
    return super.canActivate(context) as Promise<boolean>;
  }

  /**
   * 認証結果をハンドリング
   *
   * Why: デフォルトのエラーではなく、BFF固有のエラーコードを返すため。
   */
  handleRequest<TUser>(err: Error | null, user: TUser): TUser {
    if (err || !user) {
      throw new BffUnauthorizedException(
        'Invalid or missing authentication token',
      );
    }
    return user;
  }
}
