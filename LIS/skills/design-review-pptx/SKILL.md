---
name: design-review-pptx
description: >
  Generates visual .pptx decks for LIS/HA CP3 design reviews from a declarative
  deck spec — cards, flowcharts, matrices and code panels rather than bullet
  lists. Use when the user asks to prepare CP3 design review slides, create a
  design review deck, or build a presentation from a JIRA design note. Triggers
  on "design review", "CP3", "JIRA design note to slides". For any other
  PowerPoint, deck, or presentation from notes, markdown, meetings, or pasted
  content, use generate-pptx.
---

# Design Review PowerPoint

Produce a **deck spec** (JSON), then render it with the bundled generator. The
visual system is extracted from the approved LIS-10747 deck and lives in
`deck-kit.js`: 15 palette tokens, a 3-family type ladder, a fixed grid, and 14
slide archetypes.

**Never hand-write pptxgenjs or python-pptx for a design review.** The whole
point of the kit is that colours and coordinates are decided once. A deck spec
names archetypes and fills slots; it does not set positions.

> The previous HA-template generator (python-pptx, 4:3, bullet lists) is retired
> in `legacy/`. See `legacy/README.md` if you specifically need that template.

---

## Workflow

```
Task Progress:
- [ ] 1. Gather inputs (JIRA note, service, review type, date)
- [ ] 2. Choose the slide sequence
- [ ] 3. Write the deck spec JSON
- [ ] 4. Generate the .pptx
- [ ] 5. QA — must exit 0
- [ ] 6. Preview and actually look at it
```

### Step 0 — Resolve the skill directory and install

`<skill-dir>` is the folder containing **this** SKILL.md. In Cursor that is
wherever the skill was surfaced from; in the vault it is
`LIS/skills/design-review-pptx/`. Do not hardcode either path — derive it.

```bash
cd <skill-dir> && npm install
```

Node 18+. The only dependency is `pptxgenjs`.

### Step 1 — Gather inputs

| Field | Example | Required |
|-------|---------|----------|
| JIRA key | LIS-10747 | Yes |
| Title | Setup-Driven Reminder for Ward-Assigned Request No. | Yes |
| Service / repo | lis-ecpath5-app | Yes |
| Review forum | CP3 | Yes |
| Target date | 31 Jul 2026 | Yes |
| Review type | incremental / full | Yes |
| JIRA design note | `LIS/JIRA/{Note}.md` | Yes |
| Diagrams | architecture PNG/SVG | As needed |

Preferred input is the `## Design` section of the JIRA note written by
**lis-jira-log-creator** and populated by **generate-design**. If that section is
empty, build from Background + Change Description + Justification and mark the
design status as draft on the closing slide — do not invent design detail.

See [references/content-rules.md](references/content-rules.md) for the full
section-to-archetype mapping.

### Step 2 — Choose the slide sequence

**Incremental** (bug fix, targeted change) — 6–10 slides:

```
title-hero → evolution → code-findings|compare|image → decision-flow|steps-sidebar
           → cards (Promotion) → cards (Fallback) → asks → statement (Q&A) → closing
```

Start from `examples/LIS-10747.deck.json` and add an `asks` slide before Q&A.

**Full** (new service, migration) — 14–22 slides:

```
title-hero → agenda → thesis (Executive Summary)
           → Background → Existing (visual-first) → Proposed (+ compare)
           → Deep Dive (optional) → Trade-offs → Impact
           → Promotion → Fallback → asks → Q&A → closing
```

Full reviews require Open Questions (`asks`) before the closing Q&A `statement`.
Promotion maps Best Practices “Implementation Plan” in narrative only — keep
`cards` / `steps-sidebar`. Run QA with `--profile cp3`.

Pick per slide from the table at the end of
[references/slide-archetypes.md](references/slide-archetypes.md).

### Step 3 — Write the deck spec

`docs/{Title}.deck.json` in the project repo, or beside the JIRA note.

```json
{
  "meta": { "title": "LIS-10747 Ward-Assigned Request No. Reminder",
            "subject": "…", "author": "LIS Team", "company": "Hospital Authority" },
  "slides": [
    { "archetype": "title-hero", "headline": "…", "notes": "…" },
    { "archetype": "evolution", "eyebrow": "Background", "title": "…",
      "steps": [ … ], "notes": "…" }
  ]
}
```

