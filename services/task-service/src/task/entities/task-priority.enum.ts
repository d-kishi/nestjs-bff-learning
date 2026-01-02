/**
 * タスク優先度 Enum
 *
 * Why: OracleはENUM型をサポートしないため、
 * VARCHAR + TypeScript enumで実装する。
 * DBにはLOW, MEDIUM, HIGHの文字列が保存される。
 */
export enum TaskPriority {
  /** 低 */
  LOW = 'LOW',
  /** 中（デフォルト） */
  MEDIUM = 'MEDIUM',
  /** 高 */
  HIGH = 'HIGH',
}
