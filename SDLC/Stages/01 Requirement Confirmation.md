---
title: 01 Requirement Confirmation
tags:
  - sdlc
  - sdlc-stage
stage_key: requirement
skill: requirement-confirmation
skill_status: build
automation_level: C
created: 2026-09-03
status: blueprint
---

# 01 Requirement Confirmation

Part of [[SDLC Agentic Workflow]]. Owning skill: **`requirement-confirmation`** — *to build*. Level **C** (human-led, agent-assisted).

## Purpose

Turn an ambiguous request — an SM email, a user complaint, a defect report — into a written, agreed statement of what will change and what will not. This is the stage where the agent adds most value by *asking*, not by *writing*.

## Entry criteria

- A request exists in some form (email, JIRA, verbal, incident).
- Work type is decided: `project` / `enhancement` / `fix`.

## Inputs

| Input | Source | Required |
|---|---|---|
| Raw request text | Pasted email / JIRA / meeting note | Yes |
| Affected service(s) | User, or inferred from the request | Yes |
| Existing behaviour | `Knowledge Base/`, `LIS/ECP/<service>/`, `Study/`, source code | Agent-gathered |
| Prior related work | `SDLC/Projects/` past dossiers, `LIS/JIRA/` notes | Agent-gathered |

## Procedure

1. **Create or resolve the dossier.** New folder under `SDLC/Projects/`, provisional key if no JIRA key yet.
2. **Retrieve context first.** Search the vault for the service, the screen, the table, the transaction type. Summarise current behaviour *before* proposing anything. This is the generalized `load-context` step.
3. **Draft the requirement note** using [[Requirement Confirmation Template]].
4. **Produce a clarification list.** Every assumption the agent had to make becomes a numbered open question with a proposed default. This list is the actual deliverable of the stage — it is what you send back to the SM.
5. **Impact scan.** Grep the repos and the vault for other callers of the changed behaviour. Surface anything the requester probably has not considered.
6. **Record.** Write the note, link it from the dossier, add a Decision Log line.

## Output

`SDLC/Projects/<key>/01 Requirement Confirmation.md` containing:

- Background and trigger
- **In scope** / **Explicitly out of scope** (the second list matters more)
- Functional requirements, numbered `R1…Rn` so later stages can trace to them
- Non-functional requirements (volume, latency, retention, audit)
- Affected services, screens, tables, interfaces
- Assumptions
- Open questions with proposed defaults
- Acceptance criteria, one per functional requirement

## Exit gate

- [ ] Every open question is answered or explicitly deferred with an owner
- [ ] Out-of-scope list is non-empty (if it is empty, scope has not been thought about)
- [ ] Each requirement `Rn` has at least one acceptance criterion
- [ ] Requester has confirmed in writing; the confirmation is quoted or linked in the note

## Human checkpoint

**Required.** The agent never marks this gate passed on its own. You paste or link the SM's confirmation, then say so.

## Notes and risks

> [!danger] Patient data
> Requirement text often arrives with real patient identifiers in a screenshot or an example row. Strip HKID, name, episode number and any PHI before the text enters a prompt or a note. Make this a hard rule in `AGENTS.md` — see [[Cursor Setup#Guardrails]].

- Requirement numbering `R1…Rn` is what makes the later traceability work — SIT test cases cite `Rn`, the promotion checklist cites `Rn`. Do not skip it.
