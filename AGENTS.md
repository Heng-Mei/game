# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-29
**Commit:** ccaaee6
**Branch:** main

## OVERVIEW
Static browser game hub. Plain JavaScript, canvas rendering, global `window.GameHub` namespace, no bundler, no package manager, no test harness in this workspace.

## STRUCTURE
```text
game/
├── docs/                 # Shippable browser app
│   ├── index.html        # DOM shell + script load order
│   ├── scripts/
│   │   ├── app.js        # Bootstrap: wires hub, manager, loop, game instances
│   │   ├── core/         # Shared runtime/UI orchestration
│   │   └── games/        # Per-game implementations
│   └── styles/main.css   # Whole-app styling, responsive/mobile layout
├── scripts/run.sh        # Local static server for docs/
└── run.sh                # Thin wrapper around scripts/run.sh
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Boot app | `docs/scripts/app.js` | First file to read for runtime wiring |
| DOM refs / panel updates | `docs/scripts/core/ui.js` | Owns `window.GameHub.ui` and `window.GameHub.refs` |
| Menu, game switching, shared input | `docs/scripts/core/game-manager.js` | Central orchestrator |
| Frame loop | `docs/scripts/core/loop.js` | RAF-driven update loop |
| Add or change a game | `docs/scripts/games/*.js` | Each game self-registers on `window.GameHub.games` |
| Change shell/layout | `docs/index.html`, `docs/styles/main.css` | Script order and DOM ids matter |
| Run locally | `scripts/run.sh`, `run.sh` | Serves `docs/` on `127.0.0.1:8080` |

## CODE MAP
| Symbol | Type | Location | Role |
|--------|------|----------|------|
| `initApp` | bootstrap IIFE | `docs/scripts/app.js` | Builds game map, creates manager + loop |
| `GameManager` | class | `docs/scripts/core/game-manager.js` | Menu/game lifecycle, shared input, mobile controls |
| `GameLoop` | class | `docs/scripts/core/loop.js` | `requestAnimationFrame` driver |
| `ui` | object | `docs/scripts/core/ui.js` | DOM/canvas/panel facade for all games |
| `window.GameHub.games.*` | exported classes | `docs/scripts/games/*.js` | Game implementations consumed by `app.js` |

## CONVENTIONS
- Browser-only architecture. No imports/exports; modules are IIFEs attached to `window.GameHub`.
- Script load order in `docs/index.html` is part of the architecture: `ui` → `game-manager` → `loop` → game files → `app.js`.
- UI copy is Chinese by default; preserve tone and terminology when editing controls/state text.
- Shared UI updates flow through `this.ui.*`; direct DOM mutation belongs in `core/ui.js`, not inside games.
- Mobile/desktop behavior is intentional. `matchMedia`, pointer events, and localStorage are already part of the runtime contract.

## ANTI-PATTERNS (THIS PROJECT)
- Do not introduce bundler/module assumptions unless you migrate the whole load model; current code relies on globals and ordered `<script>` tags.
- Do not reorder or lazily remove scripts in `docs/index.html`; downstream globals are consumed immediately.
- Do not put shared menu/mobile/input logic into individual game files when `core/game-manager.js` can own it.
- Do not document nonexistent tooling. No CI, build pipeline, or tests are present in this workspace.

## UNIQUE STYLES
- Games usually expose `enter()`, `exit()`, `reset()`, `onAction()`, `update(delta)`, and `draw()`.
- Canvas drawing is immediate-mode and local to each game file.
- Persistence uses narrow localStorage keys per feature (`gamehub.*`).
- Responsive behavior is CSS + `GameManager`, not framework state.

## COMMANDS
```bash
./run.sh
# or
python3 -m http.server 8080 --bind 127.0.0.1 --directory docs
```

## NOTES
- No test suite was found.
- `docs/` is the deployable app; treat it as source, not generated output.
- Child AGENTS files exist only for runtime core and per-game modules; everything else inherits this root guidance.
