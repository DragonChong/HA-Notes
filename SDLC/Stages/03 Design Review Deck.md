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
status: blueprint
---

# 03 Design Review Deck

Part of [[SDLC Agentic Workflow]]. Owning skill: **`design-review-pptx`** — *exists*, needs a source-resolution change. Level **A** (agent-run).

## Purpose

Render the approved design as a CP3 deck. This stage adds no new content — if the deck needs a fact the design note does not have, the design note is wrong, not the deck.

## Entry criteria

- `design` gate passed, `reviewed_by` set on the design note
- CP3 slot date known

## Inputs

| Input | Source |
|---|---|
| Design content | `02 System Design.md` (new) or `## Design` in the JIRA note (legacy) |
| JIRA key, title, service, forum | Dossier frontmatter |
| Review date | User |

## Procedure

Unchanged from the existing skill: choose the slide sequence → write the deck spec JSON → generate → QA (must exit 0) → preview and actually look at it.

**One change:** Step 1 resolves the design source by precedence rather than assuming the JIRA note:

```
1. dossier.design wikilink            → new path
2. JIRA note frontmatter `design`     → new path
3. `## Design` in the JIRA note       → legacy path
4. none of the above                  → stop, tell the user the design gate is not passed
```

## Output

- `SDLC/Projects/<key>/assets/<Title>.deck.json`
- `SDLC/Projects/<key>/assets/<Title>.pptx`

Keeping the `.deck.json` next to the `.pptx` is what makes regeneration cheap after CP3 comments.

## Exit gate

- [ ] QA exits 0
- [ ] Deck previewed visually, not just generated
- [ ] Slide count fits the CP3 slot
- [ ] Presented; CP3 actions captured back into the design note and the dossier Gate Log

## Human checkpoint

Spot-check only before presenting. **Required** after presenting: CP3 actions must land in the design note before the `design-review` gate is marked passed.

## Notes

- CP3 "pass with actions" is a distinct verdict. Record it as such in the Gate Log with the action list, and do not let the orchestrator treat it as a clean pass.
