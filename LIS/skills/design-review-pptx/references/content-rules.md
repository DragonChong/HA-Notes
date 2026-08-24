# Content rules

How to turn a JIRA design note into slide content. The archetypes handle how it
looks; this is about what goes in them.

Craft sources (structure / asks / visual-first — **not** palette): HA
`D:\ECP\LIS\References\General PPTX Preparation Best Practices.md` and
Awesome-PPT-Design-Skills. Keep the approved LIS-10747 teal kit.

---

## Mapping a JIRA note to slides

The source is `LIS/JIRA/{Note}.md` — the change-request note from
**lis-jira-log-creator**, with its `## Design` section filled in by
**generate-design**.

| Note section / Design heading | Archetype |
|-------------------------------|-----------|
| frontmatter (`jira`, `services`, `priority`, `target_completion_date`) | `title-hero` eyebrow + stats (+ optional `presenters` / `reviewers`) |
| `## Request Summary` / meeting goal | `title-hero` lede; full reviews also get early `thesis` |
| `### Agenda` | `agenda` |
| `### Slide: Executive Summary` / meeting goal | `thesis` |
| `## Background` / `### Slide: Background` | `evolution` (history) or `cards` |
| Existing Design | `image`, `compare`, or `code-findings` — visual-first |
| Proposed Change overview / before-after | `compare` or `decision-flow` |
| Proposed Change detail / schema | `steps-sidebar`, `matrix`, or `code-findings` |
| Trade-offs / Alternatives | `cards` |
| Impact (deps + risks) | `cards` |
| Promotion / Implementation Plan | `cards` or `steps-sidebar` (docs may say “Implementation Plan”; archetype stays these) |
| Fallback | `cards` |
| Open Questions / Confirmation | `asks` (required before Q&A) |
| Q&A | `statement` |
| `## Target Completion Date` / next steps | `closing` |
| `## Justification` | `sidebar` on `steps-sidebar`, or a `callout` |

**When `## Design` is empty** — as it was for LIS-10747 — build from Background,
Change Description and Justification, and say so on the closing slide
(`"Design status: draft — to be populated before CP3 review."`). Do not invent
design detail to fill slides.

**Visual-first for existing / proposed.** Prefer `image`, `decision-flow`, or
`compare` over a grid of prose cards.

**Asks must be concrete.** “Is send-out determined by destination lab only?”
not “Any feedback?”. Full reviews and `--profile cp3` QA warn if there is no
`asks` / Open Questions slide before the closing Q&A `statement`.

### Deck length

| Review type | Slides |
|-------------|--------|
| Incremental — bug fix, targeted change | 6–10 |
| Full — new service, migration, first review | 14–22 |

**Incremental sequence:**

```
title-hero → Background → Existing (ref) → Proposed (2–4)
           → Promotion → Fallback → asks → Q&A statement → closing
```

**Full sequence:**

```
title-hero → agenda → thesis (exec summary)
           → Background → Existing → Proposed (+ compare)
           → Deep Dive (optional) → Trade-offs → Impact
           → Promotion → Fallback → asks → Q&A → closing
```

A full review adds `agenda`, `thesis`, `image` (architecture), `compare`, and
`cards` for Trade-offs / Impact / Promotion / Fallback. Incremental reviews may
skip the agenda and thesis but still need Open Questions (`asks`).

---

## Writing for the slide

**One idea per slide.** The eyebrow names the idea, the H1 states it, the body
supports it. If you cannot write the H1 as a short declarative sentence, the
slide is doing two jobs.

**Roughly 40 body words.** `qa-deck.js` warns past 90 for the whole slide. Card
bodies want 20–28 words — two lines at 13pt in a 3.12″ column.

**Density.** Prefer ≤3 cards per row; leave quiet margin. One dominant block.

**Titles are statements, not labels.** "What the code does today" beats
"Current Implementation". "KTH is next" beats "Justification".

**Eyebrows are categories, not sentences.** `BACKGROUND`, `CURRENT BEHAVIOUR`,
`LOE_CONTROL MATRIX`. Upper-casing is automatic.

**Hyphens, not em-dashes, in titles.** `Existing Design - Overview`. Em-dashes
are fine in body copy.

**Identifiers go in `Courier New`** — JIRA keys, table and column names, setup
constants, class and method names. Use the `mono: true` flag on table headers
and the `tag` slot on cards; in prose, an identifier can stay in body font if
setting it in mono would break the line.

**Terminology must not drift.** Pick `OUTSTANDING` or `Outstanding`, one service
name spelling, one name per setup control, and hold it across every slide.

---

## Speaker notes

Every slide gets notes; QA warns when one does not. One to three sentences of
what you would **say**, not a restatement of what is on screen.

Good — adds the reasoning the slide omits:

> LIS-8437 made cross-hospital ward-assigned request numbers retrievable.
> LIS-9632 patched the resulting false reminder with a QEH hardcode. That
> hardcode is now the blocker for KTH.

Bad — reads the slide back:

> This slide shows the background. There are three steps.

---

## What to put on the cover

`title-hero` stats are 2–4 chips:

- Date / forum (required somewhere: eyebrow, stats, or footer)
- Service
- Priority / status
- Owner / team

Optional identity fields:

- `presenters` — who is walking the deck
- `reviewers` — CP3 panel / stakeholders

QA under `--profile cp3` requires a JIRA key and warns if there is no service
name or date.

---

## Before you generate

- [ ] One idea per slide, H1 written as a statement
- [ ] Every slide has an eyebrow (except bookends) and speaker notes
- [ ] Open Questions (`asks`) present before Q&A for full / CP3 decks
- [ ] Identifiers in `Courier New`, terminology consistent
- [ ] No `TBD` / `TODO` / placeholder text — QA errors on these
- [ ] Matrix has at most 5 body rows when it also carries takeaway cards
- [ ] `node qa-deck.js <deck.json> --profile cp3` exits 0
- [ ] Preview opened and actually looked at
