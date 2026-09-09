---
title: 03 Design Review Deck
tags:
  - sdlc
  - sdlc-stage
stage_key: design-review
skill: design-review-pptx
skill_status: exists
automation_level: A
created: 2026-09-03
updated: 2026-09-09
status: blueprint
---

# 03 Design Review Deck

Part of [[SDLC Agentic Workflow]]. Owning skill: **`design-review-pptx`**. Level **A** (agent-run).

## Purpose

Turn the approved design into a CP3 deck. This stage **adds no new design facts**. It may rephrase for the room. If a slide needs a class, table, or API the design note does not have, the design note is wrong — hand back to `system-design`.

## Entry criteria

- `design` gate passed, `reviewed_by` set on [[02 System Design]]
- CP3 slot date known

## Inputs

| Input | Source |
|---|---|
| Facts | `02 System Design.md` |
| Slide copy | `03 Slide Brief.md` (create from [[Slide Brief Template]] if missing) |
| Legacy only | `## Design` in the JIRA note when there is no dossier |
| JIRA key, title, service, forum | Dossier frontmatter |
| Review date | User |
| Profile | `incremental` (default), `full`, or `walkthrough` (only when asked) |

## Procedure

1. Confirm `reviewed_by` on `02`. Stop if empty.
2. Write or refresh `03 Slide Brief.md`. Humanize titles, bodies, and speaker notes (`/humanizer`, prose only).
3. Choose the slide sequence for the profile.
4. Write `assets/<Title>.deck.json` from the **brief**, not from leftover `## Design` on `02`.
5. Generate → QA (`--profile cp3` must exit 0) → preview and actually look at it.

**Source precedence:**

```
1. SDLC/Projects/<key>/03 Slide Brief.md
2. ## Design in the JIRA note       → legacy
3. none of the above                → stop
```

## Output

- `SDLC/Projects/<key>/03 Slide Brief.md`
- `SDLC/Projects/<key>/assets/<Title>.deck.json`
- `SDLC/Projects/<key>/assets/<Title>.pptx`

Keeping the `.deck.json` next to the `.pptx` is what makes regeneration cheap after CP3 comments.

## Exit gate

- [ ] QA exits 0
- [ ] Deck previewed visually, not just generated
- [ ] Slide count fits the CP3 slot
- [ ] Presented; CP3 actions captured back into the design note and the dossier Gate Log

## Human checkpoint

Spot-check the brief and preview before presenting. **Required** after presenting: CP3 actions must land in the design note before the `design-review` gate is marked passed.

## Notes

- CP3 "pass with actions" is a distinct verdict. Record it as such in the Gate Log with the action list, and do not let the orchestrator treat it as a clean `pass`.
- CP3 voice sample: scheduler job-normalization `deck.json`. Walkthrough sample: USID Auto-Registration Flow `deck.json`. Do not mix them.
