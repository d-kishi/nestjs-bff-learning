/**
 * Vitestテストセットアップファイル
 *
 * Zone.jsベースのAngularテストに対応
 * @analogjs/vite-plugin-angularで外部テンプレート・スタイルを解決
 */
import 'zone.js';
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

/**
 * Angular TestBedの初期化
 *
 * 各テストファイルで個別に初期化する必要がないように
 * グローバルで一度だけ初期化する
 */
TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});
