---
title: >-
  Create `dynamic_job_definition` Table and OpenShift ConfigMap Keys for
  `lis-scheduler` Mandatory Setup
tags:
  - jira-log
  - lis
  - lis-scheduler
request_type: Service Request
priority: Medium
services:
  - lis-scheduler
target_completion_date: '2026-07-17'
status: draft
created: '2026-07-15'
reference_jira: []
---
# Create `dynamic_job_definition` Table and OpenShift ConfigMap Keys for `lis-scheduler` Mandatory Setup

## Request Type

**Type:** Service Request  
**Priority:** Medium

## Request Summary

Create `dynamic_job_definition` Table and OpenShift ConfigMap Keys for `lis-scheduler` Mandatory Setup

## Background

LIS microservices are adopting the embedded `lis-scheduler` library (`hk.org.ha.lis:lis-scheduler`) so Quartz jobs run in-process within each consuming service. Jobs can be registered at compile time (`@CmsScheduler`) or at runtime through table-driven definitions in PostgreSQL.

Table-driven jobs require the `dynamic_job_definition` table in the shared scheduler schema. `DynamicJobDefinitionMonitorJob` polls `OUTSTANDING` rows and creates corresponding Quartz jobs. This table does not yet exist and must be created as mandatory setup before services can use table-driven scheduling.

Shared OpenShift ConfigMap `scheduler-svc-config` already provides `PG_SCH_URL` (and Secret `scheduler-svc-login` already exists). Additional keys for schema/prefix and the dynamic job monitor cron must be added so consuming services can bind `cms-scheduler.db_schema`, `cms-scheduler.db_prefix`, and `CRON_EXPRESSION_DYNAMIC_JOB_DEFINITION_MONITOR`.

## Change Description

1. **Create PostgreSQL table `dynamic_job_definition`:**
   - Run DDL from `lis-scheduler` (`db_dynamic_job_definition_postgresql.sql`) against the scheduler PostgreSQL database.
   - Replace `{db_schema}` with `SCHEDULER_DB_SCHEMA` (target: `scheduler`), yielding `scheduler.dynamic_job_definition`.
   - Columns include: `application_name`, `job_name`, `bean_name`, `method_name`, `cron_expression`, concurrency/retry flags, `parameters`, `enabled`, `status` / `status_message`, and audit timestamps.
   - Create unique index `uq_dynamic_job_definition_application_job` on `(application_name, job_name)`.
   - Create pickup index `idx_dynamic_job_definition_pickup` on `(application_name, status, enabled, updated_at)`.
   - Note: `application_name` must match the consuming service `spring.application.name` (version-agnostic; not `cms-scheduler.schedulerName`).

2. **Add keys to shared OpenShift ConfigMap `scheduler-svc-config` (per environment):**
   - `SCHEDULER_DB_SCHEMA` — `scheduler` (PostgreSQL schema for Quartz / dynamic job tables)
   - `SCHEDULER_DB_PREFIX` — `lis` (Quartz table prefix `lis_sfwk_*`)
   - `CRON_EXPRESSION_DYNAMIC_JOB_DEFINITION_MONITOR` — `0 0/1 * * * ?` (cron for `DynamicJobDefinitionMonitorJob`, every 1 minute)

## Justification

This mandatory shared setup unblocks adoption of `lis-scheduler` for table-driven dynamic jobs. Creating `dynamic_job_definition` and completing `scheduler-svc-config` with schema, prefix, and monitor cron ensures all consuming services share a consistent scheduler PostgreSQL layout and can poll new job definitions without redeploying for each schedule change.

## Target Completion Date

17th Jul 2026

## Design

<!-- Populated by generate-design skill before CP3 review. -->
