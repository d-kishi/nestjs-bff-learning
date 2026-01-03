/**
 * ダッシュボードレスポンスDTO
 *
 * 複数サービスからのデータを集約したレスポンス形式。
 * 部分失敗時は_errors配列でエラー情報を通知。
 */

/**
 * ユーザーサマリー
 */
export interface UserSummary {
  id: number;
  email: string;
  profile: {
    displayName: string;
    avatarUrl: string | null;
  };
}

/**
 * タスクサマリー
 */
export interface TaskSummary {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
}

/**
 * プロジェクトサマリー
 */
export interface ProjectSummary {
  total: number;
  owned: number;
}

/**
 * 直近タスク
 */
export interface RecentTask {
  id: number;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  projectId: number;
  projectName: string;
}

/**
 * ダッシュボードレスポンス
 *
 * Why: 部分失敗時もHTTP 200を返し、_errors配列でエラーを通知。
 * これによりクライアントは利用可能なデータを表示しつつ、
 * 一部データの取得失敗をユーザーに通知できる。
 */
export interface DashboardResponse {
  user: UserSummary | null;
  taskSummary: TaskSummary;
  projectSummary: ProjectSummary;
  recentTasks: RecentTask[];
  _errors?: string[];
}
