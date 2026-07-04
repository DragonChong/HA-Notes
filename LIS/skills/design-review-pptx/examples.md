# Examples

Annotated excerpts from real CP3 design review decks. Use as tone and structure references.

---

## Example A — Full migration review (LIS-10569)

**File:** `GCRS Order Interface DHP Migration.md` (32 slides)

### Outline used

| # | Title |
|---|-------|
| 1 | Title |
| 2 | Agenda |
| 3–4 | Background (Legacy / Revamped) |
| 5–7 | Transaction Types (3 slides) |
| 8–11 | Transaction Messages (XML + JSON) |
| 12–13 | System Architecture (Receiver / Sender) |
| 14–16 | Schema + Message Status |
| 17–19 | Lifecycle diagram + Processing Mechanism |
| 20–22 | Retry + Trigger + Obsoleted table |
| 23–26 | OpenShift Configuration (4 slides) |
| 27–28 | Production Usage |
| 29–31 | Promotion + Fallback |
| 32 | Q&A |

### Title + Agenda

```markdown
<!-- Slide number: 1 -->
# GCRS Order Interface DHP Migration (LIS-10569)
(lis-gcr-order-inf-svc)
CP3
22nd May 2026

<!-- Slide number: 2 -->
# Agenda
Design Review
Promotion
Fallback
Any further topics / open discussion
```

### Legacy vs Revamped comparison

```markdown
<!-- Slide number: 3 -->
# Background for Existing GCRS Order Interface
Overview
| Aspect | Legacy |
| --- | --- |
| Communication protocol | TCP socket (long-running connection) |
| Message format | XML, validated against DTD files |
| XML parsing | Xerces SAX parser (XMLReader.java) |
| Database access | Oracle |
| Configuration | INI files (LOESERVER.ini, LOEMQSENDER.ini) |
| Scheduling | Internal timer |
| Deployment | JAR on Unix host |
```

### Promotion (operations detail)

```markdown
<!-- Slide number: 29 -->
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

---

## Example B — Incremental fix review (LIS-10672)

**File:** `Fix Race Condition in lis-gcr-order-inf-svc…md` (6 slides)

### Outline used

| # | Title |
|---|-------|
| 1 | Title |
| 2 | Agenda |
| 3 | Background (problem narrative) |
| 4–5 | Message Processing Mechanism (reused from prior review) |
| 6 | Q&A |

### Problem background (incremental)

```markdown
<!-- Slide number: 3 -->
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

### Reusing prior design slides

For incremental reviews, reference existing flows instead of rewriting architecture:

```markdown
<!-- Slide number: 4 -->
# Message Processing Mechanism
![](Picture4.jpg)
Retrieve OUTSTANDING, RETRY messages
Send Hosp = <Input Param from lis-common-scheduler>
…
Pessimistic Locking
Update status to PROCESSING
Commit to database
```

Add a **Proposed change** slide (not in original deck) when documenting the fix:

```markdown
<!-- Slide number: 5 -->
# Design Review
Root cause: overlapping scheduler runs pick up the same OUTSTANDING row before PROCESSING commit is visible
Proposed fix: {describe — e.g. distributed lock, skip-if-processing guard, extend pessimistic lock scope}
Impact: no schema change; sender job behaviour only
Testing: {simulate concurrent scheduler trigger; verify single GCRS send per msgId}
```

---

## Naming conventions

| Item | Pattern |
|------|---------|
| Markdown file | `{Title}.md` — same basename as target `.pptx` |
| JIRA in title | `({JIRA-KEY})` at end of H1 |
| Service in subtitle | `(lis-{service-name})` on line after title |
| Direction in titles | `GCRS → LIS`, `LIS → GCRS` |
| Schema slides | `# Schema Change ({TABLE_NAME})` |
| Config slides | `# OpenShift Configuration` + `ConfigMap` / `Secrets` label |
