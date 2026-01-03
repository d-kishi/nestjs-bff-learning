/**
 * DashboardController
 *
 * ダッシュボードエンドポイントを提供。
 * 複数サービスからデータを集約して返却。
 *
 * Why: Angularアプリケーションがダッシュボード画面を
 * 1回のAPIコールで表示できるようにする。
 */
import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserFromJwt } from '../common/types';
import { DashboardResponse } from './dto/dashboard-response.dto';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * ダッシュボードデータ取得
   *
   * 認証必須: JWTからユーザー情報を取得
   *
   * Note: 部分失敗時もHTTP 200を返し、_errors配列でエラーを通知。
   * これにより、クライアントは利用可能なデータを表示しつつ、
   * 一部データの取得失敗をユーザーに通知できる。
   */
  @Get()
  async getDashboard(
    @CurrentUser() user: UserFromJwt,
  ): Promise<DashboardResponse> {
    return this.dashboardService.getDashboard(user);
  }
}
