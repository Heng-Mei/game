# 2048 Swipe Animation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add smooth slide and pop animations to canvas-based 2048 for both desktop and mobile inputs.

**Architecture:** Keep the numeric grid rules unchanged, and introduce an animation layer with two phases (`slide` then `pop`). During animation, lock movement input; after animation, commit to final static board render. Reuse existing game loop `update(delta)` as the frame driver.

**Tech Stack:** Vanilla JavaScript, HTML5 Canvas, existing GameHub loop/event system, bash smoke tests.

---

### Task 1: Add Failing Animation Test

**Files:**
- Modify: `tests/game2048_smoke.sh`

**Step 1: Write the failing test**
- Add checks for animation-related identifiers (`animation`, `slide`, `pop`, `movingTiles`, easing/lerp).

**Step 2: Run test to verify it fails**
Run: `bash tests/game2048_smoke.sh`
Expected: FAIL because current 2048 implementation has no animation model.

**Step 3: Write minimal implementation**
- None in this task.

**Step 4: Run test to verify red state preserved**
Run: `bash tests/game2048_smoke.sh`
Expected: still FAIL until task 2 code is done.

### Task 2: Implement Slide + Pop Animation Core

**Files:**
- Modify: `docs/scripts/games/game2048.js`

**Step 1: Write the failing test**
- Reuse task 1 failing smoke.

**Step 2: Run test to verify it fails**
Run: `bash tests/game2048_smoke.sh`
Expected: FAIL.

**Step 3: Write minimal implementation**
- Introduce animation state object:
  - `phase`, `elapsed`, `slideDurationMs=90`, `popDurationMs=70`
  - `movingTiles`, `finalGrid`, `mergePops`, `spawnPop`
- Refactor move application to produce transition metadata.
- During slide phase, draw moving tiles by interpolated position.
- During pop phase, draw final grid with:
  - merged tile bump (scale up then back)
  - new tile pop-in
- Lock directional actions while animation is active.

**Step 4: Run test to verify it passes**
Run: `bash tests/game2048_smoke.sh`
Expected: PASS.

### Task 3: Full Regression Verification

**Files:**
- Modify: `docs/plans/2026-02-21-game-2048-swipe-animation-design.md`
- Modify: `docs/plans/2026-02-21-game-2048-swipe-animation-implementation.md`

**Step 1: Run targeted syntax checks**
Run:
- `node --check docs/scripts/games/game2048.js`

Expected: PASS.

**Step 2: Run full project smoke checks**
Run:
- `bash tests/game2048_smoke.sh`
- `bash tests/docs_publish_smoke.sh`
- `bash tests/pages_paths_smoke.sh`
- `bash tests/structure_smoke.sh`
- `bash tests/mobile_ui_smoke.sh`
- `bash tests/mobile_actions_smoke.sh`
- `bash tests/spider_minesweeper_classic_smoke.sh`
- `bash tests/tetris_desktop_modern_smoke.sh`

Expected: all PASS.

**Step 3: Run full JS syntax sweep**
Run:
- `for f in docs/scripts/core/*.js docs/scripts/games/*.js docs/scripts/app.js; do node --check "$f"; done`

Expected: PASS.

