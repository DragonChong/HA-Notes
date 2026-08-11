---
name: generate-design
description: >
  Populates the ## Design section in LIS JIRA Obsidian notes (LIS/JIRA/) created by
  lis-jira-log-creator, producing CP3-ready design content for design-review-pptx.
  Use when the user asks to generate design, create design from JIRA log, prepare
  design review content, or convert a JIRA note to slides. Runs after lis-jira-log-creator
  and before design-review-pptx. Triggers on "generate design", "design section",
  "JIRA to slides", or "/generate-design".
---

# Generate Design (JIRA → CP3 Design)

Bridge skill between **lis-jira-log-creator** and **design-review-pptx**.

```
lis-jira-log-creator  →  LIS/JIRA/{note}.md      (change request sections)
generate-design       →  ## Design in same note   (CP3 design content)  ← ends here
design-review-pptx    →  {Title}.deck.json → .pptx
```

**design-review-pptx reads the `## Design` section directly.** There is no
intermediate slide-markdown file — choosing how a design block becomes a slide
is a judgment call that skill makes against its archetype catalogue.

---

## Workflow

```
Task Progress:
- [ ] 1. Locate JIRA note (LIS/JIRA/)
- [ ] 2. Read JIRA sections + codebase context
- [ ] 3. Classify review type (incremental vs full)
- [ ] 4. Draft ## Design section
- [ ] 5. Confirm with user (if incomplete)
- [ ] 6. Write Design to Obsidian note
- [ ] 7. Hand off to design-review-pptx (only if a deck was asked for)
```

### Step 1 — Locate JIRA note

Find the note under `LIS/JIRA/`:

- User provides path or wikilink (`[[Fix Message Queue Old HKID Blocking…]]`)
- Search via Obsidian MCP `search_notes`, or browse `LIS/JIRA/JIRA Log List.base`
- Direct file read when vault is mounted (Cowork)

**Prerequisite:** Note must exist from **lis-jira-log-creator** (has Background, Change Description, etc.).

### Step 2 — Gather design inputs

From the JIRA note frontmatter and body:

| Source | Use for |
|--------|---------|
| `title`, `services`, `jira`, `reference_jira` | Title slide metadata (`jira` = this CR’s key) |
| Background | Background slides, sequence diagrams |
| Change Description | Proposed Change slides |
| Justification | Impact bullets on Background or Overview |
| Codebase / wiki | Existing Design slides, SQL samples |

Ask user for **review date** and **JIRA key** if note frontmatter `jira` is empty.

### Step 3 — Classify review type

| Type | When | Design slide count |
|------|------|-------------------|
| **incremental** | Bug fix, race condition, targeted change | 6–10 |
| **full** | New service, major migration | 14–22 |

Follow outlines in [design-template.md](design-template.md) and the archetype
catalogue in [design-review-pptx references/slide-archetypes.md](../design-review-pptx/references/slide-archetypes.md).

### Step 4 — Draft ## Design section

Use [design-template.md](design-template.md). Structure:

1. **Metadata lines** — review type, JIRA key, service, forum, date
2. **`### Agenda`** — one item per line
3. **`### Slide: {title}`** — one slide per block; roughly 40 words of body copy
4. **`### Diagram: {name}`** — Mermaid (optional; stays in JIRA note unless exported to PNG)
5. End with **`### Slide: Q&A`**

Optionally add **`**Archetype:** matrix`** under a slide title when you have a
clear view of the shape (a decision tree, a per-site grid). Otherwise leave it
out and let design-review-pptx choose.

**Writing rules:**

- Derive slide content from JIRA Background + Change Description — do not duplicate prose verbatim; compress for slides
- **Plain English in prose; identifiers in the structures built for them** (see below)
- Use `-` hyphen not em-dash in slide titles
- Reuse prior review slides for incremental fixes — cite `**Prior review:** [[note]]`
- Include Promotion + Fallback for production-impacting changes
- Sequence diagrams: 3 entities max when possible (e.g. PMI, service, DB table)

