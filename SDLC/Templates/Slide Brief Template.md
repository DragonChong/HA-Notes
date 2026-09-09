---
title: 03 Slide Brief — <Title>
tags:
  - sdlc-template
generated_by: design-review-pptx
generated_on: ''
reviewed_by: ''
agent_assisted: true
profile: incremental
---

# 03 Slide Brief — <Title>

Facts come from [[02 System Design]]. This note is presentational only: one idea per slide, statement titles, speaker notes that add the why. Do not invent a class, table, API, or ConfigMap key that is not in `02`. If a slide needs a missing fact, stop and hand back to `system-design`.

**Profile:** incremental | full | walkthrough
**JIRA key:**
**Service:**
**Review forum:** CP3
**Review date:**
**Prior review:** none

Voice: scheduler CP3 sample (`lis-scheduler-lib/docs/job-normalization/Normalize Table-driven Job Definitions.deck.json`). Walkthrough profile only when Ka asks: USID sample (`Specimen Sorter/USID Auto-Registration Flow.deck.json`).

Humanize prose (titles, bodies, notes) before writing `deck.json`. Leave identifiers, SQL, ConfigMap keys, JIRA keys, table and column names alone.

---

## Incremental (default)

```
title-hero → evolution (Background) → compare|code-findings|image (Existing)
           → compare|decision-flow (Proposed overview) → 1–3 detail slides
           → cards (Promotion) → cards (Fallback) → asks → statement (Q&A) → closing
```

6–10 content slides plus cover and close. Agenda optional. `asks` required. Titles are statements (`One table copies nature onto every site row`), not labels (`Current Implementation`).

### Cover
**Archetype:** title-hero
**Headline:**
**Notes:** Cover is identity only.

### Slide: Background
**Eyebrow:** Background
**Title:** <statement>
**Archetype:** evolution
**Body:**
**Notes:** <what you would say; not a restatement>

### Slide: Existing Design - <topic>
**Eyebrow:** Existing Design
**Title:** <statement>
**Archetype:** compare | code-findings | image
**Body:**
**Notes:**

### Slide: Proposed Change - Overview
**Eyebrow:** Proposed Change
**Title:** <statement>
**Archetype:** compare | decision-flow
**Body:**
**Notes:**

### Slide: Proposed Change - <detail>
**Eyebrow:** Proposed Change
**Title:** <statement>
**Archetype:** steps-sidebar | matrix | code-findings
**Body:**
**Notes:**

### Slide: Promotion
**Eyebrow:** Promotion
**Title:** <statement>
**Archetype:** cards
**Body:**
**Notes:**

### Slide: Fallback
**Eyebrow:** Fallback
**Title:** <statement>
**Archetype:** cards
**Body:**
**Notes:**

### Slide: Open Questions
**Eyebrow:** Open Questions
**Title:** <statement>
**Archetype:** asks
1. <Concrete question — not "Any feedback?" or "confirm reviewed_by">
2.
**Notes:**

### Slide: Q&A
**Archetype:** statement
**Headline:** Q&A
**Notes:** Likely questions the room will ask.

### Close
**Archetype:** closing
**Notes:** Next step after the room.

---

## Full

Add `agenda`, `thesis` (executive summary), architecture `image`, Trade-offs, Impact. 14–22 slides. Sequence:

```
title-hero → agenda → thesis
           → Background → Existing → Proposed (+ compare)
           → Deep Dive (optional) → Trade-offs → Impact
           → Promotion → Fallback → asks → Q&A → closing
```

### Slide: Executive Summary
**Eyebrow:** Executive Summary
**Title:** <one sentence the room should remember>
**Archetype:** thesis
**Proofs:** problem / change / impact
**Goal:** <what confirmation you need today>
**Notes:**

---

## Walkthrough (only when Ka asks)

USID pattern: `image` of today's screen or flow, then as-is vs to-be `evolution`, then `asks` for that stage. Not the CP3 6–10 sequence. Still no new facts beyond `02`.

---

## Slot rules

| Slot | Rule |
|---|---|
| Title | Declarative sentence. Hyphens, not em dashes. |
| Body | About 40 words. Card bodies 20–28. |
| Notes | One to three sentences of what you would say. |
| Asks | Decision questions. Fake asks fail the brief. |
| Identifiers | Code fences, table cells, `tag` chips. Not a prose bullet of camel-case. |
| `reviewed_by` | Empty on first draft (spot-check, not a second design gate). |
