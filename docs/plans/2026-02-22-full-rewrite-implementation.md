# Full Rewrite (7 Games) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the entire project with brand-new code (no legacy runtime path) while preserving and shipping the core gameplay of all 7 games with stable desktop + mobile playability.

**Architecture:** Use React as the shell and Phaser as the unified game runtime. Each game is split into pure `rules` logic and `scene` rendering/input orchestration. A shared platform layer handles action mapping, viewport adaptation, and theme tokens (day/night) applied consistently in menu + in-game HUD.

**Tech Stack:** React, TypeScript, Vite, Phaser 3, Zustand, SCSS/CSS variables, Vitest, Playwright

---

## Execution Rules (Must Follow)

- Process: `@superpowers:systematic-debugging`
- Implementation discipline: `@superpowers:test-driven-development`
- Completion gate: `@superpowers:verification-before-completion`
- One task = one focused commit. Do not bundle unrelated changes.

### Task 1: Replace Legacy Entry with New Runtime Contract

**Files:**
- Create: `docs/src/contracts/game-contracts.ts`
- Modify: `docs/src/shared/game-catalog.ts`
- Modify: `docs/src/features/game/game-page.tsx`
- Test: `docs/tests/e2e/game-launch.spec.ts`

**Step 1: Write the failing test**

