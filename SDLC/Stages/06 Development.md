---
title: 06 Development
tags:
  - sdlc
  - sdlc-stage
stage_key: development
skill: implement-task
skill_status: exists
automation_level: B
created: 2026-09-03
status: blueprint
---

# 06 Development

Part of [[SDLC Agentic Workflow]]. Owning skills: **`implement-task`** (*exists*) and **`code-change-log`** (*exists*). Level **B**.

## Purpose

Implement the design in the repos, and leave behind a change-log note that every later stage reads — code review, SIT, promotion form, monitoring plan and the pilot all consume it.

## Entry criteria

- Design gate passed
- JIRA key exists
- Branch created from the correct base

## The generalization problem

`implement-task`, `task-plan`, `task-add`, `task-update`, `blocker-check`
and `load-context` keep the procedure. Dossier `repos`, `## Open Items`,
and optional `tasks:` supply the particulars. CRS Revamp still works when
there is no dossier: Central Task List and D.1–D.6 remain the fallback.

## Procedure

1. `blocker-check` — which open items in the dossier affect this work package? Verdict: **proceed** / **proceed with assumption** / **partial** / **blocked**.
2. Implement. Assumptions become `// TODO [OPEN-n]: <assumption>` so they stay greppable.
3. Type-check (frontend) or compile (backend). Non-negotiable before the change-log is written.
4. `code-change-log` writes the change record.
5. Commit with the JIRA key in the message.

## Output — `06 Code Change Log.md`

This is the note that carries the project forward. Per change:

| Field | Why later stages need it |
|---|---|
| Repo, branch, commit range, PR link | Code review, promotion form |
| Files and classes changed | Code review scope |
| New/changed API endpoints | SIT test cases, interface partners |
| DB objects: tables, columns, indexes, SPs | Promotion SQL, monitoring plan |
| Config keys added/changed, per environment | ConfigMap/Secret preparation |
| New log lines and their markers | Monitoring plan queries |
| Feature flags and default state | Pilot toggling and rollback |
| Requirement traceability `Rn` | SIT coverage check, promotion checklist |
| Backward-compatibility note | Fallback and rollback plan |

> [!tip] The highest-leverage item on that list
> **New log lines and their markers.** If the developer records the exact log string when the code is written, the monitoring plan at stage 10 writes itself. If not, someone reverse-engineers it under promotion pressure.

## Exit gate

- [ ] Compiles / type-checks clean
- [ ] Unit tests added or a written reason why not
- [ ] SonarQube local scan clean of new blockers — use `sonar-scan-fix`
- [ ] Change log complete, especially DB objects, config keys and log markers
- [ ] Every `TODO [OPEN-n]` either resolved or listed in the dossier Open Items
- [ ] PR raised

## Human checkpoint

Ongoing. Agent-written code is reviewed at stage 07 like anyone else's — see [[07 Code Review]].
