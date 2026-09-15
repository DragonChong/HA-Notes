# Design system

Extracted from **Technical Design Review Template.pptx** (the same deck exists
as PDF and Google Slides). design-review-pptx and generate-pptx both render
through this one kit. Everything here is encoded in `deck-kit.js` — read this to
understand *why*, but never retype a hex value, font or coordinate into a spec.

Canvas: **16:9, 13.333 × 7.5 in** (12192000 × 6858000 EMU). All geometry in inches.

Fidelity fixture: [`examples/TDR-template.deck.json`](../examples/TDR-template.deck.json)
rebuilds the template's slides 1–18 with its own content.

---

## Look

- **Dark bookends.** Cover (`title-hero`) and closing / Q&A use `canvasDark`
  `090D16`. Content slides use `canvas` `F8FAFC`; section dividers use white.
- **White cards.** Every content block is a white card with a 0.75pt `E2E8F0`
  border and 0.12in corner radius. The *proposed* side of a comparison gets a
  1.5pt `0284C7` border instead.
- **Header.** Caps, letter-spaced sky eyebrow at y 0.50 (`02A. ARCHITECTURE
  EVOLUTION`) over a 24pt H1 at y 0.79.
- **Centred blocks.** Content is measured and centred vertically around y 4.25
  in the band 1.5–7.0 — no bottom banners, no page marks.
- **Small sky icons** above or beside card titles; tinted pills for labels;
  tinted numbered circles for procedure steps.

## Palette

| Token | Hex | Role |
|-------|-----|------|
| `canvas` | `F8FAFC` | content slide background |
| `canvasDark` | `090D16` | cover, closing, dark statement |
| `white` | `FFFFFF` | cards, section divider |
| `ink` | `0F172A` | H1, card titles; code panel fill |
| `strong` | `334155` | key-value lines, step text |
| `body` | `475569` | card body copy |
| `muted` | `64748B` | notes, meta labels |
| `onDarkMuted` | `94A3B8` | secondary text on dark |
| `onDarkText` | `F1F5F9` | small primary text on dark |
| `border` | `E2E8F0` | card outline, table row hairline |
| `ruleStrong` | `CBD5E1` | table header underline, flow connectors |
| `headerFill` | `F1F5F9` | table header, inset panels |
| `ruleDark` | `1E293B` | dividers and outlines on dark |
| `accent` | `0284C7` | eyebrow, numerals, icons, highlight border |
| `accentInk` | `0369A1` | sky text on `accentTint` (pills, badge numerals) |
| `accentOnDark` | `38BDF8` | accents on dark |
| `accentTint` | `E0F2FE` | proposed pill, accent badge |
| `accentDeep` | `082F49` | icon disc on dark |
| `danger` / `dangerInk` / `dangerTint` | `DC2626` / `B91C1C` / `FEE2E2` | existing / problem |
| `success` / `successInk` / `successTint` | `16A34A` / `15803D` / `DCFCE7` | decision / promotion |
| `warn` / `warnInk` / `warnTint` | `D97706` / `B45309` / `FEF3C7` | trade-off / attention |
| `codeText` `codeKeyword` `codeString` `codeLiteral` `codeComment` | `E2E8F0` `F43F5E` `38BDF8` `FBBF24` `64748B` | code panel tokens |

Legacy aliases (`elevated`, `neutralTint`, `onDarkFaint`, `rule`) map onto the
slate tokens so older specs still render. QA rejects any colour not in the kit.

**`*Ink` rule.** Base hues (`warn`, `success`) are for fills, icons and large
display type. Text in those hues uses the `*Ink` shade — `D97706` text on white
is 3.2:1.

### Tones

`tone` on a card, step or comparison side picks the accent for its label, pill,
badge and icon; the card itself stays white.

| Tone | Label on white | On tint | Icon tint |
|------|----------------|---------|-----------|
| `neutral` | `muted` | `muted` on `headerFill` | `muted` (sky for icons on neutral cards) |
| `accent` | `accent` | `accentInk` on `accentTint` | `accent` |
| `success` | `successInk` | on `successTint` | `success` |
| `warn` | `warnInk` | on `warnTint` | `warn` |
| `danger` | `dangerInk` | on `dangerTint` | `danger` |
| `ink` / `elevated` | dark card, `accentOnDark` | — | `onDark` |

