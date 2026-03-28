# CORE RUNTIME KNOWLEDGE BASE

## OVERVIEW
Shared browser runtime for the game hub: DOM facade, frame loop, menu/game orchestration, mobile controls.

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Update DOM refs / panel helpers | `ui.js` | Owns `window.GameHub.refs` and `window.GameHub.ui` |
| Change game switching or shared input | `game-manager.js` | Menu transitions, pointer/key routing, mobile controls |
| Change frame timing | `loop.js` | RAF lifecycle only |

## STRUCTURE
```text
core/
├── ui.js            # DOM + canvas facade
├── game-manager.js  # Runtime orchestrator
└── loop.js          # requestAnimationFrame loop
```

## LOCAL CONVENTIONS
- Keep shared browser concerns here: menu flow, input dispatch, info drawer, orientation/mobile layout, canvas refs.
- `ui.js` is the only place that should know concrete DOM ids/class wiring at scale.
- `game-manager.js` talks to games through optional lifecycle hooks (`enter`, `exit`, `update`, input handlers, `onAction`). Preserve that loose contract.
- `loop.js` should stay tiny. Timing changes belong here; gameplay rules do not.

## ANTI-PATTERNS
- Do not hardcode per-game behavior in `ui.js`; push game-specific rendering back into game modules.
- Do not bypass `dispatchAction()`/shared handlers when adding mobile controls.
- Do not add framework-style state containers; the current contract is direct object state plus DOM/canvas side effects.
- Do not swallow script-order dependencies: this directory assumes `window.GameHub` already exists and is loaded before `app.js` consumes it.

## UNIQUE STYLES
- Mobile behavior is policy-driven in `game-manager.js` via `mobileControlPolicies` and `mobileLayouts`.
- Storage failures are tolerated with guarded `localStorage` access.
- UI helpers are imperative and minimal; keep method names action-oriented.
