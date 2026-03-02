# Validation – Message 1515: Missing Anchor Time Flag

## Overview

When the user attempts to save a DFT request, the system checks that at least one row on the DFT Panel carries the anchor time flag. The anchor time flag is the baseline point from which all other collection datetimes in the sequence are measured. If no such row is present, message 1515 is displayed and the save is blocked.

---

## Related User Stories

- **[[CRST-751]]** - Registration - DFT Time Sequence Panel - Message 1515

**Epic:** LISP-23 [CRST][DEV] Registration - Patient Handling

---

## Trigger Point

Occurs when the user clicks **Save** on the DFT Registration screen. The check applies to all three DFT test series: DFTT, DFTS, and DFTC.

---

## Message Text

> `Request with Time Flag "0" doesn't exist, Please vertify it before saving!`

---

## Anchor Time Flag by Series

The anchor time flag — the value that must exist before saving — differs by test series:

| DFT Series | Anchor Time Flag Value | Notes |
|------------|----------------------|-------|
| DFTT (Timed) | 0 | The row with Time Flag **0** is the base of the sequence |
| DFTC (Custom) | 0 | The row with Time Flag **0** must be manually added by the user |
| DFTS (Sample) | 1 | The row with Time Flag **1** is the base of the sequence; the message text still references "0" but the anchor is 1 for this series |

> **Important:** For DFTT and DFTS, the time flags available on the panel are determined by the test's attribute configuration in the test dictionary. If the configured attribute list does not include the anchor value (0 for DFTT, 1 for DFTS), message 1515 will always be shown for that test — the user cannot satisfy the requirement regardless of data entry.

---

## Behaviour When Triggered

1. The system evaluates all rows on the DFT Panel at save time.
2. If no row with the anchor time flag is found among rows that have a Request No. assigned, message 1515 is displayed.
3. The user clicks **OK** to dismiss the message.
4. The DFT Panel remains open and fully editable; no data is cleared.
5. The save is not performed.

---

## Interaction Behaviours

#### User clicks Save — anchor time flag row missing
The system blocks the save and displays message 1515. The panel remains in its current state with all previously entered data intact.

#### User clicks OK on message 1515
The message panel closes. The DFT Panel is still active and editable. The user must add or correct a row so that the anchor time flag is present before attempting to save again.

---

## Business Rules

1. The anchor time flag row must have a Request No. assigned; a row with the anchor time flag value but no Request No. does not satisfy this requirement.
2. For DFTT and DFTS, the set of valid time flag values is fixed by the test attribute configuration and cannot be modified on the panel. If the anchor value is not in the configured set, saving will always fail for that test.
3. For DFTC, the user manually enters time flag values, so the user is responsible for adding a row with Time Flag 0 before saving.
4. This validation runs before all other save-time validations; if it fails, no further validation checks are performed on that save attempt.

---

## Related Workflows

- [[DFT Panel Enablement - DFTT]] — Describes how rows are enabled/populated for the DFTT series.
- [[DFT Panel Enablement - DFTS]] — Describes how rows are enabled/populated for the DFTS series.
- [[DFT Panel Enablement - DFTC]] — Describes how rows are enabled/populated for the DFTC series.
- [[Validation - Message 1466 (Invalid Time Flag)]] — A related save-time validation for DFTC that checks for invalid or missing time flag values on individual rows.
