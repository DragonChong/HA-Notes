# Content rules

How to turn arbitrary source material into slide content. The archetypes handle
how it looks; this is about what goes in them.

---

## Mapping source material to slides

Read the source once and name the *shape* of each idea, then pick an archetype.
Do not dump a section of prose onto a slide.

| The material is… | Archetype |
|------------------|-----------|
| cover / what this is | `title-hero` |
| list of topics we will cover | `agenda` |
| TL;DR, meeting goal, exec summary | `thesis` |
| history, timeline, how we got here | `evolution` |
| current implementation / a code excerpt | `code-findings` |
| old vs new, now vs proposed | `compare` |
| a branching rule or if/then | `decision-flow` |
| per-case / per-site / per-row outcomes | `matrix` |
| an ordered change, runbook, or scope list | `steps-sidebar` |
| risks, benefits, options, trade-offs, promotion, fallback | `cards` |
| a diagram (PNG/SVG) | `image` |
| concrete reviewer questions / confirmation | `asks` |
| a section break or open Q&A | `statement` |
| date, owners, next actions | `closing` |

If the source already uses `### Slide:` blocks (the generate-design outline),
each block is one slide. Honour `**Archetype:**` when present; otherwise choose
from the table above.

**Visual-first for existing / proposed.** Prefer `image`, `decision-flow`, or
`compare` over a grid of prose cards. Screenshots and flows beat walls of text.

**Density.** Prefer ≤3 cards per row; leave quiet margin (roughly one-third of
the band empty when content is short). One idea per slide.

**Asks must be concrete.** “Is send-out determined by destination lab only?”
not “Any feedback?”. Full / CP3 reviews should include an `asks` slide before
the closing Q&A `statement`.

Craft sources (not style): `D:\ECP\LIS\References\General PPTX Preparation Best Practices.md`
and Awesome-PPT-Design-Skills (thesis / negative space / visual-first / QA rigor).
Keep the approved HA teal kit — do not adopt lifestyle palettes or Inter/serif luxury type.

**When the source is thin** — a few bullets, a meeting scribble — build the
shortest honest deck (brief, 5–8 slides) and say so in the title-slide footer
(`"Draft — source was a meeting note."`). Do not invent design, numbers, or
owners to fill archetypes.

### Deck length

| Length | Slides | Typical source |
|--------|--------|----------------|
| Brief — status, handover, one topic | 5–8 | meeting note, runbook, announcement |
| Standard — training, proposal | 8–14 | wiki page, training outline |
| Full — architecture, long briefing | 14–22 | system design, multi-topic pack |

A full deck adds `agenda`, `image`, `compare`, and extra `cards`. A brief deck
usually skips the agenda.

---

## Writing for the slide

**One idea per slide.** The eyebrow names the idea, the H1 states it, the body
supports it. If you cannot write the H1 as a short declarative sentence, the
slide is doing two jobs.

**Roughly 40 body words.** `qa-deck.js` warns past 90 for the whole slide. Card
bodies want 20–28 words — two lines at 13pt in a 3.12″ column.

**Titles are statements, not labels.** "The queue blocks on new HKID only"
beats "Current Behaviour". "Cut over after last batch" beats "Schedule".

**Eyebrows are categories, not sentences.** `BACKGROUND`, `RUNBOOK`, `GO / NO-GO`.
Upper-casing is automatic.

**Hyphens, not em-dashes, in titles.** `Existing flow - overview`. Em-dashes
are fine in body copy.

**Identifiers go in `Courier New`** — ticket keys, table and column names,
class and method names, config keys. Use the `mono: true` flag on table headers
and the `tag` slot on cards. In a prose bullet, describe the behaviour instead.

**Terminology must not drift.** Pick one spelling per service, status, and
control name and hold it across every slide.

**No bullets.** If content wants to be a list, it wants to be `cards`, `agenda`,
or `steps-sidebar`.

---

## Speaker notes

Every slide gets notes; QA warns when one does not. One to three sentences of
what you would **say**, not a restatement of what is on screen.

Good — adds the reasoning the slide omits:

> We moved the window to 02:00 because Friday night still has outpatient
> phlebotomy until midnight. The batch job drains in under twenty minutes
> once inbound A08 traffic stops.

Bad — reads the slide back:

> This slide shows the runbook. There are three steps: drain, cut, verify.

---

## What to put on the cover

`title-hero` stats are 2–4 chips. Useful chips for a general deck:

- Date / window (required somewhere: eyebrow, stats, or footer)
- Audience or forum
- Owner / team
- Status (`draft`, `for briefing`, `agreed`)

Optional identity fields (rendered above the footer):

- `presenters` — who is walking the deck
- `reviewers` — who must confirm (panel, stakeholders)

A JIRA key is optional. Use `--profile cp3` on QA only when this *is* a CP3
design-review deck that happened to go through this skill.

---

## Before you generate

- [ ] One idea per slide, H1 written as a statement
- [ ] Every slide has an eyebrow (except bookends) and speaker notes
- [ ] Identifiers in `Courier New`, terminology consistent
- [ ] No `TBD` / `TODO` / placeholder text — QA errors on these
- [ ] Matrix has at most 5 body rows when it also carries takeaway cards
- [ ] `node qa-deck.js <deck.json>` exits 0
- [ ] Preview opened and actually looked at
