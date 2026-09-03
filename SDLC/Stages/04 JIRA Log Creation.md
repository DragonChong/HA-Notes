---
title: 04 JIRA Log Creation
tags:
  - sdlc
  - sdlc-stage
stage_key: jira
skill: lis-jira-log-creator
skill_status: exists
automation_level: B
created: 2026-09-03
status: blueprint
---

# 04 JIRA Log Creation

Part of [[SDLC Agentic Workflow]]. Owning skill: **`lis-jira-log-creator`** — *exists*. Level **B**.

## Purpose

Produce the SM→SA change-request content and the JIRA issue itself. Scope stays exactly as today: the JIRA log detail, nothing more.

## Position in the flow

Note this sits *after* design in your listed order, which is right — the change description is much sharper once the design exists. But it can also run earlier for a fix where design is trivial. The orchestrator allows `jira` before `design` when `work_type: fix`, and blocks it otherwise.

## Entry criteria

- Requirement gate passed
- For `enhancement` / `project`: design gate passed
- Target completion date known

## Inputs

Unchanged from the existing skill: service name(s), what is changing, technical details, problem/current state, reference JIRA tickets, target completion date, request type, priority.

**Added:** when a dossier exists, these are read from it rather than asked for again — `services`, `reference_jira`, `target_completion_date`, `work_type` → request type.

## Procedure

1. Existing six-section drafting workflow.
2. Write the note to `LIS/JIRA/<Summary>.md` with `jira-log` tag so `JIRA Log List.base` picks it up. **Do not move this note into the dossier** — the Base depends on the folder.
3. **New:** set `design: "[[02 System Design]]"` in the note frontmatter, and `jira_log: "[[<Summary>]]"` in the dossier.
4. **New — with JIRA MCP available:** create the issue directly, then write the returned key back to both the note's `jira` property and the dossier's `key`/`jira`. Rename the dossier folder from the provisional slug to the real key.

## Output

- `LIS/JIRA/<Summary>.md`
- A real JIRA issue, key recorded in two places

## Exit gate

- [ ] All six sections present and non-placeholder
- [ ] Request Summary string identical across `title` frontmatter, H1, and the Request Summary body
- [ ] Note appears in `JIRA Log List.base`
- [ ] JIRA key set on the note and the dossier

## Human checkpoint

**Required before issue creation.** Read the drafted sections; JIRA issues are hard to un-create and the summary line is the one your SM sees.

## Notes

- The bidirectional link (dossier ⇄ JIRA note) is what lets the orchestrator find the dossier when you open a JIRA note, and vice versa. Set both sides.
