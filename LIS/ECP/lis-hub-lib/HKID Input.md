# HKID Input

## Overview

The HKID Input is a single-line text field used to enter a patient's Hong Kong Identity Card number. It accepts input up to 12 characters, converts it to uppercase automatically, and validates the check digit when the user finishes editing. If the lab option for HKID merging is enabled, the component also calls the PAS (Patient Administration System) to check whether the entered HKID has been linked, changed, or merged to a different identity — and prompts the user to follow the chain to the current HKID if so. During any asynchronous PAS check, the field is locked and displays a loading indicator.

The component is available from `@lis/lis-hub-lib` as `HkidInput`. It is ported from the legacy `LisHkidTextInputPm.as` in LIS Flex.

---

## Visual Layout

The component renders as a single-line CMS `TextField` with a trailing icon on the right side of the field:

- **Idle**: A clear (✕) icon button. Clicking it empties the field.
- **Checking (PAS lookup in progress)**: A small circular progress spinner. The field is read-only and the button is disabled while the check is running.

An inline error message appears below the field when check digit validation fails (if the `logBubble` flag is set on message code 2643).

---

## Interaction Behaviours

#### User types into the field

Each character is converted to uppercase as it is entered. Input beyond 12 characters is silently ignored.

#### User leaves the field or presses Enter after making a change

The component runs `checkAndValidate()`, which performs two steps in sequence:

**Step 1 — HKID merge check** (only if merge is applicable):
If the entered HKID is non-empty and HKID merging is active (either the lab option `MERGE_IND` is enabled and `hkidMergeEnabled` is `true`, or `hkidMergeForceCheckEnabled` is `true`), the component:
1. Sets the field to read-only and shows the loading spinner.
2. Calls the PAS `checkHkid` API with the entered HKID.
3. Receives the PAS amendment log and determines the amendment status.
4. If the HKID has been linked, changed, or merged to a new HKID, displays prompt **2155** with the original HKID, the status, and the target HKID, asking the user whether to follow the change.
   - If the user selects **Yes**: the component recursively repeats the merge check for the target HKID until it reaches the current one.
   - If the user selects **No**: the field retains the originally entered HKID unchanged.
5. Releases the read-only lock.

**Step 2 — Check digit validation** (only if `autoVerifyCheckDigit` is `true`):
The component validates the check digit of the current field value using the standard HKID algorithm. If validation fails:
- If `selectForVerifyFail` is `true`, the field text is selected for easy re-entry.
- Error message **2643** is displayed with the entered HKID as a parameter.
- If message 2643 has a `logBubble` flag, an inline error state and helper text are shown beneath the field.

#### User focuses the field when it is already in an error state

If `selectForVerifyFail` is `true` and the field is currently in an error state, the field text is automatically selected on focus, making it easy to retype.

#### User clicks the clear (✕) button

The field value is cleared, the parent `onChange` callback is called with an empty string, and keyboard focus is returned to the field. The button is suppressed while a PAS check is in progress (`readOnly` state).

#### Field value is empty

An empty field or one beginning with `%` passes check digit validation without error. The merge check is also skipped for empty input.

---

## Buttons and Actions

### Clear (✕)

**When visible**: When the field is idle (not performing a PAS check).
**What it does**: Clears the field value, notifies the parent via `onChange`, and returns keyboard focus to the input. Suppresses `mousedown` default to prevent the field from losing focus before the click registers.

### Loading Spinner

**When visible**: During an active PAS HKID merge check, from the time the check begins until the server response is received and any prompted action is resolved.
**What it does**: Non-interactive indicator. The field is also read-only during this period.

---

## Configuration

