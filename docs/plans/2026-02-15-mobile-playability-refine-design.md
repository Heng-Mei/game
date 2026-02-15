# Mobile Playability Refinement Design

## Problem
On phones, some games could not show both canvas and controls at the same time. Interaction density was too high, and game-specific control needs were not optimized.

## Goals
- Keep canvas and controls usable in one viewport on mobile.
- Optimize controls per game instead of one-size-fits-all.
- Make Flappy/Dino fully playable by tapping canvas only.

## Decisions
- Mobile game view is canvas-first: hide side info cards in active game view.
- Use viewport-height constraints (`100dvh`) to bound canvas display size.
- Keep portrait and landscape both playable.
- Apply minimal control policy per game:
  - Tetris: dpad + hard drop.
  - Snake: dpad only.
  - Minesweeper: reveal/flag mode toggles only.
  - Dino/Flappy: no mobile buttons (canvas tap only).

## Interaction
- Add shared `primary_tap` action from touch canvas pointer events.
- Minesweeper uses double tap for restart (`double_tap_restart`).
- Prevent duplicate touch actions (especially Flappy) by avoiding double handling.

## Validation
- Smoke checks for:
  - mobile game view side-panel hiding rules,
  - dvh-based canvas max-height rules,
  - game-specific control policy markers,
  - primary tap and double-tap action hooks.
