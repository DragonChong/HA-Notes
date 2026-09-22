/**
 * deck-kit.js — design tokens + drawing primitives for HA 16:9 decks.
 *
 * Extracted from "Technical Design Review Template.pptx" (Tailwind slate/sky
 * look: white bordered cards on an F8FAFC canvas, dark cover and closing).
 * Every colour, font, size and coordinate in the archetypes comes from here —
 * nothing is invented at call sites. Both design-review-pptx and generate-pptx
 * render through this one file.
 *
 * Canvas: 16:9, 13.333 x 7.5 in. All geometry is in inches.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Palette
//
// sky   = current / proposed / enabled     red   = problem / existing defect
// green = success / promotion              amber = attention / trade-off
// slate = neutral structure and text
//
// `*Ink` variants are the text-safe shade of a hue; the base shade is for
// fills, icons and large display type only (it misses the contrast floor as
// body text on a light ground).
// ---------------------------------------------------------------------------

const color = {
  // canvas
  canvas: 'F8FAFC', // content slide background
  canvasDark: '090D16', // cover, closing, dark statement
  white: 'FFFFFF', // cards, section divider background

  // text
  ink: '0F172A', // headings, card titles; also the code panel fill
  strong: '334155', // key-value lines, step text
  body: '475569', // card body copy
  muted: '64748B', // notes, meta labels, secondary lines
  onDarkMuted: '94A3B8', // secondary text on dark
  onDarkText: 'F1F5F9', // primary small text on dark

  // structure
  border: 'E2E8F0', // card outline, table row hairline
  ruleStrong: 'CBD5E1', // table header underline, flow connectors
  headerFill: 'F1F5F9', // table header row, quiet inset panels
  ruleDark: '1E293B', // vertical dividers + outlines on dark

  // accent (sky)
  accent: '0284C7',
  accentInk: '0369A1', // accent text on accentTint (0284C7 there is 3.6:1)
  accentOnDark: '38BDF8',
  accentTint: 'E0F2FE',
  accentDeep: '082F49', // icon disc on dark

  // semantic
  danger: 'DC2626',
  dangerInk: 'B91C1C',
  dangerTint: 'FEE2E2',
  success: '16A34A',
  successInk: '15803D',
  successTint: 'DCFCE7',
  warn: 'D97706',
  warnInk: 'B45309',
  warnTint: 'FEF3C7',

  // code panel tokens
  codeText: 'E2E8F0',
  codeKeyword: 'F43F5E',
  codeString: '38BDF8',
  codeLiteral: 'FBBF24',
  codeComment: '64748B',

  // Aliases kept so existing deck specs render unchanged.
  elevated: '1E293B',
  neutralTint: 'F1F5F9',
  onDarkFaint: '64748B',
  rule: 'E2E8F0',
};

/**
 * Tones. Every card surface is white with a border; the tone decides the
 * accent used for its label, badge, pill and icon. `ink` / `elevated` are
 * dark cards.
 */
// ink     = text colour on white
// tintInk = text colour on the tone's own tint (pills, badge numerals)
const tone = {
  neutral: { ink: color.muted, tint: color.headerFill, tintInk: color.muted, icon: 'muted', dark: false },
  outline: { ink: color.muted, tint: color.headerFill, tintInk: color.muted, icon: 'muted', dark: false },
  accent: { ink: color.accent, tint: color.accentTint, tintInk: color.accentInk, icon: 'accent', dark: false },
  success: { ink: color.successInk, tint: color.successTint, tintInk: color.successInk, icon: 'success', dark: false },
  warn: { ink: color.warnInk, tint: color.warnTint, tintInk: color.warnInk, icon: 'warn', dark: false },
  danger: { ink: color.dangerInk, tint: color.dangerTint, tintInk: color.dangerInk, icon: 'danger', dark: false },
  ink: { ink: color.accentOnDark, tint: color.accentDeep, tintInk: color.accentOnDark, icon: 'onDark', dark: true },
  elevated: { ink: color.accentOnDark, tint: color.accentDeep, tintInk: color.accentOnDark, icon: 'onDark', dark: true },
};

function toneOf(name) {
  return tone[name] || tone.neutral;
}

/** Back-compat: accent colour for a tone. */
const toneAccent = Object.fromEntries(Object.entries(tone).map(([k, v]) => [k, v.ink]));

