/**
 * archetypes.js — the 14 slide patterns.
 *
 * Each archetype takes a spec object (slots) and draws a slide using only
 * deck-kit primitives. No coordinate or colour is invented here that isn't
 * derived from deck-kit's grid/palette.
 *
 * Every archetype signature: (pptx, slide, spec) => void
 */

'use strict';

const fs = require('fs');
const K = require('./deck-kit');
const { color, font, size, grid, columns } = K;

/** Shared header: eyebrow + H1. Returns the y where content may begin. */
function header(slide, spec, onDark = false) {
  if (spec.eyebrow) K.eyebrow(slide, spec.eyebrow, { onDark });
  if (spec.title) K.heading(slide, spec.title, { onDark });
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

// ---------------------------------------------------------------------------
// 1. title-hero — dark opening slide
// ---------------------------------------------------------------------------
function titleHero(pptx, slide, spec) {
  K.darkBg(slide);
  const M = grid.marginDark;

  if (spec.eyebrow) {
    K.text(slide, spec.eyebrow.toUpperCase(), {
      x: M, y: 1.15, w: 9.0, h: 0.3,
      fontSize: size.small, color: color.onDarkMuted,
    });
  }

  K.text(slide, spec.headline, {
    x: M, y: 1.65, w: 9.4, h: 1.9,
    face: font.display, fontSize: size.hero, color: color.white,
    lineSpacingMultiple: 1.1,
  });

  if (spec.lede) {
    K.text(slide, spec.lede, {
      x: M, y: 3.75, w: 8.2, h: 1.1,
      fontSize: size.cardTitleSm, color: color.onDarkMuted,
      lineSpacingMultiple: 1.25,
    });
  }

  // Stat chips. `fullWidth` spans the whole content width; otherwise they sit
  // under the text column (the reference deck's left-weighted look).
  const chips = spec.stats || [];
  if (chips.length) {
    const span = spec.fullWidth ? grid.right - M : 10.5 - M;
    const cols = columns(chips.length, 0.3, M, span);
    chips.forEach((s, i) => {
      const { x, w } = cols[i];
      K.panel(pptx, slide, { x, y: 5.35, w, h: 0.95, tone: 'elevated' });
      K.text(slide, String(s.label).toUpperCase(), {
        x: x + 0.22, y: 5.5, w: w - 0.45, h: 0.24,
        fontSize: size.micro, color: color.onDarkMuted,
      });
      K.text(slide, s.value, {
        x: x + 0.22, y: 5.76, w: w - 0.45, h: 0.34,
        fontSize: size.lead, color: color.white,
      });
    });
  }

  // Optional identity row: presenters / reviewers (Best Practices title slide).
  if (spec.presenters || spec.reviewers) {
    const bits = [];
    if (spec.presenters) bits.push(`Presenters: ${spec.presenters}`);
    if (spec.reviewers) bits.push(`Reviewers: ${spec.reviewers}`);
    K.text(slide, bits.join('   ·   '), {
      x: M, y: 6.35, w: 11.5, h: 0.28,
      fontSize: size.small, color: color.onDarkMuted,
    });
  }

  if (spec.footer) {
    K.text(slide, spec.footer, {
      x: M, y: 6.65, w: 6.0, h: 0.3,
      fontSize: size.eyebrow, color: color.onDarkFaint,
    });
  }
}

// ---------------------------------------------------------------------------
// 2. evolution — 2-4 step cards with arrow connectors
// ---------------------------------------------------------------------------
function evolution(pptx, slide, spec) {
  header(slide, spec);

  const steps = spec.steps || [];
  // 0.42 gutter seats the 0.30 arrow with 0.06 clearance either side.
  // 3 cards @ 3.72 is the reference-deck measurement; the row is 12.00 wide,
  // so it stops 0.13 short of the right edge. That is intentional — matching
  // the approved deck — and only visible against a full-width bottom band.
  const gap = 0.42;
  const cols = columns(steps.length, gap, grid.margin, 12.0);
  const cardY = 2.0;
  const cardH = spec.callout ? 3.05 : 3.6;

  steps.forEach((step, i) => {
    const { x, w } = cols[i];
    const t = step.tone || 'neutral';
    K.panel(pptx, slide, { x, y: cardY, w, h: cardH, tone: t });

    const inner = x + grid.pad;
    const innerW = w - grid.pad * 2;
    const accent = K.toneAccent[t] || color.accent;
    const showBadge = step.badge !== false && step.badge !== null;

    if (showBadge) {
      K.badge(pptx, slide, step.badge ?? i + 1, { x: inner, y: cardY + 0.32, fill: accent });
    }
    if (step.tag) {
      K.mono(slide, step.tag, {
        x: showBadge ? inner + 0.55 : inner,
        y: cardY + 0.36,
        w: showBadge ? innerW - 0.52 : innerW,
        h: 0.34,
        color: accent,
      });
    }
    const titleY = showBadge ? cardY + 1.0 : cardY + 0.82;
    K.text(slide, step.title, {
      x: inner, y: titleY, w: innerW, h: 0.55,
      face: font.display, fontSize: size.cardTitleXl, color: color.ink,
      lineSpacingMultiple: 1.1,
    });
    const bodyY = titleY + 0.62;
    K.text(slide, step.body, {
      x: inner, y: bodyY, w: innerW, h: cardY + cardH - bodyY - 0.22,
      fontSize: size.lead, color: color.body, lineSpacingMultiple: 1.35,
    });

    // Arrow in the gutter to the right of every card but the last.
    if (i < steps.length - 1) {
      K.connector(pptx, slide, 'right', {
        x: x + w + (gap - 0.3) / 2,
        y: cardY + 1.35,
      });
    }
  });

  if (spec.callout) {
    K.bottomBand(pptx, slide, 'callout', { ...spec.callout, y: 5.45 });
  }
}

// ---------------------------------------------------------------------------
// 3. code-findings — dark code panel left, badged findings right
// ---------------------------------------------------------------------------
function codeFindings(pptx, slide, spec) {
  header(slide, spec);

  const codeW = 6.05;
  const codeY = 1.85;
  const codeH = 3.5;

  K.codePanel(pptx, slide, {
    x: grid.margin, y: codeY, w: codeW, h: codeH,
    filename: spec.code.filename,
    lines: spec.code.lines,
    caption: spec.code.caption,
  });

  const findings = spec.findings || [];
  const fx = grid.margin + codeW + 0.4; // badge column
  const tx = fx + 0.5; // text column
  const tw = grid.right - tx;
  const pitch = 1.16;
  const markTone = spec.findingTone === 'accent' ? color.accent : color.danger;

  findings.forEach((f, i) => {
    const y = 1.95 + i * pitch;
    K.badge(pptx, slide, f.mark ?? '!', { x: fx, y: y + 0.04, d: 0.3, fill: markTone });
    K.text(slide, f.title, {
      x: tx, y, w: tw, h: 0.36,
      fontSize: size.cardTitleSm, color: color.ink,
    });
    K.text(slide, f.body, {
      x: tx, y: y + 0.38, w: tw, h: 0.7,
      fontSize: size.body, color: color.body,
    });
  });

  if (spec.footnote) {
    K.bottomBand(pptx, slide, 'footnote', { text: spec.footnote, y: 5.62, w: codeW });
  }
}

// ---------------------------------------------------------------------------
// 4. decision-flow — start -> hexagon decisions -> outcomes
// ---------------------------------------------------------------------------
function decisionFlow(pptx, slide, spec) {
  header(slide, spec);

  const rowY = 2.08;
  const nodeH = 1.5;
  const midY = rowY + nodeH / 2 - 0.02; // vertical centre of the decision row
  const boxY = 2.25;
  const boxH = 1.15;

  // Start node — a single shape carrying its own centred text.
  const start = spec.start;
  const startW = start.w ?? 2.35;
  K.shapeText(pptx, slide, 'roundRect', start.text, {
    x: grid.margin, y: boxY, w: startW, h: boxH,
    fill: { color: color.neutralTint },
    line: { color: color.onDarkMuted, width: 1 },
    rectRadius: 0.04,
    align: 'center', valign: 'middle',
    fontFace: font.body, fontSize: size.small, color: color.ink,
  });

  let cursor = grid.margin + startW;

  const decisions = spec.decisions || [];
  const outcomes = [];

  decisions.forEach((d, i) => {
    // Connector into this decision: 0.10 clearance, then the 0.32 arrow,
    // then 0.11 before the node — 0.53 from the previous node's right edge.
    K.connector(pptx, slide, 'right', { x: cursor + 0.1, y: midY - 0.14, w: 0.32, h: 0.28 });
    if (i > 0 && d.inLabel) {
      K.text(slide, d.inLabel, {
        x: cursor - 0.01, y: boxY + 0.02, w: 0.55, h: 0.28,
        fontSize: size.eyebrow, color: color.accent, align: 'center',
      });
    }
    cursor += 0.53;

    const w = d.w ?? 3.25;
    K.decisionNode(pptx, slide, d.text, {
      x: cursor, y: rowY, w, h: nodeH,
      fontSize: d.fontSize ?? size.eyebrow,
    });

    // "No"/"Yes" fall-through below the hexagon
    if (d.fallthrough) {
      const cx = cursor + w / 2;
      K.connector(pptx, slide, 'down', {
        x: cx - 0.14, y: rowY + nodeH + 0.1, w: 0.28, h: 0.42, fill: color.body,
      });
      K.text(slide, d.fallthrough.label, {
        x: cx + 0.195, y: rowY + nodeH + 0.17, w: 0.5, h: 0.28,
        fontSize: size.eyebrow, color: color.body,
      });
      outcomes.push({ x: cursor, w, ...d.fallthrough });
    }

    cursor += w;
  });

  // Terminal outcome on the right
  if (spec.terminal) {
    K.connector(pptx, slide, 'right', {
      x: cursor + 0.1, y: midY - 0.14, w: 0.32, h: 0.28, fill: color.warn,
    });
    if (spec.terminal.label) {
      K.text(slide, spec.terminal.label, {
        x: cursor, y: boxY + 0.02, w: 0.55, h: 0.28,
        fontSize: size.eyebrow, color: color.warnInk, align: 'center',
      });
    }
    const tx = cursor + 0.45;
    const tw = grid.right - tx;
    // The deck's one solid-amber node — the outcome everything funnels toward.
    // Filled with warnInk rather than warn so the white label clears AA.
    K.shapeText(pptx, slide, 'roundRect', spec.terminal.text, {
      x: tx, y: boxY, w: tw, h: boxH,
      fill: { color: color.warnInk }, line: { color: color.warnInk, width: 1 },
      rectRadius: 0.04,
      align: 'center', valign: 'middle',
      fontFace: font.body, fontSize: size.fine, color: color.white,
    });
  }

  // Fall-through outcome boxes
  outcomes.forEach((o) => {
    K.shapeText(pptx, slide, 'roundRect', o.body ? `${o.title}\n${o.body}` : o.title, {
      x: o.x, y: 4.18, w: o.w, h: 1.0,
      fill: { color: color.neutralTint },
      line: { color: color.onDarkMuted, width: 1 },
      rectRadius: 0.04,
      align: 'center', valign: 'middle',
      fontFace: font.body, fontSize: size.small, color: color.ink,
    });
  });

  if (spec.condition) {
    K.bottomBand(pptx, slide, 'condition', { ...spec.condition, y: 5.68 });
  }
}

// ---------------------------------------------------------------------------
// 5. matrix — table with dark header + semantic outcome fills
// ---------------------------------------------------------------------------
function matrix(pptx, slide, spec) {
  header(slide, spec);

  const t = spec.table;
  const colW = t.colWidths || Array(t.headers.length).fill(grid.contentW / t.headers.length);

  const headerRow = t.headers.map((h) => ({
    text: typeof h === 'string' ? h : h.text,
    options: {
      fill: { color: color.ink },
      color: color.white,
      bold: true,
      fontFace: (typeof h === 'object' && h.mono) ? font.mono : font.body,
      fontSize: (typeof h === 'object' && h.mono) ? size.eyebrow : size.bodySm,
      align: 'left',
      valign: 'middle',
    },
  }));

  // Cell shorthand: a string, or { text, tone, color, mono, bold }.
  const cellFill = { warn: color.warnTint, neutral: color.neutralTint, accent: color.accentTint, danger: color.dangerTint };
  const bodyRows = t.rows.map((row) =>
    row.map((cell) => {
      const c = typeof cell === 'string' ? { text: cell } : cell;
      return {
        text: c.text,
        options: {
          fill: { color: cellFill[c.tone] || color.white },
          color: color[c.color] || c.color || color.ink,
          bold: !!c.bold,
          fontFace: c.mono ? font.mono : font.body,
          fontSize: size.body,
          align: 'left',
          valign: 'middle',
        },
      };
    })
  );

  slide.addTable([headerRow, ...bodyRows], {
    x: grid.margin,
    y: t.y ?? 1.95,
    w: grid.contentW,
    colW,
    rowH: [0.52, ...Array(bodyRows.length).fill(0.55)],
    border: { type: 'solid', color: color.rule, pt: 1 },
    margin: [4, 10, 4, 10],
  });

  // Takeaway cards below
  const cards = spec.takeaways || [];
  if (cards.length) {
    const cols = columns(cards.length, 0.23);
    const y = spec.takeawayY ?? 4.85;
    cards.forEach((c, i) => {
      const { x, w } = cols[i];
      K.panel(pptx, slide, { x, y, w, h: 1.55, tone: c.tone || (i === 0 ? 'accent' : 'neutral') });
      K.text(slide, c.title, {
        x: x + grid.pad, y: y + 0.17, w: w - 0.55, h: 0.34,
        face: font.display, fontSize: size.cardTitleLg, color: color.ink,
      });
      K.text(slide, c.body, {
        x: x + grid.pad, y: y + 0.57, w: w - 0.55, h: 0.8,
        fontSize: size.body, color: color.body,
      });
    });
  }
}

// ---------------------------------------------------------------------------
// 6. steps-sidebar — numbered scope rows + dark sidebar
// ---------------------------------------------------------------------------
function stepsSidebar(pptx, slide, spec) {
  header(slide, spec);

  const hasSidebar = !!spec.sidebar;
  const mainW = hasSidebar ? 8.35 : grid.contentW;
  const rows = spec.steps || [];
  const y0 = 1.9;

  // 3 rows use the reference deck's measurements exactly. Past that, compress
  // to fit the band rather than running off the bottom of the slide.
  const gap = 0.22;
  const pitch = rows.length <= 3 ? 1.42 : (grid.bandBottom - y0) / rows.length;
  const rowH = pitch - gap;
  const tight = rowH < 1.2;

  rows.forEach((r, i) => {
    const y = y0 + i * pitch;
    K.panel(pptx, slide, { x: grid.margin, y, w: mainW, h: rowH, tone: r.tone || 'neutral' });
    K.badge(pptx, slide, r.badge ?? i + 1, {
      x: grid.margin + 0.32, y: y + (rowH - 0.42) / 2,
    });
    K.text(slide, r.title, {
      x: grid.margin + 0.92, y: y + (tight ? 0.13 : 0.2), w: 5.2, h: 0.34,
      fontSize: tight ? size.cardTitleSm : size.cardTitle, color: color.ink,
    });
    K.text(slide, r.body, {
      x: grid.margin + 0.92, y: y + (tight ? 0.46 : 0.56), w: mainW - 1.95,
      h: rowH - (tight ? 0.54 : 0.58),
      fontSize: tight ? size.small : size.bodySm, color: color.body,
    });
    if (r.tag) {
      K.chip(pptx, slide, r.tag, {
        x: grid.margin + 7.12, y: y + (tight ? 0.13 : 0.2), w: 1.06, h: 0.32,
      });
    }
  });

  if (hasSidebar) {
    const sb = spec.sidebar;
    const sx = 9.25;
    const sw = grid.right - sx;
    const sy = y0;
    // Run the sidebar 0.46 past the last row so it reads as a full-height
    // column rather than something that stopped short.
    const sh = sb.h ?? rows.length * pitch - (pitch - rowH) + 0.46;
    const stw = sw - 0.58;

    K.panel(pptx, slide, { x: sx, y: sy, w: sw, h: sh, tone: 'ink' });
    K.text(slide, String(sb.eyebrow || '').toUpperCase(), {
      x: sx + grid.pad, y: sy + 0.25, w: stw, h: 0.28,
      fontSize: size.label, color: color.onDarkMuted,
    });
    K.text(slide, sb.headline, {
      x: sx + grid.pad, y: sy + 0.58, w: stw, h: 0.42,
      face: font.display, fontSize: size.sidebar, color: color.white,
    });
    K.text(slide, sb.body, {
      x: sx + grid.pad, y: sy + 1.1, w: stw, h: 1.8,
      fontSize: size.bodySm, color: color.onDarkMuted,
    });
    if (sb.points && sb.points.length) {
      // Anchored to the bottom of the panel, not a fixed offset — otherwise a
      // short body leaves a hole between it and the points.
      K.text(slide, sb.points.join('\n'), {
        x: sx + grid.pad, y: sy + sh - 1.45, w: stw, h: 1.2,
        fontSize: size.body, color: color.white, lineSpacingMultiple: 1.4,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// 7. closing — dark, big stat + next steps
// ---------------------------------------------------------------------------
function closing(pptx, slide, spec) {
  K.darkBg(slide);
  const M = grid.marginDark;

  if (spec.eyebrow) {
    K.text(slide, spec.eyebrow.toUpperCase(), {
      x: M, y: 0.85, w: 4.0, h: 0.3,
      fontSize: size.eyebrow, color: color.onDarkMuted,
    });
  }
  if (spec.headline) {
    K.text(slide, spec.headline, {
      x: M, y: 1.2, w: 6.0, h: 0.5,
      face: font.display, fontSize: size.headingSm, color: color.white,
    });
  }
  if (spec.stat) {
    K.text(slide, spec.stat, {
      x: M, y: 1.85, w: 6.0, h: 1.15,
      face: font.display, fontSize: size.stat, color: color.warn,
    });
  }
  if (spec.note) {
    K.text(slide, spec.note, {
      x: M, y: 3.1, w: 5.6, h: 0.5,
      fontSize: size.body, color: color.onDarkMuted,
    });
  }

  const steps = spec.nextSteps || [];
  const sx = 7.0;
  const sw = grid.right - sx;
  const pitch = 1.5;
  steps.forEach((s, i) => {
    const y = 1.35 + i * pitch;
    K.panel(pptx, slide, { x: sx, y, w: sw, h: 1.25, tone: 'elevated' });
    K.badge(pptx, slide, s.badge ?? i + 1, { x: sx + 0.3, y: y + 0.41 });
    K.text(slide, s.title, {
      x: sx + 0.9, y: y + 0.22, w: sw - 1.13, h: 0.34,
      fontSize: size.cardTitleSm, color: color.white,
    });
    K.text(slide, s.body, {
      x: sx + 0.9, y: y + 0.58, w: sw - 1.13, h: 0.55,
      fontSize: size.small, color: color.onDarkMuted,
    });
  });

  if (spec.identity) {
    const iy = spec.identityY ?? 4.62;
    K.panel(pptx, slide, { x: M, y: iy, w: 5.6, h: 1.35, tone: 'elevated' });
    K.mono(slide, spec.identity.key, {
      x: M + 0.3, y: iy + 0.2, w: 5.0, h: 0.36,
      fontSize: size.cardTitle, color: color.white,
    });
    K.text(slide, spec.identity.meta, {
      x: M + 0.3, y: iy + 0.63, w: 5.0, h: 0.55,
      fontSize: 11.5, color: color.onDarkMuted,
    });
  }
}

// ---------------------------------------------------------------------------
// 8. agenda — section list
// ---------------------------------------------------------------------------
function agenda(pptx, slide, spec) {
  header(slide, spec);
  const items = spec.items || [];
  const y0 = 1.95;
  const pitch = Math.min(0.86, 4.4 / Math.max(items.length, 1));
  const h = pitch - 0.12;

  items.forEach((item, i) => {
    const it = typeof item === 'string' ? { title: item } : item;
    const y = y0 + i * pitch;
    K.panel(pptx, slide, { x: grid.margin, y, w: grid.contentW, h, tone: it.tone || 'neutral' });
    K.badge(pptx, slide, it.badge ?? i + 1, { x: grid.margin + 0.28, y: y + (h - 0.42) / 2 });
    const runs = [{ text: it.title, bold: true, color: 'ink', size: 'cardTitleSm' }];
    if (it.note) runs.push({ text: `   ${it.note}`, color: 'body', size: 'small' });
    K.richText(slide, runs, {
      x: grid.margin + 0.88, y, w: grid.contentW - 1.2, h,
      valign: 'middle',
    });
  });

  if (spec.footnote) {
    K.bottomBand(pptx, slide, 'footnote', { text: spec.footnote, y: 6.4, w: grid.contentW });
  }
}

// ---------------------------------------------------------------------------
// 9. cards — generic 2/3/4-up grid (Promotion, Fallback, benefits)
// ---------------------------------------------------------------------------
function cards(pptx, slide, spec) {
  header(slide, spec);
  const items = spec.cards || [];
  const perRow = spec.perRow || Math.min(items.length, 3);
  const rowCount = Math.ceil(items.length / perRow);
  const cols = columns(perRow, 0.28);
  const availH = (spec.callout ? 5.3 : 6.5) - grid.bandTop;
  const cardH = Math.min(3.4, (availH - 0.28 * (rowCount - 1)) / rowCount);

  items.forEach((c, i) => {
    const { x, w } = cols[i % perRow];
    const y = grid.bandTop + Math.floor(i / perRow) * (cardH + 0.28);
    const t = c.tone || 'neutral';
    K.panel(pptx, slide, { x, y, w, h: cardH, tone: t });

    const inner = x + grid.pad;
    const innerW = w - grid.pad * 2;
    const onDark = t === 'ink' || t === 'elevated';
    let cy = y + 0.28;

    if (c.badge !== undefined) {
      K.badge(pptx, slide, c.badge, { x: inner, y: cy, fill: K.toneAccent[t] || color.accent });
      cy += 0.62;
    }
    if (c.tag) {
      K.mono(slide, c.tag, {
        x: inner, y: cy, w: innerW, h: 0.3,
        fontSize: size.eyebrow, color: onDark ? color.onDarkMuted : K.toneAccent[t],
      });
      cy += 0.4;
    }
    K.text(slide, c.title, {
      x: inner, y: cy, w: innerW, h: 0.5,
      face: font.display, fontSize: size.cardTitleLg,
      color: onDark ? color.white : color.ink,
    });
    cy += 0.58;
    K.text(slide, c.body, {
      x: inner, y: cy, w: innerW, h: y + cardH - cy - 0.2,
      fontSize: size.body, color: onDark ? color.onDarkMuted : color.body,
    });
  });

  if (spec.callout) K.bottomBand(pptx, slide, 'callout', { ...spec.callout, y: 5.45 });
}

// ---------------------------------------------------------------------------
// 10. image — captioned diagram (native aspect ratio, max fit)
// ---------------------------------------------------------------------------
function image(pptx, slide, spec) {
  header(slide, spec);

  const capReserve = spec.caption ? 0.48 : 0;
  const bandY = grid.bandTop;
  // Leave room for the page mark under the content band.
  const bandBottom = Math.min(grid.bandBottom, 6.55 - capReserve);
  const availW = grid.contentW;
  const availH = bandBottom - bandY;
  const innerPad = 0.18;
  const boxW = availW - innerPad * 2;
  const boxH = availH - innerPad * 2;

  const px = imagePixelSize(spec.path);
  const fitted = px
    ? fitContain(boxW, boxH, px.w, px.h)
    : { w: boxW, h: boxH };

  const panelW = fitted.w + innerPad * 2;
  const panelH = fitted.h + innerPad * 2;
  const panelX = grid.margin + (availW - panelW) / 2;
  const panelY = bandY + Math.max(0, (availH - panelH) / 2);

  if (spec.panel !== false) {
    K.panel(pptx, slide, {
      x: panelX, y: panelY, w: panelW, h: panelH,
      tone: spec.tone || 'neutral',
    });
  }

  // Pass exact w/h from the natural ratio — do not stretch.
  slide.addImage({
    path: spec.path,
    x: panelX + innerPad,
    y: panelY + innerPad,
    w: fitted.w,
    h: fitted.h,
  });

  if (spec.caption) {
    K.text(slide, spec.caption, {
      x: grid.margin,
      y: Math.min(panelY + panelH + 0.1, 6.55),
      w: grid.contentW,
      h: 0.38,
      fontSize: size.small,
      color: color.body,
      align: 'center',
    });
  }
}

// ---------------------------------------------------------------------------
// 11. statement — dark full-bleed message / section divider / Q&A
// ---------------------------------------------------------------------------
function statement(pptx, slide, spec) {
  K.darkBg(slide);
  const M = grid.marginDark;
  const w = grid.right - M;
  const centred = spec.align === 'center';

  if (spec.eyebrow) {
    K.text(slide, spec.eyebrow.toUpperCase(), {
      x: M, y: centred ? 2.6 : 2.9, w, h: 0.3,
      fontSize: size.small, color: color.onDarkMuted,
      align: centred ? 'center' : 'left',
    });
  }
  K.text(slide, spec.headline, {
    x: M, y: centred ? 3.0 : 3.3, w, h: 1.4,
    face: font.display, fontSize: spec.fontSize || size.hero, color: color.white,
    align: centred ? 'center' : 'left', valign: 'middle',
  });
  if (spec.body) {
    K.text(slide, spec.body, {
      x: M, y: centred ? 4.5 : 4.8, w: centred ? w : 8.0, h: 0.9,
      fontSize: size.cardTitleSm, color: color.onDarkMuted,
      align: centred ? 'center' : 'left',
    });
  }
}

// ---------------------------------------------------------------------------
// 12. compare — side-by-side before/after
// ---------------------------------------------------------------------------
function compare(pptx, slide, spec) {
  header(slide, spec);

  const sides = [spec.left, spec.right];
  const cols = columns(2, 0.33);
  const y = grid.bandTop;
  const h = spec.callout ? 3.35 : 4.4;

  sides.forEach((s, i) => {
    const { x, w } = cols[i];
    const t = s.tone || (i === 0 ? 'danger' : 'accent');
    K.panel(pptx, slide, { x, y, w, h, tone: t });

    const inner = x + grid.pad;
    const innerW = w - grid.pad * 2;
    const accent = K.toneAccent[t] || color.accent;

    K.text(slide, String(s.label || '').toUpperCase(), {
      x: inner, y: y + 0.24, w: innerW, h: 0.28,
      fontSize: size.micro, color: accent,
    });
    K.text(slide, s.title, {
      x: inner, y: y + 0.58, w: innerW, h: 0.5,
      face: font.display, fontSize: size.cardTitleXl, color: color.ink,
    });

    let cy = y + 1.18;
    if (s.code) {
      const lines = s.code.length;
      const codeH = Math.max(0.5, lines * 0.26 + 0.2);
      K.mono(slide, s.code.join('\n'), {
        x: inner, y: cy, w: innerW, h: codeH,
        fontSize: size.fine, color: color.ink,
      });
      cy += codeH + 0.16;
    }
    if (s.points && s.points.length) {
      K.text(slide, s.points.map((p) => `·  ${p}`).join('\n'), {
        x: inner, y: cy, w: innerW, h: y + h - cy - 0.2,
        fontSize: size.body, color: color.body, lineSpacingMultiple: 1.4,
      });
    }
  });

  if (spec.callout) K.bottomBand(pptx, slide, 'callout', { ...spec.callout, y: 5.45 });
}

// ---------------------------------------------------------------------------
// Escape hatch — raw pptxgenjs ops for genuine one-offs.
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

// ---------------------------------------------------------------------------
// 13. thesis — executive summary / meeting goal (Asymmetric Thesis)
// ---------------------------------------------------------------------------
function thesis(pptx, slide, spec) {
  header(slide, spec);

  const proofs = (spec.proofs || []).slice(0, 3);
  const hasGoal = Boolean(spec.goal);
  const y0 = grid.bandTop;
  // Callout sits at 5.45; keep proof cards clear of it.
  const calloutY = 5.45;
  const contentBottom = hasGoal ? calloutY - 0.12 : grid.bandBottom;

  let cursor = y0;
  if (spec.lede) {
    // Compact lede so three proof cards still fit above the meeting-goal band.
    const ledeH = hasGoal ? 0.78 : 1.15;
    K.text(slide, spec.lede, {
      x: grid.margin, y: cursor, w: 11.5, h: ledeH,
      face: font.display, fontSize: size.cardTitleLg, color: color.ink,
      lineSpacingMultiple: 1.12,
    });
    cursor += ledeH + 0.18;
  }

  if (proofs.length) {
    const cols = columns(proofs.length, 0.28);
    const ph = Math.max(2.0, contentBottom - cursor);
    proofs.forEach((p, i) => {
      const { x, w } = cols[i];
      K.panel(pptx, slide, { x, y: cursor, w, h: ph, tone: p.tone || 'neutral' });
      const inner = x + grid.pad;
      const innerW = w - grid.pad * 2;
      K.badge(pptx, slide, p.badge !== undefined ? p.badge : i + 1, {
        x: inner, y: cursor + 0.18, fill: color.accent,
      });
      K.text(slide, p.title, {
        x: inner, y: cursor + 0.72, w: innerW, h: 0.4,
        face: font.display, fontSize: size.cardTitle, color: color.ink,
      });
      K.text(slide, p.body, {
        x: inner, y: cursor + 1.2, w: innerW, h: ph - 1.4,
        fontSize: size.bodySm, color: color.body,
      });
    });
  }

  if (hasGoal) {
    K.bottomBand(pptx, slide, 'callout', {
      lead: spec.goalLead || 'Meeting goal:',
      text: spec.goal,
      y: calloutY,
    });
  }
}

// ---------------------------------------------------------------------------
// 14. asks — numbered open questions for reviewers
// ---------------------------------------------------------------------------
function asks(pptx, slide, spec) {
  header(slide, spec);

  const items = (spec.asks || []).slice(0, 6);
  const hasCallout = Boolean(spec.callout);
  const top = grid.bandTop;
  // Leave a clear gap above the callout (or slide number band).
  const bottom = hasCallout ? 5.35 : 6.5;
  const gap = 0.1;
  const n = Math.max(items.length, 1);
  const rowH = Math.min(0.78, (bottom - top - gap * (n - 1)) / n);

  items.forEach((a, i) => {
    const y = top + i * (rowH + gap);
    const q = typeof a === 'string' ? a : a.q;
    const why = typeof a === 'string' ? null : a.why;
    const qH = why ? Math.min(0.36, rowH * 0.52) : rowH;

    K.badge(pptx, slide, i + 1, { x: grid.margin, y: y + 0.02, fill: color.accent });
    K.text(slide, q, {
      x: grid.margin + 0.7, y, w: 11.0, h: qH,
      face: font.display, fontSize: size.cardTitleSm, color: color.ink,
    });
    if (why) {
      K.text(slide, why, {
        x: grid.margin + 0.7, y: y + qH, w: 11.0, h: Math.max(0.22, rowH - qH - 0.02),
        fontSize: size.small, color: color.body,
      });
    }
  });

  if (hasCallout) {
    K.bottomBand(pptx, slide, 'callout', { ...spec.callout, y: 5.5, h: 0.85 });
  }
}

module.exports = {
  'title-hero': titleHero,
  evolution,
  'code-findings': codeFindings,
  'decision-flow': decisionFlow,
  matrix,
  'steps-sidebar': stepsSidebar,
  closing,
  agenda,
  cards,
  image,
  statement,
  compare,
  thesis,
  asks,
  custom,
};
