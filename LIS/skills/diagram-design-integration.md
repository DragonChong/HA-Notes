---
title: Diagram Design Integration
date: 2026-08-30
tags:
  - design-doc
  - skills
  - pptx
status: draft
aliases:
  - diagram-design integration
  - LIS diagram skin
---

# Diagram Design Integration

Design documentation for enhancing [[generate-pptx]] and [[design-review-pptx]] with the **diagram-design** skill.

> [!abstract] Summary
> Both deck skills render every diagram that is not a linear card chain or a ≤3-node decision chain through the `image` archetype, sourced from **mermaid-diagrams**. That path has no design system and no QA. This document specifies replacing it with **diagram-design**, skinned to the deck-kit tokens, in three phases — a skinned image pipeline, an editable EMF variant, and native archetypes.

---

## 1. Context

### 1.1 What exists today

`generate-pptx` and `design-review-pptx` share one visual kit — `deck-kit.js`, `archetypes.js`, `qa-deck.js`, `record.js` and `preview-deck.js` are byte-identical between them. `design-review-pptx` is the CP3 fork, carrying the LIS-10747 reference deck and the retired python-pptx generator in `legacy/`.

Diagrams reach a slide by one of three routes:

| Tier | Route | Capability | Editable | Covered by `qa-deck.js` |
|---|---|---|---|---|
| 1 | `decision-flow` | Hexagons chained left→right via `decisionNode()`. Ceiling of 3 decisions, one `terminal`, optional `fallthrough` boxes. | Yes | Yes |
| 2 | `evolution`, `steps-sidebar`, `cards` | Card rows joined by `connector()` — a `rightArrow`/`downArrow` glyph placed at an explicit x/y. No routing logic. | Yes | Yes |
| 3 | `image` | External PNG/JPEG, authored in **mermaid-diagrams**. | No | **No** |

### 1.2 The problem

Anything that is not a linear chain or a ≤3-node decision falls off a cliff into tier 3. For CP3 that is most of what matters: system architecture, message sequences, data flows, integration topology, state lifecycles.

Tier 3 is the weakest link in an otherwise tightly controlled system:

- **No design system.** `mermaid-diagrams` is a syntax reference with no renderer wired in — its export section points at `mermaid.live` or a global `mmdc` install. The result is default-theme Mermaid: grey-lilac fills, Trebuchet, automatic routing.
- **No QA.** `deck-kit.js` locks 15 palette tokens and exactly three font families, and `qa-deck.js` rejects off-palette drift, contrast failures and safe-area breaches. It cannot see inside a PNG.
- **No aspect control.** `imagePixelSize()` in `archetypes.js` parses PNG and JPEG headers only. Any other format returns `null` and the image is stretched to fill the content box.

The net effect: the single most important slide in a CP3 deck is the one slide with no design system and no mechanical check.

### 1.3 Why diagram-design

`diagram-design` v2.6 is already present at `LIS/skills/diagram-design` (symlinked to `D:/Github/diagram-design/skills/diagram-design`) but is **unskinned** — `references/style-guide.md` still carries the shipped atomic-tangerine defaults.

It fits this kit better than the alternatives for three reasons:

1. **It is a rulebook, not a renderer.** Its value is 39 type references, six mandatory connector rules, a complexity budget and a node-treatment grammar — all of which survive translation to pptxgenjs coordinates.
2. **Its design system is skinnable.** Every colour resolves from one `style-guide.md` by semantic role, so the deck-kit palette can be substituted wholesale without touching type-specific logic.
3. **Its SVG is portable.** The output uses inline presentation attributes with zero CSS classes, so the `<svg>` node survives extraction into SVG, PNG and EMF.

> [!info] Alternative considered — archify
> Evaluated and rejected. Its output is a ~708 KB interactive viewer application, and its SVG is styled by CSS semantic classes in the host document, so an extracted `<svg>` renders as a solid black block through the EMF path (verified). Its export requires headless Chrome, which the LIS boxes do not have. Its validator is strong but duplicates `qa-deck.js`.

---

## 2. Goals and non-goals

### Goals

