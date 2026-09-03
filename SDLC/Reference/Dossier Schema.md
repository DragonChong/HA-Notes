---
title: Dossier Schema
tags:
  - sdlc
  - reference
created: 2026-09-03
updated: 2026-09-03
status: blueprint
---

# Dossier Schema

Part of [[SDLC Agentic Workflow]]. This is the contract every skill reads and writes.

## One folder per unit of work

```
SDLC/Projects/<key> — <Short Name>/
  _Dossier.md                  ← state machine + index. The only file the orchestrator parses.
  01 Requirement Confirmation.md
  02 System Design.md
  05 Project Plan.md
  06 Code Change Log.md
  07 Code Review.md
  08 SIT Test Report.md         ← source of truth; .docx is a render of it
  09 Load Test Scenario.md
  10 Promotion Preparation.md
  10 Monitoring Plan.md
  12 Pilot Report.md
  assets/                       ← diagrams, screenshots, generated decks and docs
```

`<key>` is the JIRA key once known (`LIS-10748`), otherwise a provisional slug (`TMP-scheduler-normalize`) that the orchestrator renames when the key is assigned.

## Artifact routing

Not everything moves into the dossier. Some artifacts have an existing home with existing tooling; the dossier links to them.

| Artifact | Lives at | Why |
|---|---|---|
| JIRA log note | `LIS/JIRA/<Summary>.md` | `JIRA Log List.base` depends on the folder + tag |
| Business workflow docs | `Knowledge Base/01_Screens/…` | Owned by `create-user-story`, outlives the project |
| Service architecture notes | `LIS/ECP/<service>/` | Per-service, not per-project |
| Multi-project schedules | `LIS/Project Plans/` | Programme level; dossier plan is project level |
| Everything else | The dossier folder | Project-scoped, dies with the project |

> [!tip]
> The rule of thumb: **does this note stay useful after the project ships?** Yes → its own home. No → the dossier.

## `_Dossier.md` frontmatter

```yaml
---
title: Enhance lis-scheduler to normalize table-driven job definitions
tags:
  - sdlc-dossier
key: LIS-10748
work_type: enhancement          # project | enhancement | fix
stage: development              # see Stage vocabulary below
status: active                  # active | on-hold | done | cancelled
services:
  - lis-scheduler
repos:
  - lis-common-scheduler-svc
jira: LIS-10748
reference_jira:
  - LIS-10723
design: "[[02 System Design]]"
requirement: "[[01 Requirement Confirmation]]"
jira_log: "[[Enhance `lis-scheduler` to Normalize Table-driven Job Definitions into `job_definition` and `job_request`]]"
gates_passed:
  - requirement
  - design
  - design-review
  - jira
  - plan
target_completion_date: '2026-10-31'
owner: Ka
risk: medium                    # low | medium | high — drives how strict the gates are
created: '2026-09-03'
updated: '2026-09-03'
---
```

### Stage vocabulary

Fixed enum. The orchestrator refuses to write a value outside it.

`requirement` · `design` · `design-review` · `jira` · `plan` · `development` · `code-review` · `sit` · `load-test` · `promotion-prep` · `promotion-submit` · `pilot` · `closed`

`gates_passed` uses the **same** vocabulary. A stage is current when it is in `stage`; it is done when it appears in `gates_passed`. That redundancy is deliberate — it lets a stage be reopened (`stage` moves back, `gates_passed` entry removed) with an audit trail.

## `_Dossier.md` body

```markdown
# <Title>

## Status
> [!info] Stage: **development** — gate `code-review` outstanding
> Next action: `/code-review` on lis-common-scheduler-svc PR #142

## Artifacts
| Stage | Artifact | State |
|---|---|---|
| 01 Requirement | [[01 Requirement Confirmation]] | approved 2026-09-05 |
| 02 Design | [[02 System Design]] | approved 2026-09-12 |
| 03 Design Review | [[assets/LIS-10748 CP3.pptx]] | presented 2026-09-18 |
| 04 JIRA | [[Enhance `lis-scheduler` …]] | LIS-10748 created |

## Gate Log
| Date | Gate | Verdict | By | Note |
|---|---|---|---|---|
| 2026-09-05 | requirement | pass | Ka | SM confirmed scope by email |
| 2026-09-18 | design-review | pass with actions | CP3 forum | 2 actions → see Decision Log |

## Decision Log
- 2026-09-12 — Split `dynamic_job_definition` into two tables rather than adding nullable columns. Rejected the single-table option because job-nature fields duplicated per hospital/lab. — Ka
- 2026-09-18 — CP3 asked for a fallback path if `job_request` backlog exceeds 1000 rows. Added to design §Fallback. — CP3 forum

## Open Items
- [ ] Confirm monitoring DB connection string for `job_request` counts

## Links
- Services: [[lis-common-scheduler-svc]]
- Related dossiers: [[LIS-10723 — Scheduler framework release]]
```

## Provenance on every generated artifact

Every note or document a skill produces carries this in frontmatter. HA change control needs to know what a human authored versus what an agent drafted.

```yaml
generated_by: system-design
generated_on: '2026-09-12'
reviewed_by: Ka
review_date: '2026-09-12'
agent_assisted: true
```

> [!warning] Non-negotiable
> `agent_assisted: true` with an empty `reviewed_by` means the artifact is a draft and must not be attached to a promotion form or a CP3 submission. Make the orchestrator check this at the `promotion-submit` gate.

## Portfolio view — `SDLC/Dossiers.base`

An Obsidian Base over `tags: sdlc-dossier` gives you the whole portfolio in one table, the same way `JIRA Log List.base` does for change requests. Suggested views:

- **Active** — `status == "active"`, sorted by `target_completion_date`
- **By stage** — grouped on `stage`, to spot everything stuck in `sit`
- **Awaiting gate** — `status == "active"` and `stage` not in `gates_passed`
- **At risk** — `target_completion_date` within 14 days and `stage` before `promotion-prep`

See [[Obsidian Bases]] usage in the existing skill set for the syntax.

## Related

- [[SDLC Agentic Workflow]] · [[Architecture]] · [[Skill Catalogue]]
