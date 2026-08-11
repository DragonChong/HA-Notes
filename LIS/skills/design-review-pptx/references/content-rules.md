# Content rules

How to turn a JIRA design note into slide content. The archetypes handle how it
looks; this is about what goes in them.

---

## Mapping a JIRA note to slides

The source is `LIS/JIRA/{Note}.md` — the change-request note from
**lis-jira-log-creator**, with its `## Design` section filled in by
**generate-design**.

| Note section | Becomes |
|--------------|---------|
| frontmatter (`jira`, `services`, `priority`, `target_completion_date`, `reference_jira`) | `title-hero` eyebrow + stats |
| `## Request Summary` | `title-hero` lede |
| `## Background` | `evolution` (if there is a history) or `cards` |
| existing code / current behaviour | `code-findings`, or `compare` if the new logic is a direct swap |
| `## Change Description` | `decision-flow` when it is conditional logic; `steps-sidebar` when it is a list of edits |
| setup / config tables, per-site behaviour | `matrix` |
| `## Justification` | the `sidebar` on `steps-sidebar`, or a `callout` |
| `## Target Completion Date` | `closing` stat |
| promotion / fallback steps | `cards` |

**When `## Design` is empty** — as it was for LIS-10747 — build from Background,
Change Description and Justification, and say so on the closing slide
(`"Design status: draft — to be populated before CP3 review."`). Do not invent
design detail to fill slides.

### Deck length

| Review type | Slides |
|-------------|--------|
| Incremental — bug fix, targeted change | 6–10 |
| Full — new service, migration, first review | 14–22 |

A full review adds `agenda`, `image` (architecture), `compare`, and `cards` for
Promotion and Fallback. Incremental reviews usually skip the agenda.

---

## Writing for the slide

**One idea per slide.** The eyebrow names the idea, the H1 states it, the body
supports it. If you cannot write the H1 as a short declarative sentence, the
slide is doing two jobs.

**Roughly 40 body words.** `qa-deck.js` warns past 90 for the whole slide. Card
bodies want 20–28 words — two lines at 13pt in a 3.12″ column.

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

> This slide shows the background. There are three steps: LIS-8437, LIS-9632
> and LIS-10747.

---

## The bits reviewers always ask about

Include these for anything production-impacting, as `cards`:

- **Promotion** — ordered steps naming concrete artifacts: Helm release, cron
  job, DDL script, config map.
- **Fallback** — what you revert and in what order, and how long you have.
- **Regression scope** — the cases you will verify. If there is a `matrix`
  slide, say that the matrix *is* the regression list.

Say "no DB migration" or "no setup data change" explicitly when true. Reviewers
ask; answering on the slide saves the round trip.

---

## Before you generate

- [ ] One idea per slide, H1 written as a statement
- [ ] Every slide has an eyebrow and speaker notes
- [ ] Identifiers in `Courier New`, terminology consistent
- [ ] Promotion and Fallback present for production-impacting change
- [ ] No `TBD` / `TODO` / placeholder text — QA errors on these
- [ ] Matrix has at most 5 body rows when it also carries takeaway cards
- [ ] `node qa-deck.js <deck.json>` exits 0
- [ ] Preview opened and actually looked at
