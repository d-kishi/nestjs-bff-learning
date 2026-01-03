/**
 * AuthModule
 *
 * 認証関連の機能を提供するモジュール。
 * JWT検証のためのPassportモジュールを設定。
 *
 * Why: 本番環境ではJWT_SECRET環境変数を必須とし、
 * 予測可能なシークレットキーでの起動を防止する。
 */
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from '../common/strategies/jwt.strategy';
import { ClientsModule } from '../clients/clients.module';

/**
 * JWT_SECRETを取得（本番環境では必須）
 */
function getJwtSecret(configService: ConfigService): string {
  const secret = configService.get<string>('JWT_SECRET');
  const nodeEnv = configService.get<string>('NODE_ENV');

  if (!secret && nodeEnv === 'production') {
    throw new Error(
      'JWT_SECRET environment variable is required in production environment',
    );
  }

  return secret || 'dev-secret-key';
}

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: getJwtSecret(configService),
        signOptions: {
          // BFFではJWT署名は行わない（user-serviceが担当）
          // ここでの設定はJwtModuleの初期化に必要
          expiresIn: '15m',
        },
      }),
    }),
    ClientsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
