/**
 * archetypes.js — the slide patterns, drawn in the Technical Design Review
 * Template style.
 *
 * Each archetype takes a spec object (slots) and draws a slide using only
 * deck-kit primitives. Content blocks are measured, then centred vertically in
 * the band below the header, as the template does.
 *
 * Every archetype signature: (pptx, slide, spec) => void
 */

'use strict';

const fs = require('fs');
const K = require('./deck-kit');
const { color, font, size, grid, columns, gutter, centreY } = K;

/** Light canvas + eyebrow + H1. Returns the y where content may begin. */
function header(slide, spec) {
  K.lightBg(slide);
  if (spec.eyebrow) K.eyebrow(slide, spec.eyebrow);
  if (spec.title) K.heading(slide, spec.title);
  return grid.bandTop;
}

/** Pixel size of a PNG or JPEG — used to keep image aspect ratio on slides. */
function imagePixelSize(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  const buf = fs.readFileSync(filePath);
  if (buf.length >= 24 && buf[0] === 0x89 && buf.toString('ascii', 1, 4) === 'PNG') {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 8) {
      if (buf[i] !== 0xff) { i += 1; continue; }
      const marker = buf[i + 1];
      if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
        return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
      }
      if (marker === 0xd9 || marker === 0xda) break;
      const len = buf.readUInt16BE(i + 2);
      i += 2 + len;
    }
  }
  return null;
}

/** Largest size that fits in the box without changing aspect ratio. */
function fitContain(boxW, boxH, imgW, imgH) {
  const ratio = imgW / imgH;
  let w = boxW;
  let h = boxW / ratio;
  if (h > boxH) {
    h = boxH;
    w = boxH * ratio;
  }
  return { w, h };
}

const hasBadge = (b) => b !== undefined && b !== false && b !== null;

/** "01"-style numeral for numbers; strings pass through. */
const numeral = (v) => (typeof v === 'number' ? String(v).padStart(2, '0') : String(v));

/** Tone for a small accent element: a neutral card still uses sky accents. */
const accentTone = (t) => (!t || t === 'neutral' ? 'accent' : t);

// ---------------------------------------------------------------------------
// title-hero — dark cover
// ---------------------------------------------------------------------------
function titleHero(pptx, slide, spec) {
  K.darkBg(slide);
  const M = grid.marginDark;
  const headline = spec.headline || spec.title || '';
  const heroW = 9.95;
  const heroH = K.lineCount(headline, size.hero, heroW, font.display) * (size.hero / 72) * 1.12;
  const ledeW = 7.2;
  const ledeH = spec.lede ? K.textHeight(spec.lede, size.lede, ledeW, font.body, 1.25) : 0;

  const meta = (spec.stats || []).map((s) => ({ label: s.label, value: s.value, highlight: !!s.highlight }));
  if (spec.presenters) meta.push({ label: 'Presenters', value: spec.presenters });
  if (spec.reviewers) meta.push({ label: 'Reviewers', value: spec.reviewers });

  const blockH = 0.4 + heroH + (ledeH ? 0.2 + ledeH : 0) + (meta.length ? 0.42 + 0.47 : 0);
  let y = Math.max(0.9, 3.75 - blockH / 2);

  if (spec.eyebrow) K.splitEyebrow(pptx, slide, spec.eyebrow, { x: M, y, onDark: true });
  y += 0.4;
  K.text(slide, headline, {
    x: M, y, w: heroW, h: heroH,
    face: font.display, fontSize: size.hero, color: color.white, lineSpacingMultiple: 1.05,
  });
  y += heroH;
  if (spec.lede) {
    y += 0.2;
    K.text(slide, spec.lede, {
      x: M, y, w: ledeW, h: ledeH,
      fontSize: size.lede, color: color.onDarkMuted, lineSpacingMultiple: 1.2,
    });
    y += ledeH;
  }
  if (meta.length) {
    y += 0.42;
    K.metaRow(pptx, slide, meta, { x: M, y, onDark: true, maxW: grid.W - M * 2 });
  }
  if (spec.footer) {
    K.text(slide, spec.footer, {
      x: M, y: 6.62, w: 11.5, h: 0.24, fontSize: size.eyebrow, color: color.muted,
    });
  }
}

// ---------------------------------------------------------------------------
// agenda — numbered row cards
// ---------------------------------------------------------------------------
function agenda(pptx, slide, spec) {
  header(slide, spec);
  const items = (spec.items || []).map((it) => (typeof it === 'string' ? { title: it } : it));
  const n = Math.max(items.length, 1);
  const gap = 0.16;
  const avail = grid.bandBottom - grid.bandTop - (spec.footnote ? 0.6 : 0);
  const rowH = Math.min(0.88, (avail - gap * (n - 1)) / n);
  const blockH = n * rowH + (n - 1) * gap;
  const y0 = centreY(blockH);
  const tx = grid.margin + 0.8;
  const tw = grid.contentW - 1.06;

  items.forEach((it, i) => {
    const y = y0 + i * (rowH + gap);
    K.card(pptx, slide, { x: grid.margin, y, w: grid.contentW, h: rowH });
    K.text(slide, numeral(it.badge ?? i + 1), {
      x: grid.margin + 0.26, y, w: 0.55, h: rowH,
      face: font.display, fontSize: size.cardTitle, color: color.accent, valign: 'middle',
    });
    if (it.note) {
      K.text(slide, it.title, {
        x: tx, y: y + rowH / 2 - 0.28, w: tw, h: 0.27,
        fontSize: size.body, bold: true, color: color.ink, valign: 'middle',
      });
      K.text(slide, it.note, {
        x: tx, y: y + rowH / 2 + 0.01, w: tw, h: 0.24,
        fontSize: size.fine, color: color.muted, valign: 'middle',
      });
    } else {
      K.text(slide, it.title, {
        x: tx, y, w: tw, h: rowH, fontSize: size.body, bold: true, color: color.ink, valign: 'middle',
      });
    }
  });

  if (spec.footnote) K.note(slide, { text: spec.footnote }, { y: y0 + blockH + 0.25 });
}

