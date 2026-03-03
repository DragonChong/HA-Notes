---
epic: LISP-262
status: draft
---
# Not Supported Lab Message

## Overview

When a request number is entered on the Add/Delete Test screen, the system checks whether the identified laboratory is supported. If the lab is not supported, one of two messages is displayed depending on the reason: a configurable "prompt" message for labs excluded via a lab option setting, or a hard-stop message for requests belonging to APS (Anatomical Pathology Lab), which is not supported on this screen. Both messages prevent the user from proceeding with the selected request.

---

## Related User Stories

- **[[CRST-1018]]** — Add Delete Test — Not Supported Lab Message

**Epic:** LISP-262 [CRST][DEV] Add/Delete Test — Request Retrieval

---

## Messages

### Message 4134 — Prompt for Not Supported Lab

| Property | Detail |
|---|---|
| **Message Code** | 4134 |
| **Trigger** | The identified lab is **not** in the list of supported labs defined by the `SCREEN_NOTSUPPORTLABS` lab option |
| **Lab Option** | `lab_option` where `option_group = 'REQUEST_REGISTRATION'` and `option_code = 'SCREEN_NOTSUPPORTLABS'`; the option value contains the list of labs excluded from this screen via `PROMPT_REQUEST_NOT_SUPPORTED_LAB` |
| **User Options** | Dismiss (OK) |
| **Outcome** | The request is not loaded; the user must enter a different request number |

---

### Message 3675 — Not Supported Lab (APS)

| Property | Detail |
|---|---|
| **Message Code** | 3675 |
| **Trigger** | The identified lab is **APS** (Anatomical Pathology Lab) — hardcoded as unsupported on this screen |
| **Configuration** | Not configurable; APS is unconditionally excluded |
| **User Options** | Dismiss (OK) |
| **Outcome** | The request is not loaded; the user must enter a different request number |

---

## Business Rules

1. Message 4134 is driven by the `SCREEN_NOTSUPPORTLABS` lab option and applies to any lab explicitly listed as not supported for this screen.
2. Message 3675 applies specifically to APS requests and is not configurable — it is always triggered for APS regardless of lab option settings.
3. Both messages result in the same outcome: the request is rejected and the screen remains in its initial state.
4. The two checks are independent; a non-APS lab can trigger message 4134 if it is in the unsupported lab list, and APS always triggers message 3675.

---

## Configuration

| Setting | Option Code | Source Table | Purpose | Effect When Configured |
|---------|------------|--------------|---------|----------------------|
| Screen Not Supported Labs | `SCREEN_NOTSUPPORTLABS` | `LAB_OPTION` (`option_group = 'REQUEST_REGISTRATION'`) | Lists labs that are not supported on this screen | Displays message 4134 when a request from one of these labs is entered |

---

## Related Workflows

- [[Retrieve Request]] — Not Supported Lab checking occurs during the request retrieval workflow.
- [[Laboratory Selection]] — Lab identification precedes this check.
