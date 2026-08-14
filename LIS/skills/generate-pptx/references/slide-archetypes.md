# Slide archetypes

Twelve patterns plus an escape hatch. Each slide in a deck spec names one and
fills its slots. Geometry comes from `deck-kit.js` — a spec never sets
coordinates except where a slot explicitly takes a width.

Common slots on every content archetype:

| Slot | Type | Notes |
|------|------|-------|
| `archetype` | string | required |
| `eyebrow` | string | upper-cased automatically |
| `title` | string | the H1 |
| `notes` | string | speaker notes; QA warns if missing |

---

## 1. `title-hero` — dark opening slide

```json
{ "archetype": "title-hero",
  "eyebrow": "LIS-10747   ·   CHANGE REQUEST   ·   PRIORITY: MEDIUM",
  "headline": "Setup-Driven Reminder for\nWard-Assigned Request No.",
  "lede": "One or two sentences of what this is.",
  "stats": [ { "label": "Service", "value": "lis-ecpath5-app" } ],
  "footer": "Design status: draft  ·  for CP3 review",
  "fullWidth": false }
```

2–4 `stats`. `fullWidth: true` spans them to the right edge; the default keeps
them under the text column (the reference deck's left-weighted look).
QA warns if there is no date. Under `--profile cp3` it also requires a JIRA key
and warns if there is no service name.

## 2. `evolution` — how we got here

```json
{ "archetype": "evolution",
  "steps": [ { "badge": 1, "tone": "neutral", "tag": "LIS-8437",
               "title": "Blood taking within cluster", "body": "…" } ],
  "callout": { "lead": "The blocker:", "text": "…" } }
```

2–4 `steps`, drawn left to right with arrow connectors. `tone` is one of
`neutral` / `accent` / `warn` / `danger` and tints both the card and its badge —
use it to show the arc (neutral → danger → accent reads as "was fine, broke,
fixed"). `tag` renders monospace. `callout` is optional; `lead` is emphasised in
`warnInk`.

## 3. `code-findings` — what the code does today

```json
{ "archetype": "code-findings",
  "code": { "filename": "GcrSpecAckUIComponents.as",
            "lines": [ [ { "text": "if (", "color": "white" },
                         { "text": "LisGlobal.hospital", "color": "warn" } ],
                       "plain line" ],
            "caption": "One line on what the code implies." },
  "findings": [ { "mark": "!", "title": "Rollout needs code", "body": "…" } ],
  "findingTone": "danger",
  "footnote": "…" }
```

Each entry in `lines` is a plain string or an array of runs for token colouring.
Run colours: `white` (default), `warn` (the token you want the room to look at),
`comment`. Up to 3 `findings`; `findingTone` is `danger` (default) or `accent`.

## 4. `decision-flow` — the proposed logic

```json
{ "archetype": "decision-flow",
  "start": { "text": "Acknowledge specimen\nwith no request no.", "w": 2.35 },
  "decisions": [
    { "text": "WARD_PRINT_LABNO_LABEL\n= 'Y' ?", "w": 3.25, "fontSize": 11,
      "inLabel": "Yes",
      "fallthrough": { "label": "No", "title": "No popup", "body": "…" } } ],
  "terminal": { "label": "No", "text": "Show reminder popup" },
  "condition": { "label": "Effective condition", "code": "a && !b", "note": "…" } }
```

Decisions chain left to right as hexagons. Each may drop a `fallthrough` outcome
box beneath it; `terminal` is the amber node everything funnels into. Use
explicit `\n` in node text — the hexagon is narrow and auto-wrapping is ugly.
Two decisions fit comfortably; three is the ceiling.

## 5. `matrix` — how each case resolves

```json
{ "archetype": "matrix",
  "table": { "y": 1.95, "colWidths": [1.55, 2.75, 3.05, 2.83, 1.95],
             "headers": [ "Hospital", { "text": "WARD_PRINT_LABNO_LABEL", "mono": true } ],
             "rows": [ [ { "text": "QEH", "bold": true },
                         { "text": "Shown", "tone": "warn", "color": "warnInk", "bold": true } ] ] },
  "takeaways": [ { "tone": "accent", "title": "…", "body": "…" } ] }
```

Cells are a string or `{ text, tone, color, mono, bold }`. `tone` fills the cell
(`warn` / `neutral` / `accent` / `danger`) — reserve it for the **outcome
column** so the table reads at a glance. `colWidths` must sum to 12.13.

Rows are 0.55 high, header 0.52. QA computes the real extent and errors if the
table collides with the takeaway cards — with two takeaway cards, **five body
rows is the maximum**.

## 6. `steps-sidebar` — scope of change

```json
{ "archetype": "steps-sidebar",
  "steps": [ { "badge": 1, "title": "Remove the QEH hardcode",
               "body": "…", "tag": "lis-ecpath5-app" } ],
  "sidebar": { "eyebrow": "Why now", "headline": "KTH is next", "body": "…",
               "points": ["No DB migration", "No new control"] } }
```

3 steps is the sweet spot, 4 the maximum. `tag` is the chip on the right of each
row — service name, or `Test`. Omit `sidebar` to run the rows full width.

## 7. `closing` — the last slide

```json
{ "archetype": "closing",
  "eyebrow": "Next", "headline": "Target completion", "stat": "31 JUL 2026",
  "note": "…",
  "nextSteps": [ { "badge": 1, "title": "…", "body": "…" } ],
  "identity": { "key": "LIS-10747", "meta": "lis-ecpath5-app  ·  Change Request" } }
```

`stat` is the 62pt amber anchor — a date, a count, a percentage. 3 `nextSteps`.

## 8. `agenda`

```json
{ "archetype": "agenda",
  "items": [ "Background", { "title": "Design Review", "note": "the change itself" } ] }
```

Rows auto-fit; up to 6 items. QA warns when an agenda item has no matching slide
eyebrow or title later in the deck.

## 9. `cards` — generic grid

```json
{ "archetype": "cards", "perRow": 3,
  "cards": [ { "badge": 1, "tone": "neutral", "tag": "step 1",
               "title": "…", "body": "…" } ],
  "callout": { "text": "…" } }
```

The workhorse for **Promotion**, **Fallback**, benefits, risks — anything that
would otherwise be a bullet list. `tone: "ink"` or `"elevated"` inverts a card to
dark and flips its text colours automatically.

## 10. `image` — diagram

```json
{ "archetype": "image", "path": "architecture.png",
  "caption": "…", "panel": true, "tone": "neutral" }
```

`path` resolves relative to the **deck spec file**, so keep diagrams beside it.
The image is contained, never stretched. `panel: false` drops the backing card.

## 11. `statement` — divider / Q&A

```json
{ "archetype": "statement", "align": "center",
  "eyebrow": "…", "headline": "Q&A", "body": "…", "fontSize": 40 }
```

Dark full-bleed. Use for section breaks and the closing Q&A. No eyebrow/title
requirement.

## 12. `compare` — before / after

```json
{ "archetype": "compare",
  "left":  { "label": "Today", "tone": "danger", "title": "Hardcoded",
             "code": ["if (hospital == QEH) {"], "points": ["…"] },
  "right": { "label": "Proposed", "tone": "accent", "title": "Setup-driven",
             "code": ["if (enabled && !relabel) {"], "points": ["…"] },
  "callout": { "text": "…" } }
```

Defaults to `danger` left / `accent` right, which reads as problem → solution.

## `custom` — escape hatch

```json
{ "archetype": "custom", "eyebrow": "…", "title": "…",
  "ops": [ { "kind": "shape", "shape": "roundRect", "options": { … } },
           { "kind": "text", "text": "…", "options": { … } } ] }
```

Raw pptxgenjs calls under the standard header. `kind` is `text`, `shape`,
`image` or `table`. QA still checks bounds, palette and contrast, so a custom
slide cannot quietly break the system. If you reach for this twice for the same
shape, it belongs in `archetypes.js` instead.

---

## Picking one

| The slide is… | Archetype |
|---------------|-----------|
| the cover | `title-hero` |
| what we will cover | `agenda` |
| history / how the problem arose | `evolution` |
| the current implementation | `code-findings` |
| old vs. new side by side | `compare` |
| the new conditional logic | `decision-flow` |
| per-case behaviour, regression grid | `matrix` |
| what we are changing | `steps-sidebar` |
| promotion, fallback, risks, benefits | `cards` |
| an architecture or sequence diagram | `image` |
| a section break or Q&A | `statement` |
| dates, owners, sign-off | `closing` |
