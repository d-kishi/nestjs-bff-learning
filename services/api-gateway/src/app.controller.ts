/**
 * AppController
 *
 * api-gatewayのルートコントローラー。
 * ヘルスチェック用エンドポイントを提供。
 */
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * ヘルスチェック用エンドポイント
   *
   * Why: @Public()で認証不要に設定。
   * ロードバランサー等からの死活監視で使用。
   */
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
