import { expect, test } from '@playwright/test';

test('theme toggle works from settings modal', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: '设置' }).click();
  await expect(page.getByRole('dialog', { name: '全局设置' })).toBeVisible();

  await page.getByRole('radio', { name: '夜间' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');

  await page.getByRole('button', { name: '关闭' }).click();
});