```ts
// docs/tests/e2e/game-launch.spec.ts
test('launches game without legacy iframe', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: '开始游戏' }).first().click();
  await expect(page.locator('iframe.legacy-game-frame')).toHaveCount(0);
  await expect(page.locator('[data-testid="game-host-canvas"]')).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `cd docs && npm run test:e2e -- --project=chromium tests/e2e/game-launch.spec.ts`  
Expected: FAIL because `iframe.legacy-game-frame` still exists.

**Step 3: Write minimal implementation**

```ts
// docs/src/contracts/game-contracts.ts
export type GameId = 'tetris' | 'snake' | 'minesweeper' | 'spider' | 'dino' | 'flappy' | 'g2048';
export interface GameManifest { id: GameId; titleZh: string; titleEn: string; summary: string; }
```

Refactor `game-page.tsx` to render new `GameHost` component instead of legacy iframe.

**Step 4: Run test to verify it passes**

Run: `cd docs && npm run test:e2e -- --project=chromium tests/e2e/game-launch.spec.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add docs/src/contracts/game-contracts.ts docs/src/shared/game-catalog.ts docs/src/features/game/game-page.tsx docs/tests/e2e/game-launch.spec.ts
git commit -m "refactor(core): remove legacy iframe entry and add game contract"
```

### Task 2: Build Platform Runtime (GameHost + Registry + Lifecycle)

**Files:**
- Create: `docs/src/platform/game-registry.ts`
- Create: `docs/src/platform/game-runtime.ts`
- Create: `docs/src/platform/game-host.tsx`
- Test: `docs/src/platform/game-runtime.test.ts`

**Step 1: Write the failing test**

```ts
// docs/src/platform/game-runtime.test.ts
it('registers and launches a game scene by id', () => {
  const runtime = createGameRuntime();
  runtime.register({ id: 'tetris', factory: () => ({ key: 'scene:tetris' }) });
  expect(runtime.getSceneKey('tetris')).toBe('scene:tetris');
});
```

**Step 2: Run test to verify it fails**

Run: `cd docs && npx vitest run src/platform/game-runtime.test.ts`  
Expected: FAIL because runtime module does not exist.

**Step 3: Write minimal implementation**

```ts
export function createGameRuntime() {
  const map = new Map<string, { key: string }>();
  return {
    register(def: { id: string; factory: () => { key: string } }) { map.set(def.id, def.factory()); },
    getSceneKey(id: string) { return map.get(id)?.key; }
  };
}
```

Then connect `game-host.tsx` to instantiate/destroy Phaser instance on mount/unmount.

**Step 4: Run test to verify it passes**

Run: `cd docs && npx vitest run src/platform/game-runtime.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add docs/src/platform/game-registry.ts docs/src/platform/game-runtime.ts docs/src/platform/game-host.tsx docs/src/platform/game-runtime.test.ts
git commit -m "feat(platform): add unified runtime and game host lifecycle"
```

### Task 3: Unified Input Pipeline (Keyboard + Touch + Gesture)

**Files:**
- Create: `docs/src/platform/input/input-adapter.ts`
- Create: `docs/src/platform/input/gesture-detector.ts`
- Create: `docs/src/platform/input/action-bus.ts`
- Test: `docs/src/platform/input/gesture-detector.test.ts`

**Step 1: Write the failing test**

```ts
it('maps swipe direction to canonical actions', () => {
  expect(detectSwipe({ x: 0, y: 0 }, { x: 50, y: 2 })).toBe('move_right');
  expect(detectSwipe({ x: 0, y: 0 }, { x: -50, y: 1 })).toBe('move_left');
});
```

**Step 2: Run test to verify it fails**

Run: `cd docs && npx vitest run src/platform/input/gesture-detector.test.ts`  
Expected: FAIL.

**Step 3: Write minimal implementation**

```ts
export function detectSwipe(from: Point, to: Point): CanonicalAction | null {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return null;
  return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'move_right' : 'move_left') : (dy > 0 ? 'move_down' : 'move_up');
}
```

Wire keyboard + touch into one action bus consumed by scenes.

**Step 4: Run test to verify it passes**

Run: `cd docs && npx vitest run src/platform/input/gesture-detector.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add docs/src/platform/input/input-adapter.ts docs/src/platform/input/gesture-detector.ts docs/src/platform/input/action-bus.ts docs/src/platform/input/gesture-detector.test.ts
git commit -m "feat(input): unify keyboard touch and gesture actions"
```

### Task 4: Rebuild Theme System (Day/Night Tokens for Shell + HUD)

**Files:**
- Modify: `docs/src/theme/tokens.ts`
- Modify: `docs/src/theme/theme.css`
- Modify: `docs/src/theme/theme-provider.tsx`
- Modify: `docs/src/styles/global.scss`
- Test: `docs/tests/e2e/theme-toggle.spec.ts`

**Step 1: Write the failing test**

```ts
test('theme toggle updates shell and in-game hud colors', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /主题|Theme/i }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', /dark|night/);
  await page.getByRole('link', { name: '开始游戏' }).first().click();
  await expect(page.locator('[data-testid="game-hud"]')).toHaveCSS('background-color', /rgb/);
});
```

**Step 2: Run test to verify it fails**

Run: `cd docs && npm run test:e2e -- --project=chromium tests/e2e/theme-toggle.spec.ts`  
Expected: FAIL.

**Step 3: Write minimal implementation**

Define semantic tokens: `--surface`, `--surface-alt`, `--text`, `--accent`, `--danger`, `--grid-bg`.  
Apply tokens to menu cards, modal/drawer, and in-game HUD components.

**Step 4: Run test to verify it passes**

Run: `cd docs && npm run test:e2e -- --project=chromium tests/e2e/theme-toggle.spec.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add docs/src/theme/tokens.ts docs/src/theme/theme.css docs/src/theme/theme-provider.tsx docs/src/styles/global.scss docs/tests/e2e/theme-toggle.spec.ts
git commit -m "feat(theme): unify day-night tokens across shell and game hud"
```

### Task 5: Rebuild Game Shell Layout (No Nested Menu, Mobile Drawer)

**Files:**
- Modify: `docs/src/app/layouts/AppShell.tsx`
- Modify: `docs/src/features/game/game-page.tsx`
- Modify: `docs/src/features/game/game-overlay.tsx`
- Modify: `docs/src/ui/drawer.tsx`
- Test: `docs/tests/e2e/mobile-drawer.spec.ts`

**Step 1: Write the failing test**

```ts
test('game page has single-level navigation and mobile info drawer', async ({ page }) => {
  await page.goto('/#/game/tetris');
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.getByRole('link', { name: '返回菜单' })).toHaveCount(1);
  await page.getByRole('button', { name: /展开信息|信息/ }).click();
  await expect(page.locator('.ui-drawer')).toHaveClass(/ui-drawer--open/);
});
```

**Step 2: Run test to verify it fails**

Run: `cd docs && npm run test:e2e -- --project=chromium tests/e2e/mobile-drawer.spec.ts`  
Expected: FAIL.

**Step 3: Write minimal implementation**

Create one-page game shell with:
- top bar (single back link),
- host canvas area,
- HUD drawer for mobile and side panel for desktop.

**Step 4: Run test to verify it passes**

Run: `cd docs && npm run test:e2e -- --project=chromium tests/e2e/mobile-drawer.spec.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add docs/src/app/layouts/AppShell.tsx docs/src/features/game/game-page.tsx docs/src/features/game/game-overlay.tsx docs/src/ui/drawer.tsx docs/tests/e2e/mobile-drawer.spec.ts
git commit -m "refactor(ui): rebuild game shell with single-level navigation"
```

### Task 6: Rebuild Tetris (Core Rules + Scene + Desktop Key Config + Hold)

**Files:**
- Modify: `docs/src/games/tetris/tetris-rules.ts`
- Modify: `docs/src/games/tetris/tetris-scene.ts`
- Modify: `docs/src/games/tetris/tetris-input.ts`
- Modify: `docs/src/games/tetris/tetris-settings-modal.tsx`
- Test: `docs/src/games/tetris/tetris-rules.test.ts`
- Test: `docs/tests/e2e/tetris-controls.spec.ts`

**Step 1: Write the failing test**

```ts
it('supports hold once per drop cycle', () => {
  const s1 = createInitialTetrisState();
  const s2 = reducer(s1, { type: 'hold' });
  const s3 = reducer(s2, { type: 'hold' });
  expect(s2.hold).toBeTruthy();
  expect(s3).toEqual(s2); // second hold ignored before lock
});
```

**Step 2: Run test to verify it fails**

Run: `cd docs && npx vitest run src/games/tetris/tetris-rules.test.ts`  
Expected: FAIL.

**Step 3: Write minimal implementation**

Implement:
- left/right rotation,
- remappable desktop bindings,
- hold slot,
- DAS/ARR-like repeat tuning (desktop-only setting).

**Step 4: Run test to verify it passes**

Run:  
`cd docs && npx vitest run src/games/tetris/tetris-rules.test.ts`  
`cd docs && npm run test:e2e -- --project=chromium tests/e2e/tetris-controls.spec.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add docs/src/games/tetris/tetris-rules.ts docs/src/games/tetris/tetris-scene.ts docs/src/games/tetris/tetris-input.ts docs/src/games/tetris/tetris-settings-modal.tsx docs/src/games/tetris/tetris-rules.test.ts docs/tests/e2e/tetris-controls.spec.ts
git commit -m "feat(tetris): modern controls hold and desktop key configuration"
```

### Task 7: Rebuild Snake (Rules + Scene + Mobile Controls)

**Files:**
- Modify: `docs/src/games/snake/snake-scene.ts`
- Create: `docs/src/games/snake/snake-rules.ts`
- Create: `docs/src/games/snake/snake-rules.test.ts`
- Create: `docs/tests/e2e/snake-mobile.spec.ts`

**Step 1: Write the failing test**

```ts
it('grows by one after eating food', () => {
  const s1 = createSnakeState({ snake: [[2, 2]], food: [3, 2], dir: 'right' });
  const s2 = stepSnake(s1);
  expect(s2.snake.length).toBe(2);
  expect(s2.score).toBe(1);
});
```

**Step 2: Run test to verify it fails**

Run: `cd docs && npx vitest run src/games/snake/snake-rules.test.ts`  
Expected: FAIL.

**Step 3: Write minimal implementation**

Move logic to `snake-rules.ts`; scene handles rendering and action mapping.

**Step 4: Run test to verify it passes**

Run:  
`cd docs && npx vitest run src/games/snake/snake-rules.test.ts`  
`cd docs && npm run test:e2e -- --project=chromium tests/e2e/snake-mobile.spec.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add docs/src/games/snake/snake-scene.ts docs/src/games/snake/snake-rules.ts docs/src/games/snake/snake-rules.test.ts docs/tests/e2e/snake-mobile.spec.ts
git commit -m "feat(snake): split pure rules and mobile input mapping"
```

### Task 8: Rebuild Minesweeper (Win7-Style Rules and Interaction)

**Files:**
- Modify: `docs/src/games/minesweeper/minesweeper-rules.ts`
- Modify: `docs/src/games/minesweeper/minesweeper-scene.ts`
- Modify: `docs/src/games/minesweeper/minesweeper-rules.test.ts`
- Create: `docs/tests/e2e/minesweeper-classic.spec.ts`

**Step 1: Write the failing test**

```ts
it('chords around revealed number when flags match', () => {
  const s1 = seedBoardForChordCase();
  const s2 = chordCell(s1, { x: 3, y: 3 });
  expect(revealedCount(s2)).toBeGreaterThan(revealedCount(s1));
});
```

**Step 2: Run test to verify it fails**

Run: `cd docs && npx vitest run src/games/minesweeper/minesweeper-rules.test.ts`  
Expected: FAIL.

**Step 3: Write minimal implementation**

Implement classic behavior:
- first click safe,
- right-click flag,
- chord open,
- beginner/intermediate/expert presets.

**Step 4: Run test to verify it passes**

Run:  
`cd docs && npx vitest run src/games/minesweeper/minesweeper-rules.test.ts`  
`cd docs && npm run test:e2e -- --project=chromium tests/e2e/minesweeper-classic.spec.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add docs/src/games/minesweeper/minesweeper-rules.ts docs/src/games/minesweeper/minesweeper-scene.ts docs/src/games/minesweeper/minesweeper-rules.test.ts docs/tests/e2e/minesweeper-classic.spec.ts
git commit -m "feat(minesweeper): implement win7-style classic interactions"
```

### Task 9: Rebuild Spider Solitaire (Classic Rules + Suit Symbols)

**Files:**
- Modify: `docs/src/games/spider/spider-rules.ts`
- Modify: `docs/src/games/spider/spider-scene.ts`
- Modify: `docs/src/games/spider/spider-rules.test.ts`
- Create: `docs/tests/e2e/spider-classic.spec.ts`

**Step 1: Write the failing test**

```ts
it('moves complete descending K-A run to foundation', () => {
  const s1 = seedCompleteRunOnTableau();
  const s2 = resolveCompletedRuns(s1);
  expect(s2.foundations).toHaveLength(s1.foundations.length + 1);
});
```

**Step 2: Run test to verify it fails**

Run: `cd docs && npx vitest run src/games/spider/spider-rules.test.ts`  
Expected: FAIL.

**Step 3: Write minimal implementation**

Implement:
- classic deal and move legality,
- 1/2/4 suit modes,
- clear suit rendering (`♠ ♥ ♦ ♣`) in card UI.

**Step 4: Run test to verify it passes**

Run:  
`cd docs && npx vitest run src/games/spider/spider-rules.test.ts`  
`cd docs && npm run test:e2e -- --project=chromium tests/e2e/spider-classic.spec.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add docs/src/games/spider/spider-rules.ts docs/src/games/spider/spider-scene.ts docs/src/games/spider/spider-rules.test.ts docs/tests/e2e/spider-classic.spec.ts
git commit -m "feat(spider): classic rules and clear suit symbol rendering"
```

### Task 10: Rebuild Dino + Flappy as Tap-First Mobile Games

**Files:**
- Modify: `docs/src/games/dino/dino-scene.ts`
- Modify: `docs/src/games/flappy/flappy-scene.ts`
- Create: `docs/src/games/dino/dino-rules.ts`
- Create: `docs/src/games/flappy/flappy-rules.ts`
- Create: `docs/tests/e2e/flappy-tap.spec.ts`

**Step 1: Write the failing test**

```ts
test('flappy runs with tap-only input on mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/game/flappy');
  await page.locator('[data-testid="game-host-canvas"]').click();
  await expect(page.locator('[data-testid="score-value"]')).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `cd docs && npm run test:e2e -- --project=chromium tests/e2e/flappy-tap.spec.ts`  
