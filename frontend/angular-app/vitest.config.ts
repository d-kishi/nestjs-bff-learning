/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

/**
 * Vitest設定ファイル
 *
 * Angular 21 + Vitest統合設定
 *
 * 注意:
 * - 通常のテスト実行は `npm run test` (= `ng test --no-watch`) を使用
 * - `ng test` は `@angular/build:unit-test` ビルダー経由でVitestを実行
 * - このファイルは `npx vitest` 直接実行時やVSCode拡張機能用
 *
 * 外部テンプレート対応:
 * - `ng test` 経由では外部テンプレート（templateUrl）が動作する
 * - `npx vitest` 直接実行では外部テンプレートは未サポート
 */
export default defineConfig({
  test: {
    // グローバルAPIを有効化（describe, it, expectなど）
    globals: true,

    // テスト環境
    environment: 'jsdom',

    // セットアップファイル
    setupFiles: ['src/test-setup.ts'],

    // テストファイルのパターン
    include: ['src/**/*.spec.ts'],

    // 除外パターン
    exclude: ['node_modules', 'dist'],

    // カバレッジ設定
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/app/**/*.ts'],
      exclude: ['src/app/**/*.spec.ts', 'src/app/**/index.ts'],
    },

    // レポーター設定
    reporters: ['default'],

    // タイムアウト設定
    testTimeout: 10000,
  },

  // esbuild設定（TypeScriptデコレータ対応）
  esbuild: {
    target: 'es2022',
  },

  // 依存関係の解決
  resolve: {
    alias: {
      '@app': '/src/app',
    },
  },
});
