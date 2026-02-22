import { expect, test } from '@playwright/test';

test('game canvas should not be vertically centered with large margin', async ({ page }) => {
  await page.goto('/#/game/tetris');
  await page.waitForTimeout(300);

  const metrics = await page.evaluate(() => {
    const host = document.querySelector('.game-canvas-host') as HTMLElement | null;
    const canvas = host?.querySelector('canvas') as HTMLCanvasElement | null;
    if (!host || !canvas) {
      return null;
    }
    const hostRect = host.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const style = getComputedStyle(canvas);
    return {
      marginTop: style.marginTop,
      marginLeft: style.marginLeft,
      hostHeight: hostRect.height,
      canvasHeight: canvasRect.height
    };
  });

  expect(metrics).not.toBeNull();
  expect(metrics!.marginTop).toBe('0px');
  expect(metrics!.marginLeft).toBe('0px');
  expect(metrics!.hostHeight / metrics!.canvasHeight).toBeLessThanOrEqual(1.05);
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
