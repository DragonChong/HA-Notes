# HKID Input Field

## Overview

The **HKID Input Field** is a shared text input component used wherever a Hong Kong Identity Card (HKID) number must be entered in the system. It enforces HKID format rules, validates the check digit, and — depending on system configuration — can automatically calculate a missing check digit when the user types a placeholder character. When the user finishes entering an HKID and moves focus away, the field may also check whether the identity card number has been merged or amended in the Patient Administration System and prompt the user to switch to the current identity card number before proceeding.

---

## Related User Stories

- **[[CRST-93]]** - Registration - Retrieve PMI Patient by HKID
- **[[CRST-94]]** - Registration - New Case Number for Existing Patient by HKID

**Epic:** LISP-23 [CRST][DEV] Registration - Patient Handling

---

## Visual Layout

The component appears as a single-line text input field. It accepts uppercase characters only and enforces a maximum length of 12 characters. There are no additional visual elements beyond the field itself and standard field-level error indicators. The field is embedded within the screen that uses it — it does not open any additional panel on its own.

---

## Input Rules

| Rule | Detail |
|------|--------|
| Character case | Input is automatically converted to uppercase |
| Maximum length | 12 characters |
| Accepted format | 1–2 letters followed by 6 digits followed by 1 check digit character (e.g., A123456(7)) |
| Check digit characters | 0–9 or the letter A |
| Bypass prefix | An HKID beginning with `%` bypasses format and check digit validation (used for special system entries) |

---

## Behaviour on Focus-Out

When the user finishes entering a value and moves focus away from the field, the following steps occur in order:

1. Leading and trailing whitespace is removed from the entered value.
2. If the field is empty, no further action is taken and focus proceeds normally.
3. If automatic check digit generation is enabled (see Configuration) and the user typed `X` as the last character, the system calculates the correct check digit and replaces the `X` automatically.
4. If the HKID merge check is active (see Configuration), the system looks up the entered identity card number to determine whether it has been merged into or linked to a different identity card number in the Patient Administration System.
   - If a link is found, the user is prompted to confirm whether to switch to the current identity card number (Message 2155). Answering **Yes** updates the field to the linked number. Answering **No** retains the originally entered number.
   - If no link is found, the field retains the entered number.
5. The field signals to the host screen that the entry is complete, allowing the screen to proceed with patient lookup.

---

## Validation

### Check Digit Validation

The field can validate the check digit of an entered HKID on demand. The validation follows the official weighted-sum algorithm:

- The entered value must match the pattern: 1–2 letters + 6 digits + 1 check digit.
- If the check digit is correct, validation passes silently.
- If the check digit is incorrect, an error message is displayed (Message 2643) unless the caller has suppressed error display.
- A value beginning with `%` always passes validation (bypass mode).
- An empty value always passes validation.

### Patient Sub-ID Validation

The field supports a secondary check to verify whether a patient sub-identifier (used in specific hospital configurations) already exists in the system. If the sub-identifier is found, an error message is displayed to the user (Message 3598).

---

## Configuration

| Setting | Purpose | Effect when enabled | Effect when disabled |
|---------|---------|--------------------|--------------------|
| Decode Check Digit (Main) | Controls whether the system auto-calculates a missing check digit | Typing `X` as the last character causes the field to replace it with the calculated check digit on focus-out | No automatic check digit generation; user must enter the check digit manually |
| HKID Merge (Patient) | Controls whether the field checks for merged or amended identity card numbers in the Patient Administration System | On focus-out, the system looks up the HKID and prompts if a linked number is found | No merge check performed; the entered number is accepted as-is |
| HKID Merge (per screen) | Allows individual screens to override the global merge setting | The screen can disable the merge check even when the global setting is enabled | The screen can force the merge check even when the global setting is disabled |
| Hospital-specific features | Enables hospital-specific HKID handling (e.g., for certain hospitals with extended patient lookup behaviour) | Additional lookup logic is applied on focus-out | Standard lookup logic only |

---

## Error Messages and System Prompts

| Message | Text (or description) | Trigger | User Options |
|---------|-----------------------|---------|--------------|
| 2155 | Notifies the user that the entered identity card number has been merged or linked to a different number, and asks whether to use the current number | HKID merge check finds a linked or amended identity card number on focus-out | Yes (switch to linked number) / No (keep entered number) |
| 2643 | Invalid check digit for the entered HKID | Check digit validation fails | OK (dismiss; user corrects the entry) |
| 3598 | The patient sub-identifier already exists in the system | Patient sub-ID existence check finds a duplicate | Configurable by the calling screen |

---

## Related Workflows

- [[Retrieve Patient by HKID]] — The HKID Input Field is the primary entry point for this workflow; check digit validation and merge checking occur as part of the HKID entry step.
- [[Create New Patient by HKID]] — The same field is used when creating a new patient record; the merge check ensures the user is not inadvertently creating a duplicate.
- [[Patient Selection Dialogue]] — Displays results after a valid HKID is entered and existing patient records are found.
