# Mobile Gameplay Support Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add full mobile playability for all games with per-game touch controls and landscape-first UX, while preserving desktop controls.

**Architecture:** Introduce a mobile controls UI layer in `docs/index.html` + `docs/styles/main.css`, then route all input through a unified action dispatcher in `docs/scripts/core/game-manager.js`. Each game adds an `onAction(action)` entrypoint to map mobile controls (and desktop key handlers) to the same gameplay logic.

**Tech Stack:** Static HTML/CSS/Vanilla JS, shell smoke tests (`bash` + `rg`)

---

### Task 1: Add failing smoke tests for mobile UI skeleton

**Files:**
- Create: `tests/mobile_ui_smoke.sh`
- Test: `tests/mobile_ui_smoke.sh`

**Step 1: Write the failing test**

```bash
#!/usr/bin/env bash
set -euo pipefail

rg -n 'id="mobileControls"' docs/index.html >/dev/null
rg -n 'id="orientationOverlay"' docs/index.html >/dev/null
rg -n 'mobile-controls' docs/styles/main.css >/dev/null
```

**Step 2: Run test to verify it fails**

Run: `bash tests/mobile_ui_smoke.sh`  
Expected: FAIL (missing mobile controls / overlay before implementation)

**Step 3: Implement minimal scaffold**

- Add mobile control container and orientation overlay elements in `docs/index.html`.
- Add baseline `.mobile-controls` and `.orientation-overlay` style blocks in `docs/styles/main.css`.

**Step 4: Run test to verify it passes**

Run: `bash tests/mobile_ui_smoke.sh`  
Expected: PASS

**Step 5: Commit**

```bash
git add docs/index.html docs/styles/main.css tests/mobile_ui_smoke.sh
git commit -m "feat: add mobile ui scaffold for controls and orientation hint"
```

### Task 2: Add failing smoke tests for action dispatch plumbing

**Files:**
- Create: `tests/mobile_actions_smoke.sh`
- Modify: `docs/scripts/core/game-manager.js`
- Modify: `docs/scripts/core/ui.js`
- Test: `tests/mobile_actions_smoke.sh`

**Step 1: Write the failing test**

```bash
#!/usr/bin/env bash
set -euo pipefail

rg -n 'dispatchAction\\(' docs/scripts/core/game-manager.js >/dev/null
rg -n 'setMobileControls\\(' docs/scripts/core/ui.js >/dev/null
rg -n 'setOrientationOverlay\\(' docs/scripts/core/ui.js >/dev/null
```

**Step 2: Run test to verify it fails**

Run: `bash tests/mobile_actions_smoke.sh`  
Expected: FAIL (new API not yet present)

**Step 3: Write minimal implementation**

- `game-manager.js`:
  - Add `dispatchAction(action)` forwarding to current game `onAction`.
  - Keep keyboard dispatch and map key events into actions (directly or through `onAction` fallback).
  - Update canvas pointer handling for mobile-safe pointer input.
- `ui.js`:
  - Add methods to render per-game mobile controls.
  - Add methods to show/hide/update orientation overlay.

**Step 4: Run test to verify it passes**

Run: `bash tests/mobile_actions_smoke.sh`  
Expected: PASS

**Step 5: Commit**

```bash
git add docs/scripts/core/game-manager.js docs/scripts/core/ui.js tests/mobile_actions_smoke.sh
git commit -m "feat: add unified action dispatch and mobile control ui apis"
```

### Task 3: Implement Tetris + Snake mobile action handling with TDD checks

**Files:**
- Modify: `docs/scripts/games/tetris.js`
- Modify: `docs/scripts/games/snake.js`
- Modify: `docs/scripts/core/game-manager.js`
- Test: `tests/mobile_actions_smoke.sh`

**Step 1: Write failing checks**

Add checks to `tests/mobile_actions_smoke.sh`:

```bash
rg -n 'onAction\\(action\\)' docs/scripts/games/tetris.js >/dev/null
rg -n 'onAction\\(action\\)' docs/scripts/games/snake.js >/dev/null
```

**Step 2: Run test to verify it fails**

Run: `bash tests/mobile_actions_smoke.sh`  
Expected: FAIL on missing `onAction`

**Step 3: Write minimal implementation**

- In each game add `onAction(action)` with action types:
  - Tetris: `start_or_primary`, `move_left`, `move_right`, `rotate`, `soft_drop`, `hard_drop`, `pause_toggle`, `restart`
  - Snake: `start_or_primary`, `move_up`, `move_down`, `move_left`, `move_right`, `pause_toggle`, `restart`
- Update existing `onKeyDown` to call `onAction` (DRY).
- Ensure hold-repeat actions are supported by manager/control layer for movement/drop.

**Step 4: Run test to verify it passes**

Run: `bash tests/mobile_actions_smoke.sh`  
Expected: PASS

