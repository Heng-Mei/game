#!/usr/bin/env bash
set -euo pipefail

required=(
  "docs/src/games/minesweeper/minesweeper-scene.ts"
  "docs/src/games/minesweeper/minesweeper-rules.ts"
  "docs/src/games/spider/spider-scene.ts"
  "docs/src/games/spider/spider-rules.ts"
  "docs/src/games/cards/card-theme.ts"
)

for file in "${required[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "MISSING: $file"
    exit 1
  fi
done

rg -n 'BEGINNER|INTERMEDIATE|EXPERT|classic' docs/src/games/minesweeper/minesweeper-rules.ts >/dev/null
rg -n 'question|flag|chord|quick.?open|first.?click|safe' docs/src/games/minesweeper/minesweeper-rules.ts >/dev/null
rg -n -i 'spider|suit|sequence|deal' docs/src/games/spider/spider-rules.ts >/dev/null
rg -n 'symbol|theme|day|night' docs/src/games/cards/card-theme.ts >/dev/null

echo "OK"
