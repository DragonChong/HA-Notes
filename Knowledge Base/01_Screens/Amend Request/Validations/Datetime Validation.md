---
epic: LISP-223
status: draft
---
# Datetime Validation

## Overview

When the **Amend** button is clicked, the system validates the three specimen datetime fields — **Specimen Request Datetime**, **Specimen Collection Datetime**, and **Specimen Arrival Datetime** — against a set of rules covering chronological order, future datetime restrictions, and expiry thresholds. Some checks produce hard blocking errors; others produce confirmation prompts that allow the user to proceed or cancel. The rules may be modified by laboratory options.

---

## Related User Stories

- **[[CRST-893]]** - Amend Request - Request Info Datetime Validation Checking
- **[[CRST-797]]** - Amend Request - Validation (AmendRequestDataValidator) *(parent validation story)*

**Epic:** LISP-223 [CRST][DEV] Amend Request - Amend Action

---

## Validation Rules and Messages

### Hard Blocking Errors (message 551, 543, 544, 547, 548)

These messages require the user to click **OK** to dismiss. The amendment is not saved; the user must correct the value before retrying.

| Message | Text | Condition |
|---------|------|-----------|
| 551 | "Invalid datetime: Request Datetime/Time cannot greater than Now." | Specimen Request Datetime is in the future |
| 551 | "Invalid datetime: Request date cannot later than Arrival date." | Specimen Request Datetime > Specimen Arrival Datetime |
| 551 | "Invalid datetime: Collection date cannot later than Arrival date." | Specimen Collection Datetime > Specimen Arrival Datetime |
| 551 | "Invalid datetime: Collection date cannot earlier than Patient's day of birth." | Specimen Collection Datetime < Patient's date of birth |
| 543 | "Collection Date/Time cannot later than Now." | Specimen Collection Datetime is in the future AND `ALLOW_FUTURE_SPECIMEN` option is not enabled |
| 544 | "Collection Date/Time cannot later than '*n* hours.'" | Specimen Collection Datetime exceeds current server time + the configured future-specimen hours AND `ALLOW_FUTURE_SPECIMEN` is enabled with `option_text` = hours limit |
| 547 | "Arrival Date/Time cannot later than Now." | Specimen Arrival Datetime is in the future AND `ALLOW_FUTURE_SPECIMEN` option is not enabled |
| 548 | "Arrival Date/Time cannot later than '*n* hours.'" | Specimen Arrival Datetime exceeds current server time + the configured future-specimen hours AND `ALLOW_FUTURE_SPECIMEN` is enabled |

### Confirmation Prompts (messages 546, 550, 682, 683, 684)

These messages allow the user to choose whether to proceed or cancel.

| Message | Text | Condition | Yes / OK | No / Cancel |
|---------|------|-----------|----------|-------------|
| 546 | "Collection Date/Time later than Now, do you want to continue?" | Specimen Collection Datetime > current server time AND `FUTURE_SPECIMEN_WARNING_ENABLED` = 1 | Amendment proceeds | Amendment undone |
| 550 | "Arrival Date/Time later than Now, do you want to continue?" | Specimen Arrival Datetime > current server time AND `FUTURE_SPECIMEN_WARNING_ENABLED` = 1 | Amendment proceeds | Amendment undone |
| 683 | "Collection Date/Time is *n* hours before. Do you want to proceed registration?" | Collection Datetime is past and exceeds expiry threshold; `COLLECTION_DATE_EXPIRE_CHECK_CRITERIA` option_value = 1 or 2 with `option_text` matching `(expire hours/1)` | Amendment proceeds | Amendment undone |
| 684 | "Collection Date/Time is *n* hours before. Do you want to proceed registration?" | Same as 683 but `option_text` matches `(expire hours/2)` — default focus on **Cancel** | Amendment proceeds | Amendment undone |
| 682 | "Collection date is more than *n* day(s) earlier than Arrival date! Continue Registration?" | Difference between Collection and Arrival datetimes exceeds `DAYS_ALLOWED_SINCE_SPECIMEN_COLLECTION` option value | Amendment proceeds | Amendment undone |

> **Note on messages 683 vs 684:** Both messages cover the same expired-collection-datetime scenario, but differ in their default button focus. Message 683 defaults focus to **OK**; message 684 defaults focus to **Cancel**. The applicable message is selected by the `option_text` suffix (`/1` vs `/2`).

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|------------|---------|--------------------|--------------------|
| Allow Future Specimen | `ALLOW_FUTURE_SPECIMEN` | Permits specimen datetimes beyond current time, up to a defined number of hours | Future datetime up to the configured hours limit is accepted (messages 544 / 548 for over-limit); messages 543 / 547 suppressed | Future datetimes blocked with messages 543 / 547 |
| Future Specimen Warning | `FUTURE_SPECIMEN_WARNING_ENABLED` | Warns (but allows) when specimen datetime is in the future | Messages 546 / 550 prompted — user can proceed or cancel | No warning shown |
| Collection Date Expiry Check | `COLLECTION_DATE_EXPIRE_CHECK_CRITERIA` | Warns when collection datetime is too far in the past | Message 683 or 684 prompted depending on `option_text` suffix | No expiry warning |
| Days Allowed Since Collection | `DAYS_ALLOWED_SINCE_SPECIMEN_COLLECTION` | Warns when collection datetime is more than N days before arrival datetime | Message 682 prompted when difference exceeds `option_value` days | No days-gap warning |

*Source: `LAB_OPTION` table, `option_group = 'REQUEST_REGISTRATION'`*

---

## Related Workflows

- [[Amend Request Validation]] — Datetime validation runs as part of the overall validation sequence when the Amend button is clicked.
