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
# Create `dynamic_job_definition` Table and OpenShift Configuration for `lis-scheduler` Mandatory Setup

## Request Type

**Type:** Service Request  
**Priority:** Medium

## Request Summary

Create `dynamic_job_definition` Table and OpenShift Configuration for `lis-scheduler` Mandatory Setup

## Background

LIS microservices are adopting the embedded `lis-scheduler` library (`hk.org.ha.lis:lis-scheduler`) primarily to support **canary deployment** of services that use a scheduler. Embedding Quartz in-process (instead of the centralized `lis-common-scheduler-svc` HTTP trigger model) allows each service version to use an isolated Quartz `sched_name`, so v1 and v2 pods can run concurrently without sharing the same job set or double-firing schedules.

Jobs can be registered at compile time (`@CmsScheduler`) or at runtime through table-driven definitions in PostgreSQL. Table-driven jobs require the `dynamic_job_definition` table in the shared scheduler schema. `DynamicJobDefinitionMonitorJob` polls `OUTSTANDING` rows and creates corresponding Quartz jobs. This table does not yet exist and must be created as mandatory setup before services can use table-driven scheduling.

Additional keys for schema/prefix and the dynamic job monitor cron must be added so consuming services can bind `cms-scheduler.db_schema`, `cms-scheduler.db_prefix`, and `CRON_EXPRESSION_DYNAMIC_JOB_DEFINITION_MONITOR`.

## Change Description

1. **Create PostgreSQL table `dynamic_job_definition`:**
   - Create `scheduler.dynamic_job_definition` table in the scheduler PostgreSQL database.
	   - Columns include: `application_name`, `job_name`, `bean_name`, `method_name`, `cron_expression`, concurrency/retry flags, `parameters`, `enabled`, `status` / `status_message`, and audit timestamps.
   - Create unique index `uq_dynamic_job_definition_application_job` on `(application_name, job_name)`.
   - Create pickup index `idx_dynamic_job_definition_pickup` on `(application_name, status, enabled, updated_at)`.

2. **Add keys to shared OpenShift ConfigMap `scheduler-svc-config` (per environment):**
   - `SCHEDULER_DB_SCHEMA` — `scheduler` (PostgreSQL schema for Quartz / dynamic job tables)
   - `SCHEDULER_DB_PREFIX` — `lis` (Quartz table prefix `lis_sfwk_*`)
   - `CRON_EXPRESSION_DYNAMIC_JOB_DEFINITION_MONITOR` — `0 0/1 * * * ?` (cron for `DynamicJobDefinitionMonitorJob`, every 1 minute)

## Justification

This mandatory shared setup unblocks adoption of `lis-scheduler`, which enables canary deployment of scheduler-backed LIS services through versioned Quartz namespaces and phased job cutover. Creating `dynamic_job_definition` and completing `scheduler-svc-config` with schema, prefix, and monitor cron ensures all consuming services share a consistent scheduler PostgreSQL layout and can poll new job definitions without redeploying for each schedule change.

## Target Completion Date

17th Jul 2026

## Design

<!-- Populated by generate-design skill before CP3 review. -->