// ---------------------------------------------------------------------------
// cards — 2/3/4-up grid: icon cards, ADR columns, stage cards
// ---------------------------------------------------------------------------
function cards(pptx, slide, spec) {
  header(slide, spec);
  const items = spec.cards || [];
  const perRow = spec.perRow || Math.min(items.length, 3) || 1;
  const rows = Math.ceil(items.length / perRow);
  const cols = columns(perRow, gutter(perRow));
  const w = cols[0].w;
  const compact = perRow >= 4;
  const pad = compact ? 0.26 : 0.3;
  const innerW = w - pad * 2;
  const titleSize = compact ? size.body : size.cardTitle;
  const bodySize = compact ? size.small : size.body;

  // Measure each card's stack so cards hug their content.
  const layout = items.map((c) => {
    const parts = [];
    let h = pad + 0.05;
    if (c.icon) { parts.push(['icon', h]); h += 0.5; }
    if (hasBadge(c.badge)) { parts.push(['badge', h]); h += 0.48; }
    if (c.label) { parts.push(['label', h]); h += 0.3; }
    if (c.tag) { parts.push(['tag', h]); h += 0.3; }
    const th = K.textHeight(c.title || '', titleSize, innerW, font.display, 1.15);
    parts.push(['title', h, th]);
    h += th + 0.1;
    if (c.body) {
      const bh = K.textHeight(c.body, bodySize, innerW, font.body, 1.25);
      parts.push(['body', h, bh]);
      h += bh;
    }
    return { parts, h: h + pad + 0.05 };
  });

  const rowGap = 0.25;
  const noteH = spec.callout ? 0.6 : 0;
  const rowH = [];
  for (let r = 0; r < rows; r++) {
    rowH.push(Math.max(1.6, ...layout.slice(r * perRow, (r + 1) * perRow).map((l) => l.h)));
  }
  let blockH = rowH.reduce((a, b) => a + b, 0) + rowGap * (rows - 1);
  const avail = grid.bandBottom - grid.bandTop - noteH;
  if (blockH > avail) {
    const k = (avail - rowGap * (rows - 1)) / (blockH - rowGap * (rows - 1));
    rowH.forEach((h, i) => { rowH[i] = h * k; });
    blockH = avail;
  }
  const y0 = centreY(blockH + noteH);

  let rowY = y0;
  items.forEach((c, i) => {
    const r = Math.floor(i / perRow);
    if (i > 0 && i % perRow === 0) rowY += rowH[r - 1] + rowGap;
    const { x } = cols[i % perRow];
    const h = rowH[r];
    const t = K.toneOf(c.tone);
    const at = K.toneOf(accentTone(c.tone));
    K.card(pptx, slide, { x, y: rowY, w, h, tone: c.tone, highlight: !!c.highlight });
    const ix = x + pad;

    layout[i].parts.forEach(([kind, off, ph]) => {
      const py = rowY + off;
      if (kind === 'icon') {
        K.icon(slide, c.icon, { x: ix, y: py, tint: t.dark ? 'onDark' : at.icon });
      } else if (kind === 'badge') {
        K.badge(pptx, slide, c.badge, { x: ix, y: py, tone: accentTone(c.tone) });
      } else if (kind === 'label') {
        K.text(slide, String(c.label).toUpperCase(), {
          x: ix, y: py, w: innerW, h: 0.2,
          fontSize: size.micro, bold: true, charSpacing: 1.2, color: t.dark ? color.accentOnDark : at.ink,
        });
      } else if (kind === 'tag') {
        K.text(slide, String(c.tag).toUpperCase(), {
          x: ix, y: py, w: innerW, h: 0.22,
          face: font.display, fontSize: size.eyebrow, color: t.dark ? color.accentOnDark : at.ink,
        });
      } else if (kind === 'title') {
        K.text(slide, c.title, {
          x: ix, y: py, w: innerW, h: ph,
          face: font.display, fontSize: titleSize, color: t.dark ? color.white : color.ink,
          lineSpacingMultiple: 1.1,
        });
      } else if (kind === 'body') {
        K.text(slide, c.body, {
          x: ix, y: py, w: innerW, h: Math.max(0.25, rowY + h - py - pad * 0.6),
          fontSize: bodySize, color: t.dark ? color.onDarkMuted : color.body, lineSpacingMultiple: 1.2,
        });
      }
    });
  });

  if (spec.callout) K.note(slide, spec.callout, { y: y0 + blockH + 0.25 });
}

// ---------------------------------------------------------------------------
// stats — one hero number, or a 2-4 card grid of numbers
// ---------------------------------------------------------------------------
function stats(pptx, slide, spec) {
  header(slide, spec);
  const items = (spec.stats || []).slice(0, 4);

  if (items.length === 1) {
    const s = items[0];
    const cx = grid.W / 2;
    const valH = (size.stat / 72) * 1.05;
    const bodyW = 6.8;
    const bodyH = s.body ? K.textHeight(s.body, size.body, bodyW, font.body, 1.2) : 0;
    const blockH = valH + 0.15 + (s.label ? 0.45 : 0) + bodyH;
    let y = centreY(blockH);
    K.text(slide, s.value, {
      x: cx - 4.5, y, w: 9, h: valH,
      face: font.display, fontSize: size.stat, color: color.accent, align: 'center', valign: 'middle',
    });
    y += valH + 0.15;
    if (s.label) {
      K.text(slide, s.label, {
        x: cx - bodyW / 2, y, w: bodyW, h: 0.4,
        face: font.display, fontSize: size.statLabel, color: color.ink, align: 'center', valign: 'middle',
      });
      y += 0.45;
    }
    if (s.body) {
      K.text(slide, s.body, {
        x: cx - bodyW / 2, y, w: bodyW, h: bodyH,
        fontSize: size.body, color: color.muted, align: 'center', lineSpacingMultiple: 1.15,
      });
    }
  } else if (items.length) {
    const n = items.length;
    const cols = columns(n, gutter(n));
    const w = cols[0].w;
    const bodyH = Math.max(0, ...items.map((s) => (s.body
      ? K.textHeight(s.body, size.eyebrow, w - 0.4, font.body, 1.2) : 0)));
    const h = 1.25 + bodyH + 0.4;
    const y = centreY(h);
    items.forEach((s, i) => {
      const { x } = cols[i];
      K.card(pptx, slide, { x, y, w, h });
      K.text(slide, s.value, {
        x: x + 0.1, y: y + 0.34, w: w - 0.2, h: 0.6,
        face: font.display, fontSize: size.hero, color: color.accent, align: 'center', valign: 'middle',
      });
      if (s.label) {
        K.text(slide, s.label, {
          x: x + 0.2, y: y + 0.97, w: w - 0.4, h: 0.26,
          fontSize: size.small, bold: true, color: color.strong, align: 'center',
        });
      }
      if (s.body) {
        K.text(slide, s.body, {
          x: x + 0.2, y: y + 1.25, w: w - 0.4, h: bodyH + 0.05,
          fontSize: size.eyebrow, color: color.muted, align: 'center', lineSpacingMultiple: 1.15,
        });
      }
    });
  }

  if (spec.callout) K.note(slide, spec.callout, { y: 6.5 });
}

