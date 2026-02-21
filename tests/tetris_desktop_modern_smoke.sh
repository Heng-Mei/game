#!/usr/bin/env bash
set -euo pipefail

required=(
  "docs/src/games/tetris/tetris-scene.ts"
  "docs/src/games/tetris/tetris-rules.ts"
  "docs/src/games/tetris/tetris-input.ts"
  "docs/src/games/tetris/tetris-settings-modal.tsx"
  "docs/src/stores/tetris-settings-store.ts"
)

for file in "${required[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "MISSING: $file"
    exit 1
  fi
done

rg -n 'rotateLeft|rotateRight|rotate_ccw|counter.?clockwise' docs/src/games/tetris/tetris-input.ts >/dev/null
rg -n 'hold' docs/src/games/tetris/tetris-rules.ts >/dev/null
rg -n 'keybind|键位|binding' docs/src/games/tetris/tetris-settings-modal.tsx >/dev/null
rg -n 'DAS|ARR|DSS|dssFrames' docs/src/stores/tetris-settings-store.ts >/dev/null
rg -n 'TetrisSettingsModal|tetris-settings' docs/src/games/tetris/tetris-settings-modal.tsx >/dev/null

echo "OK"
