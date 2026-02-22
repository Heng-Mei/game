#!/usr/bin/env bash
set -euo pipefail

required=(
  "docs/src/game-core/events.ts"
  "docs/src/game-core/base-scene.ts"
  "docs/src/platform/game-runtime.ts"
  "docs/src/platform/game-registry.ts"
  "docs/src/platform/game-host.tsx"
  "docs/src/platform/input/input-adapter.ts"
  "docs/src/platform/input/gesture-detector.ts"
  "docs/src/features/game/game-page.tsx"
  "docs/src/stores/game-session-store.ts"
)

for file in "${required[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "MISSING: $file"
    exit 1
  fi
done

rg -n 'createHashRouter|createBrowserRouter' docs/src/app/router.tsx >/dev/null
rg -n 'game/:gameId|/game/' docs/src/app/router.tsx >/dev/null
rg -n 'Phaser\.Game|new Phaser\.Game' docs/src/platform/game-host.tsx >/dev/null
rg -n 'GAME_READY|GAME_STATE_CHANGED|SCORE_CHANGED' docs/src/game-core/events.ts >/dev/null
rg -n 'data-testid="game-host-canvas"|game-canvas-host' docs/src/platform/game-host.tsx >/dev/null

if rg -n 'legacy/index\.html|legacy-game-frame|URLSearchParams' docs/src/features/game/game-page.tsx >/dev/null; then
  echo "FAIL: legacy runtime references still exist in game-page"
  exit 1
fi

if [[ -d "docs/public/legacy" ]]; then
  echo "FAIL: docs/public/legacy should be removed"
  exit 1
fi

echo "OK"
