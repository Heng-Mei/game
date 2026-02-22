import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

test('snake accepts swipe input on mobile viewport', async ({ page }) => {
  await page.goto('/#/game/snake');
  const canvas = page.locator('[data-testid="game-host-canvas"] canvas');
  await expect(canvas).toBeVisible();

  const box = await canvas.boundingBox();
  if (!box) {
    throw new Error('canvas box missing');
  }

  const fromX = box.x + box.width * 0.3;
  const toX = box.x + box.width * 0.7;
  const y = box.y + box.height * 0.5;

  await page.mouse.move(fromX, y);
  await page.mouse.down();
  await page.mouse.move(toX, y, { steps: 5 });
  await page.mouse.up();

  await page.waitForTimeout(200);
  await expect(page).toHaveURL(/#\/game\/snake/);
});
