# Mobile Dual-Orientation Controls Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Optimize mobile controls so portrait and landscape are both first-class, with portrait dpad and landscape split controls.

**Architecture:** Keep the current per-game action dispatch and render one control DOM structure with semantic classes. Use CSS media queries to switch between portrait (cross dpad) and landscape (left dpad + right actions) layouts. Remove orientation-overlay blocking logic.

**Tech Stack:** Static HTML/CSS/Vanilla JS, shell smoke tests

---

### Task 1: Add failing UI smoke checks for dual-orientation classes

**Files:**
- Modify: `tests/mobile_ui_smoke.sh`
- Test: `tests/mobile_ui_smoke.sh`

**Step 1: Write the failing test**

Add checks:

```bash
rg -n 'mobile-row--dpad' docs/styles/main.css >/dev/null
rg -n 'mobile-row--actions' docs/styles/main.css >/dev/null
rg -n 'mobile-layout--landscape' docs/styles/main.css >/dev/null
rg -n 'mobile-layout--portrait' docs/styles/main.css >/dev/null
```

**Step 2: Run test to verify it fails**

Run: `bash tests/mobile_ui_smoke.sh`  
Expected: FAIL before CSS/JS changes

**Step 3: Write minimal implementation**

Add matching CSS class blocks and JS-rendered class hooks.

**Step 4: Run test to verify it passes**

Run: `bash tests/mobile_ui_smoke.sh`  
Expected: PASS

**Step 5: Commit**

```bash
git add tests/mobile_ui_smoke.sh docs/styles/main.css docs/scripts/core/ui.js docs/scripts/core/game-manager.js
git commit -m "feat: add dual-orientation control layout hooks"
```

### Task 2: Remove orientation blocking and keep both modes playable

**Files:**
- Modify: `docs/scripts/core/game-manager.js`
- Modify: `docs/scripts/core/ui.js`
- Modify: `docs/styles/main.css`
- Test: `tests/mobile_actions_smoke.sh`

**Step 1: Write failing expectation**

Ensure no control path depends on portrait-blocking state.

**Step 2: Run test to verify current gap**

Run: `bash tests/mobile_actions_smoke.sh`  
Expected: current pass/fail baseline captured

**Step 3: Implement minimal changes**

- Remove gating logic around `allowPortraitPlay`/overlay blocking.
- Keep optional overlay methods harmless (non-blocking).
- Ensure orientation changes only reflow layout and stop repeat actions.

**Step 4: Run tests**

Run: `bash tests/mobile_actions_smoke.sh && bash tests/mobile_ui_smoke.sh`  
Expected: PASS

**Step 5: Commit**

```bash
git add docs/scripts/core/game-manager.js docs/scripts/core/ui.js docs/styles/main.css tests/mobile_actions_smoke.sh tests/mobile_ui_smoke.sh
git commit -m "feat: make portrait and landscape both directly playable on mobile"
```

### Task 3: Implement portrait cross dpad and landscape split layout

**Files:**
- Modify: `docs/scripts/core/game-manager.js`
- Modify: `docs/scripts/core/ui.js`
- Modify: `docs/styles/main.css`
- Test: `tests/mobile_ui_smoke.sh`

**Step 1: Write failing test additions**

Require directional semantic classes:

```bash
rg -n 'mobile-btn--dpad-up' docs/styles/main.css >/dev/null
rg -n 'mobile-btn--dpad-down' docs/styles/main.css >/dev/null
rg -n 'mobile-btn--dpad-left' docs/styles/main.css >/dev/null
rg -n 'mobile-btn--dpad-right' docs/styles/main.css >/dev/null
```

**Step 2: Run test to verify it fails**

Run: `bash tests/mobile_ui_smoke.sh`  
Expected: FAIL before class implementation

**Step 3: Implement minimal code**

- Add `layout`/`role`/`pos` metadata to mobile control configs.
- Render row/button semantic classes in `ui.js`.
- CSS:
  - portrait dpad cross layout,
  - landscape two-column split layout,
  - action cluster layout refinement.

**Step 4: Run test to verify it passes**

Run: `bash tests/mobile_ui_smoke.sh`  
Expected: PASS

**Step 5: Commit**

```bash
git add docs/scripts/core/game-manager.js docs/scripts/core/ui.js docs/styles/main.css tests/mobile_ui_smoke.sh
git commit -m "feat: add portrait cross dpad and landscape split control layout"
```

### Task 4: Full verification and docs update

**Files:**
- Modify: `README.md`
- Test: `tests/docs_publish_smoke.sh`
- Test: `tests/pages_paths_smoke.sh`
- Test: `tests/structure_smoke.sh`
- Test: `tests/mobile_ui_smoke.sh`
- Test: `tests/mobile_actions_smoke.sh`

**Step 1: Update docs**

Document dual-orientation control behavior in README.

**Step 2: Run verification**

Run:

```bash
bash tests/docs_publish_smoke.sh
bash tests/pages_paths_smoke.sh
bash tests/structure_smoke.sh
bash tests/mobile_ui_smoke.sh
bash tests/mobile_actions_smoke.sh
node --check docs/scripts/core/ui.js
node --check docs/scripts/core/game-manager.js
```

Expected: all PASS

**Step 3: Commit**

```bash
git add README.md tests docs/styles/main.css docs/scripts/core/ui.js docs/scripts/core/game-manager.js
git commit -m "feat: optimize mobile controls for portrait and landscape gameplay"
```

---

## Notes
- Use @superpowers:test-driven-development for each task.
- Use @superpowers:verification-before-completion before claiming completion.
