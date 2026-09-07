---
title: Phase 0 plumbing verification
tags:
  - sdlc-dossier
key: TMP-phase0-plumbing
work_type: enhancement
stage: requirement
status: active
services: []
repos:
  - HA-Notes
jira: ''
reference_jira: []
requirement: ''
design: ''
jira_log: ''
gates_passed: []
target_completion_date: '2026-09-07'
owner: Ka
risk: low
created: '2026-09-07'
updated: '2026-09-07'
---
# Phase 0 plumbing verification

Throwaway dossier to prove Cursor can resolve SDLC state from the vault. Not a real change request. Delete after Phase 1 starts, or keep as the smoke-test fixture.

## Status

> [!info] Stage: **requirement** — gate `requirement` outstanding
> Next action: invoke `/test-ping` to prove skill discovery, then start Phase 1 (`sdlc-orchestrator`).

## Artifacts

| Stage | Artifact | State |
| --- | --- | --- |
| 01 Requirement | | not started — this dossier is plumbing only |

## Gate Log

| Date | Gate | Verdict | By | Note |
| --- | --- | --- | --- | --- |
| 2026-09-07 | (none) | — | agent | Hand-written dossier created for Phase 0 verification |

## Decision Log

- 2026-09-07 — Created as a Phase 0 fixture. Skills junction already points at `LIS/skills` (`%USERPROFILE%\.cursor\skills` → `D:\Github\HA-Notes\LIS\skills`). Canonical `Skills/` tree deferred; not a Phase 0 prerequisite.
- 2026-09-07 — Plumbing check (this session): Obsidian MCP read/write **pass**. Junction resolves `test-ping` and `nested/category/test-nested-ping` **pass**. JIRA MCP read **fail** — proxy 504 to `hatool.home:443` (matches [[Open Questions|Q5]]). Write-scope test skipped until read works. `/test-ping` invocation and Custom Mode still need a human click.

## Open Items

- [x] `/test-ping` discovered and invoked from this vault window
- [ ] `/test-ping` discovered and invoked from a **repo** window (e.g. a service clone)
- [ ] Nested skill `/test-nested-ping` discovered
- [ ] Custom Mode named **SDLC** created in Cursor (`Option+Enter`) and keeps a skill loaded across turns
- [ ] JIRA MCP write scope confirmed on a test project (read already checked during Phase 0)
- [ ] Copy `AGENTS.md` into each active service repo

## Links

- Blueprint: [[SDLC Agentic Workflow]]
- Wiring: [[Cursor Setup]]
- Rollout: [[Rollout Plan]]
