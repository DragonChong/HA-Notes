# Design system

Extracted from `LIS-10747_Ward_Assigned_Request_No_Reminder.pptx`, the approved
reference deck. generate-pptx uses this visual system for any content;
design-review-pptx uses it for CP3 reviews. Everything here is encoded in
`deck-kit.js` — read this to understand *why*, but never retype a hex value or
a coordinate into a deck spec.

Canvas: **16:9, 13.333 × 7.5 in**. All geometry in inches.

---

## Palette

15 tokens. `qa-deck.js` rejects any colour outside this set, so extending the
palette is a deliberate edit to `deck-kit.js`, not something a deck does on its own.

| Token | Hex | Role |
|-------|-----|------|
| `ink` | `08323B` | dark canvas, dark panels, table header, all heading text |
| `elevated` | `13525F` | raised card **on** a dark canvas |
| `accent` | `0B6E7F` | eyebrows, step numerals, hexagon outlines, enabled values |
| `accentTint` | `E4F0F2` | accent-toned panel |
| `onDarkMuted` | `8FBAC3` | secondary text on dark |
| `onDarkFaint` | `6E9199` | tertiary text on dark |
| `body` | `56676C` | body text on light; neutral / "suppressed" marker |
| `neutralTint` | `F1F3F3` | neutral panel |
| `warn` | `C87F22` | amber **fills**, arrows, and large display type |
| `warnInk` | `9A5C15` | amber **text on light grounds** — see Contrast below |
| `warnTint` | `FAEEDB` | amber callout banner, "shown" cells |
| `danger` | `A8443A` | problem markers, `!` badges |
| `dangerTint` | `F7E7E4` | problem card |
| `rule` | `D5DEE0` | table gridlines |
| `codeComment` | `7F9AA1` | comment lines inside a dark code panel |
| `white` | `FFFFFF` | — |

### Semantics

The colour carries meaning; keep it consistent or the deck stops being readable
at a glance.

- **teal** (`accent`, `accentTint`) — current, correct, enabled
- **amber** (`warn`, `warnInk`, `warnTint`) — attention, output, the thing that happens
- **red** (`danger`, `dangerTint`) — problem, defect, the thing that hurts
- **grey** (`body`, `neutralTint`) — neutral, suppressed, no-op

### Contrast

`qa-deck.js` checks every text run against its resolved background.

- **default profile** — 4.0 normal / 3.0 large. The floor for a projected slide.
- **`--strict`** — 4.5 / 3.0, WCAG 2.1 AA. Use this if the deck will be read on
  a laptop or circulated as a document rather than presented.

`warn` (`C87F22`) as *text* fails badly on light grounds — 2.81:1 on `warnTint`,
3.22:1 on white. That is why `warnInk` exists: same hue, 4.68:1 and 5.36:1.
**Use `warn` for fills and 18pt+ display type; use `warnInk` for amber text.**

Three pairings inherited from the approved deck sit between 4.0 and 4.5, so they
pass the default profile and fail `--strict`:

| Pairing | Ratio | Where |
|---------|-------|-------|
| `onDarkMuted` on `elevated` | 4.16 | stat-chip labels, closing next-step bodies |
| `onDarkFaint` on `ink` | 4.04 | title-slide footer |
| `warn` on `ink` | 4.26 | highlighted token in the code panel |

They were left as approved rather than silently restyled. If a deck needs AA,
raise them at the token level in `deck-kit.js` — don't patch individual slides.

---

## Typography

Three families, all shipped with Office. Nothing else — HA Windows desktops are
not guaranteed to have anything more exotic, and a missing font resolves to a
substitute that wrecks the layout.

| Family | Use |
|--------|-----|
| **Cambria** | display only: slide H1, hero, card titles, big stats |
| **Calibri** | body and UI: paragraphs, eyebrows, labels |
| **Courier New** | code, identifiers, JIRA keys, constant names |

### The ladder

Every size in the deck is one of these. Reach for the nearest rung rather than
inventing a value.

