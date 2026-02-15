# Mobile Playability Refinement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ensure mobile can see and operate both canvas and controls, while applying game-specific minimal controls.

**Architecture:** Update mobile layout CSS to prioritize canvas and hide side cards during active gameplay. Extend game manager with control policies and touch `primary_tap` dispatch. Add minimal per-game action hooks with Flappy/Dino canvas-only interaction.

**Tech Stack:** Static HTML/CSS/Vanilla JS, shell smoke tests.

---

### Task 1: Add failing smoke checks for refined mobile constraints

**Files:**
- Modify: `tests/mobile_ui_smoke.sh`
- Modify: `tests/mobile_actions_smoke.sh`

**Step 1: Add checks for canvas-first rules and policy hooks**

**Step 2: Run**
Run: `bash tests/mobile_ui_smoke.sh && bash tests/mobile_actions_smoke.sh`  
Expected: FAIL before implementation.

**Step 3: Implement minimal code**
- Add CSS hooks and policy markers.

**Step 4: Re-run tests**
Run: `bash tests/mobile_ui_smoke.sh && bash tests/mobile_actions_smoke.sh`  
Expected: PASS.

### Task 2: Mobile layout fix (canvas-first)

**Files:**
- Modify: `docs/styles/main.css`

**Step 1: Implement**
- Mobile body top-aligned with scroll.
- Hide `.side` in active mobile game view.
- Use `100dvh`-based `max-height` for canvas in portrait/landscape.

**Step 2: Verify**
Run: `bash tests/mobile_ui_smoke.sh`  
Expected: PASS.

### Task 3: Game-specific minimal control policies

**Files:**
- Modify: `docs/scripts/core/game-manager.js`
- Modify: `docs/scripts/core/ui.js`

**Step 1: Implement**
- Add `mobileControlPolicies`.
- Apply `canvas_only` for Flappy/Dino.
- Trim non-essential buttons for Tetris/Snake.
- Skip rendering empty rows.

**Step 2: Verify**
Run: `bash tests/mobile_actions_smoke.sh`  
Expected: PASS.

### Task 4: Touch interaction specialization

**Files:**
- Modify: `docs/scripts/core/game-manager.js`
- Modify: `docs/scripts/games/tetris.js`
- Modify: `docs/scripts/games/snake.js`
- Modify: `docs/scripts/games/minesweeper.js`
- Modify: `docs/scripts/games/dino.js`
- Modify: `docs/scripts/games/flappy.js`

**Step 1: Implement**
- Dispatch `primary_tap` on touch canvas.
- Add `double_tap_restart` for Minesweeper.
- Prevent duplicate handling in Flappy touch path.
- Ensure Tetris `primary_tap` only start/restart (no in-game hard drop).

**Step 2: Verify**
Run: `bash tests/mobile_actions_smoke.sh`  
Expected: PASS.

### Task 5: Final verification

**Files:**
- Modify: `README.md`

**Run:**
```bash
bash tests/docs_publish_smoke.sh
bash tests/pages_paths_smoke.sh
bash tests/structure_smoke.sh
bash tests/mobile_ui_smoke.sh
bash tests/mobile_actions_smoke.sh
node --check docs/scripts/core/ui.js
node --check docs/scripts/core/game-manager.js
node --check docs/scripts/games/tetris.js
node --check docs/scripts/games/snake.js
node --check docs/scripts/games/minesweeper.js
node --check docs/scripts/games/dino.js
node --check docs/scripts/games/flappy.js
```

Expected: all PASS.
