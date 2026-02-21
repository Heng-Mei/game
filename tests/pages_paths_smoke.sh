#!/usr/bin/env bash
set -euo pipefail

required=(
  "docs/src/game-core/phaser-bridge.ts"
  "docs/src/game-core/events.ts"
  "docs/src/game-core/base-scene.ts"
  "docs/src/game-core/game-host.tsx"
  "docs/src/features/game/game-page.tsx"
  "docs/src/stores/game-session-store.ts"
  "docs/public/legacy/index.html"
  "docs/public/legacy/scripts/app.js"
  "docs/public/legacy/scripts/core/game-manager.js"
  "docs/public/legacy/scripts/games/tetris.js"
)

for file in "${required[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "MISSING: $file"
    exit 1
  fi
done

rg -n 'createHashRouter|createBrowserRouter' docs/src/app/router.tsx >/dev/null
rg -n 'game/:gameId|/game/' docs/src/app/router.tsx >/dev/null
rg -n 'Phaser\.Game|new Phaser\.Game' docs/src/game-core/phaser-bridge.ts >/dev/null
rg -n 'GAME_READY|GAME_STATE_CHANGED|SCORE_CHANGED' docs/src/game-core/events.ts >/dev/null
rg -n 'legacy/index\.html\?game=' docs/src/features/game/game-page.tsx >/dev/null
rg -n 'URLSearchParams|openGame\(' docs/public/legacy/scripts/app.js >/dev/null

echo "OK"