// ---------------------------------------------------------------------------
// compare — two cards: existing vs proposed, key-value pairs, or runbooks
// ---------------------------------------------------------------------------
function compare(pptx, slide, spec) {
  header(slide, spec);
  const sides = [spec.left, spec.right].filter(Boolean);
  const cols = columns(2, gutter(2));
  const w = cols[0].w;
  const pad = 0.3;
  const innerW = w - pad * 2;
  const lineH = (pt) => (pt / 72) * 1.25;

  const measure = (s) => {
    let h = pad + 0.02 + 0.5;
    if (s.code && s.code.length) h += s.code.length * 0.21 + 0.24 + 0.15;
    if (s.body) h += K.textHeight(s.body, size.small, innerW, font.body, 1.25) + 0.1;
    (s.points || []).forEach((p) => { h += K.lineCount(p, size.small, innerW) * lineH(size.small) + 0.15; });
    (s.steps || []).forEach((p) => {
      const str = typeof p === 'string' ? p : p.text;
      h += K.lineCount(str, size.fine, innerW - 0.37) * lineH(size.fine) + 0.17;
    });
    return h + pad;
  };

  const noteH = spec.callout ? 0.6 : 0;
  const h = Math.min(Math.max(1.8, ...sides.map(measure)), grid.bandBottom - grid.bandTop - noteH);
  const y = centreY(h + noteH);

  sides.forEach((s, i) => {
    const { x } = cols[i];
    const tn = s.tone || (i === 0 ? 'danger' : 'accent');
    const t = K.toneOf(tn);
    const highlight = s.highlight ?? (i === 1 && !!s.label && tn === 'accent');
    K.card(pptx, slide, { x, y, w, h, highlight });

    const ix = x + pad;
    let cy = y + pad + 0.02;
    let tx = ix;
    if (s.label) {
      tx = ix + K.pill(pptx, slide, s.label, { x: ix, y: cy + 0.035, tone: tn }) + 0.12;
    } else if (s.icon) {
      K.icon(slide, s.icon, { x: ix, y: cy + 0.015, tint: K.toneOf(accentTone(tn)).icon });
      tx = ix + 0.4;
    }
    if (s.title) {
      K.text(slide, s.title, {
        x: tx, y: cy, w: x + w - pad - tx, h: 0.32,
        face: font.display, fontSize: size.cardTitle, color: color.ink, valign: 'middle',
      });
    }
    cy += 0.5;

    if (s.code && s.code.length) {
      const ch = s.code.length * 0.21 + 0.24;
      K.card(pptx, slide, {
        x: ix, y: cy, w: innerW, h: ch, fill: color.headerFill, line: color.headerFill, radius: 0.06,
      });
      K.mono(slide, s.code.join('\n'), {
        x: ix + 0.14, y: cy + 0.12, w: innerW - 0.28, h: ch - 0.24,
        fontSize: size.fine, color: color.strong, valign: 'top',
      });
      cy += ch + 0.15;
    }
    if (s.body) {
      const bh = K.textHeight(s.body, size.small, innerW, font.body, 1.25);
      K.text(slide, s.body, {
        x: ix, y: cy, w: innerW, h: bh, fontSize: size.small, color: color.strong, lineSpacingMultiple: 1.2,
      });
      cy += bh + 0.1;
    }
    (s.points || []).forEach((p) => {
      const lh = K.lineCount(p, size.small, innerW) * lineH(size.small);
      K.keyValue(slide, p, { x: ix, y: cy, w: innerW, h: lh + 0.02 });
      cy += lh + 0.15;
    });
    (s.steps || []).forEach((p, j) => {
      const str = typeof p === 'string' ? p : p.text;
      const lh = K.lineCount(str, size.fine, innerW - 0.37) * lineH(size.fine);
      K.badge(pptx, slide, j + 1, { x: ix, y: cy - 0.03, d: 0.25, tone: accentTone(tn) });
      K.text(slide, str, {
        x: ix + 0.37, y: cy, w: innerW - 0.37, h: lh + 0.02, fontSize: size.fine, color: color.strong,
      });
      cy += lh + 0.17;
    });
  });

  if (spec.callout) K.note(slide, spec.callout, { y: y + h + 0.25 });
}

