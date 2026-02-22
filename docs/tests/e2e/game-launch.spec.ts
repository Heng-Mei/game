import { expect, test } from '@playwright/test';

test('launches game without legacy iframe', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: '开始游戏' }).first().click();

  await expect(page).toHaveURL(/#\/game\//);
  await expect(page.locator('iframe.legacy-game-frame')).toHaveCount(0);
  await expect(page.locator('[data-testid="game-host-canvas"]')).toBeVisible();
});
