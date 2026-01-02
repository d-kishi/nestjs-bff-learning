import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * アプリケーションエントリポイント
 *
 * ValidationPipeをグローバルに設定し、
 * DTOのバリデーションを自動実行する。
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // グローバルValidationPipe設定
  app.useGlobalPipes(
    new ValidationPipe({
      // DTOに定義されていないプロパティを除去
      whitelist: true,
      // DTOに定義されていないプロパティがあればエラー
      forbidNonWhitelisted: true,
      // プリミティブ型への自動変換を有効化
      transform: true,
      transformOptions: {
        // 暗黙的な型変換を有効化（クエリパラメータのnumber変換等）
        enableImplicitConversion: true,
      },
    }),
  );

  // task-serviceはポート3001で起動
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`task-service is running on port ${port}`);
}
bootstrap();