- Every diagram in a deck reads as part of the deck — same palette, same three font families, same density.
- Diagram authoring stays in Mermaid, inside the JIRA note, under the existing `### Diagram: {name}` convention.
- Architecture and sequence diagrams gain the connector discipline the kit currently has no concept of.
- No change to the deck spec contract: a spec still names an archetype and fills slots, never a hex or a coordinate.

### Non-goals

- Replacing `decision-flow`. It works, it is native and it is QA-covered.
- Interactive or animated diagrams. Static only.
- Editing the shared `diagram-design` install in place. See §3.1.
- Any new runtime dependency on the LIS boxes beyond what is already installed.

---

## 3. Phase 1 — Skin and wire the image pipeline

**Committed scope.** Effort ≈ 1 hour. No code change to either skill.

### 3.1 Skin as a named profile, not a working-copy edit

The vault entry is a symlink into a shared git checkout. Editing `references/style-guide.md` directly would be reverted by the next `git pull` and would leak the LIS skin into every other project using that install.

Use the profile mechanism instead:

1. Author the skin and save it as `~/.diagram-design/profiles/lis.md` — a complete `style-guide.md` body with one `<!-- diagram-design-profile -->` header prepended.
2. Drop a marker file at the project root — the service repo containing `docs/*.deck.json` — with exactly one line:

   ```text
   profile: lis
   ```

3. Marker-first resolution reads the profile directly for that generation and leaves the installed working copy byte-for-byte unchanged.

This also suppresses the first-run style-guide gate in `SKILL.md` §0, which would otherwise prompt on every new project.

> [!tip] Slug rules
> `[a-z0-9][a-z0-9-]{0,63}`. `default` is reserved. The marker accepts a single `profile:` line and nothing else — any comment, path or extra key invalidates the whole file.

### 3.2 Token mapping

diagram-design semantic role → deck-kit token.

| Role | deck-kit token | Hex | Rationale |
|---|---|---|---|
| `paper` | `neutralTint` | `F1F3F3` | Matches the `image` archetype's default panel fill exactly |
| `paper-2` | `white` | `FFFFFF` | Secondary container fill |
| `ink` | `ink` | `08323B` | Primary text and stroke |
| `muted` | `body` | `56676C` | Default arrow stroke, secondary text |
| `soft` | `onDarkMuted` | `8FBAC3` | Sublabels, boundary labels |
| `rule` | `rule` | `D5DEE0` | Hairlines |
| `rule-solid` | `rule` | `D5DEE0` | Baselines |
| `accent` | `warn` | `C87F22` | **Focal, 1–2 nodes max** |
| `accent-tint` | `warnTint` | `FAEEDB` | Fill behind an accent stroke |
| `link` | `accent` | `0B6E7F` | HTTP/API calls, external arrows |

**Why amber is `accent` and teal is `link`.** diagram-design's `accent` is the editorial focal colour, capped at 1–2 elements per diagram. In deck-kit, that role belongs to `warn` — it is the `terminal` node in `decision-flow` and the 62 pt `stat` on the closing slide. Teal `accent` is the structural brand colour used broadly for eyebrows, numerals and outlines, which maps onto `link` (API and external arrows) without competing for focus.

> [!warning] Amber text must be `warnInk`
> The deck's own contrast rule applies inside the diagram: `warn` `C87F22` is for **fills, strokes and arrow markers only**. Any amber **text** — a focal node's label, an accent arrow label — uses `warnInk` `9A5C15`. Diagram node names sit at 16 px, well under the 18 pt threshold where `warn` becomes legible as type. This is an LIS addendum; diagram-design has no equivalent rule.

### 3.3 Node treatment — flattened to solid hexes

diagram-design expresses most node fills as `ink @ 0.05`-style alpha. Flatten these against `paper` `F1F3F3` and store solid hexes in the profile.

| Type | Fill | Stroke |
|---|---|---|
| `focal` (1–2 max) | `FAEEDB` | `C87F22` |
| `backend` | `FFFFFF` | `08323B` |
| `store` | `E5E9EA` | `56676C` |
| `external` | `EAEDED` | `ABB9BC` |
| `input` | `E2E5E6` | `8FBAC3` |
| `optional` | `ECEFEF` | `C2CCCE` dashed `4,3` |
| `security` | `EFEDE9` | `DCB98A` dashed `4,4` |

