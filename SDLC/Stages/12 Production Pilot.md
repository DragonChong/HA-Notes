---
title: 12 Production Pilot
tags:
  - sdlc
  - sdlc-stage
stage_key: pilot
skill: pilot-monitor
skill_status: build
automation_level: B
created: 2026-09-03
status: blueprint
---

# 12 Production Pilot

Part of [[SDLC Agentic Workflow]]. Owning skill: **`pilot-monitor`** — *to build*. Level **B**.

## Purpose

Run the monitoring plan against the live pilot, decide go/no-go for wider rollout, and close the loop back into the knowledge base.

## Entry criteria

- Promotion submitted and executed
- Monitoring plan available with pre-promotion baselines captured

## Procedure

1. **Define the pilot scope** — which hospitals, labs, wards or user group; for how long; what the exit criteria are.
2. **Execute the monitoring plan** at T+0, T+1h, T+1d, T+1w. Each run appends a dated row to the pilot report; the agent compares against the baseline and flags deviation.
3. **Track incidents** — anything raised during the pilot, linked to the requirement or design section it relates to.
4. **Go / no-go recommendation** with the evidence behind it.
5. **Close the loop** — the part that is usually skipped and that compounds the most value:
   - Update `Knowledge Base/` and `LIS/ECP/<service>/` with the new behaviour, so the next requirement stage retrieves reality rather than the pre-change design.
   - Record actual versus planned durations back into the dossier, so `project-plan` estimates improve.
   - Record what the agentic workflow got wrong this cycle into [[Rollout Plan#Retro log]].

## Output

- `SDLC/Projects/<key>/12 Pilot Report.md` — scope, monitoring runs, deviations, incidents, verdict
- Updated knowledge-base notes
- Dossier `stage: closed`, `status: done`

## Exit gate

- [ ] Monitoring executed at every planned interval
- [ ] No unexplained deviation from baseline
- [ ] All pilot incidents closed or carried with an owner
- [ ] Go/no-go decided and recorded
- [ ] Knowledge base updated — the dossier does not close until this is done
- [ ] Retro line written

## Human checkpoint

**Required** for the go/no-go decision.

## Notes

> [!tip] This is the compounding stage
> Everything the workflow learns lands here. A dossier closed without the knowledge-base update is a project that taught the system nothing — and the next requirement stage will retrieve stale context. Make the orchestrator refuse to set `stage: closed` until the knowledge-base update is linked.
