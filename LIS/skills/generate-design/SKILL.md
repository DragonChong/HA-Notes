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
lis-jira-log-creator  →  LIS/JIRA/{note}.md     (change request sections)
generate-design       →  ## Design in same note  (CP3 design content)
jira-design-to-slides →  docs/{Title}.md        (slide-ready markdown)
design-review-pptx    →  docs/{Title}.pptx      (final deck)
```

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
- [ ] 7. Convert to slide markdown (jira-design-to-slides.py)
- [ ] 8. Hand off to design-review-pptx for .pptx
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
| **incremental** | Bug fix, race condition, targeted change | 5–15 |
| **full** | New service, major migration | 20–35 |

Follow outlines in [design-template.md](design-template.md) and [design-review-pptx slide-types.md](../design-review-pptx/slide-types.md).

### Step 4 — Draft ## Design section

Use [design-template.md](design-template.md). Structure:

1. **Metadata lines** — review type, JIRA key, service, forum, date
2. **`### Agenda`** — one item per line
3. **`### Slide: {title}`** — one slide per block (max ~8 bullets or ~10 table rows)
4. **`### Diagram: {name}`** — Mermaid (optional; stays in JIRA note unless exported to PNG)
5. End with **`### Slide: Q&A`**

**Writing rules:**

- Derive slide content from JIRA Background + Change Description — do not duplicate prose verbatim; compress for slides
- **Use plain English only** — describe behaviour, not code identifiers (see below)
- Use `-` hyphen not em-dash in slide titles
- Reuse prior review slides for incremental fixes — cite `**Prior review:** [[note]]`
- Include Promotion + Fallback for production-impacting changes
- Sequence diagrams: 3 entities max when possible (e.g. PMI, service, DB table)

**Plain English (no class or method names):**

Slide bullets are for CP3 reviewers (architects, ops, clinical stakeholders), not developers reading source. When drafting from codebase or wiki:

| Avoid | Use instead |
|-------|-------------|
| Class names (`MessageQueueProcessor`, `PatientTransactionVo`) | Role or layer ("scheduled job", "inbound patient transaction") |
| Method or function names (`findProcessableMessages`, `countPreviousBlockingMessages`) | What it does ("selects the next batch of ready messages", "checks for earlier blocking messages") |
| JPQL / ORM entity names in SQL fences | Table/column names, or a simplified SQL comment; describe logic in bullets above the fence |
| "Update entity/repository/service" | "Update application code" or name the layer's responsibility |

**Still OK:** service names (`lis-patient-pmi-sync-svc`), JIRA keys, table/column names in schema slides, config keys, domain codes (A08, A47), status values (OUTSTANDING, PROCESSING).

### Step 5 — Present draft

Show the `## Design` section in chat before writing to Obsidian, unless user asks to skip.

### Step 6 — Write to Obsidian

Append or replace `## Design` in the JIRA note:

- **Obsidian MCP:** `read_note` → `patch_note` (replace from `## Design` to end, or append if section empty)
- **Direct file:** `Read` / `StrReplace` on vault path

Update frontmatter `design_status: draft` if frontmatter is editable.

### Step 7 — Convert to slide markdown

```bash
python <skill-dir>/jira-design-to-slides.py \
  "<vault>/LIS/JIRA/{Note Title}.md" \
  "<repo>/docs/{Title} ({JIRA-KEY}).md"
```

`<skill-dir>` = folder containing this SKILL.md (`~/.cursor/skills/generate-design`).

### Step 8 — Hand off to design-review-pptx

Read **design-review-pptx** skill. Run:

```bash
python <design-review-skill-dir>/qa-design-review-pptx.py "docs/{Title}.md"
python <design-review-skill-dir>/generate-design-review-pptx.py "docs/{Title}.md"
```

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