// ---------------------------------------------------------------------------
// image — diagram in a card, optionally beside a stack of cards
// ---------------------------------------------------------------------------
function image(pptx, slide, spec) {
  header(slide, spec);
  const px = imagePixelSize(spec.path);
  const innerPad = 0.13;
  const side = spec.cards && spec.cards.length ? (spec.side === 'left' ? 'left' : 'right') : null;
  const capReserve = spec.caption ? 0.45 : 0;
  const bandH = grid.bandBottom - grid.bandTop - capReserve;

  if (!side) {
    const boxW = grid.contentW - innerPad * 2;
    const boxH = bandH - innerPad * 2;
    const fitted = px ? fitContain(boxW, boxH, px.w, px.h) : { w: boxW, h: boxH };
    const panelW = fitted.w + innerPad * 2;
    const panelH = fitted.h + innerPad * 2;
    const panelX = grid.margin + (grid.contentW - panelW) / 2;
    const panelY = centreY(panelH + capReserve);
    if (spec.panel !== false) K.card(pptx, slide, { x: panelX, y: panelY, w: panelW, h: panelH });
    slide.addImage({ path: spec.path, x: panelX + innerPad, y: panelY + innerPad, w: fitted.w, h: fitted.h });
    if (spec.caption) {
      K.text(slide, spec.caption, {
        x: grid.margin, y: panelY + panelH + 0.12, w: grid.contentW, h: 0.3,
        fontSize: size.fine, color: color.muted, align: 'center',
      });
    }
    return;
  }

  // Image column + card column (template: 5.82 + 0.37 gap + 5.81).
  const imgColW = 5.82;
  const gapX = 0.37;
  const cardColW = grid.contentW - imgColW - gapX;
  const imgX = side === 'right' ? grid.margin : grid.margin + cardColW + gapX;
  const cardX = side === 'right' ? grid.margin + imgColW + gapX : grid.margin;

  const fitted = px
    ? fitContain(imgColW - innerPad * 2, 4.32, px.w, px.h)
    : { w: imgColW - innerPad * 2, h: 4.32 };
  const panelH = fitted.h + innerPad * 2;

  const cw = cardColW - 0.52;
  const cardH = spec.cards.map((c) => 0.26 + 0.3
    + (c.body ? K.textHeight(c.body, size.small, cw - (c.icon ? 0.4 : 0), font.body, 1.2) : 0) + 0.26);
  const stackGap = 0.19;
  const stackH = cardH.reduce((a, b) => a + b, 0) + stackGap * (spec.cards.length - 1);
  const blockH = Math.max(panelH, stackH) + capReserve;
  const y0 = centreY(blockH);

  const panelY = y0 + (blockH - capReserve - panelH) / 2;
  if (spec.panel !== false) K.card(pptx, slide, { x: imgX, y: panelY, w: imgColW, h: panelH });
  slide.addImage({
    path: spec.path,
    x: imgX + (imgColW - fitted.w) / 2, y: panelY + innerPad, w: fitted.w, h: fitted.h,
  });
  if (spec.caption) {
    K.text(slide, spec.caption, {
      x: imgX, y: panelY + panelH + 0.12, w: imgColW, h: 0.3,
      fontSize: size.fine, color: color.muted, align: 'center',
    });
  }

  let cy = y0 + (blockH - capReserve - stackH) / 2;
  spec.cards.forEach((c, i) => {
    const h = cardH[i];
    K.card(pptx, slide, { x: cardX, y: cy, w: cardColW, h });
    let tx = cardX + 0.26;
    if (c.icon) {
      K.icon(slide, c.icon, { x: tx, y: cy + 0.27, size: 0.26, tint: K.toneOf(accentTone(c.tone)).icon });
      tx += 0.4;
    }
    K.text(slide, c.title, {
      x: tx, y: cy + 0.24, w: cardX + cardColW - 0.26 - tx, h: 0.3,
      face: font.display, fontSize: size.body, color: color.ink, valign: 'middle',
    });
    if (c.body) {
      K.text(slide, c.body, {
        x: tx, y: cy + 0.56, w: cardX + cardColW - 0.26 - tx, h: h - 0.7,
        fontSize: size.small, color: color.body, lineSpacingMultiple: 1.15,
      });
    }
    cy += h + stackGap;
  });
}

// ---------------------------------------------------------------------------
// matrix — borderless table in a card, optional takeaway cards
// ---------------------------------------------------------------------------
function matrix(pptx, slide, spec) {
  header(slide, spec);
  const t = spec.table;
  const raw = t.colWidths || Array(t.headers.length).fill(1);
  const sum = raw.reduce((a, b) => a + b, 0);
  const colW = raw.map((v) => (v * grid.contentW) / sum);
  const rowH = 0.5;

  const none = { type: 'none' };
  const hair = { type: 'solid', pt: 0.75, color: color.border };
  const underline = { type: 'solid', pt: 1.5, color: color.ruleStrong };
  const toneText = {
    accent: color.accent, danger: color.danger, warn: color.warnInk,
    success: color.successInk, neutral: color.muted,
  };

  const headerRow = t.headers.map((h) => {
    const o = typeof h === 'string' ? { text: h } : h;
    return {
      text: o.text,
      options: {
        fill: { color: color.headerFill }, color: color.ink, bold: true,
        fontFace: o.mono ? font.mono : font.body, fontSize: size.fine,
        align: 'left', valign: 'middle', border: [none, none, underline, none],
      },
    };
  });

  const last = t.rows.length - 1;
  const bodyRows = t.rows.map((row, ri) => row.map((cell) => {
    const c = typeof cell === 'string' ? { text: cell } : cell;
    let fg = color.body;
    if (c.color) fg = color[c.color] || c.color;
    else if (c.tone) fg = toneText[c.tone] || color.strong;
    else if (c.mono) fg = color.accent;
    return {
      text: c.text,
      options: {
        fill: { color: color.white }, color: fg,
        bold: !!c.bold || (!!c.tone && c.tone !== 'neutral'),
        fontFace: c.mono ? font.mono : font.body, fontSize: size.fine,
        align: 'left', valign: 'middle', border: [none, none, ri < last ? hair : none, none],
      },
    };
  }));

  const tableH = rowH * (bodyRows.length + 1);
  const takeaways = spec.takeaways || [];
  const tkCols = takeaways.length ? columns(takeaways.length, gutter(takeaways.length)) : [];
  const tkH = takeaways.length
    ? Math.max(1.1, ...takeaways.map((c) => 0.62
      + K.textHeight(c.body || '', size.small, tkCols[0].w - 0.6, font.body, 1.2) + 0.3))
    : 0;
  const blockH = tableH + (tkH ? 0.3 + tkH : 0);
  const y = centreY(blockH);

  // pptxgenjs table margin: if [0] >= 1 the values are points; if [0] < 1
  // they are inches. `[0, 16, 0, 16]` was read as 16" of side padding and
  // crushed every cell to a one-character column.
  slide.addTable([headerRow, ...bodyRows], {
    x: grid.margin, y, w: grid.contentW, colW,
    rowH: Array(bodyRows.length + 1).fill(rowH),
    margin: [0.06, 0.22, 0.06, 0.22],
  });
  K.card(pptx, slide, { x: grid.margin, y, w: grid.contentW, h: tableH, outlineOnly: true });

  const ty = y + tableH + 0.3;
  takeaways.forEach((c, i) => {
    const { x, w } = tkCols[i];
    K.card(pptx, slide, { x, y: ty, w, h: tkH });
    K.text(slide, c.title, {
      x: x + 0.3, y: ty + 0.26, w: w - 0.6, h: 0.3,
      face: font.display, fontSize: size.body, color: color.ink, valign: 'middle',
    });
    K.text(slide, c.body || '', {
      x: x + 0.3, y: ty + 0.62, w: w - 0.6, h: tkH - 0.8,
      fontSize: size.small, color: color.body, lineSpacingMultiple: 1.15,
    });
  });
}

