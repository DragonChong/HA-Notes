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

Table-driven scheduling in `lis-scheduler` currently stores all job creation details in one table `dynamic_job_definition`. Fields common to the same job nature (`bean_name`, `method_name`, `concurrent`, `skip_on_overdue`) are repeated on every row for different hospital and lab. The table has to be normalized so that job nature is defined once and job creation is queued separately.

## Change Description

1. **Normalize `dynamic_job_definition` into two tables:**
   - `job_definition` — catalog of job nature (PK `application` + `job`):
     - `application`, `job`, `bean_name`, `method`, `concurrent`, `skip_on_overdue`
   - `job_request` — work queue for job creation (and future update/delete):
     - `id`, `application`, `job` (FK), `version`, `action` (CREATE / UPDATE / DELETE), `schedule`, `cron_expression`, `hosp`, `lab`, `parameters`, `status`, `status_message`, `created_at`, `updated_at`
   - Remove `max_retry` and `enabled`

2. **Derive Quartz job names by `JobManager`:**
   - Derive job name based on `application`, `job`, `hosp`, `lab`, `parameters`, `schedule` columns
	   - Format: `{PascalCase(application)}_{job}_{hosp}_{lab}_{paramSegments}_Sch{schedule}` 
	   - omit blank segments. 
	   - Method parmaters = `hosp` + `lab` + split(`parameters`).
   - Example:
	   - `LisTemplateSvc_AHN_CPS`
	   - `LisTemplateSvc_Echo_AHN_CPS_PARAM1_PARAM2`
	   - `LisTemplateSvc_AHN_CPS_Sch1`)

3. **Release `lis-scheduler` 1.1.0**
 
## Justification

Normalization allow defining a job nature once and insert hospital/lab/schedule-specific `job_request` rows without repeating bean/method settings. Derived names keep Quartz keys consistent.

## Target Completion Date

27th Aug, 2026

## Design

<!-- Populated by generate-design skill before CP3 review. See design-template.md. -->

## Reference Logs

- LIS-10748
