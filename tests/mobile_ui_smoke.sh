#!/usr/bin/env bash
set -euo pipefail

required=(
  "docs/src/theme/tokens.ts"
  "docs/src/theme/theme-provider.tsx"
  "docs/src/theme/theme.css"
  "docs/src/features/settings/theme-switcher.tsx"
  "docs/src/stores/ui-store.ts"
)

for file in "${required[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "MISSING: $file"
    exit 1
  fi
done

rg -n 'day|night' docs/src/theme/tokens.ts >/dev/null
rg -n 'system' docs/src/theme/theme-provider.tsx >/dev/null
rg -n 'matchMedia' docs/src/theme/theme-provider.tsx >/dev/null
rg -n 'localStorage|storage|THEME_STORAGE_KEY' docs/src/stores/ui-store.ts >/dev/null
rg -n 'ThemeSwitcher' docs/src/app/layouts/AppShell.tsx >/dev/null
rg -n -- '--color-bg|--color-surface|--color-text|--color-primary' docs/src/theme/theme.css >/dev/null

echo "OK"
