#!/usr/bin/env node
'use strict';
/**
 * Rasterise assets/icons/*.svg into tinted PNGs under assets/icons/png/<tint>/.
 *
 * PNG, not SVG, ships in decks: pptxgenjs embeds SVG with a generated fallback
 * that is a broken-image placeholder, which Keynote and older Office display.
 *
 * Font Awesome paths often overflow the declared viewBox (paper-plane, gear,
 * lock). We expand to the painted bbox, then letterbox into a square so the
 * 1:1 slide slot does not clip or stretch.
 *
 * Tint hexes must match deck-kit.js (ICON_TINTS).
 *
 *   npm install --prefix tools @resvg/resvg-js
 *   node tools/build-icons.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ICON_DIR = path.join(ROOT, 'assets', 'icons');
const TINTS = {
  accent: '0284C7',
  onDark: '38BDF8',
  success: '16A34A',
  danger: 'DC2626',
  warn: 'D97706',
  muted: '64748B',
};
const PX = 128;
/** Extra room around the painted bbox so anti-aliased tips are not clipped. */
const PAD_RATIO = 0.06;

function loadResvg() {
  const candidates = [
    path.join(__dirname, 'node_modules', '@resvg', 'resvg-js'),
    '@resvg/resvg-js',
  ];
  for (const id of candidates) {
    try {
      return require(id);
    } catch (_) { /* try next */ }
  }
  throw new Error(
    'Missing @resvg/resvg-js. From this skill folder run: npm install --prefix tools @resvg/resvg-js'
  );
}

function parseViewBox(svg) {
  const m = svg.match(/viewBox="([^"]+)"/);
  if (!m) return null;
  const [x, y, w, h] = m[1].trim().split(/[\s,]+/).map(Number);
  if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) return null;
  return { x, y, w, h };
}

function squareViewBox(svg, Resvg) {
  const declared = parseViewBox(svg);
  const probe = new Resvg(svg.replace(/currentColor/g, '#000000'));
  const box = probe.getBBox();
  let x;
  let y;
  let w;
  let h;
  if (declared && box) {
    x = Math.min(declared.x, box.x);
    y = Math.min(declared.y, box.y);
    w = Math.max(declared.x + declared.w, box.x + box.width) - x;
    h = Math.max(declared.y + declared.h, box.y + box.height) - y;
  } else if (box) {
    ({ x, y, width: w, height: h } = box);
  } else if (declared) {
    ({ x, y, w, h } = declared);
  } else {
    return svg;
  }
  const pad = Math.max(w, h) * PAD_RATIO;
  const side = Math.max(w, h) + pad * 2;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const vb = `${cx - side / 2} ${cy - side / 2} ${side} ${side}`;
  if (/viewBox="[^"]+"/.test(svg)) return svg.replace(/viewBox="[^"]+"/, `viewBox="${vb}"`);
  return svg.replace(/<svg\b/, `<svg viewBox="${vb}"`);
}

function main() {
  const { Resvg } = loadResvg();
  const names = fs.readdirSync(ICON_DIR).filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4));
  if (!names.length) throw new Error(`no SVGs in ${ICON_DIR}`);

  const fitted = new Map();
  for (const name of names) {
    const raw = fs.readFileSync(path.join(ICON_DIR, `${name}.svg`), 'utf8');
    fitted.set(name, squareViewBox(raw, Resvg));
  }

  for (const [tint, hex] of Object.entries(TINTS)) {
    const outDir = path.join(ICON_DIR, 'png', tint);
    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(outDir, { recursive: true });
    for (const name of names) {
      const svg = fitted.get(name).replace(/currentColor/g, `#${hex}`);
      const png = new Resvg(svg, {
        fitTo: { mode: 'width', value: PX },
        background: 'rgba(0,0,0,0)',
      }).render().asPng();
      fs.writeFileSync(path.join(outDir, `${name}.png`), png);
    }
  }
  console.log(`rendered ${names.length} icons x ${Object.keys(TINTS).length} tints`);
}

main();
