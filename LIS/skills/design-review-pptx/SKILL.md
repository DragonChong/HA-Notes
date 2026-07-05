---
name: design-review-pptx
description: >
  Prepares Markdown slide outlines and generates .pptx for LIS/HA CP3 design reviews
  using the canonical HA template (LIS-10672 / LIS-10583 style). Use when the user asks
  to prepare design review slides, create a design review deck, write slide content in
  markdown for PowerPoint, document a change for CP3 review, or generate presentation
  material. Triggers on "design review", "CP3", "prepare slides", "slide outline".
---

# Design Review PowerPoint

Produce **slide-ready Markdown**, then generate `.pptx` with the **canonical HA/LIS template** so every deck matches the style of:

- `Fix Race Condition in lis-gcr-order-inf-svc… (LIS-10672).pptx`
- `Fix Message Queue Old HKID Blocking (LIS-10583).pptx`

**Always use the bundled generator** — do not use pptxgenjs or custom colour themes for CP3 design reviews.

---

## Workflow

```
Task Progress:
- [ ] 1. Classify review type (full vs incremental)
- [ ] 2. Gather inputs (JIRA, service, audience, scope)
- [ ] 3. Draft slide outline (titles only) — reuse prior slides via extract-slides.py for incremental reviews
- [ ] 4. Write slide content in Markdown
- [ ] 5. Self-check against QA checklist
- [ ] 6. Generate .pptx with generate-design-review-pptx.py
- [ ] 7. Content QA (qa-design-review-pptx.py, then markitdown for a final read)
```

### Step 1 — Classify review type

| Type | When | Typical slide count |
|------|------|---------------------|
| **Full** | New service, major migration, first design review | 20–35 |
| **Incremental** | Bug fix, race condition, targeted change to existing design | 5–15 |

### Step 2 — Gather inputs

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

### Step 3 — Choose slide outline

**Full design review** — default outline; drop or add slides per scope:

1. Title → 2. Agenda → 3–4. Background → 5–7. Domain reference → 8–11. Architecture / processing → 12. Schema → 13–14. Retry / concurrency → 15–16. OpenShift config → 17. Production stats → 18–19. Promotion / Fallback → 20. Q&A

**Incremental design review** — minimal outline:

1. Title → 2. Agenda → 3. Background (problem) → 4+. Existing design / proposed change → Promotion / Fallback → Q&A

When a prior full review already documented the architecture/flow, reuse those slides
instead of rewriting them (see examples.md, "Reusing prior design slides"). Discover and
pull them forward with `extract-slides.py`:

```bash
# List slide titles in the prior deck
python <skill-dir>/extract-slides.py "docs/{Prior Title}.md"

# Extract matching slide(s), renumbered from a given position
python <skill-dir>/extract-slides.py "docs/{Prior Title}.md" \
  --title "Message Processing Mechanism" --start-number 4
```

If a reused slide references an image, copy that image file alongside the **new** deck's
`.md` — paths resolve relative to wherever the new markdown lives, not the source deck.

See [slide-types.md](slide-types.md) and [examples.md](examples.md).

### Step 4 — Write Markdown

Save as `{Title}.md` in the project `docs/` folder (same basename as target `.pptx`).

### Step 6 — Generate .pptx

Resolve `<skill-dir>` to the folder containing **this** SKILL.md — e.g. `~/.cursor/skills/design-review-pptx` when invoked via Cursor's symlink into the vault, or the vault path `LIS/skills/design-review-pptx/` directly (Cowork, or any environment without that symlink). Do not hardcode the Cursor path; it only resolves through that specific symlink.

```bash
pip install -r <skill-dir>/requirements.txt

python <skill-dir>/generate-design-review-pptx.py \
  "docs/{Title}.md" \
  "docs/{Title}.pptx"
```

Omit the second argument to write `{Title}.pptx` next to the `.md` file.

### Step 7 — Content QA

Run the mechanical checks first — they cover the checkable half of the QA checklist below
(title-slide fields, placeholder text, slide/table size limits, agenda coverage) and fail
with a non-zero exit code if anything's wrong:

```bash
python <skill-dir>/qa-design-review-pptx.py "docs/{Title}.md"
```

Then do a final human-readable pass over the generated deck for the judgment-based items
(Promotion/Fallback relevance, terminology consistency):

```bash
python -m markitdown "docs/{Title}.pptx"
```

---

## Visual Style (canonical template)

Style is defined by `ha-lis-design-review-template.pptx` in this skill folder. **Do not override** with custom colours or pptxgenjs themes.

