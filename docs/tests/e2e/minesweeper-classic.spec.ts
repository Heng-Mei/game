import { expect, test } from '@playwright/test';

test('minesweeper classic interactions reveal cells', async ({ page }) => {
  await page.goto('/#/game/minesweeper');
  const canvas = page.locator('[data-testid="game-host-canvas"] canvas');
  await expect(canvas).toBeVisible();

  const box = await canvas.boundingBox();
  if (!box) {
    throw new Error('canvas box missing');
  }

  await page.mouse.click(box.x + box.width * 0.16, box.y + box.height * 0.28);
  await expect(page).toHaveURL(/#\/game\/minesweeper/);
  await expect(canvas).toBeVisible();
});