Expected: FAIL.

**Step 3: Write minimal implementation**

Make both games tap-first:
- no mandatory on-screen direction pads,
- pointer/tap directly maps to jump/flap.

**Step 4: Run test to verify it passes**

Run: `cd docs && npm run test:e2e -- --project=chromium tests/e2e/flappy-tap.spec.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add docs/src/games/dino/dino-scene.ts docs/src/games/flappy/flappy-scene.ts docs/src/games/dino/dino-rules.ts docs/src/games/flappy/flappy-rules.ts docs/tests/e2e/flappy-tap.spec.ts
git commit -m "feat(dino-flappy): tap-first mobile interaction model"
```

### Task 11: Rebuild 2048 (Rules + Slide/Merge Animation + Keyboard/Swipe)

**Files:**
- Modify: `docs/src/games/g2048/g2048-rules.ts`
- Modify: `docs/src/games/g2048/g2048-scene.ts`
- Modify: `docs/src/games/g2048/g2048-rules.test.ts`
- Create: `docs/tests/e2e/g2048-input.spec.ts`

**Step 1: Write the failing test**

```ts
it('merges once per move and increments score correctly', () => {
  const s1 = fromRows([[2, 2, 2, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
  const s2 = move(s1, 'left');
  expect(s2.rows[0]).toEqual([4, 2, 0, 0]);
  expect(s2.score).toBe(4);
});
```

