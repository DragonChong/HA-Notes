---
title: 01 Requirement Confirmation — Oracle route lookup
tags:
  - sdlc
  - requirement
generated_by: requirement-confirmation
generated_on: '2026-09-25'
reviewed_by: Requester
review_date: '2026-09-25'
agent_assisted: true
---
# 01 Requirement Confirmation — Oracle route lookup

Sources used (no PHI):

- Current behaviour: [[Plan - Implement Distributed Transactions in data-source Library]], [[Dynamic Data Source Design]]
- Trigger: `lis-patient-pmi-sync-svc` message queue, hospital route `NDH` / lab `9` / `LAB_DB` / `SYB`, calling `DatabaseUtil.isPGDatabaseConnection`
- Library: `lis-svc-lib` `data-source` (`DynamicDataSource`, `DatabaseUtil`, `DataSourceContextHolder`)

## Background and trigger

**Current behaviour (as-is)**

1. `data-source` keeps one thread route (`server`, `lab`, `database`, `dbType`) and one `DynamicDataSource` per database type (Sybase, PostgreSQL, Oracle). Cross-type calls use separate entity-manager factories ([[Plan - Implement Distributed Transactions in data-source Library]]).
2. Oracle is the index for whether a hospital database is Sybase or PostgreSQL ([[Dynamic Data Source Design]]). In the library, `setCurrentDb` reads that index from Oracle LOE control. The vault notes that this lookup temporarily enters an Oracle context and can enlist Oracle even when the business work is Sybase or PostgreSQL ([[Plan - Implement Distributed Transactions in data-source Library]], Oracle LOE_CTRL side-effect).
3. Changing the shared route while a segmented transaction is open commits the current hospital segment and starts the next one (`RoutingTransactionManager`).
4. `lis-patient-pmi-sync-svc` sets the hospital route, then calls `DatabaseUtil.isPGDatabaseConnection` to decide whether to strip non-ASCII characters from the HL7 payload. That method queries Oracle `loe_control` through the Oracle repository and does not install an Oracle route first.
5. The Oracle router rejects a lookup key whose `dbType` is not `ORACLE`. With the thread still on Sybase, the read throws `InvalidDataAccessApiUsageException`: `DynamicDataSource for dbType='ORACLE' cannot route context with dbType='SYB'`.
6. `isPGDatabaseConnection` catches that failure, treats the server-lab as PostgreSQL, and stores that answer. Later calls skip Oracle. The non-ASCII strip is then skipped for a hospital that was routed as Sybase.

**Trigger**

The same exception was stopped in the debugger on `NDH` lab `9` while the message-queue thread was already on Sybase. The Oracle repository is only ever an Oracle connection. The hospital route should stay Sybase or PostgreSQL while that read runs.

## In scope

- Oracle repository reads that run while the thread route is Sybase or PostgreSQL, including the `loe_control` read inside `DatabaseUtil.isPGDatabaseConnection`.
- The active hospital transaction segment stays open across that read.
- Sybase and PostgreSQL routers still reject a lookup key for the other hospital database type.
- A failed Oracle type lookup returns Sybase for that call and is not cached.

## Out of scope

> Explicitly excluded. If this list is empty, scope has not been thought about.

- Non-ASCII filtering rules in `lis-patient-pmi-sync-svc` (`MessageQueueService`).
- Redesign of `RoutingTransactionManager`, JTA, or distributed commit behaviour.
- Adding or moving hospital Sybase / PostgreSQL pools.
- Changing `loe_control` rows or which hospitals are PostgreSQL.
- Release notes, wiki, or a consumer-service code change.

## Functional requirements

| ID | Requirement | Status | Acceptance criteria |
|---|---|---|---|
| R1 | An Oracle repository read reaches Oracle when the thread route is Sybase or PostgreSQL. | assumed | `isPGDatabaseConnection` for a hospital already routed as `SYB` or `PG` does not throw `InvalidDataAccessApiUsageException` for an Oracle router rejecting that `dbType`. The connection used is the registered Oracle route. |
| R2 | That read does not commit or replace the active hospital transaction segment. | assumed | Hospital work already done in the same segmented transaction is still uncommitted when the Oracle read returns. The thread route is still the hospital route afterward. |
| R3 | Sybase and PostgreSQL routers still reject a mismatched `dbType`. | assumed | A Sybase router with a PostgreSQL lookup key still throws `IllegalStateException`. The PostgreSQL router does the same for a Sybase key. |
| R4 | A failed Oracle type lookup returns Sybase for that call and is not cached. | confirmed | After the Oracle lookup throws, the method returns Sybase (`false`) and `getCachedDatabaseConnection` for that server and lab is null. A later successful `loe_control` read is what gets cached. A missing `loe_control` row is still a real answer and may be cached as not PostgreSQL. |

Status: `proposed` (draft) · `assumed` (proceeding on the default) · `confirmed`

## Non-functional requirements

| Area | Requirement |
|---|---|
| Volume | Unchanged. One Oracle type lookup per server-lab until a real answer is cached. |
| Latency | No extra Oracle round trip on a cache hit. A cache miss stays one `loe_control` read. |
| Retention | The type cache stays in memory for the process. A failed lookup must not occupy a cache entry. |
| Audit | Keep the existing warning when Oracle is unavailable. Do not add patient identifiers to that log. |

## Impact

| Affected | Detail |
|---|---|
| Services | `data-source` in `lis-svc-lib`. Caller that hit the defect: `lis-patient-pmi-sync-svc` message queue. Other services that call `isPGDatabaseConnection` or an Oracle repository while a hospital route is set get the same lookup behaviour. |
| Screens | None. |
| Tables | Read `loe_control` (`HOSP_SETTING` / `DATABASE_CONNECTION`). No schema change. |
| Interfaces / partners | None. |

## Assumptions

1. Work type is a **fix**. Provisional key `TMP-oracle-route-lookup` until a JIRA key exists.
2. Oracle remains a single route: `LOE` / lab `1` / `LOE_DB`.
3. The code change stays in `data-source`. `MessageQueueService` keeps calling `isPGDatabaseConnection`.
4. On Oracle unavailable, the current call returns Sybase, and that default is not cached.
5. The hospital route is not switched to Oracle to perform the read, because a route switch commits the active hospital segment.

## Open questions

| # | Question | Proposed default | Owner | Answer |
|---|---|---|---|---|
| Q1 | When Oracle is down, should this call still default to PostgreSQL? | Yes for this call only. Do not cache it (R4). | Ka | **No. Default to Sybase.** Do not cache (R4). |
| Q2 | Is the Oracle target always `LOE` / `1` / `LOE_DB`? | Yes. One Oracle route. | Ka | Proceed on assumption (A1). |
| Q3 | Change only `data-source`, and leave `MessageQueueService` as it is? | Yes. | Ka | Proceed on assumption (A2). |
| Q4 | Must the hospital segment stay uncommitted across the Oracle read? | Yes. Do not switch the shared hospital route to Oracle for the read (R2). | Ka | Proceed on assumption (A3). |
| Q5 | JIRA key? | Provisional `TMP-oracle-route-lookup` until a key is assigned. | Ka | Proceed on assumption (A4). |

## Confirmation

- Confirmed by: Requester (chat)
- Date: 2026-09-25
- Verdict for orchestrator: **`pass with assumptions`**
- Statement (quoted):

> Q1, default to Sybase.
> proceed on assumptions for others
