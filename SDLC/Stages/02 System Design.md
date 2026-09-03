---
title: 02 System Design
tags:
  - sdlc
  - sdlc-stage
stage_key: design
skill: system-design
skill_status: refit
automation_level: B
created: 2026-09-03
status: blueprint
---

# 02 System Design

Part of [[SDLC Agentic Workflow]]. Owning skill: **`system-design`** — *refit of the existing `generate-design`*. Level **B** (agent-drafted, human-approved).

## Purpose

Produce the canonical technical design, in its own note, decoupled from the JIRA change request and from the review deck.

## What changes from today

`generate-design` currently writes a `## Design` section *inside* the JIRA note in `LIS/JIRA/`, and `design-review-pptx` reads it from there. That couples the change request, the design and the deck.

**Target:** design is its own note at `SDLC/Projects/<key>/02 System Design.md`. The JIRA note gains `design: "[[02 System Design]]"` in frontmatter.

**Migration:** teach `design-review-pptx` to resolve its source by precedence — (1) the `design` frontmatter wikilink, (2) the legacy `## Design` section. Nothing existing breaks; new work uses the clean split. See [[Architecture#Separating design from the JIRA log]].

## Entry criteria

- `requirement` gate passed
- Requirements numbered `R1…Rn`

## Inputs

| Input | Source |
|---|---|
| Requirement note | `01 Requirement Confirmation.md` |
| Current architecture | `LIS/ECP/<service>/`, `SpringBoot/`, `Knowledge Base/00_Index/System_Overview.md` |
| Source code | Local clones via Cursor `@workspace` |
| Team standards | `lis-architecture`, `data-source-usage`, `lis-audit-logging`, `lis-als-logger`, `react-best-practices` |

## Procedure

1. Classify the review type — **incremental** (delta on an existing design) or **full** (new service / major rework). This decides the section set and the eventual deck length.
2. Read the requirement note and pull architecture context.
3. Draft the design sections (below), citing `Rn` for each design decision.
4. Generate diagrams via the `mermaid-diagrams` capability — sequence for flows, ER for schema, component for deployment.
5. Record **rejected alternatives**. A design without them cannot survive a CP3 question.
6. Write the note; link from the dossier; set `design` on the JIRA note if it already exists.

## Output — section set

| Section | Incremental | Full |
|---|---|---|
| Context and problem | ✓ | ✓ |
| Existing design | ✓ | ✓ |
| Proposed change — overview | ✓ | ✓ |
| Component / class design | when touched | ✓ |
| Data model changes (DDL, indexes, migration) | when touched | ✓ |
| Interface / API contract changes | when touched | ✓ |
| Configuration changes (ConfigMap, Secret, properties) | ✓ | ✓ |
| Error handling, logging, audit | ✓ | ✓ |
| Non-functional: volume, concurrency, retention | brief | ✓ |
| Rejected alternatives | ✓ | ✓ |
| Promotion impact and fallback | ✓ | ✓ |
| Open design questions | ✓ | ✓ |

## Exit gate

- [ ] Every requirement `Rn` maps to at least one design section
- [ ] Data model changes include the migration/rollback statement, not just the target DDL
- [ ] Configuration changes are enumerated by environment (DEVQA / SIT / PROD)
- [ ] Fallback path stated
- [ ] Open design questions are closed or owned
- [ ] You have read it end to end and set `reviewed_by`

## Human checkpoint

**Required before the deck is generated.** A deck built from an unreviewed design wastes the CP3 slot.

## Notes

- Keep the design note the source of truth. If CP3 changes something, the design note is edited and the deck is **regenerated** — never edit the `.pptx` directly, or the two diverge immediately.