**Step 5: Commit**

```bash
git add docs/scripts/games/tetris.js docs/scripts/games/snake.js docs/scripts/core/game-manager.js tests/mobile_actions_smoke.sh
git commit -m "feat: add mobile action handlers for tetris and snake"
```

### Task 4: Implement Minesweeper + Dino + Flappy mobile actions

**Files:**
- Modify: `docs/scripts/games/minesweeper.js`
- Modify: `docs/scripts/games/dino.js`
- Modify: `docs/scripts/games/flappy.js`
- Modify: `docs/scripts/core/game-manager.js`
- Test: `tests/mobile_actions_smoke.sh`

**Step 1: Write failing checks**

Extend `tests/mobile_actions_smoke.sh`:

```bash
rg -n 'onAction\\(action\\)' docs/scripts/games/minesweeper.js >/dev/null
rg -n 'onAction\\(action\\)' docs/scripts/games/dino.js >/dev/null
rg -n 'onAction\\(action\\)' docs/scripts/games/flappy.js >/dev/null
```

**Step 2: Run test to verify it fails**

Run: `bash tests/mobile_actions_smoke.sh`  
Expected: FAIL before adding handlers

**Step 3: Write minimal implementation**

- Minesweeper:
  - Add action mode switch (`mode_reveal`, `mode_flag`) and use current mode for pointer/tap on board.
- Dino:
  - Add `jump_primary` and `restart`.
- Flappy:
  - Add `flap_primary` and `restart`.
- Ensure desktop pointer/click behavior remains intact.

**Step 4: Run test to verify it passes**

Run: `bash tests/mobile_actions_smoke.sh`  
Expected: PASS

**Step 5: Commit**

```bash
git add docs/scripts/games/minesweeper.js docs/scripts/games/dino.js docs/scripts/games/flappy.js docs/scripts/core/game-manager.js tests/mobile_actions_smoke.sh
git commit -m "feat: add mobile action handlers for remaining games"
```

### Task 5: Implement landscape-first responsive layout and polish

**Files:**
- Modify: `docs/styles/main.css`
- Modify: `docs/index.html`
- Modify: `docs/scripts/core/ui.js`
- Test: `tests/mobile_ui_smoke.sh`

**Step 1: Write failing checks**

Extend `tests/mobile_ui_smoke.sh`:

```bash
rg -n '@media \\(orientation: landscape\\)' docs/styles/main.css >/dev/null
rg -n '@media \\(orientation: portrait\\)' docs/styles/main.css >/dev/null
rg -n 'touch-action' docs/styles/main.css >/dev/null
```

**Step 2: Run test to verify it fails**

Run: `bash tests/mobile_ui_smoke.sh`  
Expected: FAIL before CSS rules are added

**Step 3: Write minimal implementation**

- Add landscape-first mobile layout rules.
- Add portrait overlay display rule.
- Enforce touch target sizing and touch-action for control zones.
- Wire overlay text/state through UI methods.

**Step 4: Run test to verify it passes**

Run: `bash tests/mobile_ui_smoke.sh`  
Expected: PASS

**Step 5: Commit**

```bash
git add docs/styles/main.css docs/index.html docs/scripts/core/ui.js tests/mobile_ui_smoke.sh
git commit -m "feat: add landscape-first mobile gameplay layout and overlay"
```

### Task 6: Final verification and docs update

**Files:**
- Modify: `README.md`
- Modify: `tests/structure_smoke.sh` (if needed)
- Test: `tests/docs_publish_smoke.sh`
- Test: `tests/pages_paths_smoke.sh`
- Test: `tests/structure_smoke.sh`
- Test: `tests/mobile_ui_smoke.sh`
- Test: `tests/mobile_actions_smoke.sh`

**Step 1: Write failing doc check (if adding one)**

Optionally add a grep check for mobile support notes in README.

**Step 2: Run verification command set**

Run:

```bash
bash tests/docs_publish_smoke.sh
bash tests/pages_paths_smoke.sh
bash tests/structure_smoke.sh
bash tests/mobile_ui_smoke.sh
bash tests/mobile_actions_smoke.sh
```

Expected: all PASS

**Step 3: Update README**

Document:
- mobile gameplay support,
- landscape-first recommendation,
- per-game mobile controls summary.

**Step 4: Re-run verification**

Run the same command set again; expected all PASS.

**Step 5: Commit**

```bash
git add README.md tests docs/index.html docs/styles/main.css docs/scripts
git commit -m "feat: add full mobile gameplay support with per-game touch controls"
```

---

## Implementation Notes
- Follow @superpowers:test-driven-development for each task (RED -> GREEN -> REFACTOR).
- Use @superpowers:verification-before-completion before any success claim.
- Keep changes DRY: keyboard handlers should call shared action handlers.
- Keep YAGNI: avoid adding settings screens or non-essential UI variants in this iteration.