**Rationale.** Alpha survives PNG export intact, but LibreOffice's SVG→EMF filter flattens opacity inconsistently — observed in testing as low-contrast sublabels on tinted nodes. Solid hexes render identically down all three export paths and cost nothing on the PNG path. This becomes load-bearing in Phase 2.

### 3.4 Typography

Three families only. `deck-kit.js` is explicit that anything else may not exist on an HA Windows desktop.

| Role | Shipped | LIS | Size (presentation ramp) |
|---|---|---|---|
| `title` | Instrument Serif | **Cambria** | 40 px |
| `node-name` | Geist 600 | **Calibri** bold | 16 px |
| `sublabel` | Geist Mono | **Courier New** | 12 px |
| `eyebrow` / tag | Geist Mono | **Courier New** | 9 px |
| `arrow-label` | Geist Mono | **Courier New** | 12 px |
| `callout` | Instrument Serif italic | **Cambria** italic | 14 px |

Two consequential edits to the profile body:

- **Delete the Google Fonts `<link>` and the Korean font stack.** Reference the three families directly (`font-family="Calibri, sans-serif"`). `self_check.py` permits the fonts link but does not require it, so removing it is clean — and it removes a network dependency from a diagram that will be rendered on an internal machine.
- **Raise the eyebrow ramp from 8 px to 9 px.** The deck type ladder bottoms out at `micro: 9`; 8 px is off-ladder.

The three-family constraint in `style-guide.md` ("Serif + sans + mono … keep Instrument Serif for `title` anyway") is satisfied: Cambria is the serif.

### 3.5 Canvas geometry

The `image` archetype fits an image to the content band and preserves its aspect ratio. Authoring at the band's own ratio removes all letterboxing. Derived from `archetypes.js` and `deck-kit.js`:

| | Without caption | With caption |
|---|---|---|
| Band top (`grid.bandTop`) | 1.90″ | 1.90″ |
| Band bottom (`min(6.68, 6.55 − capReserve)`) | 6.55″ | 6.07″ |
| Inner padding (×2) | 0.36″ | 0.36″ |
| **Usable box** | **11.77″ × 4.29″** | **11.77″ × 3.81″** |
| **Aspect** | **2.744 : 1** | **3.089 : 1** |
| **Recommended `viewBox`** | **`0 0 1280 468`** | **`0 0 1280 416`** |

Both viewBox values keep every coordinate on diagram-design's 4 px grid. Residual letterboxing is under 0.05″ total — roughly 2 px per side at 96 px/inch — against 11.77″ of width.

Values are derived, not chosen: `boxW = grid.contentW − 2 × innerPad = 12.13 − 0.36`, and `boxH = min(grid.bandBottom, 6.55 − capReserve) − grid.bandTop − 2 × innerPad`. If either constant moves in `deck-kit.js`, recompute.

> [!important] Do not use the `slide-16x9` preset
> Its `0 0 1280 720` canvas is 54 % taller than the band. The image archetype would letterbox it to 11.77″ × 4.29″ and the type would shrink with it, defeating the presentation ramp.

Three consequent adjustments:

- **No bottom safe-area reserve.** `output-spec.md` advises keeping the bottom 80 px clear for a deck footer. The band already stops at 6.55″ to clear the `N / total` page mark, so reserving again inside the viewBox double-counts and shrinks the diagram.
- **Drop the legend strip.** A 60 px legend costs 13 % of a 468 px canvas. Use the slide's own `caption` slot, which sits outside the image and is covered by `qa-deck.js` contrast checks.
- **Tighten the node budget to 7.** diagram-design's default ceiling of 9 assumes a taller canvas. The band gives 65 % of a 16:9 slide's vertical space. Past 7 nodes, split into an overview slide and a detail slide — which is the CP3-friendlier structure anyway.

### 3.6 Panel handling

Set `paper` to `F1F3F3` and keep `panel: true` with the default `neutral` tone. Panel fill and diagram paper are then the same value, and the archetype's 0.18″ inner padding reads as a natural matte. No transparency handling, no colour seam.

Do not use `omit_background` on the PNG export — with matching paper and panel there is nothing to gain, and a transparent PNG would expose any label mask rect whose fill does not match the panel exactly.

### 3.7 Authoring pipeline

