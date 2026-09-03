---
title: 10 Promotion Preparation
tags:
  - sdlc
  - sdlc-stage
stage_key: promotion-prep
skill: promotion-config
skill_status: build
automation_level: B
created: 2026-09-03
status: blueprint
---

# 10 Promotion Preparation

Part of [[SDLC Agentic Workflow]]. Three owning skills, all *to build*: **`promotion-config`**, **`promotion-form`**, **`monitoring-plan`**. Level **B**.

## Purpose

Assemble everything production needs: the setup and configuration artifacts, the step-by-step promotion document, and the monitoring plan that tells you whether the promotion worked.

All three are largely *derivable* from `06 Code Change Log.md` — which is why that note's DB-objects, config-keys and log-markers fields matter so much.

---

## 10a — `promotion-config` — setup and configuration

### Generates

| Artifact | From | Notes |
|---|---|---|
| DDL scripts | Change log DB objects | With rollback DDL alongside, always |
| Data migration / seed SQL | Design data-model section | Idempotent, re-runnable |
| OpenShift ConfigMap YAML | Change log config keys | Per environment; diffed against current |
| Secret entries | Change log config keys | **Names and placeholders only — never real values in the vault or in a prompt** |
| Property / env var changes | Change log | |
| Artifactory artifact versions | Build output | |
| Scheduler/job registrations | Change log | Relevant for `lis-scheduler` work |

### Key behaviours

- **Diff, do not dump.** Fetch the current ConfigMap and emit the delta plus the merged result, so the reviewer sees what changes.
- **Every forward script has a paired rollback.** The skill refuses to finish otherwise.
- **Ordering matters.** Emit the sequence: DDL → data migration → config → deploy → post-deploy verification. Getting this order wrong is the classic promotion failure.

### Output
`SDLC/Projects/<key>/10 Promotion Preparation.md` + scripts in `assets/promotion/`.

---

## 10b — `promotion-form` — the promotion document

### Generates
`assets/<key> Promotion Form.docx` via the `docx` capability, rendered from a markdown source of truth.

### Sections
Change summary and JIRA key · affected services and versions · **pre-promotion checks** · promotion steps, numbered, each with command/screen, expected result, and estimated duration · post-promotion verification steps · **rollback procedure, step by step, with its own verification** · timing window and downtime statement · dependencies on other teams or systems · contact list.

> [!important] The rollback section is the point
> A promotion form whose rollback section says "restore from backup" has not been thought through. The skill should require a concrete step sequence and refuse to render without one.

---

## 10c — `monitoring-plan` — how you know it worked

### Generates
`SDLC/Projects/<key>/10 Monitoring Plan.md` — the SQL and checks to run after promotion.

| Check type | Example |
|---|---|
| Success/failure counts | Counts by status over a window, compared with a pre-promotion baseline |
| Log-marker presence | The new log strings recorded in the change log actually appearing |
| Error-log scan | New exception types, or a rise in a known one |
| Data integrity | Row counts, orphan checks, new-column population rate |
| Queue/backlog depth | Where the design introduced a queue |
| Performance | Response time against the stage 09 baseline |

Each check states: **query · where it runs (which database) · when to run it (T+0, T+1h, T+1d) · expected result · what to do if it fails**.

> [!warning] Two databases, both unconfirmed
> The application database (Sybase / PostgreSQL) and the logging database are separate, and agent access to either is not yet confirmed. Design the plan to be **generate-and-hand-over** by default: the skill produces runnable SQL with the connection target named, you execute it, and the agent interprets the pasted output. If direct access is later granted, the same plan becomes executable with no rewrite. Tracked in [[Open Questions]].

---

## Entry criteria (all three)

- SIT gate passed; load test gate passed or waived
- Change log complete

## Exit gate

- [ ] Every DB object in the change log has a forward script and a rollback script
- [ ] Every config key has a value for each target environment, and no real secret value is stored in the vault
- [ ] Promotion steps are ordered, timed, and each has an expected result
- [ ] Rollback procedure is concrete and independently verifiable
- [ ] Monitoring plan covers every new log marker and every new/changed table
- [ ] Baseline figures captured *before* promotion, so post-promotion counts mean something

## Human checkpoint

**Required on all three.** These are the artifacts that reach production change control.
