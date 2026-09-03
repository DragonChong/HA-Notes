---
title: 05 Project Plan
tags:
  - sdlc
  - sdlc-stage
stage_key: plan
skill: project-plan
skill_status: build
automation_level: B
created: 2026-09-03
status: blueprint
---

# 05 Project Plan

Part of [[SDLC Agentic Workflow]]. Owning skill: **`project-plan`** — *to build*. Level **B**.

## Purpose

Turn the design into a dated schedule across every downstream stage, as a Mermaid Gantt plus a milestone table. Your existing `LIS/Project Plans/CRS Revamp.md` already uses this shape — the skill formalises it and makes it per-dossier.

## Entry criteria

- Design gate passed (effort cannot be estimated before design)
- Target completion date known
- Known fixed dates: CP3 forum, promotion windows, freeze periods

## Inputs

| Input | Source |
|---|---|
| Design sections and their size | `02 System Design.md` |
| Historic durations for similar work | Past dossiers in `SDLC/Projects/` |
| Team calendar constraints | User |
| Promotion window calendar | User — see [[Open Questions]] |

## Procedure

1. Decompose the design into work packages, one per design section that produces code, config or SQL.
2. Estimate each: `S` / `M` / `L` / `XL`, converted to days by a table kept in the skill, calibrated from past dossiers.
3. Lay the schedule out across the fixed stage sequence (below), working **backwards** from the promotion window, not forwards from today. Backwards scheduling is what surfaces the impossible plan on day one.
4. Emit a Mermaid `gantt` block with `excludes weekends`.
5. Emit a milestone table with owner and gate name per row.
6. Flag every stage whose computed slack is negative.

## Planned stages

`Requirement Confirmation` · `System Design` · `Development` · `System Integration Test` · `User Acceptance Test` · `Load / Soak Test` · `Promotion Preparation` · `Promotion Submission` · `Production Pilot`

> [!note] UAT
> UAT appears in the plan but has no stage note or skill in this blueprint, because it is user-run rather than agent-run. The agent's role is to schedule it, prepare the UAT scope from the acceptance criteria, and record the outcome in the dossier. Worth adding a thin `uat-support` skill in a later phase — see [[Rollout Plan]].

## Output

`SDLC/Projects/<key>/05 Project Plan.md` — Gantt, milestone table, dependency notes, risk-to-schedule list.

For programme-level work spanning several dossiers, the skill also appends a section to the relevant note in `LIS/Project Plans/`.

## Exit gate

- [ ] Every downstream stage has a start and end date
- [ ] Dates are consistent with the promotion window and any freeze period
- [ ] No negative slack, or negative slack is explicitly accepted and recorded
- [ ] Dependencies on other teams are named with an owner

## Human checkpoint

**Required.** Estimates are your professional judgment; the agent proposes and arranges them.

## Notes

- Re-run the skill whenever a gate slips. The plan note is versioned by git in the vault, so the slip history is itself useful evidence at the next planning round.
