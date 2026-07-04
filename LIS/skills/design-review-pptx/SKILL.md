---
name: design-review-pptx
description: >
  Prepares Markdown slide outlines for LIS/HA design review presentations (CP3),
  following conventions from GCRS Order Interface and similar service design reviews.
  Use when the user asks to prepare design review slides, create a design review deck,
  write slide content in markdown for PowerPoint, document a change for CP3 review,
  or generate presentation material before calling the pptx skill. Triggers on
  "design review", "CP3", "prepare slides", "slide outline", or when working with
  .md files intended to become .pptx for technical design review sessions.
---

# Design Review PowerPoint — Markdown Authoring

Produce **slide-ready Markdown** that the `pptx` skill converts into a `.pptx` deck.
Do not generate `.pptx` in this skill — finish with a complete `.md` file, then hand off to `pptx`.

---

## Workflow

```
Task Progress:
- [ ] 1. Classify review type (full vs incremental)
- [ ] 2. Gather inputs (JIRA, service, audience, scope)
- [ ] 3. Draft slide outline (titles only)
- [ ] 4. Write slide content in Markdown
- [ ] 5. Self-check against QA checklist
- [ ] 6. Hand off to pptx skill for deck generation
```

### Step 1 — Classify review type

| Type | When | Typical slide count |
|------|------|---------------------|
| **Full** | New service, major migration, first design review | 20–35 |
| **Incremental** | Bug fix, race condition, targeted change to existing design | 5–10 |

### Step 2 — Gather inputs

Collect before writing:

| Field | Example | Required |
|-------|---------|----------|
| Title | GCRS Order Interface DHP Migration | Yes |
| JIRA key | LIS-10569 | Yes |
| Service / repo | lis-gcr-order-inf-svc | Yes |
| Review forum | CP3 | Yes (default CP3) |
| Date | 22nd May 2026 | Yes |
| Agenda topics | Design Review, Promotion, Fallback | Yes |
| Diagrams | architecture PNG/SVG, sequence flows | As needed |
| Code/message samples | XML, JSON, SQL | As needed |

Ask the user for missing items. Infer slide content from wiki pages, JIRA, source code, or prior design docs when available.

### Step 3 — Choose slide outline

**Full design review** — use this default outline; drop or add slides per scope:

1. Title
2. Agenda
3. Background (legacy / existing)
4. Background (revamped / proposed) — or Problem Statement for greenfield
5. Domain reference (transaction types, message types) — split across slides if table is long
6. Message format examples (legacy + revamped)
7. System architecture (receiver, sender, or relevant flows) — one slide per flow
8. Data model / schema changes
9. Status / state machine / lifecycle
10. Processing mechanism — split across 2 slides if flow is dense
11. Retry / error handling / concurrency (if applicable)
12. Obsoleted components (if applicable)
13. OpenShift configuration (ConfigMaps, Secrets) — one slide per config group
14. Production usage / volume stats (if available)
15. Promotion (deployment steps)
16. Fallback (receiver + sender, or per direction)
17. Q&A

**Incremental design review** — minimal outline:

1. Title
2. Agenda (Background, Design Review)
3. Background (problem, symptoms, root cause)
4. Existing design reference (reuse architecture / flow from prior review — cite slide topic, do not duplicate full content)
5. Proposed change (what changes, why, impact)
6. Q&A

See [slide-types.md](slide-types.md) for per-slide content rules and [examples.md](examples.md) for real excerpts.

### Step 4 — Write Markdown

Save as `{Title}.md` in the working directory (match the eventual `.pptx` basename).

---

## Markdown Format

Each slide is a level-1 heading block separated by a blank line. Use slide-number comments for traceability (matches markitdown export from existing decks).

```markdown
<!-- Slide number: 1 -->
# {Title} ({JIRA-KEY})
({service-name})
CP3
{Date}

<!-- Slide number: 2 -->
# Agenda
{Agenda item 1}
{Agenda item 2}
...

<!-- Slide number: 3 -->
# Background
{Content}
```

### Rules

