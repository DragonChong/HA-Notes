---
title: 01 Requirement Confirmation — Amend Request retrieve retry
tags:
  - sdlc
  - requirement
generated_by: requirement-confirmation
generated_on: '2026-09-08'
reviewed_by: Ka
review_date: '2026-09-08'
agent_assisted: true
---
# 01 Requirement Confirmation — Amend Request retrieve retry

Sources used (no PHI):

- SM verbal to Ka, 2026-09-08 (afternoon)
- Ka confirmation in orchestrator session, 2026-09-08 18:00
- [[Retrieve Request]] (Amend Request) — CRST-779
- [[CRS/Revamp/Migration Plan/Frontend/Amend Request Migration Plan|Amend Request Migration Plan]] §8A.1

## Background and trigger

On **Amend Request**, staff enter a request number to run [[Retrieve Request]]. When the retrieve call fails (network timeout, service unavailable, or unhandled transport error), the screen today shows an error message and leaves the user to re-submit from the **Req. No.** field with no dedicated recovery action.

SM asked for a **Retry** button on retrieve request so staff can repeat the last retrieval attempt without retyping the number or clearing the screen.

**Current behaviour (as-is)**

1. User enters **Req. No.** and submits.
2. `lis-request-app` calls the Amend retrieve API on `lis-crs-spec-ack-svc`.
3. On success, panels populate and the screen enters the ready state ([[Retrieve Request]]).
4. On transport/unknown failure, an error message is shown; **Req. No.** stays editable; there is no Retry control.
5. Business-rule outcomes (not found, cancelled, unsupported lab) are not retriable failures — they show the existing messages (CRST-781–783) and do not need Retry.

**Trigger**

Reduce rework when a transient failure blocks retrieval; align with SM request and prior similar fix ("same as last time").

## In scope

- Add a **Retry** button on Amend Request visible after a **retriable** retrieve failure.
- Retry re-runs retrieve with the **same request number** and lab context as the failed attempt.
- Disable Retry while a retrieve is in flight; show loading state on Retry.
- ALS error log on repeated failure (existing logger patterns).
- Amend Request screen only (`lis-request-app`).

## Out of scope

- Retry on Cancel Request, Wipeout Request, Add Delete Test, or Specimen Acknowledgement retrieve flows (separate stories if needed).
- Backend API contract changes or new endpoints.
- Automatic retry / polling without user action.
- Changing not-found, cancelled, or unsupported-lab messages.
- Retry after a successful retrieve (Amend / Send Out / Print paths unchanged).

## Functional requirements

| ID | Status | Requirement | Acceptance criteria |
|---|---|---|---|
| R1 | confirmed | Show **Retry** after a retriable retrieve failure. | Transport timeout, HTTP 5xx, or network error from the retrieve call → error message **and** Retry enabled. Business-rule failures (not found, cancelled, unsupported lab) → **no** Retry. |
| R2 | confirmed | Retry uses the last request number. | Clicking Retry calls the same retrieve API with the request number from the failed attempt. User does not re-enter **Req. No.** |
| R3 | confirmed | Single in-flight retrieve. | While retrieve or retry is running, Retry is disabled; completes or fails before another attempt. |
| R4 | confirmed | Success path unchanged. | Successful retry populates panels and enables buttons per [[Retrieve Request]]. |
| R5 | confirmed | Audit on repeated failure. | Second and later retriable failures log ALS error with request number (masked per existing rules) and failure reason; no PHI in message text beyond existing retrieve logging. |

## Non-functional requirements

| Area | Requirement |
|---|---|
| UX | Retry label **Retry**; placed adjacent to the retrieve error message (same message box region). |
| Performance | No extra calls until user clicks Retry. |
| Accessibility | Retry is keyboard reachable when visible. |

## Impact

| Affected | Detail |
|---|---|
| Services | **`lis-request-app`** — Amend Request retrieve UI and error handling. **`lis-crs-spec-ack-svc`** — no change (existing retrieve-by-request-no API reused). |
| Screens | Amend Request only. |
| Tables | None. |

## Assumptions

1. **Enhancement**, not a new project.
2. Retriable = transport / 5xx / unknown; not business-rule responses.
3. Lab context for retrieve comes from the same source as today's Amend retrieve (request record / screen lab selection) — no new parameter from the user on Retry.
4. v1 is Amend Request only; other CRS screens are follow-ups if SM expands scope.

## Open questions

None. Ka confirmed scope verbally (SM relay) 2026-09-08.

## Confirmation

- Confirmed by: Ka (owner; relaying SM verbal scope)
- Date: 2026-09-08
- Verdict for orchestrator: **`pass`**
- Statement (quoted):

> SM already told me verbally this afternoon. We know what we want: add a retry button on retrieve request. Mark it confirmed, set reviewed_by to Ka, close the requirement gate, start system design tonight. CP3 is tomorrow.
