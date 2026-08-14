---
title: >-
  Enhance `lis-scheduler` to Normalize Table-driven Job Definitions into
  `job_definition` and `job_request`
tags:
  - jira-log
  - lis
request_type: Change Request
priority: Medium
services:
  - lis-scheduler
target_completion_date: '2026-08-27'
status: draft
created: '2026-08-13'
jira: ''
reference_jira:
  - LIS-10748
design_status: draft
---
# Enhance `lis-scheduler` to Normalize Table-driven Job Definitions into `job_definition` and `job_request`

## Request Type

**Type:** Change Request  
**Priority:** Medium

## Request Summary

Enhance `lis-scheduler` to Normalize Table-driven Job Definitions into `job_definition` and `job_request`

## Background

Table-driven scheduling in `lis-scheduler` currently stores job nature and instance details together in `dynamic_job_definition`. `DynamicJobCreatorJob` polls `OUTSTANDING` rows (scoped by `application_name` and optional `version` for canary) and creates Quartz jobs using stored `job_name`, `bean_name`, `method_name`, `cron_expression`, `concurrent`, `skip_on_overdue`, `max_retry`, and `parameters`. Fields that are the same for a given job nature (`bean_name`, `method`, `concurrent`, `skip_on_overdue`) are repeated on every hospital, lab, parameter, and schedule row, and Quartz job names must be supplied manually. The table has to be normalized so that job nature is defined once in `job_definition` and each create/update/delete operation is queued in `job_request`, with Quartz names derived from `application`, `job`, `hosp`, `lab`, `parameters`, and `schedule`.

## Change Description

1. **Normalize PostgreSQL tables (breaking):**
   - Replace `dynamic_job_definition` with `job_definition` (PK `application` + `job`; `bean_name`, `method`, `concurrent`, `skip_on_overdue`) and `job_request` (work queue: `application`/`job` FK, `version`, `action` CREATE/UPDATE/DELETE, `schedule`, `cron_expression`, `hosp`, `lab`, `parameters`, `status`/`status_message`).
   - Drop `enabled` and `max_retry`. Pickup index `(application, version, status)`.
   - DDL: `docs/db_job_definition_postgresql.sql` and `docs/job-normalization/deploy.sql`.

1. **Derive Quartz job names by `JobManager`:**
   - `JobNameBuilder`: `{PascalCase(application)}_{job}_{hosp}_{lab}_{paramSegments}_Sch{schedule}` (omit blank segments). Method args = `hosp` + `lab` + split(`parameters`). Table-driven CREATE uses `maxRetry=0`.
   - Implement `CREATE`; stub `UPDATE`/`DELETE` as `FAILED` (“not implemented yet”).

3. **Release `lis-scheduler` 1.1.0 and update consumers:**
   - Bump library version; update wiki (Job Creation, Canary, Promotion Handbook, Configuration, OpenShift).
   - Align `lis-template-svc` Maven dependency and `application.yml` keys.

## Justification

Normalization lets ops define a job nature once and insert hospital/lab/schedule-specific `job_request` rows without repeating bean/method settings. Derived names (`LisTemplateSvc_AHN_CPS`, `LisTemplateSvc_Echo_AHN_CPS_PARAM1_PARAM2`, `LisTemplateSvc_AHN_CPS_Sch1`) keep Quartz keys consistent, and `action` plus `version` keep canary pickup and future update/delete on the same work queue.

## Target Completion Date

27th Aug, 2026

## Design

<!-- Populated by generate-design skill before CP3 review. See design-template.md. -->

## Reference Logs

- LIS-10748