// ---------------------------------------------------------------------------
// Typography — Office-safe stand-ins for the template's Space Grotesk (display)
// and Plus Jakarta Sans (body). Every HA desktop has these three.
// ---------------------------------------------------------------------------

const font = {
  display: 'Segoe UI Semibold', // headings, numerals, stats
  body: 'Segoe UI', // body, labels (bold where the template is bold)
  mono: 'Consolas', // code, identifiers
};

/** The type ladder, in points. */
const size = {
  micro: 9, // ADR labels, language tag
  label: 9.75, // pills, step numerals, code filename
  eyebrow: 10.5, // section eyebrow, meta labels, stage labels
  fine: 11.25, // table cells, code, side-card body, agenda note
  small: 12, // key-value lines, 4-up body, meta values
  bodySm: 12.75, // side-card titles
  body: 13.5, // 3-up card body, agenda title
  cardTitle: 15, // card titles, compare titles
  lede: 15, // cover / section lede
  statLabel: 18, // single stat label
  heading: 24, // slide H1
  closing: 33, // closing / dark statement headline
  hero: 39, // cover and section headline; stat grid value
  stat: 90, // single hero stat
};

// ---------------------------------------------------------------------------
// Grid
// ---------------------------------------------------------------------------

const grid = {
  // Widescreen is exactly 40/3 in = 12192000 EMU.
  W: 40 / 3,
  H: 7.5,

  margin: 2 / 3, // 609600 EMU — content slides
  marginDark: 0.83, // cover, section divider, closing
  contentW: 12.0,
  right: 2 / 3 + 12.0,

  eyebrowY: 0.5,
  eyebrowH: 0.25,
  headingY: 0.79,
  headingH: 0.5,

  bandTop: 1.5, // content never starts above this
  bandBottom: 7.0, // ...or ends below this
  bandCentre: 4.25, // template blocks centre here vertically

  pad: 0.3, // card interior padding
  radius: 0.12, // card corner radius

  safe: { x0: 0.6, x1: 12.74, y0: 0.45, y1: 7.05 },
};

/** Evenly divide a span into `n` columns with `gap` between them. */
function columns(n, gap = 0.25, left = grid.margin, width = grid.contentW) {
  const w = (width - gap * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => ({ x: left + i * (w + gap), w }));
}

/** Template gutters by column count. */
function gutter(n) {
  return n >= 4 ? 0.21 : n === 3 ? 0.25 : 0.33;
}

/** Top y that centres a block of height `h` in the content band. */
function centreY(h, top = grid.bandTop) {
  const y = grid.bandCentre - h / 2;
  return Math.max(top, Math.min(y, grid.bandBottom - h));
}

// --- text measurement (estimates; PowerPoint does the real layout) ----------

const GLYPH = { [font.display]: 0.54, [font.body]: 0.5, [font.mono]: 0.55 };

/** Estimated rendered width of a single line. */
function textWidth(str, pt, face = font.body, caps = false) {
  const k = (GLYPH[face] || 0.5) + (caps ? 0.1 : 0);
  return String(str).length * (pt / 72) * k;
}

/** Estimated line count when wrapped to width `w`. */
function lineCount(str, pt, w, face = font.body) {
  const perLine = Math.max(1, Math.floor(w / ((pt / 72) * (GLYPH[face] || 0.5))));
  return String(str || '').split('\n')
    .reduce((n, seg) => n + Math.max(1, Math.ceil(seg.length / perLine)), 0);
}

/** Estimated height of wrapped text. */
function textHeight(str, pt, w, face = font.body, spacing = 1.25) {
  return lineCount(str, pt, w, face) * (pt / 72) * spacing;
}

// ---------------------------------------------------------------------------
// Primitives
//
// Shapes are drawn fill/outline only and text is a separately positioned box
// laid over them, for exact padding. Only badges, pills and flow nodes carry
// their own text.
// ---------------------------------------------------------------------------

function lightBg(slide, fill = color.canvas) {
  slide.background = { color: fill };
}

function darkBg(slide) {
  slide.background = { color: color.canvasDark };
}

/**
 * A shape that carries its own text.
 *
 * NOTE: pptxgenjs 3.12 silently DROPS the `text` option passed to addShape() —
 * the shape renders empty. `addText(str, { shape })` is the only API that
 * actually emits a text body. Never reach for addShape+text.
 */
