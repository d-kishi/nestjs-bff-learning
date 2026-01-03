/**
 * DashboardComponent
 *
 * ダッシュボード画面
 *
 * 機能:
 * - ユーザー情報表示（ようこそメッセージ）
 * - タスクサマリー（TODO/IN_PROGRESS/DONE件数）
 * - プロジェクトサマリー（総数/所有数）
 * - 直近タスク5件の表示
 * - 部分失敗時の警告表示
 */
import { Component, inject, OnInit } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { DashboardService } from './dashboard.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LowerCasePipe, LoadingSpinnerComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  protected readonly dashboardService = inject(DashboardService);

  ngOnInit(): void {
    this.dashboardService.loadDashboard();
  }
}
