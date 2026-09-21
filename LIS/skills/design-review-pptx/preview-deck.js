#!/usr/bin/env node
/**
 * preview-deck.js — deck spec -> 1:1 HTML preview (1in = 96px).
 *
 * Usage:  node preview-deck.js <deck.json> [out.html]
 *
 * There is no headless pptx renderer on typical HA boxes, so this is how you
 * actually look at a deck before opening PowerPoint. It replays the same
 * recorded draw calls generate-deck.js emits, so the geometry is exact. Fonts
 * are the browser's: Segoe UI / Consolas where installed, a system sans
 * otherwise, so text wrapping is an approximation.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const K = require('./deck-kit');
const { record } = require('./record');

const PX = 96;
const PT = PX / 72;
const p = (v) => `${(v * PX).toFixed(1)}px`;
const hex = (c) => (c ? `#${String(c).replace('#', '')}` : 'transparent');

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** CSS for a font face name, including the Semibold face as a weight. */
function fontCss(face) {
  const f = face || K.font.body;
  if (f === K.font.mono) return `font-family:Consolas,'SF Mono',Menlo,monospace`;
  const weight = /Semibold/i.test(f) ? ';font-weight:600' : '';
  return `font-family:'Segoe UI',Calibri,'Microsoft YaHei',sans-serif${weight}`;
}

/** CSS shape for the preset geometries the kit actually uses. */
function geometry(shape, o) {
  switch (shape) {
    case 'ellipse':
      return 'border-radius:50%;';
    case 'roundRect':
      return `border-radius:${((o.rectRadius ?? 0.04) * PX).toFixed(1)}px;`;
    case 'hexagon':
      return 'clip-path:polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%);';
    case 'rightArrow':
      return 'clip-path:polygon(0 30%,60% 30%,60% 0,100% 50%,60% 100%,60% 70%,0 70%);';
    case 'downArrow':
      return 'clip-path:polygon(30% 0,70% 0,70% 60%,100% 60%,50% 100%,0 60%,30% 60%);';
    default:
      return '';
  }
}

function boxStyle(o) {
  const s = [
    'position:absolute;box-sizing:border-box',
    `left:${p(o.x ?? 0)}`,
    `top:${p(o.y ?? 0)}`,
    `width:${p(o.w ?? 0)}`,
    `height:${p(o.h ?? 0)}`,
  ];
  if (o.fill && o.fill.color && o.fill.transparency !== 100) s.push(`background:${hex(o.fill.color)}`);
  if (o.line && o.line.color && (o.line.width ?? 0) > 0) {
    s.push(`box-shadow:inset 0 0 0 ${(o.line.width * PT).toFixed(2)}px ${hex(o.line.color)}`);
  }
  return s.join(';');
}

function textStyle(o) {
  const s = [
    fontCss(o.fontFace),
    `font-size:${((o.fontSize || 13) * PT).toFixed(2)}px`,
    `color:${hex(o.color || K.color.ink)}`,
    `line-height:${o.lineSpacingMultiple || 1.2}`,
    `text-align:${o.align || 'left'}`,
    // pre-wrap keeps code indentation and explicit newlines, which PowerPoint
    // preserves but HTML would otherwise collapse.
    'white-space:pre-wrap',
  ];
  if (o.bold) s.push('font-weight:700');
  if (o.italic) s.push('font-style:italic');
  if (o.charSpacing) s.push(`letter-spacing:${(o.charSpacing * PT).toFixed(2)}px`);
  const v = o.valign || 'top';
  s.push('display:flex;flex-direction:column');
  s.push(`justify-content:${v === 'middle' ? 'center' : v === 'bottom' ? 'flex-end' : 'flex-start'}`);
  return s.join(';');
}

function runsHtml(runs) {
  return runs.map((r) => {
    const st = [];
    if (r.color) st.push(`color:${hex(r.color)}`);
    if (r.fontFace) st.push(fontCss(r.fontFace));
    if (r.fontSize) st.push(`font-size:${(r.fontSize * PT).toFixed(2)}px`);
    if (r.bold) st.push('font-weight:700');
    if (r.italic) st.push('font-style:italic');
    const body = esc(r.text);
    const tail = r.breakLine ? '\n' : '';
    return st.length ? `<span style="${st.join(';')}">${body}</span>${tail}` : body + tail;
  }).join('');
}

/** pptxgenjs cell border [top,right,bottom,left] -> CSS. */
function cellBorders(border) {
  if (!Array.isArray(border)) return `border:1px solid ${hex(K.color.border)}`;
  const sides = ['top', 'right', 'bottom', 'left'];
  return border.map((b, i) => (b && b.type !== 'none'
    ? `border-${sides[i]}:${((b.pt || 1) * PT).toFixed(2)}px solid ${hex(b.color)}`
    : `border-${sides[i]}:0`)).join(';');
}

/**
 * Tables are drawn as absolutely-positioned cells, not as an HTML <table>: a
 * real <table> grows rows to fit content, which PowerPoint never does.
 */
/** pptxgenjs table margin: points when [0] >= 1, otherwise inches. */
function tablePad(margin) {
  const m = margin == null ? [0.06, 0.14, 0.06, 0.14] : margin;
  const box = Array.isArray(m) ? m : [m, m, m, m];
  const unit = box[0] >= 1 ? PT : PX;
  return {
    top: (box[0] || 0) * unit,
    right: (box[1] || 0) * unit,
    bottom: (box[2] || 0) * unit,
    left: (box[3] || 0) * unit,
  };
}

