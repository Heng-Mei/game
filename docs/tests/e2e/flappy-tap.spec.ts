import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

test('flappy runs with tap-only input on mobile viewport', async ({ page }) => {
  await page.goto('/#/game/flappy');
  const canvas = page.frameLocator('iframe.legacy-game-frame').locator('canvas#mainCanvas');
  await expect(canvas).toBeVisible();

  await canvas.click();
  await canvas.click();
  await canvas.click();
  await page.waitForTimeout(400);
  await expect(page).toHaveURL(/#\/game\/flappy/);
});