**Where identifiers belong:**

CP3 reviewers are architects, ops and clinical stakeholders, not developers
reading source — so a *paragraph* full of camel-case is noise. But an identifier
set in a code panel or a table cell reads as precision, and the deck has
dedicated places for exactly that.

| Put it in | Identifiers welcome |
|-----------|--------------------|
| a code panel (`code-findings`, `compare`) | file, class, method, the condition being changed |
| a table cell, a `tag` chip, the condition strip | column names, setup controls, service names |
| a prose bullet | avoid — describe the behaviour instead |

So this is fine, in a code panel captioned "Hospital identity decides the
behaviour":

```
if (LisGlobal.hospital == CommonConstants.HOSPITAL_QEH) {
```

…while a bullet should still say "the reminder is gated on hospital identity",
not "`GcrSpecAckUIComponents.as` calls `LisGlobal.hospital`".

**Always fine anywhere:** service names, JIRA keys, table/column names, config
keys, domain codes (A08, A47), status values (OUTSTANDING, PROCESSING).

### Step 5 — Present draft

Show the `## Design` section in chat before writing to Obsidian, unless user asks to skip.

### Step 6 — Write to Obsidian

Append or replace `## Design` in the JIRA note:

- **Obsidian MCP:** `read_note` → `patch_note` (replace from `## Design` to end, or append if section empty)
- **Direct file:** `Read` / `StrReplace` on vault path

Update frontmatter `design_status: draft` if frontmatter is editable.

### Step 7 — Hand off to design-review-pptx

Only when the user actually asked for a deck. The `## Design` section is a
finished artifact on its own — most of the time this skill stops at step 6.

Read the **design-review-pptx** skill and follow its workflow. It takes the
`## Design` section from this note as its input, writes a `{Title}.deck.json`
spec, and renders it:

```bash
node <design-review-skill-dir>/generate-deck.js "docs/{Title}.deck.json"
node <design-review-skill-dir>/qa-deck.js       "docs/{Title}.deck.json"
node <design-review-skill-dir>/preview-deck.js  "docs/{Title}.deck.json"
```

Do not write the deck spec from here — archetype selection and the visual
system belong to that skill.

---

## Design section format (quick reference)

```markdown
## Design

**Review type:** incremental
**JIRA key:** LIS-10583
**Service:** lis-patient-pmi-sync-svc
**Review forum:** CP3
**Review date:** 3rd Jul, 2026
**Prior review:** none

### Agenda
Background
Design Review
Promotion
Fallback
Q&A

### Slide: Background
<bullets>

### Slide: Proposed Change - Overview
<bullets>

### Slide: Q&A
```

Full template: [design-template.md](design-template.md)  
Worked example: [examples.md](examples.md)

---

## QA checklist

- [ ] JIRA note exists with Background and Change Description
- [ ] Review type classified (incremental / full)
- [ ] Metadata lines complete (JIRA key, service, date)
- [ ] Agenda matches slide sequence
- [ ] No slide block exceeds ~8 bullets or ~10 table rows
- [ ] Slide bullets use plain English — no class or method names
- [ ] Promotion and Fallback present for production changes
- [ ] `## Design` written to Obsidian note
- [ ] `jira-design-to-slides.py` ran successfully
- [ ] design-review-pptx handoff completed (optional unless user requests .pptx)

---

## Skill assets

| File | Purpose |
|------|---------|
| [design-template.md](design-template.md) | ## Design section structure |
| [examples.md](examples.md) | LIS-10583 pipeline example |
| [jira-design-to-slides.py](jira-design-to-slides.py) | JIRA Design → slide-ready `.md` |

## Related skills

- **lis-jira-log-creator** — creates the JIRA note (upstream)
- **design-review-pptx** — generates `.pptx` from slide markdown (downstream)