**Step 2: Run test to verify it fails**

Run: `cd docs && npx vitest run src/games/g2048/g2048-rules.test.ts`  
Expected: FAIL.

**Step 3: Write minimal implementation**

Implement:
- exact merge semantics,
- keyboard arrows/WASD,
- swipe input,
- tile transition animation data from rules -> scene.

**Step 4: Run test to verify it passes**

Run:  
`cd docs && npx vitest run src/games/g2048/g2048-rules.test.ts`  
`cd docs && npm run test:e2e -- --project=chromium tests/e2e/g2048-input.spec.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add docs/src/games/g2048/g2048-rules.ts docs/src/games/g2048/g2048-scene.ts docs/src/games/g2048/g2048-rules.test.ts docs/tests/e2e/g2048-input.spec.ts
git commit -m "feat(2048): rebuild merge rules input mapping and animations"
```

### Task 12: Bilingual Titles/Descriptions and Non-Dev Copy Rewrite

**Files:**
- Modify: `docs/src/shared/game-catalog.ts`
- Modify: `docs/src/features/menu/menu-page.tsx`
- Modify: `docs/src/features/menu/game-card.tsx`
- Test: `docs/tests/e2e/lobby-copy.spec.ts`

**Step 1: Write the failing test**

```ts
test('lobby cards show bilingual player-facing copy', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('俄罗斯方块 · Tetris')).toBeVisible();
  await expect(page.getByText(/键位设置|开发|迁移/)).toHaveCount(0);
});
```

