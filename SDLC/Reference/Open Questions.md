---
title: Open Questions
tags:
  - sdlc
  - reference
  - blockers
created: 2026-09-03
updated: 2026-09-03
status: blueprint
---

# Open Questions

Part of [[SDLC Agentic Workflow]]. Resolve these before the phase named in each row.

## Tooling and access

| # | Question | Blocks | Owner | Status |
|---|---|---|---|---|
| Q1 | Can Cursor / an MCP server reach the **application database** (Sybase / PostgreSQL) read-only from the corporate network? | Phase 4 — `monitoring-plan`, `promotion-config` verification | Ka | Open |
| Q2 | The **logging database** is a separate instance. Same question: read-only access, and by what client? | Phase 4 — `monitoring-plan` | Ka | Open |
| Q3 | JIRA MCP **write scope** — can it create issues, add comments, and transition workflow states? Which of those does the org permit? | Phase 1 — `lis-jira-log-creator` auto-create; Phase 4 — `promotion-checklist` | Ka | Open |
| Q4 | Is SonarQube reachable via API, or does the report have to be exported manually? | Phase 3 — `sit-test-report` embedding | Ka | Open |
| Q5 | Does the corporate proxy / SSL inspection break MCP servers that make outbound HTTPS calls? | Phase 1 onward | Ka | Likely — see [[Corporate Network Diagnosis]] |
| Q6 | Is Cursor formally approved for the team, and under what data-handling terms (what may be sent to the model)? | Everything | Ka + management | Open |

> [!info] Designing around Q1/Q2
> The promotion and monitoring skills are specified as **generate-and-hand-over**: they emit runnable SQL with the target connection named, you execute it, and paste the output back for interpretation. If access is later granted, the same plan becomes directly executable with no rewrite. Do not block Phase 4 on this.

## Process and governance

| # | Question | Blocks |
|---|---|---|
| Q7 | What exactly is on the corporate **promotion checklist**? It needs to be captured verbatim in the `promotion-checklist` skill's reference file. | Phase 4 |
| Q8 | Does HA change control require a statement that an artifact was **AI-assisted**? If so, the `agent_assisted` provenance field must appear on the promotion form, not just in the vault. | Phase 4 |
| Q9 | Who else on the team will use these skills, and does the vault need to become shared/multi-writer? | Phase 2 |
| Q10 | Where does **UAT** sit — who runs it, and does it need its own gate rather than only a plan entry? | Phase 5 |
| Q11 | Are there **freeze periods** or fixed promotion windows the `project-plan` skill must schedule around? | Phase 2 |

## Data protection

| # | Question | Blocks |
|---|---|---|
| Q12 | Confirm the rule for **patient-identifiable data**: nothing enters a prompt, a note, a commit or a log example. Who signs off that the guardrail wording is sufficient? | Everything |
| Q13 | Are screenshots in requirement notes already redacted today, or does redaction become a new step? | Phase 1 |

## Gaps in the stage list worth deciding on

These are stages your current SDLC list does not name. Not necessarily missing — but worth a conscious decision rather than an accident.

| Candidate | Argument for adding |
|---|---|
| **Impact / feasibility assessment** between requirement and design | Some requests should be pushed back before design effort is spent. Currently implicit. |
| **UAT** as a gate, not just a plan row | You already schedule it; it produces evidence the promotion checklist probably wants. |
| **Handover / operations readiness** | Runbook, support notes, on-call briefing. Your `lis-wiki-creator` and `app-wiki` skills already cover most of the content. |
| **Post-implementation review** after the pilot | Closes the improvement loop for the *project*, distinct from the pilot's technical verdict. |
| **Rollback executed** as a recordable outcome | Right now a rollback is an exception with nowhere to be recorded. It should have a place in the Gate Log. |

## Related

- [[SDLC Agentic Workflow]] · [[Rollout Plan]] · [[Cursor Setup]]