function shapeText(pptx, slide, shape, content, opts = {}) {
  slide.addText(String(content), { shape: pptx.ShapeType[shape], ...opts });
}

/**
 * The template card: white, 0.75pt border, rounded. `highlight` gives the
 * 1.5pt accent outline used for the proposed side of a comparison. A tone of
 * `ink` / `elevated` draws a dark card.
 */
function card(pptx, slide, { x, y, w, h, tone: t, highlight = false, fill, line, radius = grid.radius, outlineOnly = false }) {
  const dark = toneOf(t).dark;
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    // outlineOnly draws just the rounded border over something (a table).
    fill: outlineOnly
      ? { color: color.white, transparency: 100 }
      : { color: fill || (dark ? color.ink : color.white) },
    line: highlight
      ? { color: color.accent, width: 1.5 }
      : { color: line || (dark ? color.ruleDark : color.border), width: 0.75 },
    rectRadius: radius,
  });
}

/** Back-compat name. */
function panel(pptx, slide, opts) {
  card(pptx, slide, opts);
}

/** Solid, borderless rectangle (rules, dividers, accent bars). */
function rect(pptx, slide, { x, y, w, h, fill }) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: fill },
    line: { color: fill, width: 0 },
  });
}

/** Caps, letter-spaced section label. */
function eyebrow(slide, str, { x = grid.margin, y = grid.eyebrowY, w = grid.contentW, onDark = false, fill } = {}) {
  slide.addText(String(str).toUpperCase(), {
    x, y, w, h: grid.eyebrowH,
    fontFace: font.display,
    fontSize: size.eyebrow,
    color: fill || (onDark ? color.accentOnDark : color.accent),
    charSpacing: 1.5,
    valign: 'middle',
    margin: 0,
  });
}

/** Slide H1. */
function heading(slide, str, { x = grid.margin, y = grid.headingY, w = grid.contentW, onDark = false } = {}) {
  slide.addText(String(str), {
    x, y, w, h: grid.headingH,
    fontFace: font.display,
    fontSize: size.heading,
    color: onDark ? color.white : color.ink,
    valign: 'middle',
    margin: 0,
  });
}

/**
 * Split-eyebrow used on cover and section slides:
 * PRIMARY (accent) — short accent rule — secondary (muted).
 */
function splitEyebrow(pptx, slide, str, { x, y, onDark = false }) {
  const parts = String(str).split(/\s*·\s*/).filter(Boolean);
  const first = parts.shift() || '';
  // Letter-spacing adds charSpacing points per character on top of the glyphs.
  const firstW = textWidth(first, size.eyebrow, font.display, true) + first.length * (1.5 / 72);
  // Generous box so PowerPoint never wraps the label; the rule is placed from
  // the estimate, not the box.
  eyebrow(slide, first, { x, y, w: Math.max(firstW + 1.5, 4), onDark });
  if (!parts.length) return;
  const ruleX = x + firstW + 0.12;
  rect(pptx, slide, {
    x: ruleX, y: y + grid.eyebrowH / 2, w: 0.33, h: 0.012,
    fill: onDark ? color.accentOnDark : color.accent,
  });
  slide.addText(parts.join('  ·  ').toUpperCase(), {
    x: ruleX + 0.46, y, w: grid.right - (ruleX + 0.46), h: grid.eyebrowH,
    fontFace: font.display, fontSize: size.eyebrow,
    color: onDark ? color.onDarkMuted : color.muted,
    valign: 'middle', margin: 0,
  });
}

/** Tinted circle with a coloured numeral (runbook / step style). */
function badge(pptx, slide, label, { x, y, d = 0.34, tone: t = 'accent', fill, textColor }) {
  const s = toneOf(t);
  shapeText(pptx, slide, 'ellipse', label, {
    x, y, w: d, h: d,
    fill: { color: fill || s.tint },
    line: { color: fill || s.tint, width: 0 },
    align: 'center', valign: 'middle', margin: 0,
    fontFace: font.body, fontSize: d < 0.3 ? size.label : size.fine, bold: true,
    color: textColor || s.tintInk,
  });
}

