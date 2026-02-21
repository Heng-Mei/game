import { expect, test } from '@playwright/test';

test('can launch tetris from menu and see game host', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: '开始游戏' }).first().click();

  await expect(page).toHaveURL(/#\/game\//);
  await expect(page.locator('iframe.legacy-game-frame')).toBeVisible();
  await expect(
    page.frameLocator('iframe.legacy-game-frame').locator('canvas#mainCanvas')
  ).toBeVisible();
});
