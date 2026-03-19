# Request Number Input

## Overview

The Request Number Input is a single-line text field used throughout the LIS CRS application whenever a user needs to enter or scan a lab request number. It accepts a short, abbreviated code (e.g., sequence number only, or partial format) and automatically validates, formats, and expands the input into the full standard request number (e.g., `25A1234560`). During server-side verification, the field is locked and displays a loading indicator. On success it updates itself with the correctly formatted number; on failure it shows an appropriate error message and returns focus to the field for re-entry.

The component is shared across multiple CRS screens and is exported from `@lis/lis-hub-lib` as `RequestNumberInput`.

---

## Component Modes

The component selects a verification strategy (called an executor) at mount time, based on the current lab's specimen ID configuration. The executor determines the accepted input format and maximum length.

| Mode | When It Applies | Max Length | Notes |
|---|---|---|---|
| **Standard** | No specimen ID option configured, or option value is 0 | 10 characters | Format: `YY` + lab prefix + sequence (e.g., `25A0001234`) |
| **USID — 10-digit only** | Lab SPECIMEN_ID option = USID type; registration mode = 10-digit only | 10 characters | USID format, 10-character |
| **USID — 12-digit only** | Lab SPECIMEN_ID option = USID type; registration mode = 12-digit only | 12 characters | USID format, includes hospital identifier |
| **USID — All** | Lab SPECIMEN_ID option = USID type; registration mode = accept both | 12 characters | Both 10- and 12-character USID accepted |
| **BTH_SID** | Lab SPECIMEN_ID option = BTH_SID type; mode = enabled | Determined by executor | BTH_SID barcode format |

---

## Visual Layout

The component renders as a single-line text input using the standard CMS `TextField` component. It consists of a label above the field (supplied by the parent form), a text input area, and a trailing icon on the right side.

The trailing icon changes based on state:

- **Idle**: A clear (✕) icon button. Clicking it empties the field and returns keyboard focus.
- **Verifying**: A small circular progress spinner. The field is read-only and the button is disabled while verification is in progress.

Input is always displayed and stored in uppercase regardless of how the user types.

---

## Interaction Behaviours

#### User types a value into the field

The component converts input to uppercase as each character is entered. The value is stored internally but is not yet validated against the server.

#### Verification is triggered (typically on blur or Enter key, initiated by the parent screen)

The parent screen calls `verifyAndFormatRequestNo()` via the component's ref. The component then:

1. Trims the input to the maximum allowed length.
2. Sets the field to read-only and shows the loading spinner.
3. Parses the input to extract the two-digit year prefix, lab prefix, and sequence number.
4. If the parsed request number passes local format checks, calls the backend to confirm the request exists and is not archived.
5. On a successful server response, updates the field with the fully formatted request number and returns `true` to the caller.
6. On any failure, shows an error message (if `popupMessageOnError` is enabled), returns keyboard focus to the field for re-entry, and returns `false` to the caller.

#### User clicks the clear (✕) button

The field value is cleared, the parent `onChange` callback is called with an empty string, and keyboard focus is returned to the input field immediately.

#### Input is empty when verification is triggered

An empty field is treated as valid. The component resolves `true` without calling the server or showing any error, supporting optional request number fields.

#### Check digit fails, and the lab has registered-request checking enabled

When the lab option `REGISTERED_REQ_CHECK_ENABLED` is active, a locally failed check digit does not immediately reject the input. Instead, the component still calls the backend. If the server confirms the request exists and is not archived, the check digit failure is overridden and the input is accepted.

#### The server reports the request is archived

An error message (code 1522) is shown with the request number as a parameter. The field retains the entered value for the user to correct.

---

## Buttons and Actions

### Clear (✕)

**When visible**: When the field is idle — not currently verifying.
**What it does**: Clears the field value, notifies the parent via `onChange`, and restores keyboard focus to the input. The button suppresses the default `mousedown` behaviour so the field does not lose focus before the click registers.

### Loading Spinner

**When visible**: While server-side verification is in progress, from the moment verification is triggered until the server response is received.
**What it does**: Non-interactive; its presence signals that the field is busy. The field is also read-only during this period to prevent concurrent input.

---

## Configuration

