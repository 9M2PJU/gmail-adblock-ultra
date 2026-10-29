#!/usr/bin/env bash
# Build release packages for Chrome (MV3) and Firefox (MV2).
# Usage: ./build.sh [version]   (defaults to version in manifest.json)
set -euo pipefail
cd "$(dirname "$0")"

VERSION="${1:-$(python3 -c "import json; print(json.load(open('manifest.json'))['version'])")}"
rm -rf dist
mkdir -p dist/chrome dist/firefox

# --- Chrome (MV3): everything as-is ---
cp manifest.json dist/chrome/
# NOTE: README.md / CHROMEWEBSTORE.md / PRIVACY.md are docs, not runtime files —
# the CWS review checklist requires excluding them from the submission ZIP.
cp -r icons src rules LICENSE dist/chrome/
rm -f dist/chrome/src/background.firefox.js dist/chrome/manifest.firefox.json

# --- Firefox (MV2): swap manifest + webRequest background, drop DNR rules ---
cp manifest.firefox.json dist/firefox/manifest.json
mkdir -p dist/firefox/src dist/firefox/icons
cp icons/* dist/firefox/icons/
cp src/content.js src/content.css src/popup.html src/popup.css src/popup.js dist/firefox/src/
cp src/background.firefox.js dist/firefox/src/background.js
cp LICENSE dist/firefox/

# Validate manifests
python3 - <<'EOF'
import json
for f in ('dist/chrome/manifest.json', 'dist/firefox/manifest.json'):
    m = json.load(open(f))
    assert m['version'] == m['version'].strip(), f
    print(f, '-> MV' + str(m['manifest_version']), m['version'], 'OK')
EOF

# Zip (store listings / sideloading / release artifacts)
(cd dist/chrome && zip -qr "../gmail-adblock-ultra-chrome-v${VERSION}.zip" .)
(cd dist/firefox && zip -qr "../gmail-adblock-ultra-firefox-v${VERSION}.zip" .)
ls -la dist/*.zip
