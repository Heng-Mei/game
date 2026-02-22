import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

test('game page has single-level navigation and mobile info drawer', async ({ page }) => {
  await page.goto('/#/game/tetris');

  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.getByRole('link', { name: '返回菜单' })).toHaveCount(1);

  const toggle = page.getByRole('button', { name: '展开信息' });
  await toggle.click();
  await expect(page.locator('.ui-drawer')).toHaveClass(/ui-drawer--open/);

  await page.getByRole('button', { name: '收起', exact: true }).click();
  await expect(page.locator('.ui-drawer')).not.toHaveClass(/ui-drawer--open/);
});
