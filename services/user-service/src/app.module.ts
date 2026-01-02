/**
 * アプリケーションルートモジュール
 *
 * TypeORM + Oracle接続設定を含む。
 * 環境変数から接続情報を取得し、開発時はsynchronize: trueで
 * エンティティ定義からテーブルを自動生成する。
 *
 * Why: USER_DB スキーマを使用
 * - task-serviceとは別のスキーマで独立したデータ管理
 * - ユーザー・認証データの分離
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';

@Module({
  imports: [
    // 環境変数の読み込み
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // TypeORM設定（Oracle接続）
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'oracle',
        host: configService.get<string>('ORACLE_HOST', 'oracle'),
        port: configService.get<number>('ORACLE_PORT', 1521),
        serviceName: configService.get<string>('ORACLE_SERVICE', 'XEPDB1'),
        // USER_DB スキーマ（task-serviceとは別）
        username: configService.get<string>('ORACLE_USER', 'USER_DB'),
        password: configService.get<string>('ORACLE_PASSWORD', 'user_password'),
        // エンティティは各ドメインモジュールで個別に登録
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // 開発時のみtrue（本番ではマイグレーション使用）
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        // Oracle固有設定
        extra: {
          // コネクションプール設定
          poolMin: 2,
          poolMax: 10,
          poolIncrement: 1,
        },
      }),
    }),
    // ドメインモジュール
    AuthModule,
    UserModule,
    RoleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
