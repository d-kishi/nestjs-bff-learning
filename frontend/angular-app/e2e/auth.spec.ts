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
    await page.evaluate(() => localStorage.clear());
  });

  test('1. ログイン画面が正しく表示される', async ({ page }) => {
    // ログイン画面に遷移
    await page.goto('/login');

    // タイトルが表示される
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();

    // メールアドレス入力欄が表示される
    await expect(page.getByLabel('メールアドレス')).toBeVisible();

    // パスワード入力欄が表示される
    await expect(page.getByLabel('パスワード')).toBeVisible();

    // ログインボタンが表示される
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
  });

  test('2. 正しい認証情報でログイン成功', async ({ page }) => {
    // ログイン画面に遷移
    await page.goto('/login');

    // 認証情報を入力
    await page.getByLabel('メールアドレス').fill('admin@example.com');
    await page.getByLabel('パスワード').fill('password123');

    // ログインボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();

    // ダッシュボードにリダイレクトされる
    await expect(page).toHaveURL('/dashboard');

    // ダッシュボードのコンテンツが表示される
    await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible();
  });

  test('3. 無効な認証情報でログイン失敗', async ({ page }) => {
    // ログイン画面に遷移
    await page.goto('/login');

    // 無効な認証情報を入力
    await page.getByLabel('メールアドレス').fill('invalid@example.com');
    await page.getByLabel('パスワード').fill('wrongpassword');

    // ログインボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();

    // エラーメッセージが表示される
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText('メールアドレスまたはパスワードが正しくありません');

    // ログイン画面に留まる
    await expect(page).toHaveURL('/login');
  });

  test('4. 未認証時は保護されたページからログインにリダイレクト', async ({ page }) => {
    // 保護されたページに直接アクセス
    await page.goto('/dashboard');

    // ログイン画面にリダイレクトされる
    await expect(page).toHaveURL('/login');
  });

  test('5. ログアウトでログイン画面にリダイレクト', async ({ page }) => {
    // まずログイン
    await page.goto('/login');
    await page.getByLabel('メールアドレス').fill('admin@example.com');
    await page.getByLabel('パスワード').fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();

    // ダッシュボードに到達
    await expect(page).toHaveURL('/dashboard');

    // ログアウトボタンをクリック
    await page.getByRole('button', { name: 'ログアウト' }).click();

    // ログイン画面にリダイレクトされる
    await expect(page).toHaveURL('/login');
  });
});
