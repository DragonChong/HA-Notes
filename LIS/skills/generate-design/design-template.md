# Design Section Template

Append or replace the `## Design` section in a JIRA Obsidian note (`LIS/JIRA/<note>.md`).
The **design-review-pptx** skill reads this section directly and turns each block
into a slide.

Narrative outline follows HA [General PPTX Preparation Best Practices](file:///D:/ECP/LIS/References/General%20PPTX%20Preparation%20Best%20Practices.md)
(Agenda → Exec Summary → Existing → Proposed → Trade-offs → Impact → Implementation → Asks).
Visual kit stays design-review-pptx (HA teal) — this template is content structure only.

---

## Full review outline (default for `full`)

```markdown
## Design

**Review type:** full
**JIRA key:** LIS-XXXXX
**Service:** lis-example-svc
**Review forum:** CP3
**Review date:** Dth Mon YYYY
**Prior review:** [[Prior Design Review Note]] or none

### Agenda
Executive Summary
Background
Existing Design
Proposed Design
Trade-offs
Impact
Promotion
Fallback
Open Questions
Q&A

### Slide: Executive Summary
**Archetype:** thesis
<One-sentence thesis the room should remember.>
- Proof 1 (problem)
- Proof 2 (change)
- Proof 3 (impact)
Meeting goal: <what confirmation you need today>

### Slide: Background
<Symptom → root cause. Max 8 lines.>

### Slide: Existing Design - <topic>
**Archetype:** image | compare | decision-flow
<Visual-first: diagram, screenshot, or before side of compare. Cite prior review when reused.>

### Slide: Proposed Design - Overview
**Archetype:** compare | decision-flow
<Numbered work items or old vs new. Prefer compare over prose cards.>

### Slide: Proposed Design - <detail>
**Archetype:** steps-sidebar | matrix | code-findings
```sql
-- or xml, json
SELECT …
```

### Diagram: architecture
```mermaid
sequenceDiagram
    …
```

### Slide: Trade-offs
**Archetype:** cards
<Alternatives considered and why rejected>

### Slide: Impact
**Archetype:** cards
<Dependencies, risks, downstream effects>

### Slide: Promotion
**Archetype:** cards
<Ordered deployment / implementation steps — Best Practices “Implementation Plan”>

### Slide: Fallback
**Archetype:** cards
<Rollback steps>

### Slide: Open Questions
**Archetype:** asks
1. <Concrete question — not “Any feedback?”>
2. …
3. …

### Slide: Q&A
```

---

## Incremental outline (lean)

```markdown
## Design

**Review type:** incremental
**JIRA key:** LIS-XXXXX
**Service:** lis-example-svc
**Review forum:** CP3
**Review date:** Dth Mon YYYY
**Prior review:** [[Prior Design Review Note]] or none

### Agenda
Background
Existing Design
Proposed Change
Promotion
Fallback
Open Questions
Q&A

### Slide: Background
<Symptom → root cause bullets. Max 8 lines.>

### Slide: Existing Design - <topic>
**Archetype:** image | compare | code-findings
<Reuse from prior review when applicable; cite source note>

### Slide: Proposed Change - Overview
**Archetype:** compare | decision-flow
<Numbered work items>

### Slide: Proposed Change - <detail>
**Archetype:** steps-sidebar | matrix | code-findings

### Slide: Promotion
**Archetype:** cards
<Ordered deployment steps>

### Slide: Fallback
**Archetype:** cards
<Rollback steps>

### Slide: Open Questions
**Archetype:** asks
1. <Concrete reviewer question>
2. …

### Slide: Q&A
```

---

## Section rules

| Block | Purpose |
|-------|---------|
| Metadata lines (`**Review type:**` etc.) | Title slide + classification for design-review-pptx |
| `### Agenda` | Agenda slide (one item per line) |
| `### Slide: {title}` | One CP3 slide; body until next `###` heading |
| `**Archetype:** {name}` | Optional hint — prefer `thesis`, `asks`, `image`, `compare`, `decision-flow` for existing/proposed |
| `### Diagram: {name}` | Mermaid stored in JIRA note; export PNG to project `docs/` if needed for slides |

## Writing rules (required)

- Every **full** or **incremental** production review must include
  `### Slide: Open Questions` with **concrete** asks (decision questions, not
  “Any feedback?”).
- Existing / Proposed prefer `**Archetype:** image|compare|decision-flow`.
- Full reviews include `### Slide: Executive Summary` with `**Archetype:** thesis`
  (meeting goal + TL;DR).
- Plain English in prose; identifiers in code blocks and tables (see below).

## Plain English rule

**Prose describes behaviour; identifiers live in code blocks and tables.**

A bullet full of camel-case is noise to a CP3 audience. The same identifier in a
code fence or a table cell is precision — and the deck has dedicated places for
it (`code-findings` panels, `tag` chips, table cells, the condition strip).

- Bad: `MessageQueueProcessor` calls `findProcessableMessages`
- Good: Scheduled job runs every 10 seconds and selects the next batch of ready messages

**Always fine anywhere:** service names, table/column names, config keys,
domain/event codes (A08, A47), status enums.

## Mapping from JIRA log sections (Best Practices aligned)

| JIRA / Best Practices section | Design slides |
|-------------------------------|---------------|
| Exec summary / meeting goal | `### Slide: Executive Summary` (`thesis`) |
| Background (problem) | `### Slide: Background` |
| Existing design | `### Slide: Existing Design - …` (visual-first) |
| Change Description / Proposed | `### Slide: Proposed Design/Change - …` |
| Trade-offs / alternatives | `### Slide: Trade-offs` |
| Impact (deps + risks) | `### Slide: Impact` |
| Mermaid in Background | `### Diagram: …` + optional slide reference |
| Justification | Fold into Background, Impact, or Overview |
| Implementation / Promotion | `### Slide: Promotion` |
| Fallback | `### Slide: Fallback` |
| Highlight Asks | `### Slide: Open Questions` (`asks`) — **required** |

## Incremental vs full

**Incremental:** Background → Existing (ref) → Proposed (2–4) → Promotion → Fallback → Open Questions → Q&A

**Full:** Agenda → Executive Summary (`thesis`) → Background → Existing → Proposed → Deep Dive (optional) → Trade-offs → Impact → Promotion → Fallback → Open Questions → Q&A

See the archetype catalogue in [design-review-pptx references/slide-archetypes.md](../design-review-pptx/references/slide-archetypes.md).
