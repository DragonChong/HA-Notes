---
name: project-plan
description: >
  Use when turning an approved design into a dated schedule, writing
  stage 05, a Gantt, or milestones, or when sdlc-orchestrator delegates
  the plan stage. Do not use to implement code (implement-task) or to
  write the change log (code-change-log).
---

# Project plan

You propose dates. A person accepts the estimates. Home:
`SDLC/Projects/<key>/05 Project Plan.md`. Template:
`SDLC/Templates/Project Plan Template.md`. Calendar:
`SDLC/Reference/Promotion Windows.md`.

## Entry

`design` is in `gates_passed` (or a recorded exception).
`02 System Design.md` exists. `target_completion_date` is set.
Otherwise stop and hand back to `sdlc-orchestrator`.

Do not run while `stage` is still `jira` and `jira` is not in
`gates_passed`, unless an exception is already in the Gate Log.

## Reply shape

1. Read `02`, the dossier, and [[Promotion Windows]].
2. Decompose `02` into work packages (code, config, SQL).
3. Size each `S` / `M` / `L` / `XL` with the table below.
4. Schedule **backwards** from Promotion submission, not forwards
   from today. UAT is a plan row even though it has no stage skill.
5. Flag negative slack. Show the draft. Write the note. Write back.
   Stop.

## Effort

Calendar days, weekends excluded. Calibrate from past dossiers when
they exist.

| Size | Days |
|---|---|
| S | 1 |
| M | 3 |
| L | 5 |
| XL | 10 |

If `target_completion_date` is after the last row in Promotion
Windows, use that date as submission and **flag** that the calendar
does not yet include it. Do not invent windows.

## Required slots

| Slot | Rule |
|---|---|
| Gantt | Mermaid `gantt` with `excludes weekends` |
| Every downstream stage | Start and end date |
| Promotion window | Named, or flagged missing |
| Negative slack | Named and accepted, or the dates change |
| Other-team dependencies | Named with an owner |

## Write-back

`Artifacts` row `05 Project Plan` → `[[05 Project Plan]]` → `draft`.
One Decision Log line. Status next action = wait for estimate
acceptance. Set `updated`. **Do not** append `plan` to
`gates_passed`.

For programme-level work, also append a section to the matching note
in `LIS/Project Plans/`.

## Later re-run

When a gate slips, rewrite `05` in place. Git in the vault is the
slip history. Do not invent a second plan file.

## Rationalizations

| Excuse | Reality |
|---|---|
| "Schedule from today so it looks busy" | Backwards from submission. Impossible plans show on day one. |
| "UAT is not a stage — omit it" | It is a plan row. Schedule it. |
| "Also implement the first package" | Second stage. Stop. |
| "Ka nodded at the Gantt — close the gate" | Estimates are a Required human checkpoint. Orchestrator closes. |

## Red flags

- Forwards-only schedule with no submission date
- Empty work packages
- Hidden negative slack
- `gates_passed` includes `plan` on first draft
- `06 Code Change Log.md` written in this turn
