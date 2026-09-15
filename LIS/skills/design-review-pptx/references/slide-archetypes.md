# Slide archetypes

Fifteen patterns plus an escape hatch, drawn in the Technical Design Review
Template style ([design-system.md](design-system.md)). Each slide in a deck spec
names one and fills its slots. Geometry comes from `deck-kit.js`; content blocks
are measured and centred in the band. A spec never sets coordinates.

Common slots on every content archetype:

| Slot | Type | Notes |
|------|------|-------|
| `archetype` | string | required |
| `eyebrow` | string | caps + letter-spaced automatically (`02A. Architecture evolution`) |
| `title` | string | the H1 |
| `notes` | string | speaker notes; QA warns if missing |

Shared optional slots: `tone` (`neutral` `accent` `success` `warn` `danger`
`ink`), `icon` (a name from `assets/icons/`), `callout` (`{ lead, text }` — a
quiet line under the block).

[`examples/TDR-template.deck.json`](../examples/TDR-template.deck.json) uses
every template layout.

---

## 1. `title-hero` — dark cover (template 1)

```json
{ "archetype": "title-hero",
  "eyebrow": "Architecture Governance · Phase 2 ARB",
  "headline": "Core Platform Technical Design Review",
  "lede": "One or two sentences of what this is.",
  "stats": [ { "label": "Lead Architect", "value": "Systems Engineering Team" },
             { "label": "Status", "value": "Pending Review Board", "highlight": true } ],
  "presenters": "Alice Chan", "reviewers": "CP3 panel",
  "footer": "Design status: draft" }
```

The first `·` part of `eyebrow` is the sky label, the rest follows a short rule.
`stats` (plus `presenters` / `reviewers`) become the meta row with vertical
dividers; `highlight` turns a value sky. QA warns if there is no date; under
`--profile cp3` it requires a JIRA key and warns if no service is named.

## 2. `agenda` — numbered rows (template 2)

```json
{ "archetype": "agenda",
  "items": [ "Background", { "title": "Design Review", "note": "the change itself" } ] }
```

White row cards with `01`, `02` numerals. Up to 6 items. QA warns when an agenda
item has no matching slide eyebrow, title or headline.

## 3. `cards` — 2/3/4-up grid (templates 3, 10, 13, 16)

```json
{ "archetype": "cards", "perRow": 3,
  "cards": [ { "icon": "bolt", "title": "Throughput Scaling", "body": "…" },
             { "label": "Decision", "tone": "success", "title": "…", "body": "…" },
             { "tag": "Stage 1", "title": "Infra Build", "body": "…" },
             { "badge": 1, "title": "Deploy dark", "body": "…" } ],
  "callout": { "lead": "Note:", "text": "…" } }
```

Stack order inside a card: `icon`, `badge` (tinted circle), `label` (small caps
coloured by tone — ADR `Context / Decision / Trade-off`), `tag` (display caps,
`STAGE 1`), title, body. Cards hug their content. `tone: "ink"` makes a dark
card; `highlight: true` gives the sky border. The workhorse for Promotion,
Fallback, risks, benefits.

## 4. `stats` — numbers (templates 7, 8)

```json
{ "archetype": "stats",
  "stats": [ { "value": "P95 < 4s", "label": "Sorter wait path", "body": "…" } ] }
```

One item → centred 90pt sky number with label and body. Two to four → a card
grid with 39pt values.

## 5. `compare` — two cards (templates 5, 9, 17)

```json
{ "archetype": "compare",
  "left":  { "label": "Existing Design", "tone": "danger", "title": "C Unix Daemon",
             "points": ["Trigger: Local crontab polling loop"] },
  "right": { "label": "Proposed Design", "tone": "accent", "title": "Microservice",
             "points": ["Trigger: Central scheduler per lab"] } }
```

Three shapes from the same archetype:

- **`label`** → tinted pill beside the title (existing vs proposed). The right
  side is highlighted when it has a label and `accent` tone; override with
  `highlight`.
- **`icon`** with no label → icon beside the title (key-value cards).
- **`steps`** → numbered tinted circles (Promotion / Fallback runbook), e.g.
  `{ "icon": "cloud-arrow-up", "tone": "success", "title": "Promotion Procedure",
  "steps": ["…", "…"] }`.

`points` render as `Label: value` with the label bold (a string without `: `
is a plain line). `code` (array of lines) renders in a quiet inset panel;
`body` is a plain paragraph. Defaults: left `danger`, right `accent`.

## 6. `image` — diagram (templates 6, 14)

```json
{ "archetype": "image", "path": "architecture.png", "caption": "…",
  "cards": [ { "title": "Edge Gateway Layer", "body": "…", "icon": "server" } ],
  "side": "right" }
```

Without `cards`: the image in a card, centred, native aspect ratio. With
`cards`: image column plus a stack of cards; `side` is where the cards go
(`right` default). `path` resolves relative to the deck spec. `panel: false`
drops the image card.

## 7. `matrix` — table (templates 11, 15)

```json
{ "archetype": "matrix",
  "table": { "colWidths": [1.85, 1.5, 2.75, 5.9],
             "headers": ["Column Name", "Data Type", "Constraints", "Functional Role"],
             "rows": [ [ { "text": "id", "mono": true }, "BIGINT",
                         { "text": "PRIMARY KEY", "bold": true, "color": "strong" }, "…" ],
                       [ "Legacy DB sync lag", { "text": "High", "tone": "danger" }, "…", "…" ] ] },
  "takeaways": [ { "title": "…", "body": "…" } ] }
```

Borderless table in a card: `headerFill` header with a strong underline, white
rows with hairlines. Cells are strings or `{ text, tone, color, mono, bold }` —
`mono` renders sky Consolas, `tone` renders coloured bold text (severity),
`color` takes a token. `colWidths` are relative and scaled to 12.00in. Rows are
0.5in; QA errors if the table collides with anything below it.

