# Slide Types Reference

Maps each design-review slide type to Markdown structure and pptx layout hints.

---

## 1. Title

**Purpose:** Opening slide; identifies the change and forum.

```markdown
<!-- Slide number: 1 -->
# Fix Race Condition in lis-gcr-order-inf-svc when Processing LOE_MESSAGE_QUEUE in Sender for Sending Messages to GCRS (LIS-10672)
(lis-gcr-order-inf-svc)
CP3
5th Jun 2026
```

**Layout:** Title Slide (layout 0) — white Office theme; title + `(service-name)` in title placeholder; `CP3` and date in subtitle placeholder (idx 1). Slide number bottom-right from master.

---

## 2. Agenda

**Purpose:** Set expectations; no discussion content.

```markdown
<!-- Slide number: 2 -->
# Agenda
Background
Design Review
```

Full reviews add: `Promotion`, `Fallback`, `Any further topics / open discussion`.

**Layout:** Title and Content (layout 1) — agenda items as **bold** paragraphs, one per line.

---

## 3. Comparison / Overview Table

**Purpose:** Legacy vs revamped, or before vs after.

```markdown
<!-- Slide number: 3 -->
# Background for Existing GCRS Order Interface
Overview
| Aspect | Legacy |
| --- | --- |
| Communication protocol | TCP socket (long-running connection) |
| Message format | XML, validated against DTD files |
| Framework | — |
| Deployment | JAR on Unix host |
```

Optional label line (`Overview`, `Receiver`, `Sender`) between title and table.

**Layout:** Title and Content + table (header bold 12pt, body 11pt). Optional footnote lines below table in 11pt Calibri.

---

## 4. Reference Table (domain data)

**Purpose:** Transaction types, status codes, config keys.

```markdown
<!-- Slide number: 5 -->
# Transaction Types (GCRS → LIS)
Receiver

| Transaction Type | Transaction Type Description |
| --- | --- |
| PO1 | Print Request (New Order) |
| CS1 / CS2 | Collect Specimen |
```

Use arrow notation in title: `GCRS → LIS`, `LIS → GCRS`.

**Layout:** Table-heavy; minimize bullets.

---

## 5. Code / Message Sample

**Purpose:** Show XML, JSON, SQL, or API payload structure.

```markdown
<!-- Slide number: 8 -->
# Transaction Messages (Legacy)
XML

\`\`\`xml
<?xml version="1.0" encoding="BIG5" standalone="no"?>
<!DOCTYPE gcrLis SYSTEM "/appl/lis/dtd/test/PrintRequest.dtd">
<gcrLis>
  <tranDtl>
    <msgId>20260000000000502014</msgId>
    …
  </tranDtl>
</gcrLis>
\`\`\`
```

Add callout lines after code when comparing formats:

```
Structure is identical
Field names are identical
```

**Layout:** Title and Content + Consolas 10pt code textbox. Notes below code in 11pt Calibri.

---

## 6. Architecture Diagram

**Purpose:** System context, component interaction.

```markdown
<!-- Slide number: 12 -->
# System Architecture (Receiver)

![](architecture-receiver.png)
Endpoint
POST /api/processReceiver
API Gateway
API Provider
lis-crs-gcrOrderServices
SAM3 Authentication
API Consumer
lis-crs-gcrOrderServices-sam3Auth-app
```

Place `![](...)` first or immediately under title. Follow with one or two caption lines (centred below the diagram). For many labelled components (3+ lines), use plain lines — the generator places them beside the image on the left.

