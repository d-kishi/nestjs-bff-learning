/**
 * 認証フロー E2Eテスト
 *
 * Phase 4 Step 4: Playwright E2Eテスト（5ケース）
 *
 * テストケース:
 * 1. ログイン画面表示
 * 2. ログイン成功
 * 3. ログイン失敗（無効な認証情報）
 * 4. 未認証時のリダイレクト
 * 5. ログアウト
 */
import { test, expect } from '@playwright/test';

test.describe('認証フロー', () => {
  test.beforeEach(async ({ page }) => {
    // ストレージクリア（ログアウト状態にする）
    await page.context().clearCookies();
    // ページに移動してからlocalStorageをクリア
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    // ページをリロードしてクリアを反映
    await page.reload();
  });

  test('1. ログイン画面が正しく表示される', async ({ page }) => {
    // ログイン画面に遷移
    await page.goto('/login');

    // タイトルが表示される（h1タグ）
    await expect(page.getByRole('heading', { name: 'タスク管理システム' })).toBeVisible();

    // メールアドレス入力欄が表示される
    await expect(page.getByLabel('メールアドレス')).toBeVisible();

    // パスワード入力欄が表示される
    await expect(page.getByLabel('パスワード')).toBeVisible();

    // ログインボタンが表示される（data-testidで特定）
    await expect(page.getByTestId('login-button')).toBeVisible();
  });

  test('2. 正しい認証情報でログイン成功', async ({ page }) => {
    // ログイン画面に遷移
    await page.goto('/login');

    // 認証情報を入力
    await page.getByLabel('メールアドレス').fill('admin@example.com');
    await page.getByLabel('パスワード').fill('password123');

    // ログインボタンをクリック（data-testidで特定）
    await page.getByTestId('login-button').click();

    // ダッシュボードにリダイレクトされる
    await expect(page).toHaveURL('/dashboard');

    // ダッシュボードのコンテンツが表示される（ようこそメッセージ）
    await expect(page.getByRole('heading', { name: /ようこそ/ })).toBeVisible();
  });

  test('3. 無効な認証情報でログイン失敗', async ({ page }) => {
    // ログイン画面に遷移
    await page.goto('/login');

    // 無効な認証情報を入力
    await page.getByLabel('メールアドレス').fill('invalid@example.com');
    await page.getByLabel('パスワード').fill('wrongpassword');

    // ログインボタンをクリック（data-testidで特定）
    await page.getByTestId('login-button').click();

    // エラーメッセージが表示される（data-testidで特定）
    await expect(page.getByTestId('error-message')).toBeVisible();

    // ログイン画面に留まる
    await expect(page).toHaveURL(/\/login/);
  });

  test('4. 未認証時は保護されたページからログインにリダイレクト', async ({ page }) => {
    // 保護されたページに直接アクセス
    await page.goto('/dashboard');

    // ログイン画面にリダイレクトされる（returnUrlパラメータは許容）
    await expect(page).toHaveURL(/\/login/);
  });

  test('5. ログアウトでログイン画面にリダイレクト', async ({ page }) => {
    // まずログイン
    await page.goto('/login');
    await page.getByLabel('メールアドレス').fill('admin@example.com');
    await page.getByLabel('パスワード').fill('password123');
    await page.getByTestId('login-button').click();

    // ダッシュボードに到達
    await expect(page).toHaveURL('/dashboard');

    // ユーザーメニューを開く（ユーザー名ボタンをクリック）
    await page.locator('.header__user-btn').click();

    // ログアウトボタンをクリック
    await page.getByRole('button', { name: 'ログアウト' }).click();

    // ログイン画面にリダイレクトされる
    await expect(page).toHaveURL(/\/login/);
  });
});
