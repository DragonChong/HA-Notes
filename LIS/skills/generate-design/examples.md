# Examples

## Example — incremental fix (LIS-10583)

**Source JIRA note:** `LIS/JIRA/Fix Message Queue Old HKID Blocking in lis-patient-pmi-sync-svc.md`

**Design section excerpt:**

```markdown
## Design

**Review type:** incremental
**JIRA key:** LIS-10583
**Service:** lis-patient-pmi-sync-svc
**Review forum:** CP3
**Review date:** 3rd Jul, 2026
**Prior review:** none

### Agenda
Background
Design Review
Promotion
Fallback
Q&A

### Slide: Background
Production incident on 26 Jun 2026
Message P5120260626094915113 (A08) set to PROCESSING for patient's old HKID
Message P5120260626094915193 (A47) picked up concurrently ~2 seconds later
Root cause: blocking check only compares blocking.hkid = m.hkid (new HKID)
For A40/A45/A47, old HKID is not stored in message queue table

### Slide: Background
| Type | Description | HKID in message |
| --- | --- | --- |
| A40 | Merge HKID | new HKID + old HKID |
| A47 | Change HKID | new HKID + old HKID |
On enqueue, only new HKID is persisted to patient_pmi_sync_message_queue.hkid

### Slide: Existing Design - Message Queue Flow
Scheduler runs every 10 seconds per hospital server (MessageQueueProcessor)
getNextBatchOfMessages calls findProcessableMessages
Eligible statuses: OUTSTANDING, RETRY, PENDING
Blocking statuses: FAILED, RETRY, PROCESSING

### Slide: Existing Design - Current Blocking Query
```sql
SELECT m FROM MessageQueue m
WHERE blocking.hkid = m.hkid
```
countPreviousBlockingMessages uses the same hkid-only match

### Slide: Proposed Change - Overview
Add old_hkid column to patient_pmi_sync_message_queue
Populate old_hkid on enqueue from PatientTransactionVo.oldHkid
Extend blocking queries to match on both hkid and old_hkid

### Slide: Proposed Change - Schema
| Column | Type | Description |
| --- | --- | --- |
| old_hkid | VARCHAR(12) NULL | Previous HKID for A40/A45/A47 |

### Slide: Promotion
Deploy DDL - add old_hkid column on all hospital DBs
Deploy lis-patient-pmi-sync-svc with entity, repository, and service changes
SIT verify: queue A08 then A47 for same patient

### Slide: Fallback
Revert lis-patient-pmi-sync-svc deployment to previous version
old_hkid column can remain (nullable, unused by old code)

### Slide: Q&A
```

**Convert to slides:**

```bash
python ~/.cursor/skills/generate-design/jira-design-to-slides.py \
  "LIS/JIRA/Fix Message Queue Old HKID Blocking in lis-patient-pmi-sync-svc.md" \
  "docs/Fix Message Queue Old HKID Blocking (LIS-10583).md"
```

Then hand off to **design-review-pptx** for `.pptx` generation.

---

## Pipeline summary

```
lis-jira-log-creator  →  LIS/JIRA/{note}.md  (sections 1–6)
generate-design       →  adds ## Design section in same note
jira-design-to-slides →  docs/{Title}.md     (slide-ready)
design-review-pptx    →  docs/{Title}.pptx   (CP3 deck)
```
