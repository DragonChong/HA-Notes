#!/usr/bin/env node
/**
 * qa-deck.js — mechanical checks on a deck spec.
 *
 * Usage:  node qa-deck.js <deck.json> [--strict] [--warn-only] [--profile cp3]
 *
 * Exits 1 if any ERROR is found (unless --warn-only). Warnings never fail.
 * These are the checks a human reviewer cannot reliably do by eye: contrast,
 * safe-area bounds, text overflow, palette drift.
 *
 * Contrast profiles
 * -----------------
 * default  4.0 normal / 3.0 large — the "projected slide" floor. Three pairings
 *          in the approved palette land between 4.0 and 4.5 (see
 *          references/design-system.md); they pass here and are flagged under
 *          --strict.
 * --strict 4.5 / 3.0 — WCAG 2.1 AA, the right bar if the deck will be read on
 *          a laptop or circulated as a document rather than presented.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const K = require('./deck-kit');
const { record } = require('./record');

const PALETTE = new Set(Object.values(K.color).map((c) => c.toUpperCase()));
const FONTS = new Set(Object.values(K.font));

// Slides that legitimately have no eyebrow/heading pair.
const NO_HEADER = new Set(['title-hero', 'closing', 'statement']);

// Average glyph width as a fraction of font size. Courier New is monospace
// (exactly 0.6); the others are measured averages for mixed-case English.
const GLYPH = { 'Courier New': 0.6, Calibri: 0.47, Cambria: 0.5 };

const STRICT = process.argv.includes('--strict');
const MIN_NORMAL = STRICT ? 4.5 : 4.0;
const MIN_LARGE = 3.0;
const PROFILE = (() => {
  const i = process.argv.indexOf('--profile');
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : 'general';
})();

const findings = [];
function err(slide, msg) { findings.push({ level: 'ERROR', slide, msg }); }
function warn(slide, msg) { findings.push({ level: 'WARN', slide, msg }); }

// --- colour helpers --------------------------------------------------------

function lum(hex) {
  const v = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}

function contrast(a, b) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

function norm(c) {
  if (!c) return null;
  const s = String(c).replace('#', '').toUpperCase();
  return /^[0-9A-F]{6}$/.test(s) ? s : null;
}

// --- geometry helpers ------------------------------------------------------

function rect(o) {
  if (o.x === undefined || o.y === undefined) return null;
  return { x: o.x, y: o.y, w: o.w ?? 0, h: o.h ?? 0 };
}

function contains(outer, inner) {
  return inner.x >= outer.x - 0.02 && inner.y >= outer.y - 0.02
    && inner.x + inner.w <= outer.x + outer.w + 0.02
    && inner.y + inner.h <= outer.y + outer.h + 0.02;
}

/**
 * Resolve what sits behind a text box: the last filled shape drawn before it
 * that fully contains it, else the slide background, else white.
 */
function backdrop(slide, opIndex, r) {
  let bg = norm(slide.background) || 'FFFFFF';
  for (let i = 0; i < opIndex; i++) {
    const op = slide.ops[i];
    if (op.kind !== 'shape' && op.kind !== 'shapeText') continue;
    const fill = norm(op.options.fill && op.options.fill.color);
    if (!fill) continue;
    const sr = rect(op.options);
    if (sr && contains(sr, r)) bg = fill;
  }
  return bg;
}

// --- checks ----------------------------------------------------------------