```
JIRA note  LIS/JIRA/<note>.md
  └── ### Diagram: <name>   ```mermaid … ```
        │
        │ 1.  python3 <dd>/scripts/mermaid_extract.py <note>.md --diagram N --json
        │       → structural IR: nodes, edges, containers, hubs, budget flags
        ▼
  redraw per type reference        viewBox 1280×468 · profile: lis · budget 7
        │ 2.  self-contained <name>.html
        │
        │ 3.  python3 <dd>/scripts/self_check.py <name>.html
        ▼
  export PNG @3                    → 3840 × 1404 px ≈ 326 dpi at 11.77″
        │ 4.  docs/<name>.png
        ▼
  deck spec                        { "archetype": "image",
        │                            "path": "<name>.png",
        │                            "caption": "…" }
        │ 5.  node generate-deck.js docs/<Title>.deck.json
        │ 6.  node qa-deck.js       docs/<Title>.deck.json      → must exit 0
        ▼
  <Title>.pptx
```

`mermaid_extract.py` supports `flowchart`/`graph`, `sequenceDiagram`, `stateDiagram-v2` and `erDiagram`, and reads fenced blocks directly out of a Markdown file — which is exactly how `### Diagram:` blocks are stored today. **Redraw, never convert:** the extractor yields content and topology; layout is authored fresh against the type reference.

### 3.8 Type routing

| JIRA note content | diagram-design type | Reference |
|---|---|---|
| Component / service map, cloud or security boundaries | Architecture | `type-architecture.md` |
| Message ordering between systems | Sequence | `type-sequence.md` |
| ETL, lineage, batch handoff | Data flow | `type-data-flow.md` |
| Status / retry transitions | State machine | `type-state.md` |
| Cross-team handoffs | Swimlane | `type-swimlane.md` |
| Tables, keys, relationships | ER | `type-er.md` |
| Stacked tiers | Layer stack | `type-layers.md` |

Branch logic stays in `decision-flow` — it is native, editable and already QA-covered.

### 3.9 Documentation changes

No code changes. Edits to prose only:

| File | Change |
|---|---|
| `design-review-pptx/SKILL.md` | Related skills — replace the `mermaid-diagrams` line with diagram-design; note the `image` archetype now consumes its PNG output |
| `generate-pptx/SKILL.md` | Same |
| `*/references/slide-archetypes.md` | §10 `image` — record the two viewBox values and the 7-node budget |
| `generate-design/design-template.md` | `### Diagram:` row — point the export step at the pipeline in §3.7 |
| `mermaid-diagrams/SKILL.md` | Note that deck-bound diagrams route through diagram-design; Mermaid remains the authoring syntax |

---

## 4. Phase 2 — Editable diagrams via EMF

**Planned.** Effort ≈ half a day, one small code change.

### 4.1 Motivation

A CP3 architecture diagram is marked up during review. A PNG cannot be. EMF is a vector format that PowerPoint ungroups (`Ctrl+Shift+G`) into native editable shapes, so a reviewer can move a box or re-label an arrow in the room.

Verified end to end: `soffice --headless --convert-to emf` on an extracted diagram-design SVG, inserted via `add_picture`, passes `validate.py` and renders correctly.

### 4.2 The blocker

```js
// archetypes.js
function imagePixelSize(filePath) {
  // PNG magic → readUInt32BE(16), readUInt32BE(20)
  // JPEG SOF0/1/2 → readUInt16BE(i+7), readUInt16BE(i+5)
  return null;   // ← everything else
}
```

`null` propagates to `fitted = { w: boxW, h: boxH }`, so an EMF or SVG is stretched to the full content box regardless of its true ratio.

### 4.3 Proposed change

Add an optional `aspect` slot to the `image` archetype, consulted when `imagePixelSize()` returns `null`:

```json
{ "archetype": "image",
  "path": "message-flow.emf",
  "aspect": 2.744,
  "caption": "…" }
```

```js
const px = imagePixelSize(spec.path);
const ratio = px ? px.w / px.h : spec.aspect;
const fitted = ratio
  ? fitContain(boxW, boxH, ratio, 1)
  : { w: boxW, h: boxH };
```

Preferred over parsing the EMF header (`rclFrame`, bytes 24–40, in 0.01 mm units) because it is three lines, format-agnostic, and the authored viewBox ratio is already known from §3.5. Add a `qa-deck.js` check: a non-PNG/JPEG `path` without an `aspect` is an error, not a silent stretch.

