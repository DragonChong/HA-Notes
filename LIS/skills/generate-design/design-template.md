# Design Section Template

Append or replace the `## Design` section in a JIRA Obsidian note (`LIS/JIRA/<note>.md`).
The **design-review-pptx** skill reads this section directly and turns each block
into a slide.

---

```markdown
## Design

**Review type:** incremental | full
**JIRA key:** LIS-XXXXX
**Service:** lis-example-svc
**Review forum:** CP3
**Review date:** Dth Mon YYYY
**Prior review:** [[Prior Design Review Note]] or none

### Agenda
Background
Design Review
Promotion
Fallback
Q&A

### Slide: Background
<Symptom → root cause bullets. Max 8 lines.>

### Slide: Background
<Optional second background slide — table or domain reference>
| Col A | Col B |
| --- | --- |
| … | … |
<Footnote lines after table>

### Slide: Existing Design - <topic>
<Reuse from prior review when applicable; cite source note>
<Bullet steps or reference architecture>

### Slide: Proposed Change - Overview
<Numbered work items as bullets>

### Slide: Proposed Change - Schema
| Column | Type | Description |
| --- | --- | --- |
| … | … | … |

### Slide: Proposed Change - <detail>
```sql
-- or xml, json
SELECT …
```
<Notes after code fence>

### Diagram: incident-sequence
```mermaid
sequenceDiagram
    …
```
<Render to PNG for slides, or keep in JIRA note only>

### Slide: Promotion
<Ordered deployment steps>

### Slide: Fallback
<Rollback steps>

### Slide: Q&A
```

---

## Section rules

| Block | Purpose |
|-------|---------|
| Metadata lines (`**Review type:**` etc.) | Title slide + classification for design-review-pptx |
| `### Agenda` | Agenda slide (one item per line) |
| `### Slide: {title}` | One CP3 slide; body until next `###` heading |
| `**Archetype:** {name}` | Optional hint under a slide title when the shape is obvious |
| `### Diagram: {name}` | Mermaid stored in JIRA note; export PNG to project `docs/` if needed for slides |

## Plain English rule

**Prose describes behaviour; identifiers live in code blocks and tables.**

A bullet full of camel-case is noise to a CP3 audience. The same identifier in a
code fence or a table cell is precision — and the deck has dedicated places for
it (`code-findings` panels, `tag` chips, table cells, the condition strip).

- Bad: `MessageQueueProcessor` calls `findProcessableMessages`
- Good: Scheduled job runs every 10 seconds and selects the next batch of ready messages

- Bad: Extend `countPreviousBlockingMessages` to match `oldHkid`
- Good: Extend the blocking check so earlier messages on the patient's old HKID also block

But a code fence showing the condition being changed is exactly right, with the
behavioural explanation in the bullets above it.

**Always fine anywhere:** service names, table/column names, config keys,
domain/event codes (A08, A47), status enums.

## Mapping from JIRA log sections

| JIRA section | Design slides |
|--------------|---------------|
| Background (problem) | `### Slide: Background` |
| Change Description | `### Slide: Proposed Change - …` |
| Mermaid in Background | `### Diagram: …` + optional slide reference |
| Justification | Fold into Background or Proposed Change overview |
| (new) Existing design | `### Slide: Existing Design - …` |
| (new) Promotion / Fallback | Required for production-impacting changes |

## Incremental vs full

**Incremental** (bug fix, race condition): Background → Existing Design (reference) → Proposed Change (2–4 slides) → Promotion → Fallback → Q&A

**Full** (new service, migration): Add domain tables, architecture, schema, config and production stats — see the archetype catalogue in [design-review-pptx references/slide-archetypes.md](../design-review-pptx/references/slide-archetypes.md).
