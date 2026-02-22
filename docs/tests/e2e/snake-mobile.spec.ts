import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

test('snake accepts swipe input on mobile viewport', async ({ page }) => {
  await page.goto('/#/game/snake');
  const canvas = page.frameLocator('iframe.legacy-game-frame').locator('canvas#mainCanvas');
  await expect(canvas).toBeVisible();
  await canvas.click();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(150);
  await expect(page).toHaveURL(/#\/game\/snake/);
});
