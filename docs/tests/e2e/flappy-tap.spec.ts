import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

test('flappy runs with tap-only input on mobile viewport', async ({ page }) => {
  await page.goto('/#/game/flappy');
  const canvas = page.locator('[data-testid="game-host-canvas"] canvas');
  await expect(canvas).toBeVisible();
  await expect(page.getByText('分数 0')).toBeVisible();

  await canvas.click();
  await canvas.click();
  await canvas.click();
  await page.waitForTimeout(1800);

  await expect(page.getByText(/分数 [1-9]\d*/)).toBeVisible();
});
