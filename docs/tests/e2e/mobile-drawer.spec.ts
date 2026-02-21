import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

test('mobile drawer can open and close on game page', async ({ page }) => {
  await page.goto('/#/game/tetris');

  const toggle = page.getByRole('button', { name: '展开信息' });
  await toggle.click();
  await expect(page.locator('.ui-drawer')).toHaveClass(/ui-drawer--open/);

  await page.getByRole('button', { name: '收起', exact: true }).click();
  await expect(page.locator('.ui-drawer')).not.toHaveClass(/ui-drawer--open/);
});
