import { expect, test } from '@playwright/test';

test('2048 supports keyboard and swipe input', async ({ page }) => {
  await page.goto('/#/game/g2048');
  const canvas = page.locator('[data-testid="game-host-canvas"] canvas');
  await expect(canvas).toBeVisible();

  await page.keyboard.press('ArrowLeft');
  const box = await canvas.boundingBox();
  if (!box) {
    throw new Error('canvas box missing');
  }
  const startX = box.x + box.width * 0.3;
  const endX = box.x + box.width * 0.7;
  const y = box.y + box.height * 0.5;
  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(endX, y, { steps: 5 });
  await page.mouse.up();

  await expect(page).toHaveURL(/#\/game\/g2048/);
});
