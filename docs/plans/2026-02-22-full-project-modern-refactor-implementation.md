# Full Project Modern Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate the entire GameHub project to a modern React + TypeScript + Phaser v3.90 architecture with unified day/night themes and fully redesigned menu/in-game UI.

**Architecture:** Build a new Vite React TypeScript app under `docs/`, keep GitHub Pages deployment rooted at `docs/`, and migrate each game into Phaser scenes behind a shared bridge. Use React for system UI (menu/settings/modals/drawers), Zustand for app state, and a shared theme token system consumed by both React and Phaser.

**Tech Stack:** React 19, TypeScript, Vite, Phaser 3.90, Zustand, Framer Motion, Sass, Vitest, Playwright.

---

### Task 1: Bootstrap React + TypeScript + Phaser App Shell

**Files:**
- Delete: `docs/index.html`
- Delete: `docs/styles/main.css`
- Delete: `docs/scripts/app.js`
- Delete: `docs/scripts/core/ui.js`
- Delete: `docs/scripts/core/game-manager.js`
- Delete: `docs/scripts/core/loop.js`
- Create: `docs/package.json`
- Create: `docs/tsconfig.json`
- Create: `docs/tsconfig.node.json`
- Create: `docs/vite.config.ts`
- Create: `docs/index.html`
- Create: `docs/src/main.tsx`
- Create: `docs/src/app/App.tsx`
- Create: `docs/src/app/router.tsx`
- Create: `docs/src/app/layouts/AppShell.tsx`
- Create: `docs/src/styles/global.scss`
- Create: `docs/src/styles/reset.scss`
- Create: `docs/src/vite-env.d.ts`
- Modify: `README.md`
- Test: `tests/structure_smoke.sh`

**Step 1: Write the failing test**
- Update `tests/structure_smoke.sh` to assert existence of React/Vite key files and removal of legacy `docs/scripts/core/*.js`.

**Step 2: Run test to verify it fails**
Run: `bash tests/structure_smoke.sh`
Expected: FAIL because new files do not yet exist.

**Step 3: Write minimal implementation**
- Scaffold Vite React TS project files in `docs/`.
- Ensure `vite build` outputs static files to `docs/` consumable by GitHub Pages path `/game/`.

**Step 4: Run test to verify it passes**
Run: `bash tests/structure_smoke.sh`
Expected: PASS.

**Step 5: Commit**
```bash
git add tests/structure_smoke.sh README.md docs
git commit -m "refactor: bootstrap react ts phaser app shell"
```

### Task 2: Build Theme System (Day/Night + System Follow + Persistence)

**Files:**
- Create: `docs/src/theme/tokens.ts`
- Create: `docs/src/theme/theme-provider.tsx`
- Create: `docs/src/theme/theme.css`
- Create: `docs/src/shared/storage.ts`
- Create: `docs/src/features/settings/theme-switcher.tsx`
- Create: `docs/src/stores/ui-store.ts`
- Modify: `docs/src/app/layouts/AppShell.tsx`
- Modify: `docs/src/styles/global.scss`
- Test: `tests/mobile_ui_smoke.sh`

**Step 1: Write the failing test**
- Extend `tests/mobile_ui_smoke.sh` to assert day/night token files and theme toggle UI markers.

**Step 2: Run test to verify it fails**
Run: `bash tests/mobile_ui_smoke.sh`
Expected: FAIL.

**Step 3: Write minimal implementation**
- Implement theme provider with `system | day | night` mode.
- Persist user override in localStorage.
- Expose CSS variables for both themes.

**Step 4: Run test to verify it passes**
Run: `bash tests/mobile_ui_smoke.sh`
Expected: PASS.

**Step 5: Commit**
```bash
git add tests/mobile_ui_smoke.sh docs/src
git commit -m "feat(ui): add day-night theme system with persistence"
```

### Task 3: Implement Shared Phaser Bridge + Event Protocol

**Files:**
- Create: `docs/src/game-core/phaser-bridge.ts`
- Create: `docs/src/game-core/events.ts`
- Create: `docs/src/game-core/base-scene.ts`
- Create: `docs/src/game-core/game-host.tsx`
- Create: `docs/src/stores/game-session-store.ts`
- Modify: `docs/src/app/router.tsx`
- Create: `docs/src/features/game/game-page.tsx`
- Test: `tests/pages_paths_smoke.sh`

**Step 1: Write the failing test**
- Update `tests/pages_paths_smoke.sh` to assert new game route markers and Phaser bridge files.

**Step 2: Run test to verify it fails**
Run: `bash tests/pages_paths_smoke.sh`
Expected: FAIL.

**Step 3: Write minimal implementation**
- Implement React `<GameHost />` that mounts Phaser game instance.
- Define typed event protocol for React <-> Phaser.