// ---------------------------------------------------------------------------
// code-findings — dark code panel with side cards
// ---------------------------------------------------------------------------
function codeFindings(pptx, slide, spec) {
  header(slide, spec);
  const code = spec.code || { lines: [] };
  const codeW = 6.42;
  const sideX = grid.margin + codeW + 0.33;
  const sideW = grid.right - sideX;
  const footH = spec.footnote ? 0.5 : 0;
  const capH = code.caption ? 0.38 : 0;
  const maxH = grid.bandBottom - grid.bandTop - footH - capH;
  const ph = Math.min(maxH, Math.max(2.2, K.codePanelHeight(code.lines.length, true)));

  const findings = spec.findings || [];
  const fh = findings.map((f) => 0.54
    + (f.body ? K.textHeight(f.body, size.fine, sideW - 0.44, font.body, 1.2) : 0) + 0.24);
  const stackH = fh.reduce((a, b) => a + b, 0) + 0.17 * Math.max(0, findings.length - 1);
  const blockH = Math.max(ph + capH, stackH);
  const y0 = centreY(blockH + footH);

  const py = y0 + (blockH - ph - capH) / 2;
  K.codePanel(pptx, slide, {
    x: grid.margin, y: py, w: codeW, h: ph,
    filename: code.filename, language: code.language, lines: code.lines,
  });
  if (code.caption) {
    K.text(slide, code.caption, {
      x: grid.margin, y: py + ph + 0.12, w: codeW, h: 0.26, fontSize: size.fine, color: color.muted,
    });
  }

  let fy = y0 + (blockH - stackH) / 2;
  const markTone = spec.findingTone === 'accent' ? 'accent' : 'danger';
  findings.forEach((f, i) => {
    const h = fh[i];
    K.card(pptx, slide, { x: sideX, y: fy, w: sideW, h });
    let tx = sideX + 0.22;
    if (f.icon) {
      K.icon(slide, f.icon, { x: tx, y: fy + 0.25, size: 0.24, tint: K.toneOf(markTone).icon });
      tx += 0.34;
    } else if (f.mark) {
      K.badge(pptx, slide, f.mark, { x: tx, y: fy + 0.245, d: 0.25, tone: markTone });
      tx += 0.36;
    }
    K.text(slide, f.title, {
      x: tx, y: fy + 0.22, w: sideX + sideW - 0.22 - tx, h: 0.3,
      face: font.display, fontSize: size.bodySm, color: color.ink, valign: 'middle',
    });
    if (f.body) {
      K.text(slide, f.body, {
        x: sideX + 0.22, y: fy + 0.54, w: sideW - 0.44, h: h - 0.7,
        fontSize: size.fine, color: color.body, lineSpacingMultiple: 1.15,
      });
    }
    fy += h + 0.17;
  });

  if (spec.footnote) K.note(slide, { text: spec.footnote }, { y: y0 + blockH + 0.2 });
}

// ---------------------------------------------------------------------------
// evolution — 2-4 step cards with arrow connectors
// ---------------------------------------------------------------------------
function evolution(pptx, slide, spec) {
  header(slide, spec);
  const steps = spec.steps || [];
  const n = Math.max(steps.length, 1);
  const gap = 0.42; // seats the arrow between cards
  const cols = columns(n, gap);
  const w = cols[0].w;
  const pad = 0.3;
  const innerW = w - pad * 2;

  const measure = (s) => {
    let h = pad + 0.02;
    if (hasBadge(s.badge) || s.badge === undefined) h += 0.48;
    else if (s.tag) h += 0.3;
    h += K.textHeight(s.title || '', size.cardTitle, innerW, font.display, 1.15) + 0.12;
    if (s.body) h += K.textHeight(s.body, size.body, innerW, font.body, 1.25);
    return h + pad;
  };
  const noteH = spec.callout ? 0.6 : 0;
  const h = Math.min(Math.max(1.8, ...steps.map(measure)), grid.bandBottom - grid.bandTop - noteH);
  const y = centreY(h + noteH);

  steps.forEach((s, i) => {
    const { x } = cols[i];
    const tn = s.tone || 'neutral';
    const t = K.toneOf(tn);
    K.card(pptx, slide, { x, y, w, h, highlight: !!s.highlight });
    const ix = x + pad;
    let cy = y + pad + 0.02;
    const showBadge = s.badge !== false && s.badge !== null;
    if (showBadge) {
      K.badge(pptx, slide, s.badge ?? i + 1, { x: ix, y: cy, tone: tn });
      if (s.tag) {
        K.mono(slide, s.tag, {
          x: ix + 0.46, y: cy, w: innerW - 0.46, h: 0.34, color: t.ink,
        });
      }
      cy += 0.48;
    } else if (s.tag) {
      K.mono(slide, s.tag, { x: ix, y: cy, w: innerW, h: 0.26, color: t.ink });
      cy += 0.3;
    }
    const th = K.textHeight(s.title || '', size.cardTitle, innerW, font.display, 1.15);
    K.text(slide, s.title, {
      x: ix, y: cy, w: innerW, h: th,
      face: font.display, fontSize: size.cardTitle, color: color.ink, lineSpacingMultiple: 1.1,
    });
    cy += th + 0.12;
    if (s.body) {
      K.text(slide, s.body, {
        x: ix, y: cy, w: innerW, h: Math.max(0.25, y + h - pad - cy),
        fontSize: size.body, color: color.body, lineSpacingMultiple: 1.2,
      });
    }
    if (i < steps.length - 1) {
      K.connector(pptx, slide, 'right', { x: x + w + (gap - 0.3) / 2, y: y + h / 2 - 0.12 });
    }
  });

  if (spec.callout) K.note(slide, spec.callout, { y: y + h + 0.25 });
}