| Element | Style |
|---------|-------|
| Theme | Microsoft Office Theme (white background) |
| Title font | Calibri Light (from slide master) |
| Body font | Calibri |
| Accent / subtitle | Century Gothic, `#00B0F0` on title slide |
| Slide numbers | Bottom-right, grey, from master |
| Title slide layout | Title + subtitle placeholder (`CP3` + date) |
| Content slides | Title and Content (layout index 1) |
| Q&A slide | Title Only, centred 48pt |
| Agenda items | Bold, one per paragraph |
| Body bullets | Plain paragraphs; use `- ` prefix or indent for level-1 sub-bullets |
| Tables | Header row bold 12pt; body 11pt; optional footnotes below |
| Code blocks | Consolas 10pt in textbox below title |
| Diagram slides | `![](image.png)` — embedded automatically by the generator (path resolved relative to the input `.md` file); dominant/centred if the slide has no other body text, placed beside the text otherwise |

Reference decks: LIS-10672 (6 slides, incremental), LIS-10583 (13 slides, incremental with Promotion/Fallback).

---

## Markdown Format

Each slide is a level-1 heading block preceded by a slide-number comment.

```markdown
<!-- Slide number: 1 -->
# Fix Message Queue Old HKID Blocking (LIS-10583)
(lis-patient-pmi-sync-svc)
CP3
3rd Jul, 2026

<!-- Slide number: 2 -->
# Agenda
Background
Design Review
Promotion
Fallback
Q&A

<!-- Slide number: 3 -->
# Background
Production incident on 26 Jun 2026
Root cause: blocking check only compares blocking.hkid = m.hkid

<!-- Slide number: 4 -->
# Background
| Type | Description | HKID in message |
| --- | --- | --- |
| A47 | Change HKID | new HKID + old HKID |
On enqueue, only new HKID is persisted (footnote line after table)

<!-- Slide number: 5 -->
# Existing Design - Current Blocking Query
```sql
SELECT m FROM MessageQueue m
WHERE blocking.hkid = m.hkid
```
countPreviousBlockingMessages uses the same hkid-only match

<!-- Slide number: N -->
# Q&A
```

### Slide type auto-detection

| Markdown pattern | Layout used |
|------------------|-------------|
| First slide with `CP3` in body | Title Slide |
| `# Agenda` | Title and Content (bold items) |
| `# Q&A` | Title Only (centred) |
| Body contains `\| col \|` table | Title and Content + table |
| Body contains ` ``` ` fence | Title and Content + Consolas code |
| Everything else | Title and Content (bullets) |

### Rules

- **One `#` heading per slide** — becomes the slide title.
- **No `##` sub-headings** in slide body — use plain lines or tables.
- **Bullets**: plain lines (no `-` required). Use `- ` or indent for sub-bullets.
- **Tables**: GFM with header row; non-table lines after the table become footnotes.
- **Code**: fenced block with language tag (`sql`, `xml`, `json`); lines after fence become notes.
- **Diagrams**: `![]({filename})` — one per slide; the generator embeds it automatically, resolving `{filename}` relative to the input `.md` file's own directory (so keep image assets alongside the markdown, e.g. in the same `docs/` folder). List assets in `<!-- Assets: ... -->` at top of file for reference only — it isn't parsed.
- **Hyphens not em-dashes** in titles (`Existing Design - Overview`) — avoids encoding issues.
- **Do not** put slide numbers in body — template adds them.

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

Bold items, one per line. Incremental: `Background`, `Design Review`. Full reviews add `Promotion`, `Fallback`.

### Background (bug fix)

Symptom → trigger → root cause → impact. One slide; detail on Design Review slides.

### Promotion / Fallback

Ordered steps; name concrete artifacts (Helm release, cron job, DDL script).

### Q&A

Title only: `# Q&A`

---

## QA Checklist

Items marked **(auto)** are checked by `qa-design-review-pptx.py` — run it before the
human pass rather than eyeballing these:

- [ ] Title slide has JIRA key, service name, CP3, date **(auto)**
- [ ] Agenda matches slide sequence **(auto, warning-level)**
- [ ] Every slide has a `#` title **(auto)**
- [ ] No slide exceeds ~10 table rows or ~8 top-level bullets **(auto, warning-level)**
- [ ] Promotion and Fallback included for production-impacting changes — judgment call
- [ ] Terminology consistent (OUTSTANDING, RETRY, service names) — judgment call
- [ ] No placeholder text (`TBD`, `lorem`) **(auto)**
- [ ] Generated via `generate-design-review-pptx.py` (not pptxgenjs)
- [ ] `qa-design-review-pptx.py` passed with no errors, then markitdown reviewed by eye

---

## Skill assets

| File | Purpose |
|------|---------|
| `ha-lis-design-review-template.pptx` | Canonical master (from LIS-10672 deck) |
| `generate-design-review-pptx.py` | Markdown → styled .pptx |
| `requirements.txt` | `python-pptx` dependency |
| [slide-types.md](slide-types.md) | Per-slide content reference |
| [examples.md](examples.md) | Real deck excerpts |

---

## Additional Resources

- Slide-type reference: [slide-types.md](slide-types.md)
- Annotated excerpts: [examples.md](examples.md)