## 8. `code-findings` — code panel + side cards (template 12)

```json
{ "archetype": "code-findings",
  "code": { "filename": "job_definition_seed.sql", "language": "SQL",
            "lines": [ [ { "text": "INSERT INTO", "color": "keyword" },
                         { "text": " scheduler.job_definition" } ],
                       [ { "text": "-- comment", "color": "comment" } ] ],
            "caption": "…" },
  "findings": [ { "title": "Nature Inserted Once", "body": "…", "icon": "database" } ],
  "footnote": "…" }
```

Line runs take token colours `keyword`, `string`, `literal`, `comment`, `text`
(older specs' `white` / `warn` / `accent` / `danger` still map). A finding may
carry `icon` or `mark` (tinted circle, `findingTone` `danger` default / `accent`).

## 9. `evolution` — how we got here

```json
{ "archetype": "evolution",
  "steps": [ { "badge": 1, "tone": "neutral", "tag": "LIS-8437", "title": "…", "body": "…" } ],
  "callout": { "lead": "The blocker:", "text": "…" } }
```

2–4 cards joined by arrows. `tone` colours the badge and tag (neutral → danger
→ accent reads "was fine, broke, fixed"). `"badge": false` hides the circle.

## 10. `decision-flow` — conditional logic

```json
{ "archetype": "decision-flow",
  "start": { "text": "Acknowledge specimen\nwith no request no.", "w": 2.35 },
  "decisions": [ { "text": "WARD_PRINT_LABNO_LABEL\n= 'Y' ?", "w": 3.25, "inLabel": "Yes",
                   "fallthrough": { "label": "No", "title": "No popup", "body": "…" } } ],
  "terminal": { "label": "No", "text": "Show reminder popup" },
  "condition": { "label": "Effective condition", "code": "a && !b", "note": "…" } }
```

Hexagon decisions left to right; `terminal` is the solid sky node; `condition`
is a dark code strip. Use explicit `\n` in node text. Two decisions fit; three
is the ceiling.

## 11. `steps-sidebar` — scope of change

```json
{ "archetype": "steps-sidebar",
  "steps": [ { "title": "Remove the QEH hardcode", "body": "…", "tag": "lis-ecpath5-app" } ],
  "sidebar": { "eyebrow": "Why now", "headline": "KTH is next", "body": "…",
               "points": ["No DB migration"] } }
```

Numbered row cards (tag as a pill) beside a dark sidebar card. 3 steps is the
sweet spot, 4 the maximum. Omit `sidebar` for full-width rows.

## 12. `thesis` — executive summary

```json
{ "archetype": "thesis", "lede": "One-sentence thesis.",
  "proofs": [ { "title": "Problem", "body": "…" } ],
  "goal": "Confirm the rule and rollout window.", "goalLead": "Meeting goal:" }
```

2–3 proof cards; `goal` is the quiet line underneath.

## 13. `asks` — open questions

```json
{ "archetype": "asks",
  "asks": [ { "q": "Is send-out determined by destination lab only?", "why": "…" },
            "Do we return sync status on every path?" ] }
```

Agenda-style numbered rows. 3–6 concrete questions, before the closing Q&A.

## 14. `statement` — section divider or dark message

```json
{ "archetype": "statement", "tone": "light",
  "eyebrow": "Section 02 · System Specification",
  "headline": "Core Architecture & Data Pipeline Design", "body": "…" }
```

`tone: "light"` → white section divider (template 4). Otherwise dark; `align:
"center"` centres it, `icon` adds the icon disc. Use the dark form for Q&A.

## 15. `closing` — decision / sign-off (template 18)

```json
{ "archetype": "closing", "icon": "clipboard-check",
  "headline": "Architecture Review Decision", "stat": "P95 < 4s",
  "note": "Seeking sign-off from …",
  "nextSteps": [ { "title": "Action Required", "body": "Sign-off approval" } ],
  "identity": { "key": "LIS-10747", "meta": "lis-ecpath5-app · Change Request" } }
```

Centred on dark: icon disc (`"icon": false` removes it), optional eyebrow,
headline, optional sky `stat`, body, `nextSteps` as meta columns, `identity` as
a footer line.

## `custom` — escape hatch

```json
{ "archetype": "custom", "eyebrow": "…", "title": "…",
  "ops": [ { "kind": "shape", "shape": "roundRect", "options": { … } },
           { "kind": "text", "text": "…", "options": { … } } ] }
```

Raw pptxgenjs calls under the standard header. QA still checks bounds, palette
and contrast. If you reach for it twice for the same shape, add an archetype.

---

## Picking one

| The slide is… | Archetype |
|---------------|-----------|
| the cover | `title-hero` |
| what we will cover | `agenda` |
| TL;DR / meeting goal | `thesis` |
| a section break | `statement` (`tone: "light"`) |
| drivers, scope, security controls | `cards` with `icon` |
| history / how the problem arose | `evolution` |
| existing vs proposed | `compare` with `label` |
| two systems side by side | `compare` with `icon` |
| architecture diagram (+ notes) | `image` (+ `cards`) |
| SLAs, targets, benchmarks | `stats` |
| a decision record | `cards` with `label` + tone |
| schema, risk register, per-case matrix | `matrix` |
| the current or new code | `code-findings` |
| the new conditional logic | `decision-flow` |
| what we are changing | `steps-sidebar` |
| milestones | `cards` with `tag` |
| promotion and fallback runbook | `compare` with `steps` |
| reviewer questions | `asks` |
| Q&A | `statement` |
| decision, sign-off, next steps | `closing` |