| Setting | Option Group | Option Code | Effect when enabled | Effect when disabled |
|---|---|---|---|---|
| HKID Merge | `PATIENT` | `MERGE_IND` | PAS merge check runs on blur/Enter when `hkidMergeEnabled` prop is also `true` (the default) | Merge check skipped regardless of prop value |
| `hkidMergeEnabled` prop | *(source: parent component prop; default: `true`)* | — | Permits the merge check to run when the lab option is enabled | Suppresses the merge check even if the lab option is on; used by screens where merging should not happen |
| `hkidMergeForceCheckEnabled` prop | *(source: parent component prop; default: `false`)* | — | Forces the merge check to run regardless of the lab `MERGE_IND` option | No effect |
| `autoVerifyCheckDigit` prop | *(source: parent component prop; default: `true`)* | — | Check digit validated on modified-and-blur | Check digit not validated; field accepts any value |
| `selectForVerifyFail` prop | *(source: parent component prop; default: `true`)* | — | Field text is selected on focus and immediately after a failed check digit so the user can retype easily | No auto-selection |

---

## Check Digit Algorithm

The check digit is the last character of the HKID (e.g., the `A` in `A123456(A)`). The algorithm:

1. Pads a single-letter prefix with a leading space to produce a 9-character string.
2. Assigns weighted values to each position (weights 9 down to 3 for positions 0–6).
3. Letter characters are converted to numeric values (`A`=10, `B`=11, … `Z`=35; space=36).
4. Computes the remainder of the sum divided by 11, then looks up the check character from `"123456789A0"`.
5. Matches the computed character against the last character of the input.

An empty string or a value beginning with `%` is treated as valid without running the algorithm.

---

## Error Messages and System Prompts

| Code | Description | Trigger | User Options |
|---|---|---|---|
| 2643 | Invalid check digit | Check digit of the entered HKID does not match the computed value | OK — dismisses; field text may be selected for re-entry depending on `logBubble` flag and `selectForVerifyFail` setting |
| 2155 | HKID linked / changed / merged | PAS confirms the entered HKID has an amendment record pointing to a different current HKID | Yes — follow the chain to the target HKID (merge check repeats recursively); No — keep the entered HKID as-is |

---

## Props Reference

| Prop | Type | Default | Purpose |
|---|---|---|---|
| `hkidMergeEnabled` | `boolean` | `true` | Allows HKID merge check to run when the lab option is enabled |
| `hkidMergeForceCheckEnabled` | `boolean` | `false` | Forces merge check regardless of lab option |
| `autoVerifyCheckDigit` | `boolean` | `true` | Validates check digit on modified-and-blur |
| `selectForVerifyFail` | `boolean` | `true` | Selects the field text when check digit fails or when focusing an error field |
| `customError` | `boolean` | `false` | When `true`, the parent's `error` and `helperText` props are used instead of the component's own inline validation state |
| `error` | `boolean` | — | External error state; only applied when `customError` is `true` |
| `helperText` | `string` | — | External helper text; only applied when `customError` is `true` |
| `onChange` | `(value: string) => void` | — | Called on each keystroke and on clear with the current uppercase value |
| `onBlur` | `(value: string) => void` | — | Called when the field loses focus; receives the current field value as a string |
| `label` | `string` | — | Field label displayed above the input |
| `autoFocus` | `boolean` | `false` | Automatically focuses the field on mount |
| `handleKeyDown` | `KeyboardEventHandler` | — | Called on any key press |

All standard CMS `TextField` props (size, id, placeholder, sx, etc.) are also forwarded to the underlying input.

---

## Ref Methods

| Method | Returns | Description |
|---|---|---|
| `getValue()` | `string` | Returns the current field value |
| `setValue(val)` | `void` | Sets the field value and immediately runs check digit validation |
| `focus()` | `void` | Programmatically sets keyboard focus to the input field |
| `validateCheckDigit` | function reference | Exposes the standalone check digit validation function for external use |

---

## Data Saved

This component does not write data to the database. It collects and validates an HKID string and surfaces it to the parent screen via `onChange`, `onBlur`, and the `getValue()` ref method. Any data operations the parent performs on the resolved HKID are the parent's responsibility.

---

## Related Workflows

- [[CRS Registration Workflow]] — The HKID Input is used during patient registration to identify the patient by identity card number.
- [[CRS Request Retrieval Workflow]] — The HKID Input may be used to retrieve existing requests by patient HKID.
