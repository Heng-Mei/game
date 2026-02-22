import { expect, test } from '@playwright/test';

test('legacy iframe hides nested menu controls in embedded mode', async ({ page }) => {
  await page.goto('/#/game/tetris');
  await page.waitForTimeout(300);

  const frame = page.frameLocator('iframe.legacy-game-frame');
  await expect(frame.locator('#mainCanvas')).toBeVisible();
  await expect(frame.locator('#menuView')).toBeHidden();
  await expect(frame.locator('#backToMenu')).toBeHidden();
  await expect(frame.locator('#gameTitle')).toBeHidden();
});

test.use({ viewport: { width: 390, height: 844 } });

test('mobile layout should not overflow horizontally', async ({ page }) => {
  await page.goto('/#/game/tetris');
  await page.waitForTimeout(300);

  const width = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth
  }));

  expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
});