**Step 4: Run test to verify it passes**
Run: `bash tests/pages_paths_smoke.sh`
Expected: PASS.

**Step 5: Commit**
```bash
git add tests/pages_paths_smoke.sh docs/src
git commit -m "feat(core): add phaser bridge and game event protocol"
```

### Task 4: Rebuild Menu + Global UI Components (Modern Flat Design)

**Files:**
- Create: `docs/src/ui/button.tsx`
- Create: `docs/src/ui/card.tsx`
- Create: `docs/src/ui/modal.tsx`
- Create: `docs/src/ui/drawer.tsx`
- Create: `docs/src/ui/segmented-control.tsx`
- Create: `docs/src/features/menu/menu-page.tsx`
- Create: `docs/src/features/menu/game-card.tsx`
- Create: `docs/src/features/settings/settings-modal.tsx`
- Create: `docs/src/features/game/game-overlay.tsx`
- Modify: `docs/src/app/router.tsx`
- Modify: `docs/src/theme/theme.css`
- Test: `tests/mobile_actions_smoke.sh`

**Step 1: Write the failing test**
- Extend `tests/mobile_actions_smoke.sh` to assert modal/drawer/segmented component markers and new menu entry structure.

**Step 2: Run test to verify it fails**
Run: `bash tests/mobile_actions_smoke.sh`
Expected: FAIL.

**Step 3: Write minimal implementation**
- Implement composable UI primitives.
- Create redesigned menu page and global settings modal.

**Step 4: Run test to verify it passes**
Run: `bash tests/mobile_actions_smoke.sh`
Expected: PASS.

**Step 5: Commit**
```bash
git add tests/mobile_actions_smoke.sh docs/src
git commit -m "feat(ui): rebuild menu settings and overlays"
```

### Task 5: Migrate Tetris to Phaser + Modernized Settings Modal

**Files:**
- Create: `docs/src/games/tetris/tetris-scene.ts`
- Create: `docs/src/games/tetris/tetris-rules.ts`
- Create: `docs/src/games/tetris/tetris-input.ts`
- Create: `docs/src/games/tetris/tetris-settings-modal.tsx`
- Create: `docs/src/stores/tetris-settings-store.ts`
- Delete: `docs/scripts/games/tetris.js`
- Modify: `docs/src/features/game/game-page.tsx`
- Test: `tests/tetris_desktop_modern_smoke.sh`

**Step 1: Write the failing test**
- Rewrite `tests/tetris_desktop_modern_smoke.sh` for TS/Phaser implementation markers: hold, keybinds modal, DAS/ARR, left/right rotate.

**Step 2: Run test to verify it fails**
Run: `bash tests/tetris_desktop_modern_smoke.sh`
Expected: FAIL.

**Step 3: Write minimal implementation**
- Port Tetris logic to Phaser scene.
- Integrate keybind modal in React side panel/overlay.

**Step 4: Run test to verify it passes**
Run: `bash tests/tetris_desktop_modern_smoke.sh`
Expected: PASS.

**Step 5: Commit**
```bash
git add tests/tetris_desktop_modern_smoke.sh docs/src/games/tetris docs/src/features/game docs/src/stores
git commit -m "feat(tetris): migrate to phaser with modal keybind settings"
```

### Task 6: Migrate Minesweeper + Spider (Win7 Rules, Unified Theme)

**Files:**
- Create: `docs/src/games/minesweeper/minesweeper-scene.ts`
- Create: `docs/src/games/minesweeper/minesweeper-rules.ts`
- Create: `docs/src/games/spider/spider-scene.ts`
- Create: `docs/src/games/spider/spider-rules.ts`
- Create: `docs/src/games/cards/card-theme.ts`
- Delete: `docs/scripts/games/minesweeper.js`
- Delete: `docs/scripts/games/spider.js`
- Test: `tests/spider_minesweeper_classic_smoke.sh`

**Step 1: Write the failing test**
- Rewrite `tests/spider_minesweeper_classic_smoke.sh` for TS/Phaser markers and shared theme token usage.

**Step 2: Run test to verify it fails**
Run: `bash tests/spider_minesweeper_classic_smoke.sh`
Expected: FAIL.

**Step 3: Write minimal implementation**
- Port both games to Phaser while preserving rule semantics.
- Apply shared day/night color token adapter.

**Step 4: Run test to verify it passes**
Run: `bash tests/spider_minesweeper_classic_smoke.sh`
Expected: PASS.

**Step 5: Commit**
```bash
git add tests/spider_minesweeper_classic_smoke.sh docs/src/games/minesweeper docs/src/games/spider docs/src/games/cards
git commit -m "feat(games): migrate minesweeper and spider to phaser"
```

### Task 7: Migrate 2048 + Snake + Flappy + Dino to Phaser

