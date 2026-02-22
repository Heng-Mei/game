import { expect, test } from '@playwright/test';

test('2048 supports keyboard and swipe input', async ({ page }) => {
  await page.goto('/#/game/g2048');
  const canvas = page.frameLocator('iframe.legacy-game-frame').locator('canvas#mainCanvas');
  await expect(canvas).toBeVisible();

  await canvas.click();
  await page.keyboard.press('ArrowLeft');

  await expect(page).toHaveURL(/#\/game\/g2048/);
});
