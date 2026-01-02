/**
 * タスクステータス Enum
 *
 * Why: OracleはENUM型をサポートしないため、
 * VARCHAR + TypeScript enumで実装する。
 * DBにはTODO, IN_PROGRESS, DONEの文字列が保存される。
 */
export enum TaskStatus {
  /** 未着手 */
  TODO = 'TODO',
  /** 進行中 */
  IN_PROGRESS = 'IN_PROGRESS',
  /** 完了 */
  DONE = 'DONE',
}
