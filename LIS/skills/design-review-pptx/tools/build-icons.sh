#!/bin/sh
# Rasterise assets/icons/*.svg into tinted PNGs under assets/icons/png/<tint>/.
#
# PNG, not SVG, ships in decks: pptxgenjs embeds SVG with a generated fallback
# that is a broken-image placeholder, which Keynote and pre-365 Office show.
# macOS only (uses AppKit to rasterise). Re-run after adding an icon.
# Tint hexes must match deck-kit.js (ICON_TINTS).
set -eu
cd "$(dirname "$0")/.."
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