/** Caps pill label on a tint ("EXISTING DESIGN"). Returns its width. */
function pill(pptx, slide, label, { x, y, tone: t = 'accent', h = 0.25 }) {
  const s = toneOf(t);
  const str = String(label).toUpperCase();
  const w = textWidth(str, size.label, font.body, true) + 0.26;
  shapeText(pptx, slide, 'roundRect', str, {
    x, y, w, h,
    fill: { color: s.tint },
    line: { color: s.tint, width: 0 },
    rectRadius: 0.05,
    align: 'center', valign: 'middle', margin: 0,
    fontFace: font.body, fontSize: size.label, bold: true, color: s.tintInk,
  });
  return w;
}

/** Back-compat: small tag chip. */
function chip(pptx, slide, label, { x, y, w, h = 0.25, tone: t = 'neutral' }) {
  const s = toneOf(t);
  shapeText(pptx, slide, 'roundRect', String(label), {
    x, y, w: w || textWidth(label, size.label) + 0.26, h,
    fill: { color: s.tint }, line: { color: s.tint, width: 0 },
    rectRadius: 0.05, align: 'center', valign: 'middle', margin: 0,
    fontFace: font.body, fontSize: size.label, bold: true, color: s.tintInk,
  });
}

/** Monospace run — identifiers, JIRA keys, constant names. */
function mono(slide, str, { x, y, w, h = 0.3, fontSize = size.fine, color: c = color.strong, bold = false, align = 'left', valign = 'middle' }) {
  slide.addText(String(str), {
    x, y, w, h, fontFace: font.mono, fontSize, color: c, bold, align, valign, margin: 0,
  });
}

/** Plain text box. */
function text(slide, content, opts = {}) {
  const {
    x, y, w, h,
    fontSize = size.body,
    color: c = color.body,
    face = font.body,
    bold = false,
    align = 'left',
    valign = 'top',
    lineSpacingMultiple = 1.15,
    charSpacing,
  } = opts;
  slide.addText(String(content), {
    x, y, w, h,
    fontFace: face, fontSize, color: c, bold, align, valign,
    lineSpacingMultiple, margin: 0,
    ...(charSpacing ? { charSpacing } : {}),
  });
}

/**
 * Mixed runs in a single paragraph.
 * Run fields: text, color (token or hex), face ('body'|'mono'|'display'),
 * size (token or pt), bold, italic, breakLine.
 */
function richText(slide, runs, opts = {}) {
  const {
    x, y, w, h,
    fontSize = size.body,
    color: baseColor = color.body,
    face = font.body,
    align = 'left',
    valign = 'top',
    lineSpacingMultiple = 1.2,
  } = opts;

  const resolved = runs.map((r) => ({
    text: r.text,
    options: {
      fontFace: r.face ? font[r.face] || r.face : face,
      fontSize: r.size ? size[r.size] || r.size : fontSize,
      color: r.color ? color[r.color] || r.color : baseColor,
      bold: !!r.bold,
      italic: !!r.italic,
      breakLine: !!r.breakLine,
    },
  }));

  slide.addText(resolved, { x, y, w, h, align, valign, lineSpacingMultiple, margin: 0 });
}

/**
 * "Label: value" line — bold label, regular value, both `strong`.
 * A string without ": " renders as a plain line.
 */
function keyValue(slide, line, { x, y, w, h, fontSize = size.small, onDark = false }) {
  const str = String(line);
  const i = str.indexOf(': ');
  const c = onDark ? color.onDarkText : color.strong;
  if (i === -1) {
    text(slide, str, { x, y, w, h, fontSize, color: c, lineSpacingMultiple: 1.15 });
    return;
  }
  richText(slide, [
    { text: `${str.slice(0, i + 1)} `, bold: true, color: c },
    { text: str.slice(i + 2), color: c },
  ], { x, y, w, h, fontSize, lineSpacingMultiple: 1.15 });
}

// --- icons ----------------------------------------------------------------

const ICON_DIR = path.join(__dirname, 'assets', 'icons');
const ICON_TINTS = ['accent', 'onDark', 'success', 'danger', 'warn', 'muted'];
const ICON_ALIASES = require('./tools/fa-catalog.js').ALIASES;

function resolveIconName(name) {
  return ICON_ALIASES[name] || name;
}