// ---------------------------------------------------------------------------
// decision-flow — start -> hexagon decisions -> outcomes
// ---------------------------------------------------------------------------
function decisionFlow(pptx, slide, spec) {
  header(slide, spec);

  const rowY = 2.0;
  const nodeH = 1.4;
  const midY = rowY + nodeH / 2;
  const boxH = 1.1;
  const boxY = midY - boxH / 2;

  const start = spec.start;
  const startW = start.w ?? 2.35;
  K.shapeText(pptx, slide, 'roundRect', start.text, {
    x: grid.margin, y: boxY, w: startW, h: boxH,
    fill: { color: color.white }, line: { color: color.border, width: 0.75 },
    rectRadius: grid.radius, align: 'center', valign: 'middle',
    fontFace: font.body, fontSize: size.small, color: color.ink,
  });

  let cursor = grid.margin + startW;
  const outcomes = [];

  (spec.decisions || []).forEach((d, i) => {
    K.connector(pptx, slide, 'right', { x: cursor + 0.1, y: midY - 0.12 });
    if (i > 0 && d.inLabel) {
      K.text(slide, d.inLabel, {
        x: cursor - 0.02, y: midY - 0.42, w: 0.55, h: 0.24,
        fontSize: size.eyebrow, bold: true, color: color.accent, align: 'center',
      });
    }
    cursor += 0.53;
    const w = d.w ?? 3.25;
    K.decisionNode(pptx, slide, d.text, { x: cursor, y: rowY, w, h: nodeH, fontSize: d.fontSize ?? size.eyebrow });

    if (d.fallthrough) {
      const cx = cursor + w / 2;
      K.connector(pptx, slide, 'down', { x: cx - 0.12, y: rowY + nodeH + 0.1 });
      K.text(slide, d.fallthrough.label, {
        x: cx + 0.2, y: rowY + nodeH + 0.14, w: 0.55, h: 0.24,
        fontSize: size.eyebrow, bold: true, color: color.muted,
      });
      outcomes.push({ x: cursor, w, ...d.fallthrough });
    }
    cursor += w;
  });

  if (spec.terminal) {
    K.connector(pptx, slide, 'right', { x: cursor + 0.1, y: midY - 0.12, fill: color.accent });
    if (spec.terminal.label) {
      K.text(slide, spec.terminal.label, {
        x: cursor - 0.02, y: midY - 0.42, w: 0.55, h: 0.24,
        fontSize: size.eyebrow, bold: true, color: color.accent, align: 'center',
      });
    }
    const tx = cursor + 0.45;
    K.shapeText(pptx, slide, 'roundRect', spec.terminal.text, {
      x: tx, y: boxY, w: grid.right - tx, h: boxH,
      fill: { color: color.accentInk }, line: { color: color.accentInk, width: 0.75 },
      rectRadius: grid.radius, align: 'center', valign: 'middle',
      fontFace: font.body, fontSize: size.small, bold: true, color: color.white,
    });
  }

  const outY = rowY + nodeH + 0.62;
  outcomes.forEach((o) => {
    K.card(pptx, slide, { x: o.x, y: outY, w: o.w, h: 0.95 });
    K.text(slide, o.title, {
      x: o.x + 0.2, y: outY + 0.14, w: o.w - 0.4, h: 0.3,
      face: font.display, fontSize: size.small, color: color.ink, align: 'center', valign: 'middle',
    });
    if (o.body) {
      K.text(slide, o.body, {
        x: o.x + 0.2, y: outY + 0.45, w: o.w - 0.4, h: 0.4,
        fontSize: size.fine, color: color.body, align: 'center',
      });
    }
  });

  if (spec.condition) {
    const c = spec.condition;
    const y = 5.75;
    const h = 0.95;
    K.card(pptx, slide, { x: grid.margin, y, w: grid.contentW, h, fill: color.ink, line: color.ruleDark });
    K.text(slide, String(c.label || 'Effective condition').toUpperCase(), {
      x: grid.margin + 0.3, y: y + 0.18, w: 4, h: 0.2,
      face: font.display, fontSize: size.micro, color: color.accentOnDark, charSpacing: 1.2,
    });
    K.mono(slide, c.code, {
      x: grid.margin + 0.3, y: y + 0.45, w: c.note ? 7.6 : grid.contentW - 0.6, h: 0.32,
      fontSize: size.small, color: color.codeText,
    });
    if (c.note) {
      K.text(slide, c.note, {
        x: grid.margin + 8.1, y: y + 0.2, w: grid.contentW - 8.4, h: h - 0.4,
        fontSize: size.fine, color: color.onDarkMuted, valign: 'middle',
      });
    }
  }
}

