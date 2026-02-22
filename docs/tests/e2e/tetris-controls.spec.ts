import { expect, test } from '@playwright/test';

test('tetris loads legacy canvas runtime', async ({ page }) => {
  await page.goto('/#/game/tetris');
  const canvas = page.frameLocator('iframe.legacy-game-frame').locator('canvas#mainCanvas');
  await expect(canvas).toBeVisible();
  await canvas.click();
  await page.keyboard.press('ArrowLeft');
  await expect(page).toHaveURL(/#\/game\/tetris/);
});
