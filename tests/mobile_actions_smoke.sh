#!/usr/bin/env bash
set -euo pipefail

required=(
  "docs/src/ui/button.tsx"
  "docs/src/ui/card.tsx"
  "docs/src/ui/modal.tsx"
  "docs/src/ui/drawer.tsx"
  "docs/src/ui/segmented-control.tsx"
  "docs/src/features/menu/menu-page.tsx"
  "docs/src/features/menu/game-card.tsx"
  "docs/src/features/settings/settings-modal.tsx"
  "docs/src/features/game/game-overlay.tsx"
)

for file in "${required[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "MISSING: $file"
    exit 1
  fi
done

rg -n 'SettingsModal|settings-modal' docs/src/features/settings/settings-modal.tsx >/dev/null
rg -n 'Drawer|drawer' docs/src/ui/drawer.tsx >/dev/null
rg -n 'Modal|modal' docs/src/ui/modal.tsx >/dev/null
rg -n 'SegmentedControl|segmented' docs/src/ui/segmented-control.tsx >/dev/null
rg -n 'MenuPage' docs/src/features/menu/menu-page.tsx >/dev/null
rg -n 'GameCard' docs/src/features/menu/game-card.tsx >/dev/null
rg -n 'settings|drawer|modal|segment' docs/src/theme/theme.css >/dev/null
rg -n 'menu|game/:gameId' docs/src/app/router.tsx >/dev/null

echo "OK"
