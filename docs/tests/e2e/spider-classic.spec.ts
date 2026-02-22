import { expect, test } from '@playwright/test';

test('spider classic scene accepts deal action', async ({ page }) => {
  await page.goto('/#/game/spider');
  const canvas = page.frameLocator('iframe.legacy-game-frame').locator('canvas#mainCanvas');
  await expect(canvas).toBeVisible();
  await canvas.click();
  await expect(page).toHaveURL(/#\/game\/spider/);
});
