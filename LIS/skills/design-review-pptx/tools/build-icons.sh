#!/bin/sh
# Rasterise assets/icons/*.svg into tinted PNGs under assets/icons/png/<tint>/.
# Prefer the Node rasteriser (Windows / macOS / Linux). Fall back to AppKit on macOS.
set -eu
cd "$(dirname "$0")/.."
if command -v node >/dev/null 2>&1; then
  node tools/build-icons.js
  exit 0
fi
BIN="${TMPDIR:-/tmp}/svg2png-deckkit"
swiftc -O tools/svg2png.swift -o "$BIN" >/dev/null
for pair in accent:0284C7 onDark:38BDF8 success:16A34A danger:DC2626 warn:D97706 muted:64748B; do
  tint="${pair%%:*}"
  hex="${pair##*:}"
  mkdir -p "assets/icons/png/$tint"
  for f in assets/icons/*.svg; do
    "$BIN" "$f" "assets/icons/png/$tint/$(basename "$f" .svg).png" "$hex" 128 >/dev/null
  done
done
echo "rendered $(ls assets/icons/*.svg | wc -l | tr -d ' ') icons x 6 tints"
