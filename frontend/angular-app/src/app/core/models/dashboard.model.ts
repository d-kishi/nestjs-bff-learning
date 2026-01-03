/**
 * ダッシュボード関連型定義
 *
 * BFF（api-gateway）のダッシュボードレスポンスに対応
 * データ集約・部分失敗ハンドリングを考慮
 */

/**
 * ダッシュボードレスポンス
 *
 * BFFがtask-service, user-serviceからデータを集約して返す
 * 部分失敗時は_errorsに失敗したサービス情報が含まれる
 */
export interface DashboardResponse {
  /** ユーザー情報（user-service取得失敗時はnull） */
  user: DashboardUserSummary | null;

  /** タスクサマリー（ステータス別件数） */
  taskSummary: TaskSummary;

  /** プロジェクトサマリー（総数・所有数） */
  projectSummary: ProjectSummary;

  /** 直近のタスク（最大5件） */
  recentTasks: RecentTask[];

  /**
   * 部分失敗時のエラー情報
   *
   * 一部のサービスからデータ取得に失敗した場合に設定される
   * 例: ["user-service unavailable"]
   */
  _errors?: string[];
}

/**
 * ダッシュボード用ユーザーサマリー
 *
 * ダッシュボードに表示するユーザー情報の最小セット
 * user.model.tsのUserSummaryとは別の型
 */
export interface DashboardUserSummary {
  /** ユーザーID */
  id: number;

  /** メールアドレス */
  email: string;

  /** プロフィール情報 */
  profile: {
    /** 表示名 */
    displayName: string;
    /** アバター画像URL（未設定時はnull） */
    avatarUrl: string | null;
  };
}

/**
 * タスクサマリー
 *
 * ステータス別のタスク件数
 */
export interface TaskSummary {
  /** 総タスク数 */
  total: number;

  /** TODOステータスのタスク数 */
  todo: number;

  /** IN_PROGRESSステータスのタスク数 */
  inProgress: number;

  /** DONEステータスのタスク数 */
  done: number;
}

/**
 * プロジェクトサマリー
 *
 * プロジェクトの総数と所有数
 */
export interface ProjectSummary {
  /** 総プロジェクト数 */
  total: number;

  /** 自分が所有（作成）したプロジェクト数 */
  owned: number;
}

/**
 * 直近タスク
 *
 * ダッシュボードに表示する最近のタスク情報
 */
export interface RecentTask {
  /** タスクID */
  id: number;

  /** タスクタイトル */
  title: string;

  /** ステータス */
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';

  /** 優先度 */
  priority: 'LOW' | 'MEDIUM' | 'HIGH';

  /** 期限日（ISO 8601形式、未設定時はnull） */
  dueDate: string | null;

  /** 所属プロジェクトID */
  projectId: number;

  /** 所属プロジェクト名 */
  projectName: string;
}
