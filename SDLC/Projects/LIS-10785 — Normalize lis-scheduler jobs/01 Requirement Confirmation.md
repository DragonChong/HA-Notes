---
title: 01 Requirement Confirmation — Normalize lis-scheduler jobs
tags:
  - sdlc
  - requirement
generated_by: requirement-confirmation
generated_on: '2026-09-08'
reviewed_by: ''
review_date: ''
agent_assisted: true
---
# 01 Requirement Confirmation — Normalize lis-scheduler jobs

Sources used (no PHI):

- Requester instruction (Ka, 2026-09-08): enhance `lis-scheduler`; in scope = normalize jobs
- Prior release context: [[Release lis-scheduler - LIS Common Scheduler Framework with Dynamic Job Creation and Versioning]] (LIS-10748)
- Draft JIRA log: [[Enhance `lis-scheduler` to Normalize Table-driven Job Definitions into `job_definition` and `job_request`]] (LIS-10785)

> [!warning] Draft
> `agent_assisted: true` with empty `reviewed_by`. Not for promotion or CP3 attachment until reviewed.

## Background and trigger

`lis-scheduler` v1.0.0 introduced table-driven job creation via a single table `dynamic_job_definition`. Each row carries both **job nature** (Spring `bean_name`, `method`, `concurrent`, `skip_on_overdue`) and **instance-specific** fields (`hosp`, `lab`, `cron_expression`, `parameters`, Quartz job name). The same nature is duplicated on every hospital/lab row, and operators must invent Quartz job names manually.

This enhancement normalizes that model so job nature is defined once and creation work is queued separately, with Quartz names derived consistently by the framework.

**Current behaviour (as-is)**

1. Consuming services enable `lis-scheduler` (`cms-scheduler.enabled` / `SCHEDULER_ENABLED`).
2. Operators insert rows into `scheduler.dynamic_job_definition` with full job details including an explicit Quartz `job_name`.
3. `DynamicJobCreatorJob` polls `OUTSTANDING` rows for the application (and version when canary is on), claims `PROCESSING`, creates the Quartz job, pauses the trigger, and sets `COMPLETED` or `FAILED`.
4. Fields `bean_name`, `method`, `concurrent`, and `skip_on_overdue` repeat on every row for the same job nature across hospitals and labs.

**Trigger**

Reduce duplication, standardize Quartz naming, and prepare for UPDATE/DELETE actions on a normalized work queue. Ship as **`lis-scheduler` 1.1.0** (breaking DDL vs 1.0.x).

## In scope

- Normalize jobs — split `dynamic_job_definition` into `job_definition` (job nature catalog) and `job_request` (creation work queue); rename poller to `JobManager`; derive Quartz job names from `application`, `job`, `hosp`, `lab`, `parameters`, and `schedule`; release `lis-scheduler` 1.1.0 with migration DDL and updated config keys.

## Out of scope

## Functional requirements

| ID | Status | Requirement | Acceptance criteria |
|---|---|---|---|
| R1 | draft | Replace `dynamic_job_definition` with normalized `job_definition` and `job_request` tables. | DDL creates both tables under `scheduler` schema; `dynamic_job_definition` dropped; FK from `job_request` to `job_definition` on `(application, job)`. |
| R2 | draft | `job_definition` holds job nature once per `(application, job)`. | Columns: `application`, `job`, `bean_name`, `method`, `concurrent`, `skip_on_overdue`. PK = `(application, job)`. Empty `job` means default nature. `max_retry` and `enabled` removed. |
| R3 | draft | `job_request` queues create operations per hospital/lab/schedule. | Columns include `id`, `application`, `job`, `version`, `action`, `schedule`, `cron_expression`, `hosp`, `lab`, `parameters`, `status`, `status_message`, `created_at`, `updated_at`. Status lifecycle: `OUTSTANDING` → `PROCESSING` → `COMPLETED` / `FAILED`. |
| R4 | draft | `JobManager` replaces `DynamicJobCreatorJob` and implements CREATE. | Polls `job_request` by application (+ version when canary on); loads nature from `job_definition`; creates Quartz job; pauses trigger; updates status. CREATE-only in 1.1.0 — UPDATE/DELETE rows fail with not-implemented message. |
| R5 | draft | Derive Quartz job name at create time (not stored on the row). | Format `{PascalCase(application)}_{job}_{hosp}_{lab}_{paramSegments}_Sch{schedule}` with blank segments omitted. Method args = `hosp`, `lab`, then split `parameters`. Examples: `LisTemplateSvc_AHN_CPS`, `LisTemplateSvc_Echo_AHN_CPS_PARAM1_PARAM2`, `LisTemplateSvc_AHN_CPS_Sch1`. |
| R6 | draft | Release `lis-scheduler` 1.1.0 with breaking migration path from 1.0.x. | Library version 1.1.0 published; consumers update dependency; ConfigMap keys renamed for JobManager; migration SQL documented with rollback. |
| R7 | draft | Preserve canary/version behaviour from 1.0.x. | `job_request.version` aligns with `APP_VERSION` when `SCHEDULER_INCLUDE_VERSION=true`; pickup scoped by application and version. |

## Non-functional requirements

| Area | Requirement |
|---|---|
| Compatibility | Breaking DDL — coordinated upgrade per consuming service; no mixed 1.0.x poller against 1.1.0 schema. |
| Audit | Log claim, derived name, and terminal status per `job_request` row (framework log; no PHI in `parameters`). |
| Operations | Created jobs remain paused until operator resume (same as 1.0.x). Table-driven create uses retry count 0 (no `max_retry`). |

## Impact

| Affected | Detail |
|---|---|
| Services | **`lis-scheduler`** library (1.1.0). All consumers embedding table-driven jobs (e.g. `lis-dhx-rrc-svc`, template services). |
| Tables | Drop `scheduler.dynamic_job_definition`. Create `scheduler.job_definition`, `scheduler.job_request`. |
| Config | Rename dynamic job creator cron/enablement keys to JobManager equivalents on `scheduler-svc-config`. |
| Interfaces | REST APIs unchanged (`/api/scheduler/create-job`, replicate, list). Internal poller class and entity names change. |

## Assumptions

1. Work type is an **enhancement** on LIS-10748.
2. CREATE is the only implemented `action` in 1.1.0; UPDATE/DELETE deferred.
3. Operators migrate existing `dynamic_job_definition` rows into paired `job_definition` + `job_request` inserts (one-off data script per consumer).
4. Derived naming rules in R5 are authoritative; stored Quartz names from 1.0.x are not preserved if they differ.

## Confirmation

- Confirmed by: (pending)
- Date: (pending)
- Verdict for orchestrator: **`draft`** — fast path; awaiting Ka review
