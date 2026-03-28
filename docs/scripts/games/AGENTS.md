# GAME MODULES KNOWLEDGE BASE

## OVERVIEW
Per-game implementations for the hub. Each file owns its own rules, canvas drawing, HUD text, and input interpretation, then registers itself on `window.GameHub.games`.

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Keyboard-heavy piece logic | `tetris.js` | Largest module; hold, DAS, key rebinding, preview canvases |
| Grid movement loop | `snake.js` | Simple lifecycle reference |
| Pointer-heavy board game | `minesweeper.js` | Custom difficulty, marking, chord logic |
| Card/tableau logic | `spider.js` | Difficulty cycling, selection/move rules |
| Endless runner / one-button action | `dino.js`, `flappy.js` | Smallest lifecycle examples |
| Swipe/animation state | `game2048.js` | Mobile gestures + animation phases |

## LOCAL CONVENTIONS
- Every game file is an IIFE that ensures `window.GameHub.games` exists, defines one class, and assigns it back to the namespace.
- `enter()` sets canvas size, controls text, settings visibility, then usually calls `reset()`.
- `reset()` reinitializes full game state, updates HUD/state text, and draws immediately.
- `update(delta)` advances simulation; `draw()` renders the full current frame.
- Shared shell communication goes through `this.ui.*`; shared cross-game input names go through `onAction(action)`.

## ANTI-PATTERNS
- Do not mutate menu/layout DOM directly from a game file; use `this.ui` or push shared behavior into `core/`.
- Do not register a game without adding it to `docs/scripts/app.js` and the menu button list in `docs/index.html`.
- Do not invent incompatible lifecycle names for new games; `GameManager` expects the existing hook family.
- Do not move persistent settings to global shared keys casually; current storage is feature-scoped (`gamehub.tetris.*`, `gamehub.2048.*`, etc.).

## UNIQUE STYLES
- Input models vary by game but normalize into action strings (`restart`, `primary_tap`, movement/action verbs).
- Small arcade games (`dino`, `flappy`, `snake`) are the cleanest references for a new module skeleton.
- Complex games (`tetris`, `minesweeper`, `spider`, `game2048`) each bundle simulation, rendering, and feature toggles in one file; keep edits localized unless extracting a truly shared concern.