function checkSlide(slide) {
  const n = slide.index;
  const spec = slide.spec || {};
  const safe = K.grid.safe;
  let words = 0;

  slide.ops.forEach((op, i) => {
    const o = op.options || {};
    const r = rect(o);

    // -- bounds
    if (r && (op.kind !== 'table')) {
      if (r.x < safe.x0 - 0.02 || r.y < safe.y0 - 0.02
          || r.x + r.w > safe.x1 + 0.02 || r.y + r.h > safe.y1 + 0.02) {
        // Dark bookends deliberately bleed the background, not content.
        err(n, `${op.kind} "${(op.runs[0] || {}).text || op.shape || ''}".slice(0,30) `
          + `outside safe area: (${r.x.toFixed(2)},${r.y.toFixed(2)}) `
          + `${r.w.toFixed(2)}x${r.h.toFixed(2)}`);
      }
    }

    // -- fonts + palette on shapes
    const shapeFill = norm(o.fill && o.fill.color);
    if (shapeFill && !PALETTE.has(shapeFill)) {
      err(n, `shape fill #${shapeFill} is not a palette token`);
    }

    // -- text runs
    if (op.runs && op.runs.length) {
      const bg = r ? backdrop(slide, i, r) : 'FFFFFF';
      op.runs.forEach((run) => {
        if (!run.text || !run.text.trim()) return;
        words += run.text.trim().split(/\s+/).length;

        const face = run.fontFace || o.fontFace;
        if (face && !FONTS.has(face)) {
          err(n, `font "${face}" is outside the three permitted families`);
        }

        const fg = norm(run.color || o.color) || '000000';
        if (!PALETTE.has(fg)) err(n, `text colour #${fg} is not a palette token`);

        // Text inside a filled shape sits on that shape, not the backdrop.
        const on = op.kind === 'shapeText' ? (shapeFill || bg) : bg;
        const ratio = contrast(fg, on);
        const pt = run.fontSize || o.fontSize || 13;
        const large = pt >= 18 || (pt >= 14 && (run.bold || o.bold));
        const floor = large ? MIN_LARGE : MIN_NORMAL;
        if (ratio < floor) {
          err(n, `contrast ${ratio.toFixed(2)}:1 (need ${floor}) — `
            + `#${fg} on #${on}: "${run.text.slice(0, 40)}"`);
        }
      });

      // -- overflow estimate
      if (r && r.w > 0 && r.h > 0) {
        const pt = o.fontSize || 13;
        const face = o.fontFace || K.font.body;
        const em = pt / 72;
        const perLine = Math.max(1, Math.floor(r.w / (em * (GLYPH[face] || 0.5))));
        const body = op.runs.map((x) => x.text).join('');
        const lines = body.split('\n').reduce(
          (acc, seg) => acc + Math.max(1, Math.ceil(seg.length / perLine)), 0);
        const need = lines * em * (o.lineSpacingMultiple || 1.2);
        if (need > r.h * 1.25) {
          warn(n, `text may overflow its box (~${need.toFixed(2)}" needed, `
            + `${r.h.toFixed(2)}" given): "${body.slice(0, 40)}"`);
        }
      }
    }

    // -- table extent
    //
    // PowerPoint sizes a table from its row heights, ignoring the `h` passed
    // to addTable. A table with more rows than the author counted silently
    // grows downward and lands on top of whatever follows it, so measure the
    // real extent and check it against every later shape.
    if (op.kind === 'table') {
      const rows = op.rows || [];
      const heights = o.rowH || [];
      const bottom = o.y + rows.reduce((a, _, ri) => a + (heights[ri] ?? 0.4), 0);
      if (bottom > safe.y1) {
        err(n, `table runs to ${bottom.toFixed(2)}", past the ${safe.y1}" safe bottom `
          + `(${rows.length} rows)`);
      }
      slide.ops.slice(i + 1).forEach((later) => {
        const lr = rect(later.options || {});
        if (!lr || later.kind === 'table') return;
        const overlapY = lr.y < bottom && lr.y + lr.h > o.y;
        const overlapX = lr.x < o.x + o.w && lr.x + lr.w > o.x;
        if (overlapY && overlapX) {
          err(n, `table (ends ${bottom.toFixed(2)}") collides with a shape at `
            + `y=${lr.y.toFixed(2)}" — give the table fewer rows or move the shape down`);
        }
      });
    }

    // -- table cells
    if (op.kind === 'table') {
      (op.rows || []).forEach((row) => {
        row.forEach((cell) => {
          const c = typeof cell === 'string' ? { text: cell, options: {} } : cell;
          const co = c.options || {};
          const fg = norm(co.color) || '000000';
          const bgc = norm(co.fill && co.fill.color) || 'FFFFFF';
          if (!PALETTE.has(fg)) err(n, `table text colour #${fg} is not a palette token`);
          if (!PALETTE.has(bgc)) err(n, `table cell fill #${bgc} is not a palette token`);
          const ratio = contrast(fg, bgc);
          if (c.text && String(c.text).trim() && ratio < MIN_NORMAL) {
            err(n, `table contrast ${ratio.toFixed(2)}:1 (need ${MIN_NORMAL}) `
              + `— #${fg} on #${bgc}: "${c.text}"`);
          }
          words += String(c.text || '').trim().split(/\s+/).filter(Boolean).length;
        });
      });
    }
  });

  // -- structure
  if (!NO_HEADER.has(spec.archetype)) {
    if (!spec.eyebrow) warn(n, `${spec.archetype} has no eyebrow — the deck loses its navigation`);
    if (!spec.title) err(n, `${spec.archetype} has no title`);
  }
  if (!slide.notes) warn(n, 'no speaker notes');

  if (words > 90) warn(n, `${words} words on one slide — target is under 90`);

  const all = JSON.stringify(spec);
  const ph = all.match(/\b(TBD|TODO|lorem ipsum|XXX|FIXME|placeholder)\b/i);
  if (ph) err(n, `placeholder text present: "${ph[0]}"`);
}