function tableHtml(op) {
  const o = op.options || {};
  const colW = o.colW || [];
  const rowH = o.rowH || [];
  const pad = tablePad(o.margin);
  const cells = [];
  let top = o.y;

  op.rows.forEach((row, ri) => {
    const h = rowH[ri] ?? 0.4;
    let left = o.x;
    row.forEach((cell, ci) => {
      const c = typeof cell === 'string' ? { text: cell, options: {} } : cell;
      const co = c.options || {};
      const w = colW[ci] ?? (o.w / row.length);
      const st = [
        'position:absolute;box-sizing:border-box;overflow:hidden',
        `left:${p(left)};top:${p(top)};width:${p(w)};height:${p(h)}`,
        `background:${hex((co.fill && co.fill.color) || 'FFFFFF')}`,
        `color:${hex(co.color || K.color.ink)}`,
        fontCss(co.fontFace),
        `font-size:${((co.fontSize || 13) * PT).toFixed(2)}px`,
        cellBorders(co.border),
        `padding:${pad.top.toFixed(1)}px ${pad.right.toFixed(1)}px ${pad.bottom.toFixed(1)}px ${pad.left.toFixed(1)}px`,
        'display:flex;align-items:center;white-space:pre-wrap',
      ];
      if (co.bold) st.push('font-weight:700');
      cells.push(`<div style="${st.join(';')}">${esc(c.text)}</div>`);
      left += w;
    });
    top += h;
  });

  return cells.join('');
}

/** Inline an image file so the preview is self-contained. */
function imageSrc(file) {
  if (!file || !fs.existsSync(file)) return null;
  const ext = path.extname(file).slice(1).toLowerCase();
  const mime = ext === 'jpg' ? 'jpeg' : ext === 'svg' ? 'svg+xml' : ext;
  return `data:image/${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}

function slideHtml(slide, i) {
  const bg = hex(slide.background || 'FFFFFF');
  const parts = slide.ops.map((op) => {
    const o = op.options || {};
    if (op.kind === 'table') return tableHtml(op);
    if (op.kind === 'image') {
      const src = imageSrc(o.path);
      return src
        ? `<img style="${boxStyle(o)};object-fit:fill" src="${src}">`
        : `<div style="${boxStyle(o)};background:#e2e8f0;display:flex;align-items:center;`
          + `justify-content:center;font:11px sans-serif;color:#64748b">${esc(path.basename(o.path || 'image'))}</div>`;
    }
    if (op.kind === 'shape') {
      return `<div style="${boxStyle(o)};${geometry(op.shape, o)}"></div>`;
    }
    const geo = op.kind === 'shapeText' ? geometry(op.shape, o) : '';
    return `<div style="${boxStyle(o)};${geo}${textStyle(o)}">`
      + `<div>${runsHtml(op.runs)}</div></div>`;
  }).join('\n    ');

  const notes = slide.notes
    ? `<p class="notes"><b>Notes.</b> ${esc(slide.notes)}</p>` : '';

  return `<section>
  <h2>${i + 1}. ${esc((slide.spec && (slide.spec.title || slide.spec.headline)) || '')}
    <span class="arch">${esc((slide.spec && slide.spec.archetype) || '')}</span></h2>
  <div class="slide" style="background:${bg}">
    ${parts}
  </div>
  ${notes}
</section>`;
}

function main() {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.error('usage: preview-deck.js <deck.json> [out.html]');
    process.exit(1);
  }
  const specPath = path.resolve(args[0]);
  const deck = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const { slides, errors } = record(deck, path.dirname(specPath));
  errors.forEach((e) => console.error(`warning: ${e}`));

  const out = args[1]
    ? path.resolve(args[1])
    : specPath.replace(/\.deck\.json$|\.json$/, '.preview.html');

  const title = (deck.meta && deck.meta.title) || path.basename(specPath);

  const html = `<!doctype html>
<meta charset="utf-8">
<title>${esc(title)} — preview</title>
<style>
  body { margin:0; padding:28px; background:#e2e8f0; font:14px/1.5 system-ui,sans-serif; color:#0F172A; }
  h1 { font:600 20px system-ui; margin:0 0 4px; }
  .sub { color:#475569; margin:0 0 24px; }
  section { margin:0 0 32px; }
  h2 { font:600 13px system-ui; color:#475569; margin:0 0 8px; }
  .arch { font-weight:400; color:#94A3B8; margin-left:8px; }
  .slide { position:relative; width:${K.grid.W * PX}px; height:${K.grid.H * PX}px;
           overflow:hidden; box-shadow:0 2px 14px rgba(15,23,42,.18); }
  .notes { max-width:${K.grid.W * PX}px; margin:10px 0 0; font-size:12.5px; color:#475569; }
</style>
<h1>${esc(title)}</h1>
<p class="sub">${slides.length} slides · 1:1 preview at ${PX}px/inch · generated by preview-deck.js</p>
${slides.map(slideHtml).join('\n')}
`;

  fs.writeFileSync(out, html);
  console.log(`Wrote ${out}`);
}

if (require.main === module) main();

module.exports = { run: main };