### Contrast

`qa-deck.js` checks every text run against its resolved background.

- **Default floor 3.7:1** (3.0 for large text). Set so the template's own
  pairings pass: sky eyebrow `0284C7` on `F8FAFC` is **3.91:1**, code comment
  `64748B` on `0F172A` is **3.75:1**.
- **`--strict`** — WCAG AA 4.5:1. Flags both pairings above. Use it when the deck
  will be read on screen rather than projected.

Two deliberate deviations from the template, both for contrast: pill and badge
numerals use `accentInk` `0369A1` rather than `0284C7` on `E0F2FE` (3.6:1), and
amber / green text uses the `*Ink` shades.

## Typography

The template uses Space Grotesk and Plus Jakarta Sans. Neither ships with
Office, and pptxgenjs cannot embed fonts, so the kit uses Office-safe stand-ins
that every HA desktop has. Letterforms are close, not identical.

| Kit face | Template face | Use |
|----------|---------------|-----|
| **Segoe UI Semibold** | Space Grotesk / Plus Jakarta bold headings | eyebrows, H1, heroes, card titles, numerals, stats |
| **Segoe UI** | Plus Jakarta Sans | body, labels (bold where the template is bold) |
| **Consolas** | monospace | code, identifiers, mono table columns |

### Ladder (pt)

| Token | pt | Use |
|-------|----|-----|
| `micro` | 9 | ADR labels, language tag |
| `label` | 9.75 | pills, step numerals, code filename |
| `eyebrow` | 10.5 | eyebrow, meta labels, stage labels |
| `fine` | 11.25 | table cells, code, side-card body, agenda notes |
| `small` | 12 | key-value lines, 4-up body, meta values |
| `bodySm` | 12.75 | side-card titles |
| `body` | 13.5 | 3-up body, agenda titles |
| `cardTitle` / `lede` | 15 | card titles; cover and section lede |
| `statLabel` | 18 | single-stat label |
| `heading` | 24 | slide H1 |
| `closing` | 33 | closing / dark statement headline |
| `hero` | 39 | cover and section headline; stat-grid value |
| `stat` | 90 | single hero stat |

## Grid

| Constant | Value |
|----------|-------|
| margin / content width / right edge | 0.667 / 12.00 / 12.667 |
| dark-slide margin | 0.83 |
| eyebrow y / H1 y | 0.50 / 0.79 |
| content band | 1.50 – 7.00, centred on 4.25 |
| card padding / radius | 0.30 / 0.12 |
| gutters | 2-up 0.33 · 3-up 0.25 · 4-up 0.21 |
| safe area (QA) | x 0.60 – 12.74, y 0.45 – 7.05 |

Template column widths fall out of the gutters: 3-up cards 3.83, 4-up 2.84,
2-up 5.84.

## Icons

`assets/icons/*.svg` — 30 Font Awesome Free solid icons (CC BY 4.0, see
`assets/icons/LICENSE`). Decks embed **pre-rendered PNGs** from
`assets/icons/png/<tint>/`, tints `accent`, `onDark`, `success`, `danger`,
`warn`, `muted`. pptxgenjs's own SVG embed writes a broken-image fallback that
Keynote and older Office display.

Add an icon: drop the SVG in `assets/icons/`, run `sh tools/build-icons.sh`
(macOS). Unknown icon names fail generation and QA.

## Craft rules

1. **Cards, not bullets.** Lists become card grids, key-value lines, numbered
   steps or table rows.
2. **One highlighted card per slide at most** — the proposed design.
3. **`Label: value` lines** carry comparisons; the label is bold.
4. **Identifiers in Consolas** — table columns (`mono: true`), code panels,
   tags.
5. **Semantic colour stays consistent:** sky = proposed / current, red =
   existing problem, green = decision / promotion, amber = trade-off.
6. **Speaker notes on every slide**; QA warns when one is missing.
7. **Roughly 40 body words a slide**; QA warns past 90.
