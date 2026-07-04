# JIRA Log Examples

Three reference examples from team change-request emails.

---

## Example 1: Bug fix (race condition)

**Request Type:** Change Request | **Priority:** Medium

**Request Summary:**  
Fix Race Condition in `lis-gcr-order-inf-svc` when Processing `LOE_MESSAGE_QUEUE` in Sender for Sending Messages to GCRS

**Background:**  
During load testing of `lis-gcr-order-inf-svc`, after the first transaction finished processing batches of messages, it retrieved outstanding messages again. The retrieval timing of the first transaction was very close to that of the second transaction. The same `OUTSTANDING` message from `LOE_MESSAGE_QUEUE` was selected and processed by multiple transactions before the status update to `PROCESSING` was committed. This race condition leads to duplicate message processing when sending messages to GCRS.

**Change Description:**

1. **Implement Pessimistic Locking in Repository:** Update `LoeMessageQueueRepository.java` to add `@Lock(LockModeType.PESSIMISTIC_WRITE)` to the `sliceQueuedMessages` query (`SELECT ... FOR UPDATE` in Oracle).
2. **Wrap Select + Mark as Processing in Transaction:** Update `LoeMessageQueueService.java` to decorate `fetchAndMarkAsProcessing(...)` with `@Transactional` — acquire lock, update rows to `PROCESSING`, commit atomically before long-running GCRS API calls.
3. **Update Sender Service Logic:** Update `MessageQueueSenderService.java` to call `loeMessageQueueService.fetchAndMarkAsProcessing(...)` instead of inline `select + saveAllAndFlush`.

**Justification:**  
Fixing this race condition ensures reliable, unique message processing from `LOE_MESSAGE_QUEUE` to GCRS under high load. Pessimistic locking with a short transactional scope eliminates duplicate selections without holding DB locks during GCRS API calls.

**Target Completion Date:** 29th May, 2026

---

## Example 2: Enhancement (patient PMI sync)

**Request Type:** Change Request | **Priority:** Medium

**Request Summary:**  
Enhance `lis-patient-pmi-sync-svc` to support Handling of Patient Merge and Deletion on Corporate Special Blood Category

**Background:**  
Patient merge and deletion on corporate special blood category is currently handled by table trigger `transaction_log_tr` (transaction types 020 Merge HKID, 030 Change HKID, 250 PMI Deletion). The logic is being revamped into `lis-patient-pmi-sync-svc`. The service currently subscribes to A40 (020 CPI) and A47 (031 CPI). Handling for patient merge will be added for these events. The service will additionally support A29 (250 CPI) for patient deletion.

**Change Description:**

- **Revamp table trigger logic into `lis-patient-pmi-sync-svc`:** Migrate logic from `transaction_log_tr`.
- **Enhance subscription handling:** Handle A40 and A47 for patient merge; add A29 for patient deletion on corporate special blood category.
- **Maintain data integrity and logging:** Copy corporate special blood requirements from old to new HKID on merge; reset on deletion; implement robust processing and error logging.

**Reference Logs:** LIS-7291, LIS-8200

**Justification:**  
Revamping into the ECP service modernizes architecture, aligns with the updated subscription model, and ensures accurate special blood requirement management during patient merges and deletions.

**Target Completion Date:** 17th Apr 2026

---

## Example 3: New service development (GCRS order interface)

**Request Type:** Change Request

**Request Summary:**  
Develop ECP service `lis-gcr-order-inf-svc` to Replace Legacy GCRS Order Interface

**Background:**  
The existing GCRS-LIS order interface is a legacy socket-based Java program using XML for bidirectional communication. It handles inbound order updates (PO1, AT3, DT3, CS1/CS2, CC1) and outbound LIS-generated updates. As part of DHP migration, this must be modernized into Spring Boot microservice `lis-gcr-order-inf-svc`, transitioning from socket/XML to RESTful JSON APIs.

**Change Description:**

1. **Develop new Spring Boot application (`lis-gcr-order-inf-svc`):** Rewrite receiver and sender logic; adopt RESTful design with validation, error handling, and logging.
2. **Implement inbound API (GCRS → LIS):** REST endpoints accepting JSON (field names identical to original XML tags); support PO1, AT3, DT3, CS1/CS2, CC1; return JSON acknowledgements (code 200, ackCode MA).
3. **Implement outbound API support (LIS → GCRS):** Endpoints for `lis-common-scheduler-svc`; accept hospital codes; handle specimen acknowledgements and status changes; convert internal data to JSON for GCRS.

**Justification:**  
Modernization supports DHP migration, service-oriented architecture, and improved maintainability and scalability over the legacy socket/XML interface.

**Target Completion Date:** [TBD — not specified in source email]
