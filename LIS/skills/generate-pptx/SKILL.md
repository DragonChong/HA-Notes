---
name: generate-pptx
description: >
  Turns any source material into a 16:9 .pptx using a declarative deck spec and
  a fixed visual kit (cards, matrices, code panels, decision flows — not bullet
  lists). Use whenever the user wants a PowerPoint, slides, a deck, or a
  presentation from notes, markdown, wiki pages, meeting notes, training
  material, status updates, runbooks, or pasted content — even if they do not
  say "pptx". Do not use for LIS/HA CP3 design reviews from a JIRA design note
  (that is design-review-pptx). Do not use to edit or unpack an existing arbitrary
  .pptx (that is the pptx skill).
---

# Generate PPTX

Produce a **deck spec** (JSON), then render it with the bundled generator. The
visual system lives in `deck-kit.js`: 15 palette tokens, a 3-family type ladder,
a fixed grid, and 14 slide archetypes (including `thesis` and `asks`).

**Never hand-write pptxgenjs or python-pptx.** A spec names archetypes and fills
slots; it does not set positions, hex colours, or fonts.

This skill is the general renderer. **design-review-pptx** is the CP3 specialist
that maps a JIRA `## Design` section onto the same kit. If the user asked for a
CP3 design-review deck, stop and follow that skill instead.

```
any content (md, note, wiki, chat, outline)
        ↓
generate-pptx     →  {Title}.deck.json  →  .pptx

JIRA CR  →  generate-design  →  ## Design  →  design-review-pptx  →  .pptx
```

---

## Workflow

```
Task Progress:
- [ ] 1. Gather content and metadata
- [ ] 2. Classify length and choose the slide sequence
- [ ] 3. Write the deck spec JSON
- [ ] 4. Generate the .pptx
- [ ] 5. QA — must exit 0
- [ ] 6. Preview and actually look at it
```

### Step 0 — Resolve the skill directory and install

`<skill-dir>` is the folder containing **this** SKILL.md. In Cursor that is
wherever the skill was surfaced from; in the vault it is
`LIS/skills/generate-pptx/`. Do not hardcode either path — derive it.

```bash
cd <skill-dir> && npm install
```

Node 18+. The only dependency is `pptxgenjs`.

### Step 1 — Gather content

Accept whatever the user pointed at. Do not invent facts to fill slides.

| Source | How to read it |
|--------|----------------|
| Pasted text / chat | Use it as-is |
| Markdown / wiki / Obsidian note | Read the file; wikilinks stay as titles |
| `### Slide:` outline | Same blocks as generate-design; one block → one slide |
| Existing `.deck.json` | Regenerate / edit; do not rebuild from scratch |
| Images / mermaid | `image` archetype; render mermaid to PNG first (mermaid-diagrams) |

Ask only for what the cover actually needs and the source does not have:
**title**, **date**, **audience or owner**. Do not require a JIRA key.

Write the spec beside the source file as `{stem}.deck.json`. If the source is
chat-only, write under the workspace `docs/` folder, or the path the user named.

See [content-rules.md](references/content-rules.md) for source → archetype
mapping. Optional outline format: [slides-template.md](slides-template.md).

### Step 2 — Choose the slide sequence

| Length | When | Slides | Skeleton |
|--------|------|--------|----------|
| **brief** | status, handover, one topic | 5–8 | title-hero → cards or evolution → steps-sidebar or matrix → closing |
| **standard** | training, proposal, walkthrough | 8–14 | add `agenda`, `compare`, extra `cards` |
| **full** | architecture, long briefing | 14–22 | add `image`, `decision-flow`, `code-findings`, section `statement`s |

Pick per slide from the table at the end of
[references/slide-archetypes.md](references/slide-archetypes.md).

Dark bookends: `title-hero` opens, `closing` or `statement` (Q&A) closes.
Everything between is light.

### Step 3 — Write the deck spec

```json
{
  "meta": { "title": "Cluster Cutover Briefing",
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
  display type only. See Contrast in [references/design-system.md](references/design-system.md).
- Image paths resolve relative to the spec file — keep diagrams beside it.
- Show the slide list (archetype + title) in chat before generating, unless the
  user asked to skip.

Start from [examples/cluster-cutover-briefing.deck.json](examples/cluster-cutover-briefing.deck.json)
when the shape is a short briefing. Reuse a slide from a prior deck:

```bash
node <skill-dir>/generate-deck.js prior.deck.json --extract "Slide title"
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

Must exit 0 before you hand the deck over. It checks contrast, safe-area bounds,
table collisions, overflow, palette and font drift, missing notes, placeholder
text, agenda coverage.

- Default profile: no JIRA key required.
- `--profile cp3`: also requires a JIRA key and warns if no service name.
- `--strict`: WCAG AA (4.5:1) when the deck will be read on screen rather than
  projected. The default 4.0 floor is tuned for projection.

### Step 6 — Preview

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
| `archetypes.js` | The 14 slide patterns |
| `generate-deck.js` | Deck spec → .pptx (`--list`, `--extract`) |
| `qa-deck.js` | Mechanical checks (`--strict`, `--profile cp3`, `--warn-only`) |
| `preview-deck.js` | Deck spec → 1:1 HTML preview |
| `record.js` | Shared draw-call recorder behind QA and preview |
| [examples/cluster-cutover-briefing.deck.json](examples/cluster-cutover-briefing.deck.json) | Brief-length reference |
| [references/design-system.md](references/design-system.md) | Palette, type, grid, craft rules |
| [references/slide-archetypes.md](references/slide-archetypes.md) | All 14 with slot schemas |
| [references/content-rules.md](references/content-rules.md) | Any-content mapping, writing rules |
| [slides-template.md](slides-template.md) | Optional `### Slide:` outline |

---

## Extending

Adding an archetype is a change to `archetypes.js` — compose it from `deck-kit`
primitives (`panel`, `badge`, `chip`, `richText`, `connector`, `shapeText`,
`bottomBand`) and export it. It then works in the generator, QA and preview at
once.

Changing a colour or a size is a change to `deck-kit.js`, never to a deck spec.
If two decks need the same one-off, it is an archetype, not a `custom` slide.

Keep `design-review-pptx` in sync if you change the kit there too — that skill
still ships its own copy for CP3.

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

- **design-review-pptx** — CP3 design-review decks from a JIRA `## Design` section
- **generate-design** — writes that `## Design` section (upstream of CP3 only)
- **mermaid-diagrams** — diagrams to embed via the `image` archetype
- **pptx** — read, unpack, or edit an existing arbitrary .pptx; not for new decks
