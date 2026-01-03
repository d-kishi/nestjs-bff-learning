/**
 * JWT認証ストラテジー
 *
 * Passport JWT Strategyを使用してJWTを検証する。
 * user-serviceが発行したJWTのシークレットと同じキーで検証。
 *
 * Why: BFFでJWTを検証し、ペイロードをrequest.userに設定することで、
 * 後続の処理でユーザー情報を利用可能にする。
 */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, UserFromJwt } from '../types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // Authorizationヘッダからトークンを抽出
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 期限切れトークンを拒否
      ignoreExpiration: false,
      // user-serviceと同じシークレットキー
      secretOrKey: configService.get<string>('JWT_SECRET', 'dev-secret-key'),
    });
  }

  /**
   * JWTペイロードを検証し、request.userに設定する値を返す
   *
   * Why: JwtPayloadから必要な情報のみ抽出し、軽量なUserFromJwt型で返す。
   * iat/expは認証後は不要なため除外。
   */
  validate(payload: JwtPayload): UserFromJwt {
    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
    };
  }
}
