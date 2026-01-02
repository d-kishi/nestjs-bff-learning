/**
 * Auth モジュール
 *
 * 認証機能を提供する。
 * ユーザー登録、ログイン、トークンリフレッシュ、ログアウト。
 */
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenRepository } from './refresh-token.repository';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    // JWT設定
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'dev-secret-key'),
        signOptions: {
          // 15分 = 900秒
          expiresIn: configService.get<number>('JWT_EXPIRES_IN_SECONDS', 900),
        },
      }),
    }),
    // UserModuleへの循環参照を解決
    forwardRef(() => UserModule),
    RoleModule,
  ],
  controllers: [AuthController],
  providers: [RefreshTokenRepository, AuthService],
  exports: [RefreshTokenRepository, AuthService, JwtModule],
})
export class AuthModule {}
