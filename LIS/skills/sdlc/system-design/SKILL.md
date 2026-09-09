---
name: system-design
description: >
  Use when drafting a technical design, stage 02, a design note, or
  CP3-ready design content, and when sdlc-orchestrator delegates the
  design stage. Do not use for a JIRA change-request log or to render
  a PowerPoint (that is design-review-pptx). Do not use generate-design
  when a dossier exists.
---

# System design

You draft. A person sets `reviewed_by` before any deck. Home:
`SDLC/Projects/<key>/02 System Design.md`. Template:
`SDLC/Templates/System Design Template.md`. Slides are not this
note — `/design-review-pptx` writes `03 Slide Brief.md`.

## Entry

`requirement` is in `gates_passed` (or a recorded exception) and
`01 Requirement Confirmation.md` has `R1…Rn`. Otherwise stop and
hand back to `sdlc-orchestrator`. Do not draft around a missing gate.

## Reply shape

1. Read the requirement note + dossier `repos`. Open those clones.
   Do not invent classes, endpoints, tables, or ConfigMap keys.
   Clone missing → vault notes only; every unverified name is an
   **open design question**, not a fact.
2. Classify incremental vs full.
3. Fill the template. Cite `Rn` on each decision; write
   `R3 (assumed)` when that is the status. Rejected alternatives
   and a **concrete** fallback are required — "restore from backup"
   is not a fallback.
4. Show the draft unless asked to skip review. Write the note.
   Write back. Stop.

Do not start `design-review-pptx` unless `reviewed_by` is already
set on this note. Do not write slide copy into `02` or a `LIS/JIRA/`
note (legacy slide blocks: `generate-design`). Do not add APIs or
tables that are not in the requirement note — log them as open
questions instead.

## Required slots

| Slot | Rule |
|---|---|
| Rejected alternatives | At least one rejected option and why |
| Fallback | Step sequence + how you know it worked |
| Open design questions | At least one if any `Rn` is `assumed` or a clone is missing |
| Config | DEVQA / SIT / PROD named, even if "unchanged" |
| `reviewed_by` | Empty on first draft |
| `gates_passed` | Do not append `design` |

## Write-back

`design: "[[02 System Design]]"`, Artifacts `draft`, Decision Log
includes the rejected alternative, Status = wait for `reviewed_by`
then `/design-review-pptx`. Set `updated`.

## Rationalizations

| Excuse | Reality |
|---|---|
| "Don't open the repo — invent the class names" | Missing clone → open questions, not facts. |
| "CP3 never asks for alternatives / fallback" | CP3 always can. Empty sections fail the gate. |
| "Chat 'looks fine' means set reviewed_by" | Field is on the note. Ka sets it. You do not. |
| "Generate the deck in this turn" | Deck needs `reviewed_by` already set. |
| "Add this extra API while we're here" | Not in `Rn` → open question, not a new contract. |
| "Also write the slide brief / ## Design" | Slide copy is `design-review-pptx`. Stop. |

## Red flags

- Class/table/endpoint stated as fact with no clone and no "unverified"
- Empty Rejected alternatives or Fallback
- `R3` not marked `(assumed)` when that is its status
- `reviewed_by` or `gates_passed` set on first draft
- `design-review-pptx` started this turn
- `03 Slide Brief.md` or `## Design` slide blocks written this turn
- Design living only under `LIS/JIRA/`