| Token | pt | Use |
|-------|-----|-----|
| `micro` | 9 | stat-chip caption, condition-strip label |
| `chip` | 9.5 | pill tag text |
| `label` | 10 | sidebar eyebrow |
| `eyebrow` | 11 | section eyebrow, flow branch labels |
| `fine` | 11.5 | dense footnotes, terminal node |
| `small` | 12 | captions, secondary body |
| `bodySm` | 12.5 | card body in dense layouts |
| `body` | 13 | default body |
| `lead` | 14 | callout banner, stat-chip value |
| `cardTitleSm` | 15 | finding titles |
| `cardTitle` | 16 | scope-row titles |
| `cardTitleLg` | 17 | takeaway card titles |
| `cardTitleXl` | 18 | step card titles |
| `sidebar` | 22 | sidebar headline |
| `headingSm` | 26 | closing headline |
| `heading` | 30 | slide H1 |
| `hero` | 40 | title-slide hero |
| `stat` | 62 | closing date / big number |

---

## Grid

| Constant | Value | Meaning |
|----------|-------|---------|
| `margin` | 0.60 | left margin, content slides |
| `marginDark` | 0.75 | left margin, dark bookend slides |
| `contentW` | 12.13 | content width |
| `right` | **12.73** | hard right edge — four slides land on it exactly |
| `eyebrowY` | 0.38 | eyebrow baseline |
| `headingY` | 0.68 | H1 baseline |
| `bandTop` | 1.90 | top of the main content band |
| `bandBottom` | 6.68 | bottom band must end by here |
| `pad` | 0.30 | card interior padding |
| safe area | x 0.60→12.73, y 0.38→6.95 | enforced by `qa-deck.js` |

### Column arithmetic

`columns(n, gap, left, width)` divides a span into `n` equal columns.

| Layout | Width | Gap | Column |
|--------|-------|-----|--------|
| 3-up cards (`evolution`) | 12.00 | 0.42 | 3.72 |
| 2-up cards (`matrix` takeaways) | 12.13 | 0.23 | 5.95 |
| split (`steps-sidebar`) | — | 0.30 | 8.35 + 3.48 |

`evolution`'s row is 12.00 wide, so it stops 0.13 short of the right edge while
the callout beneath it runs full width. That is the reference deck's measurement,
kept for fidelity. Widen the gap to 0.485 if you want the edges flush.

---

## Craft rules

These are what separate this deck from a bulleted one. They are not decoration.
Craft sources (structure / density / asks — **not** palette or type): HA
[General PPTX Preparation Best Practices](file:///D:/ECP/LIS/References/General%20PPTX%20Preparation%20Best%20Practices.md)
and Awesome-PPT-Design-Skills. Visual kit stays LIS-10747 teal + Cambria/Calibri/Courier New.

1. **Text is not inside the shape.** Panels are fill-only `roundRect`s with a
   separately-positioned textbox laid over them. That is the only way to control
   padding exactly. Flow nodes, badges and chips are the exception — they carry
   their own text because they must stay centred.

2. **`addShape(shape, { text })` silently drops the text** in pptxgenjs 3.12.
   `addText(str, { shape })` is the only working API. `deck-kit.shapeText()`
   wraps it; never call `addShape` with a `text` option.

3. **Mixed-colour runs in one paragraph** carry emphasis (`"The blocker:"` in
   `warnInk`, the rest in `ink`) and pseudo-syntax-highlighting in code panels
   (white / `warn` / `codeComment`). Use `richText()`.

4. **Eyebrow + headline on every content slide.** That pair is the deck's
   navigation — without it a reader landing mid-deck has no idea where they are.

5. **Every slide ends in a bottom band** — a callout, a footnote, a condition
   strip, or takeaway cards. Nothing floats in dead space. (Quiet page marks
   `N / total` sit below the band for Q&A reference.)

6. **Semantic conditional fill.** In a matrix, tint the *outcome* column by
   value (`warnTint` = happens, `neutralTint` = suppressed). The table then
   reads before it is read.

7. **No bullets.** Everything is a card, a row, a chip, a cell, or a flow node.
   If content wants to be a bullet list, it wants to be `cards` or `agenda`.

8. **Dark bookends.** The opening and closing slides are `ink`; everything
   between is white. Two dark slides frame the deck; a third dilutes it.

9. **Speaker notes on every slide** — one to three sentences of what you would
   *say*, not a restatement of what is on screen.

10. **Visual-first.** Existing / proposed flows prefer diagram archetypes
    (`image`, `decision-flow`, `compare`) over prose card walls.

11. **Negative space.** Prefer ≤3 cards per row; leave quiet margin; one
    dominant block per slide.

12. **Number every slide** and put concrete `asks` before open Q&A when the
    meeting needs reviewer confirmation.

10. **Tight word budget.** Roughly 40 body words a slide; `qa-deck.js` warns
    past 90. If it does not fit, it is two slides.
