#!/usr/bin/env bash
set -euo pipefail

required=(
  "docs/src/games/g2048/g2048-scene.ts"
  "docs/src/games/g2048/g2048-rules.ts"
  "docs/src/games/snake/snake-scene.ts"
  "docs/src/games/flappy/flappy-scene.ts"
  "docs/src/games/dino/dino-scene.ts"
)

for file in "${required[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "MISSING: $file"
    exit 1
  fi
done

rg -n 'SIZE\s*=\s*4|rows\s*=\s*4|cols\s*=\s*4|4x4' docs/src/games/g2048/g2048-rules.ts >/dev/null
rg -n '0\.9|90%' docs/src/games/g2048/g2048-rules.ts >/dev/null
rg -n 'merge|combine' docs/src/games/g2048/g2048-rules.ts >/dev/null
rg -n 'ArrowLeft|ArrowRight|ArrowUp|ArrowDown' docs/src/games/g2048/g2048-scene.ts >/dev/null
rg -n 'swipe|threshold|touch' docs/src/games/g2048/g2048-scene.ts >/dev/null
rg -n 'animation|slide|pop|movingTiles|mergePops|spawnPop' docs/src/games/g2048/g2048-rules.ts >/dev/null
rg -n 'primary.?tap|tap|click' docs/src/games/flappy/flappy-scene.ts >/dev/null
rg -n 'primary.?tap|tap|click' docs/src/games/dino/dino-scene.ts >/dev/null
rg -n 'move|direction|Arrow' docs/src/games/snake/snake-scene.ts >/dev/null

echo "OK"
