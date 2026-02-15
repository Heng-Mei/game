#!/usr/bin/env bash
set -euo pipefail

rg -n 'id="mobileControls"' docs/index.html >/dev/null
rg -n 'id="orientationOverlay"' docs/index.html >/dev/null
rg -n 'mobile-controls' docs/styles/main.css >/dev/null
rg -n 'orientation: landscape' docs/styles/main.css >/dev/null
rg -n 'orientation: portrait' docs/styles/main.css >/dev/null
rg -n 'touch-action' docs/styles/main.css >/dev/null

echo "OK"
