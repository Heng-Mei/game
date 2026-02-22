import { expect, test } from '@playwright/test';

test('lobby cards show bilingual player-facing copy', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('俄罗斯方块 · Tetris')).toBeVisible();
  await expect(page.getByText(/键位设置|开发|迁移/)).toHaveCount(0);
});
