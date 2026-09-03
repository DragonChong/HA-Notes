---
title: SDLC Agentic Workflow
tags:
  - sdlc
  - index
  - agentic
created: 2026-09-03
updated: 2026-09-03
status: blueprint
---

# SDLC Agentic Workflow

> [!abstract] Goal
> Make **Cursor** the orchestrator of the full LIS/HA system development life cycle, with this vault as the single centralized brain. Every stage produces a durable Obsidian artifact; every artifact is produced by a named skill; the orchestrator decides which skill runs next and refuses to skip a gate.

## Start here

| Note | What it answers |
|---|---|
| [[Architecture]] | How the pieces fit — the four layers and the one rule that keeps them small |
| [[Dossier Schema]] | The state machine: one folder + one frontmatter block per unit of work |
| [[Skill Catalogue]] | What already exists, what must be built, what must be generalized |
| [[Cursor Setup]] | Wiring: `.cursor/skills`, Custom Mode, AGENTS.md, MCP servers |
| [[Rollout Plan]] | Six phases, what to prove at each, and the pilot candidate |
| [[Open Questions]] | Blockers to resolve before Phase 3 and Phase 4 |

## The stages

Each stage note defines: **entry criteria → owning skill → inputs → outputs → exit gate → automation level**.

| # | Stage | Owning skill | Level | Primary output |
|---|---|---|---|---|
| 01 | [[01 Requirement Confirmation]] | `requirement-confirmation` | C | Requirement note |
| 02 | [[02 System Design]] | `system-design` | B | Design note (own file) |
| 03 | [[03 Design Review Deck]] | `design-review-pptx` | A | CP3 `.pptx` |
| 04 | [[04 JIRA Log Creation]] | `lis-jira-log-creator` | B | JIRA log note + JIRA issue |
| 05 | [[05 Project Plan]] | `project-plan` | B | Gantt + schedule note |
| 06 | [[06 Development]] | `implement-task` + `code-change-log` | B | Code + change-log note |
| 07 | [[07 Code Review]] | `code-review` | A | Review note + findings |
| 08 | [[08 System Integration Test]] | `sit-test-report` | B | Test Report `.docx` |
| 09 | [[09 Load and Soak Test]] | `load-test-scenario` | B | Scenario note + result |
| 10 | [[10 Promotion Preparation]] | `promotion-config`, `promotion-form`, `monitoring-plan` | B | SQL, ConfigMaps, Promotion Form `.docx` |
| 11 | [[11 Promotion Submission]] | `promotion-checklist` | C | Checklist verdict + JIRA update |
| 12 | [[12 Production Pilot]] | `pilot-monitor` | B | Pilot report + monitoring evidence |

> [!info] Automation levels
> **A — Agent-run.** Agent produces the artifact end to end; you spot-check.
> **B — Agent-drafted, human-approved.** Agent drafts, you approve before the gate closes.
> **C — Human-led, agent-assisted.** You decide; the agent gathers, formats and records.
>
> Nothing that touches production change control is level A. See [[Open Questions#Governance]].

## The core idea in one paragraph

Today your skills are *tools you invoke*. The change is to make them *steps a state machine invokes*. Every unit of work gets a **dossier** — one folder with one frontmatter block that records which stage it is in and which gates have passed. A single always-on skill, `sdlc-orchestrator`, reads that frontmatter, tells you where the work stands, names the next action, and delegates to exactly one stage skill. Stage skills never guess where they are; they are told. That is what turns a pile of good skills into an orchestrated life cycle.

## Non-goals

- Not replacing your judgment on requirements, design trade-offs, or promotion approval.
- Not auto-submitting anything into production change control.
- Not moving existing notes. `LIS/JIRA/`, `Knowledge Base/`, `LIS/ECP/` stay where they are and are referenced by wikilink — see [[Dossier Schema#Artifact routing]].

## Related

- [[Agent Skills Reference]] — the existing CRS-Revamp skill catalogue this builds on
- [[Copilot Workflow Optimization]] — the multi-root workspace strategy that Cursor inherits
