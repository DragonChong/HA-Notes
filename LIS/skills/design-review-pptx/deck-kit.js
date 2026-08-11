/**
 * deck-kit.js — design tokens + drawing primitives for LIS/HA design review decks.
 *
 * Extracted from LIS-10747_Ward_Assigned_Request_No_Reminder.pptx, the approved
 * reference deck. Every colour, font, size and coordinate in the archetypes comes
 * from here — nothing is invented at call sites.
 *
 * Canvas: 16:9, 13.333 x 7.5 in. All geometry is in inches.
 */

'use strict';

// ---------------------------------------------------------------------------
// Palette — 14 semantic tokens.
//
// teal  = current / correct / enabled      amber = attention / output
// red   = problem                          grey  = neutral / suppressed
// ---------------------------------------------------------------------------

const color = {
  ink: '08323B', // dark canvas, dark panels, table header, heading text
  elevated: '13525F', // raised card ON a dark canvas
  accent: '0B6E7F', // eyebrows, numerals, hexagon outlines, enabled values
  accentTint: 'E4F0F2', // accent-toned panel
  onDarkMuted: '8FBAC3', // secondary text on dark
  onDarkFaint: '6E9199', // tertiary text on dark
  body: '56676C', // body text on light; neutral/"suppressed" marker
  neutralTint: 'F1F3F3', // neutral panel
  warn: 'C87F22', // amber FILLS, arrows, and large display type only
  warnInk: '9A5C15', // amber TEXT on light grounds — `warn` fails AA there
  warnTint: 'FAEEDB', // amber callout banner, "shown" cells
  danger: 'A8443A', // problem markers, "!" badges
  dangerTint: 'F7E7E4', // problem card
  rule: 'D5DEE0', // table gridlines
  codeComment: '7F9AA1', // comment lines inside a dark code panel
  white: 'FFFFFF',
};

/** Panel tones -> { fill, line }. `outline` is the only stroked tone. */
const tone = {
  ink: { fill: color.ink, line: color.ink },
  elevated: { fill: color.elevated, line: color.elevated },
  accent: { fill: color.accentTint, line: color.accentTint },
  neutral: { fill: color.neutralTint, line: color.neutralTint },
  warn: { fill: color.warnTint, line: color.warnTint },
  danger: { fill: color.dangerTint, line: color.dangerTint },
  outline: { fill: color.neutralTint, line: color.onDarkMuted },
};

/**
 * Accent colour used for a tone's badge / tag / label.
 *
 * These are applied to *text* and to badge fills behind white text, so the warn
 * tone resolves to `warnInk` — plain `warn` is unreadable as text on its own
 * tint (2.81:1).
 */
const toneAccent = {
  ink: color.accent,
  elevated: color.accent,
  accent: color.accent,
  neutral: color.body,
  warn: color.warnInk,
  danger: color.danger,
  outline: color.accent,
};

// ---------------------------------------------------------------------------
// Typography — 3 Office-standard families. Nothing else is permitted;
// HA Windows desktops are not guaranteed to have anything more exotic.
// ---------------------------------------------------------------------------

const font = {
  display: 'Cambria', // headings only
  body: 'Calibri', // body + UI
  mono: 'Courier New', // code, identifiers, JIRA keys
};

/** The type ladder. Every text size in the deck is one of these. */
const size = {
  micro: 9, // stat-chip caption, condition-strip label
  chip: 9.5, // pill tag text
  label: 10, // sidebar eyebrow
  eyebrow: 11, // section eyebrow, branch labels
  fine: 11.5, // dense footnotes
  small: 12, // captions, secondary body
  bodySm: 12.5, // card body in dense layouts
  body: 13, // default body
  lead: 14, // callout banner, stat-chip value
  cardTitleSm: 15, // finding titles
  cardTitle: 16, // scope-row titles
  cardTitleLg: 17, // takeaway card titles
  cardTitleXl: 18, // step card titles
  sidebar: 22, // sidebar headline
  headingSm: 26, // closing headline
  heading: 30, // slide H1
  hero: 40, // title-slide hero
  stat: 62, // closing date / big number
};

// ---------------------------------------------------------------------------
// Grid
// ---------------------------------------------------------------------------

const grid = {
  // Widescreen is exactly 40/3 in = 12192000 EMU. Writing 13.333 rounds to
  // 12191227 and the canvas no longer matches a PowerPoint-authored deck.
  W: 40 / 3,
  H: 7.5,

  margin: 0.6, // content slides
  marginDark: 0.75, // dark bookend slides
  contentW: 12.13, // 0.60 -> 12.73
  right: 12.73, // hard right edge

  eyebrowY: 0.38,
  eyebrowH: 0.3,
  headingY: 0.68,
  headingH: 0.7,

  bandTop: 1.9, // top of the main content band
  bandTopLoose: 2.25, // when the band is short and wants centring
  bandBottom: 6.68, // bottom band must end by here

  pad: 0.3, // card interior padding

  // Safe area — qa-deck.js enforces this.
  safe: { x0: 0.6, x1: 12.73, y0: 0.38, y1: 6.95 },
};

