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
Open Questions
Q&A

### Slide: Background
Production incident on 26 Jun 2026
Message P5120260626094915113 (A08) set to PROCESSING for patient's old HKID
Message P5120260626094915193 (A47) picked up concurrently ~2 seconds later
Root cause: blocking check only compares the new HKID on each queue row
For A40/A45/A47, the old HKID is not stored in the message queue table

### Slide: Background
| Type | Description | HKID in message |
| --- | --- | --- |
| A40 | Merge HKID | new HKID + old HKID |
| A47 | Change HKID | new HKID + old HKID |
On enqueue, only the new HKID is saved to patient_pmi_sync_message_queue.hkid

### Slide: Existing Design - Message Queue Flow
Scheduled job runs every 10 seconds on each hospital server
Each poll selects the next batch of messages ready to process
Eligible statuses: OUTSTANDING, RETRY, PENDING
Blocking statuses: FAILED, RETRY, PROCESSING

### Slide: Existing Design - Current Blocking Query
Before picking a message, the service checks for earlier messages still blocking the same patient
The check matches only on the new HKID stored on the queue row
```sql
-- simplified: blocking match uses new HKID only
WHERE earlier_message.hkid = current_message.hkid
```

### Slide: Proposed Change - Overview
Add old_hkid column to patient_pmi_sync_message_queue
When enqueueing A40/A45/A47, store the patient's previous HKID in old_hkid
Extend the blocking check to match on both hkid and old_hkid

### Slide: Proposed Change - Schema
| Column | Type | Description |
| --- | --- | --- |
| old_hkid | VARCHAR(12) NULL | Previous HKID for A40/A45/A47 |

### Slide: Promotion
Deploy DDL - add old_hkid column on all hospital DBs
Deploy lis-patient-pmi-sync-svc with updated queue and blocking logic
SIT verify: queue A08 then A47 for same patient

### Slide: Fallback
Revert lis-patient-pmi-sync-svc deployment to previous version
old_hkid column can remain (nullable, unused by previous version)

### Slide: Open Questions
**Archetype:** asks
1. Should A40/A45/A47 always persist old_hkid even when the inbound message omits it?
2. Is a backfill of historical queue rows required before cutover, or only new traffic?
3. Confirm SIT sign-off owner for the A08-then-A47 race scenario.

### Slide: Q&A
```

**Turn it into a deck:**

Hand off to **design-review-pptx** — it reads this `## Design` section, writes a
deck spec, and renders it:

```bash
node <design-review-skill-dir>/generate-deck.js "docs/Fix Message Queue Old HKID Blocking (LIS-10583).deck.json"
```

Roughly how these blocks land as archetypes:

| Design block | Archetype |
|--------------|-----------|
| `Slide: Background` (bullets) | `evolution` if it has a history, else `cards` |
| `Slide: Background` (table) | `matrix` |
| `Slide: Existing Design - Current Blocking Query` | `code-findings` |
| `Slide: Proposed Change - Overview` | `steps-sidebar` |
| `Slide: Proposed Change - Schema` | `matrix` |
| `Slide: Promotion` / `Fallback` | `cards` |
| `Slide: Q&A` | `statement` |

---

## Pipeline summary

```
lis-jira-log-creator  →  LIS/JIRA/{note}.md  (sections 1–6)
generate-design       →  adds ## Design section in same note   ← ends here
design-review-pptx    →  {Title}.deck.json  →  {Title}.pptx    (CP3 deck)
```