function iconNames() {
  const files = fs.readdirSync(ICON_DIR).filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4));
  return [...new Set([...files, ...Object.keys(ICON_ALIASES)])].sort();
}

/** Absolute PNG path for an icon; throws on unknown name or tint. */
function iconPath(name, tint = 'accent') {
  if (!ICON_TINTS.includes(tint)) throw new Error(`unknown icon tint "${tint}"`);
  const resolved = resolveIconName(name);
  const p = path.join(ICON_DIR, 'png', tint, `${resolved}.png`);
  if (!fs.existsSync(p)) {
    throw new Error(`unknown icon "${name}". Available: ${iconNames().join(', ')}`);
  }
  return p;
}

/**
 * Place an icon. Shipped as pre-rendered PNG — pptxgenjs's SVG embed writes a
 * broken-image fallback that Keynote and older Office display.
 */
function icon(slide, name, { x, y, size: s = 0.29, tint = 'accent' }) {
  slide.addImage({ path: iconPath(name, tint), x, y, w: s, h: s });
}

/** Dark disc with a centred icon (closing / decision slide). */
function iconDisc(pptx, slide, name, { cx, y, d = 0.5 }) {
  slide.addShape(pptx.ShapeType.ellipse, {
    x: cx - d / 2, y, w: d, h: d,
    fill: { color: color.accentDeep }, line: { color: color.accentDeep, width: 0 },
  });
  const s = d * 0.5;
  icon(slide, name, { x: cx - s / 2, y: y + (d - s) / 2, size: s, tint: 'onDark' });
}

/**
 * Meta row: LABEL over value, columns split by thin vertical rules.
 * items: [{ label, value, highlight }]. Returns the row width.
 */
function metaRow(pptx, slide, items, { x, y, onDark = true, align = 'left', maxW = grid.contentW }) {
  const gap = 0.56;
  const widths = items.map((it) => Math.min(
    maxW / Math.max(items.length, 1),
    Math.max(
      textWidth(it.label, size.eyebrow, font.body, true),
      textWidth(it.value, size.small, font.body),
    ) + 0.12,
  ));
  const total = widths.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
  let cursor = align === 'center' ? x - total / 2 : x;

  items.forEach((it, i) => {
    const w = widths[i];
    text(slide, String(it.label).toUpperCase(), {
      x: cursor, y, w, h: 0.19,
      fontSize: size.eyebrow, color: onDark ? color.muted : color.muted,
    });
    text(slide, it.value, {
      x: cursor, y: y + 0.23, w, h: 0.24,
      fontSize: size.small,
      color: it.highlight ? (onDark ? color.accentOnDark : color.accent) : (onDark ? color.onDarkText : color.ink),
    });
    if (i < items.length - 1) {
      rect(pptx, slide, {
        x: cursor + w + gap / 2, y, w: 0.012, h: 0.42,
        fill: onDark ? color.ruleDark : color.border,
      });
    }
    cursor += w + gap;
  });
  return total;
}

/** Quiet line under a content block — the template has no banners. */
function note(slide, spec, { x = grid.margin, y, w = grid.contentW }) {
  if (!spec) return;
  const runs = [];
  if (spec.lead) {
    runs.push({ text: `${spec.lead}  `, bold: true, color: spec.leadColor || 'accent' });
  }
  runs.push({ text: spec.text, color: 'muted' });
  richText(slide, runs, { x, y, w, h: 0.4, fontSize: size.small, lineSpacingMultiple: 1.2 });
}

/** Flow connector. `dir` is 'right' or 'down'. */
function connector(pptx, slide, dir, { x, y, w, h, fill = color.ruleStrong }) {
  const shape = dir === 'down' ? pptx.ShapeType.downArrow : pptx.ShapeType.rightArrow;
  const dims = dir === 'down'
    ? { w: w ?? 0.24, h: h ?? 0.36 }
    : { w: w ?? 0.3, h: h ?? 0.24 };
  slide.addShape(shape, {
    x, y, ...dims,
    fill: { color: fill },
    line: { color: fill, width: 0 },
  });
}

/** Hexagonal decision node — carries its own text. */
function decisionNode(pptx, slide, label, { x, y, w, h = 1.4, fontSize = size.eyebrow, highlight = false }) {
  shapeText(pptx, slide, 'hexagon', label, {
    x, y, w, h,
    fill: { color: highlight ? color.accentInk : color.white },
    line: { color: color.accent, width: highlight ? 2 : 1 },
    align: 'center', valign: 'middle',
    fontFace: font.mono, fontSize, color: highlight ? color.white : color.ink,
  });
}

