/**
 * ClientsModule
 *
 * サービスクライアントを提供するモジュール。
 * HttpModuleの設定（タイムアウト等）とクライアントの登録を行う。
 *
 * Why: 各ドメインモジュールがサービスクライアントを利用できるよう、
 * 共有モジュールとして設計。
 */
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TaskServiceClient } from './task-service.client';
import { UserServiceClient } from './user-service.client';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // デフォルトタイムアウト: 5秒
        timeout: configService.get<number>('HTTP_TIMEOUT', 5000),
        // 最大リダイレクト数
        maxRedirects: 5,
      }),
    }),
  ],
  providers: [TaskServiceClient, UserServiceClient],
  exports: [TaskServiceClient, UserServiceClient],
})
export class ClientsModule {}
