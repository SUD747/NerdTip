#!/bin/sh
# Builds loadable folders + store zips for each target from the one source tree:
#   dist/chromium/  (Chrome, Edge, Brave)  dist/glossary-tooltip-chromium.zip
#   dist/firefox/                          dist/glossary-tooltip-firefox.zip
# The only per-target difference: Chromium's copy drops browser_specific_settings,
# which Chrome would otherwise flag as an unrecognized manifest key.
set -e
cd "$(dirname "$0")/.."

[ -f vendor/browser-polyfill.js ] || npm install

FILES="manifest.json vendor glossary icons src"
rm -rf dist

for target in chromium firefox; do
  mkdir -p "dist/$target"
  cp -R $FILES "dist/$target/"
done

node -e '
  const fs = require("fs");
  const path = "dist/chromium/manifest.json";
  const manifest = JSON.parse(fs.readFileSync(path, "utf8"));
  delete manifest.browser_specific_settings;
  fs.writeFileSync(path, JSON.stringify(manifest, null, 2) + "\n");
'

for target in chromium firefox; do
  (cd "dist/$target" && zip -qr "../glossary-tooltip-$target.zip" .)
done

echo "Built dist/chromium, dist/firefox and their zips."