/** Code-token colour names accepted in `lines` runs. */
const CODE_TOKENS = {
  text: color.codeText,
  white: color.codeText,
  keyword: color.codeKeyword,
  danger: color.codeKeyword,
  string: color.codeString,
  accent: color.codeString,
  literal: color.codeLiteral,
  warn: color.codeLiteral,
  comment: color.codeComment,
};

/**
 * Dark code panel: filename (top-left), language tag (top-right), tokenised
 * lines. `lines` entries are strings or arrays of { text, color } runs.
 */
function codePanel(pptx, slide, { x, y, w, h, filename, language, lines }) {
  card(pptx, slide, { x, y, w, h, fill: color.ink, line: color.ruleDark });
  const innerX = x + 0.26;
  const innerW = w - 0.52;

  if (filename) {
    mono(slide, filename, {
      x: innerX, y: y + 0.24, w: innerW - 0.7, h: 0.2,
      fontSize: size.label, color: color.accentOnDark,
    });
  }
  if (language) {
    text(slide, String(language).toUpperCase(), {
      x: x + w - 0.9, y: y + 0.24, w: 0.64, h: 0.2,
      fontSize: size.micro, color: color.muted, align: 'right',
    });
  }

  const top = y + (filename || language ? 0.56 : 0.26);
  const runs = [];
  lines.forEach((line, i) => {
    const parts = typeof line === 'string' ? [{ text: line }] : line;
    parts.forEach((p, j) => {
      runs.push({
        text: p.text,
        options: {
          fontFace: font.mono,
          fontSize: size.fine,
          color: CODE_TOKENS[p.color] || color[p.color] || p.color || color.codeText,
          breakLine: j === parts.length - 1 && i < lines.length - 1,
        },
      });
    });
  });
  slide.addText(runs, {
    x: innerX, y: top, w: innerW, h: Math.max(0.3, y + h - top - 0.2),
    valign: 'top', lineSpacingMultiple: 1.25, margin: 0,
  });
}

/** Height a code panel needs for `n` lines. */
function codePanelHeight(n, withHeader = true) {
  // PowerPoint's 1.25 line spacing on 11.25pt Consolas measures ~0.23in/line
  // (template: 13 lines in a 2.95in box).
  return (withHeader ? 0.56 : 0.26) + n * 0.235 + 0.3;
}

/** Set deck-level document properties and the exact widescreen canvas. */
function applyDocProps(pptx, meta = {}) {
  // DO NOT use the built-in 'LAYOUT_16x9' — despite the name it is 10 x 5.625in,
  // not 13.333 x 7.5, and silently pushes content off the slide.
  pptx.defineLayout({ name: 'LIS_WIDE', width: grid.W, height: grid.H });
  pptx.layout = 'LIS_WIDE';

  const emu = (inches) => Math.round(inches * 914400);
  if (pptx.presLayout.width !== emu(grid.W) || pptx.presLayout.height !== emu(grid.H)) {
    throw new Error(
      `canvas is ${pptx.presLayout.width / 914400} x ${pptx.presLayout.height / 914400}in, `
      + `expected ${grid.W} x ${grid.H}in`
    );
  }
  pptx.title = meta.title || 'LIS Design Review';
  pptx.subject = meta.subject || meta.title || 'LIS Design Review';
  pptx.author = meta.author || 'LIS Team';
  pptx.company = meta.company || 'Hospital Authority';
  if (meta.revision) pptx.revision = String(meta.revision);
}

module.exports = {
  color, tone, toneOf, toneAccent, font, size, grid, GLYPH,
  columns, gutter, centreY, textWidth, lineCount, textHeight,
  lightBg, darkBg, shapeText, card, panel, rect, eyebrow, heading, splitEyebrow,
  badge, pill, chip, mono, text, richText, keyValue,
  ICON_TINTS, ICON_ALIASES, iconNames, iconPath, icon, iconDisc, metaRow, note,
  connector, decisionNode, codePanel, codePanelHeight, CODE_TOKENS, applyDocProps,
};