| Setting | Option Group | Option Code | Effect when enabled | Effect when disabled |
|---|---|---|---|---|
| Registered Request Check | `REQUEST_NUMBER` | `REGISTERED_REQ_CHECK_ENABLED` | A request number with a failed check digit still triggers a cross-lab server lookup; accepted if the server confirms it exists | Check digit failure immediately rejects the input; no server call is made |
| Specimen ID — USID | Lab specimen option | `SPECIMEN_ID` = `USID` | Component uses the USID executor; USID-format input accepted | Standard request number executor is used |
| Specimen ID — BTH_SID | Lab specimen option | `SPECIMEN_ID` = `BTH_SID` | Component uses the BTH_SID executor | Standard request number executor is used |
| USID Registration Mode | Lab USID enable option | *(source: lab specimen enable option value)* | Determines whether 10-digit only, 12-digit only, or both USID lengths are accepted | USID executor is not instantiated; falls back to standard mode |
| Cross-Lab Requests | Component prop `isCrossLabReq` | *(source: parent prop)* | Lab prefix lookup uses the cross-lab registration lab number; cross-lab request formats are included | Only the current lab's request formats are considered |

---

## Error Messages and System Prompts

| Code | Description | Trigger | User Options |
|---|---|---|---|
| 774 | Invalid input | The entered value cannot be parsed as any recognised request number format | OK — dismisses; focus returns to field |
| 885 | Invalid check digit | The computed check digit does not match the one in the input, and `REGISTERED_REQ_CHECK_ENABLED` is off (or the server did not confirm existence) | OK — dismisses; focus returns to field |
| 1522 | Request is archived | Server confirms the request number exists but is archived or unavailable | OK — dismisses; focus returns to field |
| 2772 | Invalid request format | The parsed lab prefix does not match any configured request format for the current lab | OK — dismisses; focus returns to field |

> When the `popupMessageOnError` prop is `false`, errors are handled silently — the message box is suppressed, but focus still returns to the field and `verifyAndFormatRequestNo` still resolves `false`.

---

## Props Reference

| Prop | Type | Default | Purpose |
|---|---|---|---|
| `isCrossLabReq` | `boolean` | `false` | Enables cross-lab request number formats and cross-lab server checks |
| `isRetrievalOnly` | `boolean` | `true` | Signals retrieval-only mode to executors; affects USID hospital identifier handling |
| `typographicCase` | `boolean` | `true` | Converts input to uppercase as the user types |
| `popupMessageOnError` | `boolean` | `true` | When `true`, shows a message box on validation failure; when `false`, handles errors silently |
| `value` | `string` | `""` | Initial field value |
| `onChange` | `(value: string) => void` | — | Called on each keystroke and when the field is cleared |
| `onBlur` | `FocusEvent handler` | — | Called when the field loses focus |
| `handleKeyDown` | `KeyboardEvent handler` | — | Called on key press; typically used by the parent to trigger verification on Enter |

All standard CMS `TextField` props (label, disabled, size, placeholder, helperText, etc.) are also forwarded to the underlying input.

---

## Ref Methods

The component exposes an imperative handle via `React.forwardRef`. Key methods for parent screens:

| Method | Returns | Description |
|---|---|---|
| `verifyAndFormatRequestNo(input, allowCluster?, isRetrieveReqInfo?, verifyOnly?)` | `Promise<boolean>` | Full async validation pipeline: formats input, calls backend, shows error if needed. The main method called by parent screens. |
| `setRequestNo(value)` | `void` | Programmatically sets the field value without triggering validation. |
| `setcurrentRequestLab(labNo)` | `void` | Changes the active lab context; the executor re-initialises on the next render cycle. |
| `getRequestNo()` | `string` | Returns the current field value synchronously via ref (not from React state). |
| `getErrorCode()` | `number \| null` | Returns the last error code (`774`, `885`, `1522`, `2772`) or `null` if the last verification succeeded. |

---

## Data Saved

This component does not write data to the database. It validates and formats a request number string and returns the result to the parent screen via the `onChange` callback and the `verifyAndFormatRequestNo` method. The parent screen is responsible for all subsequent data operations.

---

## Related Workflows

- [[CRS Request Retrieval Workflow]] — The Request Number Input is the primary entry point for retrieving an existing lab request by number.
- [[CRS Spec-Ack Workflow]] — Used to enter the request number on the specimen acknowledgement screen.
