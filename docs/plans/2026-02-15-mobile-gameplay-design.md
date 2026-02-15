# Mobile Gameplay Support Design (Landscape-First)

## Goal
Make all games playable on mobile without relying on keyboard/mouse, while preserving existing desktop behavior.

## Scope
- Add mobile controls for all games.
- Use landscape-first experience on mobile.
- Keep desktop keyboard/mouse controls unchanged.

## Decisions
- Chosen approach: `DOM-based per-game mobile control panel`.
- Control style: per-game layouts, not one shared generic pad.
- Orientation strategy: landscape-first with a portrait guidance overlay (not hard lock).

## Architecture
1. Add a new UI layer for mobile controls:
- `mobileControls` container rendered below canvas in game view.
- Visible on mobile breakpoints, hidden on desktop.
- Per-game button set determined by active game key.

2. Unify input dispatch:
- Introduce `GameManager.dispatchAction(action)`.
- Keyboard, mobile buttons, and pointer/touch events are normalized into action objects and forwarded to active game.

3. Standardize game action handling:
- Each game implements `onAction(action)`.
- Existing `onKeyDown` remains for desktop compatibility, but logic converges through `onAction` to avoid drift.

## Per-Game Mobile Controls
- Tetris: left, right, rotate, soft drop, hard drop, pause, restart.
- Snake: up, down, left, right, pause, restart.
- Minesweeper: mode switch (`reveal` / `flag`) + board tap.
- Dino: jump, restart.
- Flappy: flap, restart.

## Interaction Rules
- Use pointer events for buttons (`pointerdown`, `pointerup`, `pointercancel`).
- Support press-and-hold for repeat actions where useful (e.g., Tetris move/soft drop).
- Clear repeat timers on `pointerup`, `pointercancel`, and `window blur`.
- Prevent accidental page scroll/zoom in control zone with proper `touch-action`.

## Orientation UX
- On mobile game view in portrait, show a guidance overlay:
  - Message: landscape recommended for best playability.
  - Actions: continue in portrait or dismiss after rotating.
- Do not block gameplay entirely in portrait.

## Styling
- Add landscape-first responsive layout for game view.
- Ensure touch targets are at least `44x44` px.
- Keep desktop visual layout and interactions unchanged.

## Validation Plan
- Add/adjust smoke checks for mobile control DOM presence and script references.
- Verify on real mobile:
  - Every game can start, play core loop, pause/restart without keyboard.
  - Landscape operation is stable and no page scroll conflicts.
  - Portrait shows guidance overlay and can continue if user chooses.
- Re-check desktop controls after mobile changes.

## Risks and Mitigations
- Input duplication (touch + mouse): use pointer events only for mobile controls.
- Stuck repeat input: central repeat timer cleanup on pointer end/cancel/blur.
- Desktop regression: preserve existing event handlers and run smoke checks after changes.
