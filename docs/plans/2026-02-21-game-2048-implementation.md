# 2048 Classic Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a classic 2048 game with desktop arrow-key controls and mobile swipe controls.

**Architecture:** Implement a standalone `Game2048` canvas game module that plugs into the existing `GameHub` lifecycle (`enter/exit/onAction/onKeyDown/update`). Add pointer up/cancel forwarding in `game-manager` so swipe gestures are recognized cleanly on mobile. Keep 2048 on `canvas_only` mobile policy (no extra button pad).

**Tech Stack:** Vanilla JavaScript, HTML canvas, existing GameHub UI/manager modules, bash smoke tests.

---

### Task 1: Wire New Game Entry

**Files:**
- Modify: `docs/index.html`
- Modify: `docs/scripts/app.js`

**Step 1: Write the failing test**
- Add checks in a new smoke test for 2048 menu item, script include, and app registration.

**Step 2: Run test to verify it fails**
Run: `bash tests/game2048_smoke.sh`
Expected: FAIL because files and registration do not exist yet.

**Step 3: Write minimal implementation**
- Add a menu button `data-game="game2048"`.
- Include `./scripts/games/game2048.js` in `index.html`.
- Register `Game2048` in `app.js` games map.

**Step 4: Run test to verify it passes**
Run: `bash tests/game2048_smoke.sh`
Expected: partial PASS once module exists.

### Task 2: Implement 2048 Core Rules

**Files:**
- Create: `docs/scripts/games/game2048.js`
- Test: `tests/game2048_smoke.sh`

**Step 1: Write the failing test**
- Assert keywords/patterns for classic rules:
  - 4x4 board
  - 2/4 spawn odds
  - merge-once behavior path
  - win-at-2048 continue flag

**Step 2: Run test to verify it fails**
Run: `bash tests/game2048_smoke.sh`
Expected: FAIL until implementation exists.

**Step 3: Write minimal implementation**
- Build `Game2048` class with:
  - board reset and random tile spawning
  - directional move + merge once per move
  - score/best/moves/max-tile HUD
  - 2048 reached state (continue allowed)
  - no-move game over logic
  - key controls: arrows + `R`

**Step 4: Run test to verify it passes**
Run: `bash tests/game2048_smoke.sh`
Expected: PASS.

### Task 3: Add Mobile Swipe Input

**Files:**
- Modify: `docs/scripts/core/game-manager.js`
- Modify: `docs/scripts/games/game2048.js`

**Step 1: Write the failing test**
- Extend smoke to require pointer up/cancel forwarding and swipe handlers in 2048 game.

**Step 2: Run test to verify it fails**
Run: `bash tests/game2048_smoke.sh`
Expected: FAIL until pointer forwarding and swipe handling are implemented.

**Step 3: Write minimal implementation**
- In `game-manager`, forward `pointerup` and `pointercancel` to active game when handlers exist.
- In `Game2048`, record swipe start on pointer down and resolve direction on pointer up using ~10px threshold.

**Step 4: Run test to verify it passes**
Run: `bash tests/game2048_smoke.sh`
Expected: PASS.

### Task 4: Integrate Mobile Policy + Regression Coverage

**Files:**
- Modify: `docs/scripts/core/game-manager.js`
- Modify: `tests/structure_smoke.sh`
- Modify: `tests/docs_publish_smoke.sh`
- Modify: `tests/mobile_actions_smoke.sh`

**Step 1: Write the failing test**
- Add 2048 file and policy checks (`game2048: canvas_only`) to smoke tests.

**Step 2: Run tests to verify red**
Run: `bash tests/structure_smoke.sh`
Expected: FAIL before file list/policy updates.

**Step 3: Write minimal implementation**
- Add `game2048` to `mobileControlPolicies` as `canvas_only`.
- Update smoke required file lists and action checks.

**Step 4: Run full verification**
Run:
- `bash tests/game2048_smoke.sh`
- `bash tests/docs_publish_smoke.sh`
- `bash tests/pages_paths_smoke.sh`
- `bash tests/structure_smoke.sh`
- `bash tests/mobile_ui_smoke.sh`
- `bash tests/mobile_actions_smoke.sh`
- `for f in docs/scripts/core/*.js docs/scripts/games/*.js docs/scripts/app.js; do node --check "$f"; done`
Expected: all PASS.