**Step 2: Run test to verify it fails**

Run: `cd docs && npm run test:e2e -- --project=chromium tests/e2e/lobby-copy.spec.ts`  
Expected: FAIL.

**Step 3: Write minimal implementation**

Rewrite all titles and summaries to bilingual player language only.

**Step 4: Run test to verify it passes**

Run: `cd docs && npm run test:e2e -- --project=chromium tests/e2e/lobby-copy.spec.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add docs/src/shared/game-catalog.ts docs/src/features/menu/menu-page.tsx docs/src/features/menu/game-card.tsx docs/tests/e2e/lobby-copy.spec.ts
git commit -m "feat(copy): rewrite bilingual lobby copy for players"
```

### Task 13: Remove Legacy Runtime and Dead Files

**Files:**
- Delete: `docs/public/legacy/index.html`
- Delete: `docs/public/legacy/scripts/*`
- Delete: `docs/public/legacy/styles/main.css`
- Modify: `tests/pages_paths_smoke.sh`
- Test: `tests/structure_smoke.sh`
- Test: `tests/docs_publish_smoke.sh`

**Step 1: Write the failing test**

```bash
# tests/structure_smoke.sh (assert legacy runtime removed)
assert_missing "docs/public/legacy/index.html"
```

**Step 2: Run test to verify it fails**

Run: `bash tests/structure_smoke.sh`  
Expected: FAIL because legacy files still present.

**Step 3: Write minimal implementation**

Delete `docs/public/legacy` runtime tree and remove all code references.

**Step 4: Run test to verify it passes**

Run:  
`bash tests/structure_smoke.sh`  
`bash tests/docs_publish_smoke.sh`  
Expected: PASS.

**Step 5: Commit**

```bash
git add -A docs/public/legacy tests/structure_smoke.sh tests/pages_paths_smoke.sh tests/docs_publish_smoke.sh
git commit -m "chore(cleanup): remove legacy runtime and update smoke checks"
```

### Task 14: Full Verification + Pages Build + Push

**Files:**
- Modify (if needed): `docs/playwright.config.ts`
- Modify (if needed): `.github/workflows/*` (only if deploy flow requires path updates)

**Step 1: Write/extend final verification command list**

```bash
cd docs && npm run typecheck
cd docs && npm run test:unit
cd docs && npm run test:e2e -- --project=chromium
bash tests/structure_smoke.sh
bash tests/docs_publish_smoke.sh
cd docs && npm run build
```

**Step 2: Run verification and collect failures**

Expected: some failures before final fixes.

**Step 3: Apply minimal fixes for failing checks**

Only fix failing assertions; avoid feature creep.

**Step 4: Re-run full verification until all green**

Expected: all commands PASS.

**Step 5: Commit + push**

```bash
git add -A
git commit -m "refactor: full rewrite complete with unified runtime and 7 playable games"
git push
```

---

## Deliverable Checklist

- [ ] No `legacy iframe` path remains in app flow.
- [ ] All 7 games playable on desktop and mobile.
- [ ] Day/Night themes consistent in lobby + in-game HUD.
- [ ] Single navigation layer (no nested in-game menu).
- [ ] Bilingual player-facing copy complete.
- [ ] Unit + e2e + smoke + build all pass.
