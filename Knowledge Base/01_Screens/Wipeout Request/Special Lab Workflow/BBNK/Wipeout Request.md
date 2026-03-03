---
epic: LISP-256
status: draft
---
# BBNK - Wipeout Request

## Overview

When a BBNK request is wiped out, the system packages additional BBNK-specific data alongside the standard wipeout request fields before sending to the server. The key BBNK-specific field is whether the patient's historical Blood Bank data should be deleted as part of the wipeout, a decision that was captured in the [[BBNK - Ask for Confirmation]] step.

---

## Related User Stories

- **[[CRST-1004]]** — Wipeout Request — BBNK: Wipeout Request

**Epic:** LISP-256 [CRST][DEV] Wipeout Request — Special Lab Workflow (BBNK)

---

## Trigger Point

This step occurs during the Process Save phase (step 6) of the wipeout pipeline, as the request package is being assembled. The BBNK-specific fields are appended to the standard request package.

---

## Additional Request Packing (BBNK)

In addition to the base request package (see [[Wipeout Request (Action)]]), BBNK requests include the following extra field:

| Request Packing Field | Data | Source |
|---|---|---|
| Is Delete Historical Patient Data Needed | Whether to delete the patient's historical Blood Bank data as part of this wipeout | Determined by the user's response to message 1659 in [[BBNK - Ask for Confirmation]] |

### Value Determination

| User Response to Message 1659 | Field Value |
|---|---|
| Yes — delete historical data | `true` |
| No — keep historical data | `false` |
| Message 1659 not prompted (patient has more than one request) | `false` (default) |

---

## Business Rules

1. The `Is Delete Historical Patient Data Needed` flag is always included in the BBNK wipeout request package — it defaults to `false` if message 1659 was not prompted.
2. The actual deletion of historical patient data is performed server-side when the flag is `true`; the client only sends the flag.
3. No other BBNK-specific fields are added to the request package beyond the standard base fields.

---

## Related Workflows

- [[BBNK - Ask for Confirmation]] — The step that determines the value of the historical data deletion flag.
- [[BBNK - Wipeout Message]] — The completion messages shown after successful BBNK wipeout.
- [[Wipeout Request (Action)]] — The main wipeout pipeline and the base request package contents.
