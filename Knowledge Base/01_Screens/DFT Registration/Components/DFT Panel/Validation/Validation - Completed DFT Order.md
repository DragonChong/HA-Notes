# Validation – Message 1509: Previously Completed DFT Order Within Checking Period

## Overview

When a user registers a DFT request for a patient, the system can check whether that patient already has a recently completed DFT order for the same test profile. If a completed order is found whose collection datetime falls within a configurable checking period, message 1509 is displayed to warn the staff that a recent DFT has already been performed and they should consult the laboratory before proceeding. The registration screen is automatically cleared when this message is shown.

---

## Related User Stories

- **[[CRST-756]]** - Registration - DFT Registration - Message 1509

**Epic:** LISP-23 [CRST][DEV] Registration - Patient Handling

---

## Trigger Point

Occurs when the user enters a DFT test code and confirms the collection datetime during patient registration. The check runs if the **Checking Period for Complete DFT Request** (`CHECKING_PERIOD_FOR_COMPLETE_DFT_REQ`) lab option is enabled.

---

## Message Text

> `This patient has previous DFT request which is ready or printed within (define by lab_option.option_text). Please contact the technical staff in laborary before process registration.`

The phrase `(define by lab_option.option_text)` in the message is replaced at runtime with the configured checking period value (expressed in days).

---

## Check Conditions

The system identifies a recently completed DFT order when all of the following are true:

| Condition | Description |
|-----------|-------------|
| Checking period option enabled | The `CHECKING_PERIOD_FOR_COMPLETE_DFT_REQ` lab option is active and has a value configured |
| Same test profile | The DFT test code being registered matches the profile of the completed order |
| Order is complete | The previous DFT order is marked as fully complete |
| Within checking period | The completed order's collection datetime falls within the defined number of days before the new registration's collection datetime |

The period window is: any completed order whose collection datetime is on or after `(new collection datetime − checking period days)` and on or before the new collection datetime.

---

## Automatic Screen Clearing

> **Important:** Unlike most other DFT validation messages, message 1509 causes the registration screen to be **automatically cleared before the user dismisses the message**. When the user sees the prompt, the screen has already been reset to a blank state.

---

## Behaviour When Triggered

1. After the user enters the DFT test code and confirms the collection datetime, the system evaluates the completed order history.
2. If a completed order for the same profile is found within the checking period, the registration screen is automatically cleared.
3. Message 1509 is displayed, advising the user to contact the laboratory before proceeding.
4. The user clicks **OK** to dismiss the message.
5. The message panel closes. The registration screen remains blank (already cleared before the message appeared).
6. The user must restart the registration process if they wish to continue.

---

## Interaction Behaviours

#### User enters a DFT test code and collection datetime — completed order found within period
The registration screen is cleared automatically. Message 1509 is displayed, identifying the situation and advising staff to contact the laboratory.

#### User clicks OK on message 1509
The message panel closes. The registration screen remains blank. No DFT order is saved.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|------------|---------|--------------------|--------------------|
| Checking Period for Complete DFT Request | `CHECKING_PERIOD_FOR_COMPLETE_DFT_REQ` | Defines the number of days back to check for a completed DFT order for the same patient and profile | System checks for recent completed orders; message 1509 and screen clear triggered if found | Check is not performed; no warning is shown for recently completed orders |

The number of days in the checking period is stored as a value in the option text of the `CHECKING_PERIOD_FOR_COMPLETE_DFT_REQ` lab option record.

---

## Business Rules

1. This check only applies when the `CHECKING_PERIOD_FOR_COMPLETE_DFT_REQ` lab option is enabled and has a period value configured.
2. The check is for **completed** DFT orders only. Active (incomplete) DFT orders are handled by [[Validation - Active DFT Order]].
3. The screen is cleared **before** the user dismisses the message — this is intentional and prevents the user from accidentally saving a duplicate DFT order.
4. The checking period is measured in days and is compared against the collection datetime of the previous completed order, not its registration date.
5. The purpose of the message is to prompt staff to check with the laboratory whether a new DFT is actually required, given that a recent one has been completed.

---

## Related Workflows

- [[Validation - Active DFT Order]] — Handles the complementary case where a DFT order is still active (not yet complete) for the same patient and profile.
- [[DFT Panel - DFTT]] — Describes the standard registration flow for DFTT tests.
- [[DFT Panel - DFTS]] — Describes the standard registration flow for DFTS tests.
- [[DFT Panel - DFTC]] — Describes the standard registration flow for DFTC tests.
