#!/usr/bin/env bash
set -euo pipefail

rg -n 'id="mobileControls"' docs/index.html >/dev/null
rg -n 'id="orientationOverlay"' docs/index.html >/dev/null
rg -n 'mobile-controls' docs/styles/main.css >/dev/null
rg -n 'id="infoDrawer"' docs/index.html >/dev/null
rg -n 'id="infoToggleBtn"' docs/index.html >/dev/null
rg -n 'info-drawer' docs/styles/main.css >/dev/null
rg -n 'floating-next' docs/styles/main.css >/dev/null
rg -n 'mobile-layout--portrait' docs/styles/main.css >/dev/null
rg -n 'mobile-layout--landscape' docs/styles/main.css >/dev/null
rg -n 'mobile-row--dpad' docs/styles/main.css >/dev/null
rg -n 'mobile-row--actions' docs/styles/main.css >/dev/null
rg -n 'mobile-btn--dpad-up' docs/styles/main.css >/dev/null
rg -n 'mobile-btn--dpad-down' docs/styles/main.css >/dev/null
rg -n 'mobile-btn--dpad-left' docs/styles/main.css >/dev/null
rg -n 'mobile-btn--dpad-right' docs/styles/main.css >/dev/null
rg -n '\.game-view\.mobile-game-active \.layout > \.side' docs/styles/main.css >/dev/null
rg -n 'max-height: calc\(100dvh -' docs/styles/main.css >/dev/null
rg -n 'overflow-y: auto' docs/styles/main.css >/dev/null
rg -n 'orientation: landscape' docs/styles/main.css >/dev/null
rg -n 'orientation: portrait' docs/styles/main.css >/dev/null
rg -n 'touch-action' docs/styles/main.css >/dev/null

echo "OK"
