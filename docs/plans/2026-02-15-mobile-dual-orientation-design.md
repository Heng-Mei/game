# Mobile Dual-Orientation Controls Design

## Goal
Support both portrait and landscape gameplay on mobile with optimized control layouts:
- Portrait: cross-shaped dpad.
- Landscape: left dpad + right action cluster.

## Scope
- No gameplay rule changes.
- Keep existing per-game action model and desktop behavior.
- Remove blocking orientation overlay so both orientations are always playable.

## Decisions
- Use CSS-first layout adaptation (single DOM, orientation-based reflow).
- Keep existing action dispatch (`dispatchAction`) and game `onAction`.
- Add semantic classes to mobile control rows/buttons for layout targeting.

## Architecture
1. `docs/scripts/core/game-manager.js`
- Keep per-game mobile control definitions.
- Add semantic metadata (`layout`, `role`) for rows and dpad/action buttons.
- Stop using orientation overlay as a gameplay gate.

2. `docs/scripts/core/ui.js`
- Render semantic classes from config:
  - Row classes: `mobile-row--dpad`, `mobile-row--actions`
  - Button classes: `mobile-btn--dpad-up/down/left/right`, `mobile-btn--action`
- Apply container layout classes:
  - `mobile-layout--portrait`
  - `mobile-layout--landscape`

3. `docs/styles/main.css`
- Define dpad cross layout in portrait.
- Define split-zone layout in landscape (left dpad, right actions).
- Preserve touch size and anti-mis-touch behavior.

## Interaction Rules
- Repeat actions remain unchanged for movement/drop keys.
- Rotation/confirm/pause/restart/mode-switch stay tap-based.
- Orientation switch reflows controls only; gameplay state is preserved.
- Any active repeat action is canceled on orientation change.

## Validation
- Update `tests/mobile_ui_smoke.sh` to assert new layout class hooks exist.
- Keep existing smoke tests and JS syntax checks green.
