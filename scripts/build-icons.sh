#!/bin/bash
set -euo pipefail

ICON_BASE="assets/icons/icon.png"
ICONSET_DIR="assets/icons/MarkdownViewer.iconset"
ICNS_PATH="assets/icons/MarkdownViewer.icns"

if [[ ! -f "$ICON_BASE" ]]; then
  echo "Base icon $ICON_BASE not found" >&2
  exit 1
fi

rm -rf "$ICONSET_DIR"
mkdir -p "$ICONSET_DIR"

function render() {
  local size=$1
  local name=$2
  sips -z $size $size "$ICON_BASE" --out "$ICONSET_DIR/$name" >/dev/null
}

render 16 icon_16x16.png
render 32 icon_16x16@2x.png
render 32 icon_32x32.png
render 64 icon_32x32@2x.png
render 128 icon_128x128.png
render 256 icon_128x128@2x.png
render 256 icon_256x256.png
render 512 icon_256x256@2x.png
render 512 icon_512x512.png
render 1024 icon_512x512@2x.png

if command -v iconutil >/dev/null; then
  if iconutil -c icns "$ICONSET_DIR" -o "$ICNS_PATH"; then
    echo "Generated $ICNS_PATH"
  else
    echo "iconutil failed; leaving $ICONSET_DIR for manual conversion" >&2
  fi
else
  echo "iconutil not available; skipped .icns generation" >&2
fi
