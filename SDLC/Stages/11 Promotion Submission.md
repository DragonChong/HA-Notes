---
title: 11 Promotion Submission
tags:
  - sdlc
  - sdlc-stage
stage_key: promotion-submit
skill: promotion-checklist
skill_status: build
automation_level: C
created: 2026-09-03
status: blueprint
---

# 11 Promotion Submission

Part of [[SDLC Agentic Workflow]]. Owning skill: **`promotion-checklist`** — *to build*. Level **C** (human-led).

## Purpose

Verify the promotion checklist against real evidence and update JIRA. This is the stage where the whole dossier pays off: every checklist item should be answerable from an artifact rather than from memory.

## Entry criteria

- Promotion preparation gate passed
- All prior gates in `gates_passed`

## Procedure

1. **Evidence-based verification.** For each checklist item, the skill resolves the evidence from the dossier and reports one of:
   - `PASS — evidence: [[08 SIT Test Report]] §Coverage`
   - `FAIL — no evidence found`
   - `MANUAL — requires human confirmation (e.g. SM sign-off email)`

   The verdict is never asserted without a link. An item with no linked evidence is `FAIL`, not `PASS`.

2. **Provenance check.** Any artifact with `agent_assisted: true` and an empty `reviewed_by` blocks submission. See [[Dossier Schema#Provenance on every generated artifact]].

3. **Gate completeness check.** Every stage before `promotion-submit` must appear in `gates_passed`, or carry a recorded exception in the Gate Log.

4. **JIRA update.** With JIRA MCP available, write the checklist result into the issue — comment, checklist field, or transition, whichever your workflow uses. **Drafted for your approval, never auto-posted.**

## Output

- `SDLC/Projects/<key>/11 Promotion Checklist.md` — item, verdict, evidence link, gap
- JIRA issue updated

## Exit gate

- [ ] Every checklist item `PASS` or an accepted exception recorded
- [ ] No artifact blocked on missing review
- [ ] JIRA reflects the checklist state
- [ ] Promotion submitted by **you**

## Human checkpoint

**Required, and absolute.** The agent never submits a production change. It prepares, verifies and drafts; a named person submits and is accountable. This is the boundary that keeps the whole system acceptable in a change-controlled hospital environment.

## Notes

- The checklist items themselves should be captured once in the skill's reference file and versioned in the vault, so a change to the corporate checklist is a one-line edit rather than a re-learn.