- **One `#` heading per slide** — this becomes the slide title.
- **Slide body** uses plain bullets, tables, or fenced code blocks — no `##` sub-headings unless the title slide needs a subtitle line (put subtitle on its own line under the title, not as `##`).
- **Bullets**: plain lines starting at column 0 (no `-` prefix required — match existing HA decks which use unindented lines). Use `-` only when nesting sub-bullets.
- **Tables**: GitHub-flavored markdown with header row.
- **Code / messages**: fenced blocks with language tag (`xml`, `json`, `sql`). Truncate with `…` or `# …` comment on long samples; keep structure visible.
- **Diagrams**: `![]({filename})` on its own line. List required image files at the top of the `.md` as an HTML comment:

  ```markdown
  <!-- Assets: architecture-receiver.png, message-lifecycle.png -->
  ```

- **Annotations beside diagrams**: put callout labels as plain lines after the image (e.g. `Endpoint`, `POST /api/processReceiver`) — the pptx step maps these to text boxes.
- **Split long tables**: max ~10 rows per slide; repeat the `#` title with a part indicator (`Transaction Types (GCRS → LIS)` + `Receiver`) rather than cramming one slide.
- **Do not** include slide footer numbers in body content — the pptx template adds them.

---

## Content Guidelines

### Title slide

```
# {Descriptive Title} ({JIRA-KEY})
({microservice-name})
CP3
{D Day Month Year}
```

### Agenda slide

List only topics to be presented. Common items:

- Design Review
- Promotion
- Fallback
- Any further topics / open discussion

For incremental reviews: `Background`, `Design Review`.

### Background slides

- **Migration / greenfield**: two-column comparison table (`Aspect | Legacy` / `Aspect | Revamped`).
- **Bug fix**: bullet narrative — symptom → trigger → root cause → impact. Keep to one slide; move deep technical detail to Design Review slides.

### Architecture slides

- One diagram per slide; label components and endpoints as plain lines.
- Name the integration pattern: API Gateway, SAM3, scheduler trigger, etc.

### Schema / configuration slides

- Group by artifact: table name, ConfigMap name, or Secret name as a plain line under the title.
- Tables: `Column/Key | Type | Description` or `Key | Default | Description`.

### Promotion / Fallback slides

- Numbered or bullet steps in execution order.
- Name concrete artifacts: Helm release, cron job name pattern (`GcrOrderSvcScheduleJob{Hosp}`), legacy process names (`loeReceiver (LOESERVER)`).
- Separate receiver and sender fallback when directions differ.

### Q&A slide

Title only: `# Q&A`

---

## Splitting Content Across Slides

| Content | Split strategy |
|---------|----------------|
| Transaction type table | ≤10 rows per slide; same title, different implicit part |
| Message XML + JSON | One format per slide; add callout lines (`Structure is identical`, `Field names are identical`) |
| Processing flow | Slide 1: retrieve + lock; Slide 2: send + status update |
| OpenShift config | One slide per ConfigMap or Secret group |

---

## QA Checklist (before handoff)

- [ ] Title slide has JIRA key, service name, CP3, date
- [ ] Agenda matches actual slide sequence
- [ ] Every slide has a `#` title
- [ ] No slide exceeds ~10 table rows or ~8 top-level bullets
- [ ] Code samples are truncated but structurally representative
- [ ] All `![](...)` assets listed and available (or marked `<!-- TODO: asset -->`)
- [ ] Promotion and Fallback included for production-impacting changes
- [ ] Incremental reviews reference existing design instead of duplicating full architecture
- [ ] Terminology consistent (OUTSTANDING, RETRY, service names, endpoint paths)
- [ ] No placeholder text (`TBD`, `lorem`, `xxx`)

---

## Handoff to pptx

After the Markdown file is complete:

1. Read the `pptx` skill.
2. If a **template .pptx** exists (e.g. prior design review deck), use template-based editing workflow.
3. If **no template**, use pptxgenjs with the Teal Trust or Ocean Gradient palette for HA/LIS technical content.
4. Run content QA (`python -m markitdown output.pptx`) and visual QA per pptx skill.

Tell the user: Markdown path, required asset files, and recommended template (if any).

---

## Additional Resources

- Slide-type reference and layouts: [slide-types.md](slide-types.md)
- Annotated excerpts from real decks: [examples.md](examples.md)
