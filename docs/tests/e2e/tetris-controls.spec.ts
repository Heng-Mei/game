import { expect, test } from '@playwright/test';

test('tetris supports desktop key configuration modal', async ({ page }) => {
  await page.goto('/#/game/tetris');
  await page.getByRole('button', { name: '按键设置' }).click();
  await expect(page.getByRole('dialog', { name: 'Tetris 键位与输入设置' })).toBeVisible();

  const row = page.locator('.tetris-settings li', { hasText: 'rotateLeft' });
  await row.getByRole('button', { name: '修改' }).click();
  await page.keyboard.press('x');

  await expect(row.locator('code')).toHaveText('KeyX');
});