function checkDeck(deck, slides) {
  const first = deck.slides && deck.slides[0];
  if (!first || first.archetype !== 'title-hero') {
    warn(0, 'first slide is not a title-hero');
  } else {
    const blob = JSON.stringify(first);
    if (!/\d{4}|\b\d{1,2}\s+\w{3}\b/.test(blob)) warn(1, 'title slide carries no date');
    // CP3 design reviews need a JIRA key and a named service. General decks do not.
    if (PROFILE === 'cp3') {
      if (!/\b[A-Z]{2,5}-\d{3,6}\b/.test(blob)) err(1, 'title slide carries no JIRA key');
      if (!/lis-|svc|app/i.test(blob)) warn(1, 'title slide names no service');
    }
  }

  // Agenda coverage: every agenda item should appear as a later eyebrow/title.
  const agenda = (deck.slides || []).find((s) => s.archetype === 'agenda');
  if (agenda) {
    // statement/closing slides carry their label in `headline`, not `title`.
    const titles = (deck.slides || [])
      .map((s) => `${s.eyebrow || ''} ${s.title || ''} ${s.headline || ''}`.toLowerCase())
      .join(' | ');
    (agenda.items || []).forEach((it) => {
      const label = (typeof it === 'string' ? it : it.title).toLowerCase();
      if (!titles.includes(label.split(' ')[0])) {
        warn(0, `agenda item "${label}" has no matching slide`);
      }
    });
  }

  if (!slides.length) err(0, 'deck has no slides');
}

// --- main ------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.error('usage: qa-deck.js <deck.json> [--strict] [--warn-only] [--profile cp3]');
    process.exit(1);
  }
  const specPath = path.resolve(args[0]);
  const deck = JSON.parse(fs.readFileSync(specPath, 'utf8'));

  const { slides, errors } = record(deck);
  errors.forEach((e) => err(0, e));

  slides.forEach(checkSlide);
  checkDeck(deck, slides);

  const errs = findings.filter((f) => f.level === 'ERROR');
  const warns = findings.filter((f) => f.level === 'WARN');

  const label = path.basename(specPath);
  if (!findings.length) {
    console.log(`${label}: PASS — ${slides.length} slides, no findings.`);
    return;
  }

  for (const f of [...errs, ...warns]) {
    const where = f.slide ? `slide ${f.slide}` : 'deck';
    console.log(`${f.level === 'ERROR' ? 'ERROR' : ' warn'}  ${where.padEnd(9)}  ${f.msg}`);
  }
  console.log(`\n${label}: ${errs.length} error(s), ${warns.length} warning(s) `
    + `across ${slides.length} slides.`);

  if (errs.length && !args.includes('--warn-only')) process.exit(1);
}

if (require.main === module) main();