// ---------------------------------------------------------------------------
// steps-sidebar — numbered scope rows + dark sidebar
// ---------------------------------------------------------------------------
function stepsSidebar(pptx, slide, spec) {
  header(slide, spec);
  const hasSidebar = !!spec.sidebar;
  const sbW = 3.48;
  const mainW = hasSidebar ? grid.contentW - sbW - 0.3 : grid.contentW;
  const rows = spec.steps || [];
  const n = Math.max(rows.length, 1);
  const gap = 0.2;
  const rowH = Math.min(1.1, (grid.bandBottom - grid.bandTop - gap * (n - 1)) / n);
  const blockH = n * rowH + (n - 1) * gap;
  const y0 = centreY(blockH);

  rows.forEach((r, i) => {
    const y = y0 + i * (rowH + gap);
    K.card(pptx, slide, { x: grid.margin, y, w: mainW, h: rowH });
    K.badge(pptx, slide, r.badge ?? i + 1, { x: grid.margin + 0.3, y: y + (rowH - 0.34) / 2 });
    const tx = grid.margin + 0.82;
    let tagW = 0;
    if (r.tag) {
      tagW = K.textWidth(String(r.tag).toUpperCase(), size.label, font.body, true) + 0.26;
      K.pill(pptx, slide, r.tag, { x: grid.margin + mainW - 0.26 - tagW, y: y + 0.2, tone: 'neutral' });
    }
    K.text(slide, r.title, {
      x: tx, y: y + 0.16, w: mainW - 0.82 - (tagW ? tagW + 0.4 : 0.26), h: 0.3,
      face: font.display, fontSize: size.cardTitle, color: color.ink, valign: 'middle',
    });
    K.text(slide, r.body || '', {
      x: tx, y: y + 0.48, w: mainW - 1.08, h: rowH - 0.58,
      fontSize: size.small, color: color.body, lineSpacingMultiple: 1.15,
    });
  });

  if (hasSidebar) {
    const sb = spec.sidebar;
    const sx = grid.margin + mainW + 0.3;
    const stw = sbW - 0.6;
    K.card(pptx, slide, { x: sx, y: y0, w: sbW, h: blockH, tone: 'ink' });
    K.text(slide, String(sb.eyebrow || '').toUpperCase(), {
      x: sx + 0.3, y: y0 + 0.28, w: stw, h: 0.2,
      face: font.display, fontSize: size.label, color: color.accentOnDark, charSpacing: 1.2,
    });
    K.text(slide, sb.headline || '', {
      x: sx + 0.3, y: y0 + 0.56, w: stw, h: 0.4,
      face: font.display, fontSize: 20, color: color.white,
    });
    K.text(slide, sb.body || '', {
      x: sx + 0.3, y: y0 + 1.06, w: stw, h: Math.max(0.5, blockH - 2.3),
      fontSize: size.small, color: color.onDarkMuted, lineSpacingMultiple: 1.2,
    });
    if (sb.points && sb.points.length) {
      K.text(slide, sb.points.join('\n'), {
        x: sx + 0.3, y: y0 + blockH - 1.15, w: stw, h: 0.95,
        fontSize: size.small, color: color.onDarkText, lineSpacingMultiple: 1.35,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// closing — dark decision / sign-off slide
// ---------------------------------------------------------------------------
function closing(pptx, slide, spec) {
  K.darkBg(slide);
  const W = grid.W;
  const cx = W / 2;
  const hw = 9.5;
  const hx = (W - hw) / 2;
  const bodyW = 8.07;

  const heroH = spec.headline
    ? K.lineCount(spec.headline, size.closing, hw, font.display) * (size.closing / 72) * 1.15 : 0;
  const statH = spec.stat ? (size.hero / 72) * 1.25 : 0;
  const body = spec.note || spec.body;
  const bodyH = body ? K.textHeight(body, size.body, bodyW, font.body, 1.25) : 0;
  const steps = spec.nextSteps || [];
  const metaH = steps.length ? 0.95 : 0;
  const disc = spec.icon !== false;

  const blockH = (disc ? 0.71 : 0) + (spec.eyebrow ? 0.36 : 0) + heroH
    + (statH ? 0.12 + statH : 0) + (bodyH ? 0.17 + bodyH : 0) + (metaH ? 0.42 + metaH : 0);
  let y = Math.max(0.55, 3.75 - blockH / 2);

  if (disc) {
    K.iconDisc(pptx, slide, spec.icon || 'clipboard-check', { cx, y });
    y += 0.71;
  }
  if (spec.eyebrow) {
    K.text(slide, String(spec.eyebrow).toUpperCase(), {
      x: hx, y, w: hw, h: 0.24,
      face: font.display, fontSize: size.eyebrow, color: color.accentOnDark, align: 'center', charSpacing: 1.5,
    });
    y += 0.36;
  }
  if (spec.headline) {
    K.text(slide, spec.headline, {
      x: hx, y, w: hw, h: heroH,
      face: font.display, fontSize: size.closing, color: color.white, align: 'center', lineSpacingMultiple: 1.05,
    });
    y += heroH;
  }
  if (spec.stat) {
    y += 0.12;
    K.text(slide, spec.stat, {
      x: hx, y, w: hw, h: statH,
      face: font.display, fontSize: size.hero, color: color.accentOnDark, align: 'center', valign: 'middle',
    });
    y += statH;
  }
  if (body) {
    y += 0.17;
    K.text(slide, body, {
      x: (W - bodyW) / 2, y, w: bodyW, h: bodyH,
      fontSize: size.body, color: color.onDarkMuted, align: 'center', lineSpacingMultiple: 1.2,
    });
    y += bodyH;
  }
  if (steps.length) {
    y += 0.42;
    const gap = 0.56;
    const colW = Math.min(3.6, (11.5 - gap * (steps.length - 1)) / steps.length);
    const total = colW * steps.length + gap * (steps.length - 1);
    let x = (W - total) / 2;
    steps.forEach((s, i) => {
      K.text(slide, String(s.title || '').toUpperCase(), {
        x, y, w: colW, h: 0.2, fontSize: size.eyebrow, color: color.muted,
      });
      K.text(slide, s.body || '', {
        x, y: y + 0.24, w: colW, h: 0.7, fontSize: size.small, color: color.onDarkText, lineSpacingMultiple: 1.15,
      });
      if (i < steps.length - 1) {
        K.rect(pptx, slide, { x: x + colW + gap / 2, y, w: 0.012, h: 0.62, fill: color.ruleDark });
      }
      x += colW + gap;
    });
  }

  if (spec.identity) {
    K.richText(slide, [
      { text: `${spec.identity.key}   `, face: 'mono', color: 'accentOnDark' },
      { text: spec.identity.meta || '', color: 'muted' },
    ], { x: 0.83, y: 6.66, w: W - 1.66, h: 0.26, fontSize: size.fine, align: 'center' });
  }
}

// ---------------------------------------------------------------------------
// statement — section divider (light) or dark message / Q&A
// ---------------------------------------------------------------------------
function statement(pptx, slide, spec) {
  const M = grid.marginDark;

  if (spec.tone === 'light') {
    K.lightBg(slide, color.white);
    const heroW = 9.4;
    const fs = spec.fontSize || size.hero;
    const heroH = K.lineCount(spec.headline, fs, heroW, font.display) * (fs / 72) * 1.12;
    const bodyH = spec.body ? K.textHeight(spec.body, size.lede, 7.2, font.body, 1.25) : 0;
    const blockH = 0.4 + heroH + (bodyH ? 0.2 + bodyH : 0);
    let y = Math.max(0.9, 3.75 - blockH / 2);
    if (spec.eyebrow) K.splitEyebrow(pptx, slide, spec.eyebrow, { x: M, y });
    y += 0.4;
    K.text(slide, spec.headline, {
      x: M, y, w: heroW, h: heroH, face: font.display, fontSize: fs, color: color.ink, lineSpacingMultiple: 1.05,
    });
    y += heroH;
    if (spec.body) {
      y += 0.2;
      K.text(slide, spec.body, {
        x: M, y, w: 7.2, h: bodyH, fontSize: size.lede, color: color.muted, lineSpacingMultiple: 1.2,
      });
    }
    return;
  }

  K.darkBg(slide);
  const W = grid.W;
  const centred = spec.align === 'center';
  const hw = centred ? 8.44 : 10.5;
  const hx = centred ? (W - hw) / 2 : M;
  const align = centred ? 'center' : 'left';
  const fs = spec.fontSize || size.closing;
  const heroH = K.lineCount(spec.headline, fs, hw, font.display) * (fs / 72) * 1.15;
  const bodyW = centred ? 8.07 : 8.0;
  const bodyH = spec.body ? K.textHeight(spec.body, size.body, bodyW, font.body, 1.25) : 0;
  const hasIcon = !!spec.icon;
  const blockH = (hasIcon ? 0.71 : 0) + (spec.eyebrow && !hasIcon ? 0.38 : 0) + heroH + (bodyH ? 0.17 + bodyH : 0);
  let y = Math.max(0.9, 3.75 - blockH / 2);

  if (hasIcon) {
    K.iconDisc(pptx, slide, spec.icon, { cx: centred ? W / 2 : M + 0.25, y });
    y += 0.71;
  } else if (spec.eyebrow) {
    K.text(slide, String(spec.eyebrow).toUpperCase(), {
      x: hx, y, w: hw, h: 0.24,
      face: font.display, fontSize: size.eyebrow, color: color.accentOnDark, align, charSpacing: 1.5,
    });
    y += 0.38;
  }
  K.text(slide, spec.headline, {
    x: hx, y, w: hw, h: heroH, face: font.display, fontSize: fs, color: color.white, align, lineSpacingMultiple: 1.05,
  });
  y += heroH;
  if (spec.body) {
    y += 0.17;
    K.text(slide, spec.body, {
      x: centred ? (W - bodyW) / 2 : M, y, w: bodyW, h: bodyH,
      fontSize: size.body, color: color.onDarkMuted, align, lineSpacingMultiple: 1.2,
    });
  }
}

// ---------------------------------------------------------------------------
// thesis — executive summary: lede, proof cards, meeting goal
// ---------------------------------------------------------------------------
function thesis(pptx, slide, spec) {
  header(slide, spec);
  const proofs = (spec.proofs || []).slice(0, 3);
  const ledeW = grid.contentW;
  const ledeH = spec.lede ? K.textHeight(spec.lede, 17, ledeW, font.display, 1.2) : 0;
  const cols = proofs.length ? columns(proofs.length, gutter(proofs.length)) : [];
  const innerW = cols.length ? cols[0].w - 0.6 : 0;
  const cardH = proofs.length
    ? Math.max(1.6, ...proofs.map((p) => 0.3 + 0.48 + K.textHeight(p.title || '', size.cardTitle, innerW, font.display, 1.15)
      + 0.1 + K.textHeight(p.body || '', size.small, innerW, font.body, 1.25) + 0.3))
    : 0;
  const goalH = spec.goal ? 0.55 : 0;
  const blockH = ledeH + (cardH ? 0.3 + cardH : 0) + goalH;
  let y = centreY(blockH);

  if (spec.lede) {
    K.text(slide, spec.lede, {
      x: grid.margin, y, w: ledeW, h: ledeH,
      face: font.display, fontSize: 17, color: color.ink, lineSpacingMultiple: 1.15,
    });
    y += ledeH + 0.3;
  }
  proofs.forEach((p, i) => {
    const { x, w } = cols[i];
    K.card(pptx, slide, { x, y, w, h: cardH });
    K.badge(pptx, slide, p.badge !== undefined ? p.badge : i + 1, { x: x + 0.3, y: y + 0.3, tone: accentTone(p.tone) });
    const th = K.textHeight(p.title || '', size.cardTitle, innerW, font.display, 1.15);
    K.text(slide, p.title || '', {
      x: x + 0.3, y: y + 0.78, w: innerW, h: th, face: font.display, fontSize: size.cardTitle, color: color.ink,
    });
    K.text(slide, p.body || '', {
      x: x + 0.3, y: y + 0.88 + th, w: innerW, h: Math.max(0.3, cardH - 1.18 - th),
      fontSize: size.small, color: color.body, lineSpacingMultiple: 1.2,
    });
  });
  if (spec.goal) {
    K.note(slide, { lead: spec.goalLead || 'Meeting goal:', text: spec.goal }, { y: y + cardH + 0.25 });
  }
}

// ---------------------------------------------------------------------------
// asks — numbered open questions (agenda-row style)
// ---------------------------------------------------------------------------
function asks(pptx, slide, spec) {
  header(slide, spec);
  const items = (spec.asks || []).slice(0, 6).map((a) => (typeof a === 'string' ? { q: a } : a));
  const n = Math.max(items.length, 1);
  const gap = 0.14;
  const tw = grid.contentW - 1.06;
  const noteH = spec.callout ? 0.6 : 0;
  const heights = items.map((a) => Math.max(0.78,
    0.2 + K.textHeight(a.q, size.body, tw, font.body, 1.2) + (a.why ? 0.06 + K.textHeight(a.why, size.fine, tw, font.body, 1.2) : 0) + 0.2));
  let blockH = heights.reduce((s, h) => s + h, 0) + gap * (n - 1);
  const avail = grid.bandBottom - grid.bandTop - noteH;
  if (blockH > avail) {
    const k = (avail - gap * (n - 1)) / (blockH - gap * (n - 1));
    heights.forEach((h, i) => { heights[i] = h * k; });
    blockH = avail;
  }
  let y = centreY(blockH + noteH);
  const top = y;

  items.forEach((a, i) => {
    const h = heights[i];
    K.card(pptx, slide, { x: grid.margin, y, w: grid.contentW, h });
    K.text(slide, numeral(i + 1), {
      x: grid.margin + 0.26, y, w: 0.55, h, face: font.display, fontSize: size.cardTitle, color: color.accent, valign: 'middle',
    });
    const qH = K.textHeight(a.q, size.body, tw, font.body, 1.2);
    const whyH = a.why ? K.textHeight(a.why, size.fine, tw, font.body, 1.2) : 0;
    const contentH = qH + (whyH ? 0.06 + whyH : 0);
    const cy = y + (h - contentH) / 2;
    K.text(slide, a.q, {
      x: grid.margin + 0.8, y: cy, w: tw, h: qH, fontSize: size.body, bold: true, color: color.ink, lineSpacingMultiple: 1.1,
    });
    if (a.why) {
      K.text(slide, a.why, {
        x: grid.margin + 0.8, y: cy + qH + 0.06, w: tw, h: whyH, fontSize: size.fine, color: color.muted, lineSpacingMultiple: 1.1,
      });
    }
    y += h + gap;
  });

  if (spec.callout) K.note(slide, spec.callout, { y: top + blockH + 0.25 });
}

// ---------------------------------------------------------------------------
// custom — raw pptxgenjs ops under the standard header
// ---------------------------------------------------------------------------
function custom(pptx, slide, spec) {
  header(slide, spec);
  (spec.ops || []).forEach((op) => {
    if (op.kind === 'text') slide.addText(op.text, op.options || {});
    else if (op.kind === 'shape') slide.addShape(pptx.ShapeType[op.shape], op.options || {});
    else if (op.kind === 'image') slide.addImage(op.options || {});
    else if (op.kind === 'table') slide.addTable(op.rows, op.options || {});
    else throw new Error(`custom: unknown op kind "${op.kind}"`);
  });
}

module.exports = {
  'title-hero': titleHero,
  agenda,
  cards,
  stats,
  compare,
  image,
  matrix,
  'code-findings': codeFindings,
  evolution,
  'decision-flow': decisionFlow,
  'steps-sidebar': stepsSidebar,
  closing,
  statement,
  thesis,
  asks,
  custom,
};
