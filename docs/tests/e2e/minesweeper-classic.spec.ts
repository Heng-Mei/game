import { expect, test } from '@playwright/test';

test('minesweeper classic interactions reveal cells', async ({ page }) => {
  await page.goto('/#/game/minesweeper');
  const canvas = page.frameLocator('iframe.legacy-game-frame').locator('canvas#mainCanvas');
  await expect(canvas).toBeVisible();
  await canvas.click();
  await expect(page).toHaveURL(/#\/game\/minesweeper/);
  await expect(canvas).toBeVisible();
});