**Layout:** Full-width centred diagram (~8.7"); 1–2 caption lines in 14pt italic below. Multi-line labels: text left, image right.

---

## 7. Flow / Mechanism (multi-slide)

**Purpose:** Step-by-step processing; often paired with a flow diagram.

**Slide A — retrieve and lock:**

```markdown
# Message Processing Mechanism
Retrieve OUTSTANDING, RETRY messages
Send Hosp = <Input Param from lis-common-scheduler>
Date Range = 1 month (Configurable)
Page Size = 100 (Configurable)
Sort by Create Date Time, Order No., Version No.
Pessimistic Locking
Update status to PROCESSING
Commit to database
```

**Slide B — send and update:**

```markdown
# Message Processing Mechanism
Check previous version messages (if exists)
Any PROCESSING, RETRY, FAILED, BLOCKED
Update to BLOCKED if exists
Prepare JSON message from LOE_MESSAGE_QUEUE
Send message to GCRS
Update status to COMPLETED if success response
Update status to RETRY / FAILED if failure response
Further retrieve OUTSTANDING messages
```

Repeat title on both slides; optional diagram per slide (`![](flow-step1.png)`).

**Layout:** Flowchart image + bullet steps, or bullets only for incremental reviews.

---

## 8. State / Status Table

**Purpose:** Enum values, lifecycle states.

```markdown
<!-- Slide number: 16 -->
# Message Status
| Status | Description |
| --- | --- |
| OUTSTANDING | Queued and waiting to be picked up by the sender |
| PROCESSING | Currently being sent; set before the outbound call |
| COMPLETED | Successfully acknowledged by GCRS (ackCode = MA) |
| RETRY | Send failed; scheduled for retry |
| FAILED | Permanently failed after exhausting retries |
| BLOCKED | Blocked when previous version messages are not COMPLETED |
```

**Layout:** Table; optional separate slide with lifecycle diagram.

---

## 9. Schema Change

**Purpose:** DDL impact, column additions, trigger changes.

```markdown
<!-- Slide number: 14 -->
# Schema Change (LOE_MESSAGE_QUEUE)
Old Column
| Column | Type | Description |
| --- | --- | --- |
| loemesque_complete | Number | 0 – Outstanding  1 – Completed |
```

```markdown
<!-- Slide number: 15 -->
# Schema Change (LOE_MESSAGE_QUEUE)
New Columns
| Column | Type | Description |
| --- | --- | --- |
| loemesque_status | VARCHAR2(20) | Authoritative status… |
| loemesque_retry | NUMBER(3,0) | Cumulative count of send attempts… |
```

Use `Old Column` / `New Columns` / `New Trigger` as section labels.

---

## 10. Obsoleted Component

**Purpose:** Deprecations with replacement rationale.

```markdown
# Table Obsoleted – LOE_ORDER_IGNORE_LIST
Record is inserted when failure response is returned when sending message to GCRS
Prevents message send to GCRS repeatedly
Completely replaced by retry mechanism
| Column | Description |
| --- | --- |
| LOEORDIGNLST_SEND_HOSP | Send Hospital |
| … | … |

![](obsolete-table.png)
```

**Layout:** Short bullets + table; optional screenshot.

---

## 11. OpenShift Configuration

**Purpose:** Runtime config for operators.

```markdown
# OpenShift Configuration
ConfigMap
lis-gcr-order-inf-svc-config
| Key | Default | Description |
| --- | --- | --- |
| QUEUE_BATCH_SIZE | 100 | Maximum number of queue records processed per batch |
| QUEUE_MAX_RETRY_LEVEL | 2 | Maximum retry level before FAILED |
```

Rotate through: ConfigMap (service), ConfigMap (integration), Secrets (service), Secrets (integration).

---

## 12. Production Usage / Stats

**Purpose:** Volume evidence for sizing and risk.

```markdown
# Production Usage
Peak hour loe_message_queue count per hospital
Maximum over 7000 messages
| Hospital | Count per hour |
| --- | --- |
| TMH | 7483 |
| QEH | 5637 |
```

Add a summary callout line before the table (`Maximum over 7000 messages`).

**Layout:** Stat callout + table.

---

## 13. Promotion

**Purpose:** Ordered deployment steps for go-live.

```markdown
# Promotion
Deploy lis-gcr-order-inf-svc
Shutdown legacy receiver application by send hospital
loeReceiver (LOESERVER)
Shutdown legacy sender application by send hospital
loeReceiver (MQSENDER)
Update cron expression for GcrOrderSvcScheduleJob<Hosp>
e.g. GcrOrderSvcScheduleJobHhh
Cron expression: 0/30 * * * * ?
```

**Layout:** Numbered steps or sequential bullets.

---

## 14. Fallback

**Purpose:** Rollback per direction (receiver / sender).

```markdown
# Fallback (Receiver)
GCRS starts legacy sender application
Start legacy receiver application by send hospital
loeReceiver (LOESERVER)
```

```markdown
# Fallback (Sender)
Pause Schedule for GcrOrderSvcScheduleJob<Hosp>
LOE_MESSAGE_QUEUE status check (By script)
Update status to OUTSTANDING if necessary (e.g. status = FAILED, RETRY, PROCESSING)
Start legacy sender application by send hospital
loeReceiver (MQSENDER)
```

**Layout:** Separate slides per direction when steps differ.

---

## 15. Problem Background (incremental only)

**Purpose:** Concise incident / defect context.

```markdown
# Background
Same LOE_MESSAGE_QUEUE is processed by multiple transactions during high loading
Common Scheduler is triggered per 30 seconds
1st Transaction starts
Retrieve OUTSTANDING messages again after finishing batches
process more than 30 seconds due to high loading
2nd Transaction starts
Pick up the same OUTSTANDING message with 1st Transaction
Same message is sent to GCRS repeated
Status is updated to SUCCESS and then FAILED as a result
```

**Layout:** Timeline-style bullets; optional sequence diagram.

---

## 16. Q&A

```markdown
<!-- Slide number: N -->
# Q&A
```

**Layout:** Title Only (layout 7) — centred **Q&A** at 48pt; white background. Closing slide.