Rules:

- **Every slide** needs `archetype` and `notes`. Content slides also need
  `eyebrow` and `title`.
- **Never put a hex colour, font name, or x/y coordinate in a spec.** Use tone
  names (`neutral`, `accent`, `warn`, `danger`, `ink`) and colour tokens
  (`ink`, `body`, `accent`, `warnInk`, …). QA rejects anything off-palette.
- **Amber text uses `warnInk`, not `warn`** — `warn` is for fills and 18pt+
  display type only. See the Contrast section in
  [references/design-system.md](references/design-system.md).
- Image paths resolve relative to the spec file — keep diagrams beside it.
- Reuse a slide from a prior deck:
  ```bash
  node <skill-dir>/generate-deck.js prior.deck.json --extract "Message Processing"
  ```
  `--list` prints every slide with its archetype.

### Step 4 — Generate

```bash
node <skill-dir>/generate-deck.js "docs/{Title}.deck.json" "docs/{Title}.pptx"
```

Omit the output path to write `{Title}.pptx` beside the spec.

### Step 5 — QA

```bash
node <skill-dir>/qa-deck.js "docs/{Title}.deck.json"
```

Must exit 0 before you hand the deck over. It checks what the eye misses:
contrast against the resolved background, safe-area bounds, table extent and
collisions, text overflow, palette and font drift, missing notes, placeholder
text, agenda coverage.

Add `--strict` for WCAG AA (4.5:1) if the deck will be read on screen rather
than projected; the default 4.0 floor is tuned for projection.

### Step 6 — Preview

There is no headless pptx renderer on the LIS boxes, so this is how you look at
a deck before PowerPoint:

```bash
node <skill-dir>/preview-deck.js "docs/{Title}.deck.json"
```

Writes `{Title}.preview.html` — a 1:1 render at 96px/inch from the same recorded
draw calls the generator emits. Open it and check every slide. Fonts and text
wrapping are the browser's approximation; all geometry is exact.

---

## Files

| File | Purpose |
|------|---------|
| `deck-kit.js` | Palette, type ladder, grid, drawing primitives |
| `archetypes.js` | The 12 slide patterns |
| `generate-deck.js` | Deck spec → .pptx (`--list`, `--extract`) |
| `qa-deck.js` | Mechanical checks (`--strict`, `--warn-only`) |
| `preview-deck.js` | Deck spec → 1:1 HTML preview |
| `record.js` | Shared draw-call recorder behind QA and preview |
| `examples/LIS-10747.deck.json` | The approved reference deck |
| [references/design-system.md](references/design-system.md) | Palette, type, grid, craft rules |
| [references/slide-archetypes.md](references/slide-archetypes.md) | All 12 with slot schemas |
| [references/content-rules.md](references/content-rules.md) | JIRA-note mapping, writing rules |
| `legacy/` | Retired HA-template generator |

---

## Extending

Adding an archetype is a change to `archetypes.js` — compose it from `deck-kit`
primitives (`panel`, `badge`, `chip`, `richText`, `connector`, `shapeText`,
`bottomBand`) and export it. It then works in the generator, QA and preview at
once, because all three run the same code.

Changing a colour or a size is a change to `deck-kit.js`, never to a deck spec.
If two decks need the same one-off, it is an archetype, not a `custom` slide.

## Gotchas

- **`addShape(shape, { text })` silently drops the text** in pptxgenjs 3.12. Use
  `deck-kit.shapeText()`, which wraps the working `addText(str, { shape })`.
- **Table height is set by row heights, not the `h` you pass.** A matrix with
  more than 5 body rows collides with its takeaway cards; QA catches this.
- **PowerPoint does not clip overflowing text**, it spills it over whatever is
  underneath. Heed the overflow warnings.
- **Only Cambria, Calibri and Courier New.** Anything else may not exist on an
  HA desktop and will resolve to a substitute that breaks the layout.

## Related skills

- **lis-jira-log-creator** — the change-request note (upstream)
- **generate-design** — the `## Design` section in that note (upstream)
- **generate-pptx** — the same visual kit for any non-CP3 content
- **mermaid-diagrams** — diagrams to embed via the `image` archetype