**Files:**
- Create: `docs/src/games/g2048/g2048-scene.ts`
- Create: `docs/src/games/g2048/g2048-rules.ts`
- Create: `docs/src/games/snake/snake-scene.ts`
- Create: `docs/src/games/flappy/flappy-scene.ts`
- Create: `docs/src/games/dino/dino-scene.ts`
- Delete: `docs/scripts/games/game2048.js`
- Delete: `docs/scripts/games/snake.js`
- Delete: `docs/scripts/games/flappy.js`
- Delete: `docs/scripts/games/dino.js`
- Test: `tests/game2048_smoke.sh`

**Step 1: Write the failing test**
- Rewrite `tests/game2048_smoke.sh` to assert TS/Phaser logic markers for move/merge/spawn and animation params.

**Step 2: Run test to verify it fails**
Run: `bash tests/game2048_smoke.sh`
Expected: FAIL.

**Step 3: Write minimal implementation**
- Port remaining four games to Phaser scenes.
- Preserve known control strategy (Flappy tap-first, Snake direction locks, 2048 swipe+keyboard).

**Step 4: Run test to verify it passes**
Run: `bash tests/game2048_smoke.sh`
Expected: PASS.

**Step 5: Commit**
```bash
git add tests/game2048_smoke.sh docs/src/games/g2048 docs/src/games/snake docs/src/games/flappy docs/src/games/dino
git commit -m "feat(games): migrate 2048 snake flappy dino to phaser"
```

### Task 8: Remove Legacy Runtime + Update Build/Publish Checks

**Files:**
- Delete: `docs/scripts/`
- Modify: `tests/docs_publish_smoke.sh`
- Modify: `README.md`
- Modify: `run.sh`

**Step 1: Write the failing test**
- Update `tests/docs_publish_smoke.sh` to validate Vite build output and absence of legacy script references.

**Step 2: Run test to verify it fails**
Run: `bash tests/docs_publish_smoke.sh`
Expected: FAIL.

**Step 3: Write minimal implementation**
- Remove legacy runtime folders.
- Update developer docs and run scripts for Vite flow.

**Step 4: Run test to verify it passes**
Run: `bash tests/docs_publish_smoke.sh`
Expected: PASS.

**Step 5: Commit**
```bash
git add tests/docs_publish_smoke.sh README.md run.sh docs
git commit -m "chore: remove legacy runtime and update publish flow"
```

### Task 9: Add Unit + E2E Coverage for Critical Flows

**Files:**
- Create: `docs/src/games/g2048/g2048-rules.test.ts`
- Create: `docs/src/games/minesweeper/minesweeper-rules.test.ts`
- Create: `docs/src/games/spider/spider-rules.test.ts`
- Create: `docs/src/games/tetris/tetris-rules.test.ts`
- Create: `docs/tests/e2e/theme-toggle.spec.ts`
- Create: `docs/tests/e2e/game-launch.spec.ts`
- Create: `docs/tests/e2e/mobile-drawer.spec.ts`
- Create: `docs/playwright.config.ts`
- Modify: `docs/package.json`

**Step 1: Write the failing test**
- Add vitest + playwright tests for rule integrity and UI critical paths.

**Step 2: Run test to verify it fails**
Run: `cd docs && npm run test:unit`
Expected: FAIL initially.

**Step 3: Write minimal implementation**
- Fix or expose game modules so tests can assert rule behavior.

**Step 4: Run test to verify it passes**
Run:
- `cd docs && npm run test:unit`
- `cd docs && npm run test:e2e -- --project=chromium`
Expected: PASS.

**Step 5: Commit**
```bash
git add docs/src docs/tests docs/package.json docs/playwright.config.ts
git commit -m "test: add unit and e2e coverage for refactored platform"
```

### Task 10: Final Verification + Release Commit

**Files:**
- Modify: `README.md`
- Modify: `docs/plans/2026-02-22-full-project-modern-refactor-design.md`
- Modify: `docs/plans/2026-02-22-full-project-modern-refactor-implementation.md`

**Step 1: Run full verification matrix**
Run:
- `bash tests/structure_smoke.sh`
- `bash tests/pages_paths_smoke.sh`
- `bash tests/mobile_ui_smoke.sh`
- `bash tests/mobile_actions_smoke.sh`
- `bash tests/tetris_desktop_modern_smoke.sh`
- `bash tests/spider_minesweeper_classic_smoke.sh`
- `bash tests/game2048_smoke.sh`
- `bash tests/docs_publish_smoke.sh`
- `cd docs && npm run build`
- `cd docs && npm run test:unit`

Expected: all PASS.

**Step 2: Manual QA checklist**
- Validate day/night theme in menu and all games.
- Validate desktop and mobile interactions for each game.
- Validate modal/drawer usability (including Tetris keybind modal).

**Step 3: Commit release integration**
```bash
git add README.md docs/plans
git commit -m "docs: finalize refactor plan and verification report"
```