/**
 * Evenly divide the content width into `n` columns with `gap` between them.
 * 3 cols @ 0.30 gap -> 3.72 wide (matches the reference deck exactly).
 */
function columns(n, gap = 0.3, left = grid.margin, width = grid.contentW) {
  const w = (width - gap * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => ({ x: left + i * (w + gap), w }));
}

// ---------------------------------------------------------------------------
// Primitives
//
// Core technique from the reference deck: shapes are FILL-ONLY, and text is a
// separately-positioned textbox laid over them. That is what gives exact control
// over padding and alignment. Only flow nodes and chips carry their own text.
// ---------------------------------------------------------------------------

/** Paint the whole slide with the dark canvas. */
function darkBg(slide) {
  slide.background = { color: color.ink };
}

/** Fill-only rounded panel. */
function panel(pptx, slide, { x, y, w, h, tone: t = 'neutral', radius = 0.04 }) {
  const s = tone[t] || tone.neutral;
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: s.fill },
    line: { color: s.line, width: 1 },
    rectRadius: radius,
  });
}

/** Uppercase section label. `·`-separated when it carries metadata. */
function eyebrow(slide, text, { x = grid.margin, y = grid.eyebrowY, w = 9.0, onDark = false } = {}) {
  slide.addText(String(text).toUpperCase(), {
    x, y, w, h: grid.eyebrowH,
    fontFace: font.body,
    fontSize: onDark ? size.eyebrow : size.eyebrow,
    color: onDark ? color.onDarkMuted : color.accent,
    charSpacing: 1.4,
    valign: 'middle',
  });
}

/** Slide H1 — Cambria 30pt, always paired with an eyebrow. */
function heading(slide, text, { x = grid.margin, y = grid.headingY, w = 11.5, onDark = false } = {}) {
  slide.addText(String(text), {
    x, y, w, h: grid.headingH,
    fontFace: font.display,
    fontSize: size.heading,
    color: onDark ? color.white : color.ink,
    valign: 'middle',
  });
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

/** Numbered / lettered circular badge. */
function badge(pptx, slide, label, { x, y, d = 0.42, fill = color.accent }) {
  shapeText(pptx, slide, 'ellipse', label, {
    x, y, w: d, h: d,
    fill: { color: fill },
    line: { color: fill, width: 0 },
    align: 'center',
    valign: 'middle',
    fontFace: font.body,
    fontSize: size.body,
    color: color.white,
    bold: true,
  });
}

/** Small pill tag — service names, "Test", environment labels. */
function chip(pptx, slide, label, { x, y, w = 1.06, h = 0.32, tone: t = 'accent' }) {
  const s = tone[t] || tone.accent;
  const fg = t === 'ink' || t === 'elevated' ? color.onDarkMuted : toneAccent[t] || color.accent;
  shapeText(pptx, slide, 'roundRect', label, {
    x, y, w, h,
    fill: { color: s.fill },
    line: { color: s.line, width: 1 },
    rectRadius: 0.08,
    align: 'center',
    valign: 'middle',
    fontFace: font.body,
    fontSize: size.chip,
    color: fg,
  });
}

/** Monospace run — identifiers, JIRA keys, constant names. */
function mono(slide, text, { x, y, w, h = 0.34, fontSize = size.body, color: c = color.body, bold = false, align = 'left' }) {
  slide.addText(String(text), {
    x, y, w, h,
    fontFace: font.mono,
    fontSize,
    color: c,
    bold,
    align,
    valign: 'middle',
  });
}

/** Plain body copy. */
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
  } = opts;
  slide.addText(String(content), {
    x, y, w, h,
    fontFace: face, fontSize, color: c, bold, align, valign,
    lineSpacingMultiple,
  });
}

/**
 * Mixed-colour runs in a single paragraph — the emphasis technique.
 *
 *   richText(slide, [
 *     { text: 'The blocker: ', color: 'warn', bold: true },
 *     { text: 'QEH is the only hospital hardcoded today.' },
 *   ], { x, y, w, h })
 *
 * Run fields: text, color (token name or hex), face ('body'|'mono'|'display'),
 * size (token name or pt number), bold, italic, breakLine.
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

  slide.addText(resolved, { x, y, w, h, align, valign, lineSpacingMultiple });
}

/** Flow connector. `dir` is 'right' or 'down'. */
function connector(pptx, slide, dir, { x, y, w, h, fill = color.onDarkMuted }) {
  const shape = dir === 'down' ? pptx.ShapeType.downArrow : pptx.ShapeType.rightArrow;
  const dims = dir === 'down'
    ? { w: w ?? 0.28, h: h ?? 0.42 }
    : { w: w ?? 0.3, h: h ?? 0.26 };
  slide.addShape(shape, {
    x, y, ...dims,
    fill: { color: fill },
    line: { color: fill, width: 0 },
  });
}