### 4.4 Constraints

- The converting machine must have Cambria, Calibri and Courier New installed, or LibreOffice substitutes and the geometry shifts. On an HA Windows desktop with Office this holds; on a Linux build box it does not.
- Solid hexes (§3.3) are mandatory here — the opacity flattening defect is an EMF-path defect.
- EMF file size runs an order of magnitude above the equivalent PNG. Acceptable for one or two diagrams per deck.
- Keep the PNG as the fallback. If EMF conversion fails or renders wrong, the deck spec changes by one line.

---

## 5. Phase 3 — Native architecture and sequence archetypes

**Planned, trigger-based.** Effort ≈ 1–2 days.

### 5.1 Trigger

Promote to native when the same diagram shape appears in three or more decks — consistent with the existing rule in both SKILL.md files: *"If you reach for this twice for the same shape, it belongs in `archetypes.js`."*

### 5.2 Why native is the end state

Tier 3 is the only tier `qa-deck.js` cannot inspect. A native archetype is checked for contrast against the resolved background, safe-area bounds, collisions, overflow and palette drift — the same gates every other slide passes. It is also editable without an ungroup step, and it renders in `preview-deck.js` from the same recorded draw calls.

### 5.3 Proposed slot schemas

```json
{ "archetype": "architecture",
  "nodes": [
    { "id": "ecp", "label": "ECP5 App", "type": "backend",
      "sublabel": "lis-ecpath5-app", "tag": "APP", "col": 0, "row": 1 },
    { "id": "q",  "label": "Message Queue", "type": "focal", "col": 1, "row": 1 }
  ],
  "edges": [
    { "from": "ecp", "to": "q", "label": "A08", "kind": "link" }
  ],
  "zones": [ { "label": "Cluster", "nodes": ["ecp", "q"] } ],
  "caption": "…" }
```

```json
{ "archetype": "sequence",
  "actors": [ { "id": "ward", "label": "Ward" },
              { "id": "lis",  "label": "LIS", "focal": true } ],
  "messages": [
    { "from": "ward", "to": "lis", "label": "Acknowledge specimen" },
    { "from": "lis",  "to": "ward", "label": "Reminder", "kind": "return" }
  ],
  "caption": "…" }
```

`col`/`row` place nodes on a coarse grid; the archetype derives inches. A spec still sets no coordinate and no hex — `type` and `kind` resolve through the §3.3 treatment table. Cap at 7 nodes / 5 lifelines to match §3.5.

### 5.4 deck-kit primitives required

The existing `connector()` is a positional arrow glyph with no routing concept. Three new primitives:

| Primitive | Responsibility |
|---|---|
| `elbow(pptx, slide, from, to, opts)` | Orthogonal two-segment route between node edges; owns side selection and the ≥12 px offset for parallel runs |
| `maskedLabel(slide, text, seg, opts)` | Arrow label with an opaque `paper`-fill mask and a 6–10 px gap from the stroke |
| `attachPoints(edge, n)` | For N connectors on one edge of length L, point k sits at `L·k/(N+1)` |

pptxgenjs exposes no bent-connector shape type, so an elbow is two `line` shapes meeting at a right angle. Rounded corners are not available natively; square elbows are correct for a deck and read as deliberate. If true connectors that stay attached when a shape moves are wanted later, post-process the OOXML to emit `<p:cxnSp>` with `bentConnector3` — out of scope here.

### 5.5 Connector rules to encode

The highest-value transfer from diagram-design, and the thing the kit currently has no concept of at all:

1. Orthogonal elbows only — no diagonal segments between off-axis nodes.
2. Label sits 6–10 px clear of its stroke, with an opaque mask; never on the line.
3. No two connectors share a stroke path or run parallel closer than 12 px.
4. Connectors entering one edge get distinct attach points, ≥12 px apart.
5. No connector passes behind a box that is not its source or destination; the one unavoidable case is dashed with the label at the visible end.
6. No label mask overlaps a node drawn after it.

Draw arrows before boxes so z-order puts lines behind nodes.

---

## 6. QA strategy

