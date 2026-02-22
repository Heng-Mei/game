import { expect, test } from '@playwright/test';

test('theme toggle updates shell and legacy iframe theme', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: '设置' }).click();
  await expect(page.getByRole('dialog', { name: '全局设置' })).toBeVisible();

  await page.getByRole('radio', { name: '夜间' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');

  await page.getByRole('button', { name: '关闭' }).click();

  await page.getByRole('link', { name: '开始游戏' }).first().click();
  await expect(page.locator('[data-testid="game-hud"]')).toBeVisible();
  const frame = page.frameLocator('iframe.legacy-game-frame');
  await expect(frame.locator('html')).toHaveAttribute('data-theme', 'night');

  await page.getByRole('button', { name: '日间' }).first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'day');
  await expect(frame.locator('html')).toHaveAttribute('data-theme', 'day');
});
