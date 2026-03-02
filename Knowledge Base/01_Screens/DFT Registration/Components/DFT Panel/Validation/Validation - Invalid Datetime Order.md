# Validation – Message 1467: Invalid Collection Datetime Sequence Order

## Overview

When the user attempts to save a DFT request, the system validates that the collection datetimes entered across all DFT Panel rows are in non-decreasing order — that is, each subsequent row in the sequence must have a collection datetime that is the same as or later than the previous row's datetime. If any row's datetime is earlier than the one before it, message 1467 is displayed identifying the specific request, and the save is blocked.

---

## Related User Stories

- **[[CRST-755]]** - Registration - DFT Time Sequence Panel - Message 1467

**Epic:** LISP-23 [CRST][DEV] Registration - Patient Handling

---

## Trigger Point

Occurs when the user clicks **Save** on the DFT Registration screen. This validation runs after the anchor time flag check ([[Validation - Missing Time Flag 0]]) has passed.

---

## Message Text

> `Invalid Collection Datetime of Request [(Request no.)]. Please verify before save.`

The placeholder `(Request no.)` is replaced with the actual request number of the row whose datetime is out of order.

---

## Trigger Conditions by Series and Configuration

Whether message 1467 is triggered depends on the DFT test series and the state of the automatic datetime calculation options:

| AUTO_CALC Enabled | Force Recalc Enabled | DFTT triggers 1467? | DFTS triggers 1467? | DFTC triggers 1467? |
|------------------|---------------------|---------------------|---------------------|---------------------|
| Yes | No | **Yes** | **Yes** | **Yes** |
| No | Yes | **Yes** | **Yes** | No |
| Yes | Yes | **Yes** | **Yes** | No |
| No | No | **Yes** | **Yes** | No |

**Summary of rules:**
- **DFTT and DFTS** always validate datetime sequence order, regardless of option settings.
- **DFTC** only validates datetime sequence order when **AUTO_CALC is enabled** and **Force Recalculation is disabled**. Under all other option combinations, DFTC does not receive this check.

> **Reason:** When DFTC has Force Recalculation enabled (together with AUTO_CALC), the system already silently recalculates all datetimes in order — so the sequence is guaranteed to be valid. When AUTO_CALC is disabled, DFTC users enter datetimes freely and the ordering is not enforced.

---

## Behaviour When Triggered

1. The system checks all rows in sequence order at save time.
2. For each row with a Request No., the system compares its collection datetime to the row before it.
3. If any row's collection datetime is earlier (by even one minute) than the previous row's datetime, message 1467 is displayed, identifying the out-of-order row's Request No.
4. The user clicks **OK** to dismiss the message.
5. Focus moves to the **Collection Date/Time** field of the row that triggered the message.
6. The DFT Panel remains open and editable; no data is cleared.
7. The save is not performed.
8. Validation stops at the first out-of-order row found; subsequent rows are not checked until the user retries saving.

---

## Interaction Behaviours

#### User clicks Save — a row's collection datetime is earlier than the previous row's
The system blocks the save and displays message 1467, showing the Request No. of the offending row.

#### User clicks OK on message 1467
The message panel closes. The cursor moves to the Collection Date/Time field of the row that caused the error. The user must correct the datetime to be equal to or later than the preceding row's datetime before saving again.

---

## Business Rules

1. Datetime comparison is performed in minutes — a difference of less than one minute in the wrong direction triggers the message.
2. Rows without a Request No. are skipped during this check.
3. Rows without a collection datetime are also flagged as invalid for DFTT and DFTS series (a row with a Request No. must have a collection datetime).
4. DFTC rows with no collection datetime are handled separately — they do not trigger message 1467 for DFTC; the time flag validation ([[Validation - Invalid Time Flag]]) is the primary save-time guard for DFTC rows.
5. Validation stops at the first failing row; the user must fix and retry to discover any further out-of-order rows.
6. For DFTT and DFTS, the cascade recalculation prompt ([[Validation - Cascade Datetime Prompt]]) may help users maintain correct ordering by auto-calculating datetimes from the anchor row.

---

## Related Workflows

- [[DFT Panel - DFTT]] — Describes how DFTT row datetimes are populated.
- [[DFT Panel - DFTS]] — Describes how DFTS row datetimes are populated.
- [[DFT Panel - DFTC]] — Describes how DFTC row datetimes are entered manually.
- [[Validation - Missing Time Flag 0]] — The first save-time validation; must pass before message 1467 is evaluated.
- [[Validation - Invalid Time Flag]] — Save-time validation for DFTC that checks for missing time flag values.
- [[Validation - Cascade Datetime Prompt]] — Edit-time prompt that recalculates datetimes from the anchor row, which helps prevent this error.