| Gate | Runs on | Covers | Phase |
|---|---|---|---|
| `self_check.py` | diagram HTML | Accessible-SVG contract, single-file safety, no stray remote assets | 1 |
| `verify-geometry.py` | diagram HTML | Label masks clipped by later nodes | 1, manual |
| Manual diagram review | rendered PNG | Connector rules 1–5, focal count, node budget | 1 |
| `qa-deck.js` | deck spec | Contrast, safe area, table extent, overflow, palette and font drift, notes, placeholders | 1–3 |
| `preview-deck.js` | deck spec | 1:1 geometry at 96 px/inch | 1–3 |
| `qa-deck.js` (extended) | deck spec | Non-raster `path` without `aspect` | 2 |

> [!warning] Accepted risk in Phases 1–2
> A raster or vector image bypasses `qa-deck.js` entirely — contrast, palette drift and safe area go unchecked **inside** the image. Mitigated by `self_check.py` plus manual review, and closed properly only by Phase 3.

> [!bug] `verify-geometry.py` is not in the installed skill
> The vault symlink points at `skills/diagram-design/`, which ships only `drawio_extract.py`, `mermaid_extract.py` and `self_check.py`. The geometry verifier lives at the repo root: `D:/Github/diagram-design/scripts/verify-geometry.py`. Run it from there, or copy it beside the deck tooling.

---

## 7. Risks and constraints

| # | Risk | Mitigation |
|---|---|---|
| 1 | Image contents invisible to `qa-deck.js` | Accepted in Phases 1–2; closed by Phase 3 |
| 2 | Shared install — a `git pull` reverts an in-place skin edit | Named profile + `.diagram-design` marker (§3.1); never edit the working copy |
| 3 | Font substitution on the converting machine shifts EMF geometry | Convert on a machine with Office fonts; keep the PNG fallback |
| 4 | `assets/example-*.html` were built under an older skin | Treat as layout references only; never copy their hex values |
| 5 | First-run style-guide gate prompts on each new project | The marker file suppresses it |
| 6 | Diagram drifts from the JIRA note after a design change | The Mermaid block in the note stays the source of truth; regenerate, never hand-edit the HTML |
| 7 | Node budget creep past 7 on a banded canvas | Split into overview + detail; `mermaid_extract.py` emits budget flags |

---

## 8. Acceptance criteria

**Phase 1**

- [ ] `~/.diagram-design/profiles/lis.md` exists and carries the §3.2–3.4 mapping
- [ ] A `.diagram-design` marker resolves without triggering the first-run gate
- [ ] An architecture diagram regenerated from an existing JIRA note passes `self_check.py`
- [ ] The PNG drops into the `image` archetype with no visible letterboxing
- [ ] `qa-deck.js` exits 0 on the rebuilt deck
- [ ] Side-by-side against the LIS-10747 reference deck: the diagram reads as the same document

**Phase 2**

- [ ] `aspect` slot accepted and honoured by `image`
- [ ] `qa-deck.js` errors on a non-raster path with no `aspect`
- [ ] EMF diagram ungroups in PowerPoint into editable shapes with correct fonts

**Phase 3**

- [ ] `architecture` and `sequence` render in generator, QA and preview from one code path
- [ ] Connector rules 1–6 hold on the reference deck
- [ ] No diagram slide depends on the `image` archetype

---

## 9. Open questions

1. Where does the `.diagram-design` marker live — one per service repo beside `docs/`, or once at the vault root? Per-repo is safer if any project ever needs a different skin.
2. Should the LIS profile be committed somewhere shared so the whole team resolves the same skin, given `~/.diagram-design/` is per-user?
3. Is EMF acceptable to the CP3 forum, or does the deck need to survive a PDF export path where EMF handling is less predictable?
4. Does the 7-node band budget hold for the busiest existing diagram, or does the first real conversion force an overview/detail split immediately?

---

## Related

- [[generate-pptx]] · [[design-review-pptx]] · [[generate-design]] · [[mermaid-diagrams]]
- `LIS/skills/diagram-design/SKILL.md` — §6 connector rules, §7 complexity budget, §9 taste gate
- `LIS/skills/diagram-design/references/output-spec.md` — size presets and type ramps
- `LIS/skills/diagram-design/references/style-guide.md` — the tokens Phase 1 overrides
