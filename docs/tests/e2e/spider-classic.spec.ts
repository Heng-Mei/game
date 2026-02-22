import { expect, test } from '@playwright/test';

test('spider classic scene accepts deal action', async ({ page }) => {
  await page.goto('/#/game/spider');
  const canvas = page.locator('[data-testid="game-host-canvas"] canvas');
  await expect(canvas).toBeVisible();

  await page.keyboard.press('d');
  await expect(page).toHaveURL(/#\/game\/spider/);
});