/** Hexagonal decision node — carries its own text. */
function decisionNode(pptx, slide, label, { x, y, w, h = 1.5, fontSize = size.eyebrow }) {
  shapeText(pptx, slide, 'hexagon', label, {
    x, y, w, h,
    fill: { color: color.accentTint },
    line: { color: color.accent, width: 1 },
    align: 'center',
    valign: 'middle',
    fontFace: font.mono,
    fontSize,
    color: color.ink,
  });
}

/**
 * Dark code panel with pseudo-syntax-highlighted lines.
 *
 * `lines` is an array of either a plain string, or an array of runs
 * ({ text, color }) for per-token colouring. Recognised token colours:
 * 'white' (default), 'warn' (literals/keywords worth flagging),
 * 'onDarkFaint'/'comment' (comments).
 */
function codePanel(pptx, slide, { x, y, w, h, filename, lines, caption, fontSize = size.lead }) {
  panel(pptx, slide, { x, y, w, h, tone: 'ink' });

  const innerX = x + grid.pad;
  const innerW = w - grid.pad * 2;
  let cursor = y + 0.2;

  if (filename) {
    mono(slide, filename, {
      x: innerX, y: cursor, w: innerW - 0.05, h: 0.3,
      fontSize: size.eyebrow, color: color.onDarkMuted,
    });
    cursor += 0.45;
  }

  // Code body occupies everything between the filename and the caption, so the
  // panel never has to be resized when a line is added.
  const captionH = caption ? 0.63 : 0.2;
  const codeH = Math.max(0.4, y + h - captionH - cursor);

  const runs = [];
  lines.forEach((line, i) => {
    const parts = typeof line === 'string' ? [{ text: line }] : line;
    parts.forEach((p, j) => {
      const last = j === parts.length - 1;
      runs.push({
        text: p.text,
        options: {
          fontFace: font.mono,
          fontSize,
          color: p.color === 'comment' ? color.codeComment : color[p.color] || p.color || color.white,
          breakLine: last && i < lines.length - 1,
        },
      });
    });
  });

  slide.addText(runs, {
    x: innerX, y: cursor, w: innerW, h: codeH,
    valign: 'top', lineSpacingMultiple: 1.3,
  });

  if (caption) {
    text(slide, caption, {
      x: innerX, y: y + h - captionH, w: innerW, h: 0.45,
      fontSize: size.small, color: color.onDarkMuted,
    });
  }
}

/**
 * Full-width bottom band. Every slide gets one — nothing floats.
 *
 * kinds:
 *   'callout'   tinted banner, optional amber lead-in run
 *   'condition' dark strip: label + monospace condition + trailing note
 *   'footnote'  plain grey text, no panel
 */
function bottomBand(pptx, slide, kind, spec = {}) {
  const { y = 5.45, x = grid.margin, w = grid.contentW } = spec;

  if (kind === 'footnote') {
    text(slide, spec.text, {
      x, y, w: spec.w ?? 6.05, h: spec.h ?? 0.8,
      fontSize: size.small, color: color.body,
    });
    return;
  }

  if (kind === 'condition') {
    const h = spec.h ?? 1.0;
    panel(pptx, slide, { x, y, w, h, tone: 'ink' });
    text(slide, String(spec.label ?? 'Effective condition').toUpperCase(), {
      x: x + 0.35, y: y + 0.14, w: 3.5, h: 0.26,
      fontSize: size.micro, color: color.onDarkMuted,
    });
    mono(slide, spec.code, {
      x: x + 0.35, y: y + 0.44, w: spec.note ? 8.35 : w - 0.7, h: 0.38,
      fontSize: size.body, color: color.white,
    });
    if (spec.note) {
      text(slide, spec.note, {
        x: x + 8.75, y: y + 0.46, w: 3.05, h: 0.4,
        fontSize: size.eyebrow, color: color.onDarkMuted,
      });
    }
    return;
  }

  // 'callout'
  const h = spec.h ?? 0.95;
  panel(pptx, slide, { x, y, w, h, tone: spec.tone ?? 'warn' });
  const runs = spec.lead
    ? [{ text: `${spec.lead}  `, color: spec.leadColor ?? 'warnInk', bold: true }, { text: spec.text, color: 'ink' }]
    : [{ text: spec.text, color: 'ink' }];
  richText(slide, runs, {
    x: x + 0.35, y: y + 0.15, w: w - 0.73, h: h - 0.3,
    fontSize: size.lead, valign: 'middle',
  });
}

/** Set deck-level document properties (fixes PptxGenJS's default subject). */
function applyDocProps(pptx, meta = {}) {
  // DO NOT use the built-in 'LAYOUT_16x9' — despite the name it is 10 x 5.625in,
  // not 13.333 x 7.5. Every coordinate in this kit assumes the latter, so that
  // layout silently pushes the bottom band and the right column off the slide.
  // Define the canvas from the grid constants instead, so the two cannot drift.
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
  color, tone, toneAccent, font, size, grid, columns,
  darkBg, panel, eyebrow, heading, badge, chip, mono, text, richText, shapeText,
  connector, decisionNode, codePanel, bottomBand, applyDocProps,
};
