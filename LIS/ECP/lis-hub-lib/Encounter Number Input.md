# Encounter Number Input

## Overview

The Encounter Number Input is a single-line text field used to enter a patient's hospital encounter (episode or admission) number. It accepts free-form alphanumeric input up to 15 characters and automatically converts input to uppercase. The field fires a modified-and-blur event only when the user has made a change since the last submission — preventing redundant business logic calls when the field is navigated through without editing. An optional utility function, `checkHkidOfEncounterNo`, is available to cross-check the entered encounter number against a patient's HKID after entry.

The component is available from `@lis/lis-hub-lib` as `EncounterNumber`.

---

## Visual Layout

The component renders as a standard single-line CMS `TextField`. All standard field properties — label, placeholder, helper text, error state, size, and disabled state — are accepted as props and rendered by the underlying text field.

There are no trailing icons or loading states built into this component. Any additional adornments must be provided by the parent screen via the standard `TextField` prop API.

---

## Interaction Behaviours

#### User types into the field

Each character is trimmed and converted to uppercase as it is entered. Input beyond 15 characters is silently ignored — the field does not accept additional characters once the limit is reached.

#### User leaves the field (blur) after making a change

The `onModifiedAndBlur` callback fires. This is the primary event used by parent screens to trigger business logic such as HKID cross-verification or encounter lookup. The modified flag resets after firing, so navigating back to the same field and leaving without changing the value will not fire the callback again.

#### User leaves the field without making a change

`onModifiedAndBlur` is **not** fired. The standard `onBlur` callback fires as normal, allowing the parent to handle pure focus-loss events if needed.

#### User presses Enter

The same modified-and-blur logic applies — if the value has been changed, `onModifiedAndBlur` fires immediately, without waiting for the field to lose focus. This allows keyboard-driven workflows to trigger lookup on Enter.

---

## Buttons and Actions

This component has no built-in buttons or icon actions.

---

## Configuration

| Setting | Source | Purpose | Effect |
|---|---|---|---|
| `typographicCase` | Prop (inherited from `BasicLisInput`; default: `"uppercase"`) | Controls character casing applied to input | `"uppercase"` — all input converted to uppercase; `"lowercase"` — lowercase; `"normal"` — no conversion |
| `maxLength` | Fixed at 15 (not configurable by consumers) | Limits encounter number entry length | Input beyond 15 characters is silently rejected |

---

## HKID Cross-Verification Utility

`checkHkidOfEncounterNo` is a separate utility function exported alongside the component. It is not called automatically — the parent screen calls it explicitly, typically inside the `onModifiedAndBlur` callback.

**Purpose**: Verifies that a given encounter number belongs to a patient whose HKID matches the one already on screen. This cross-check guards against accidentally loading the wrong patient's encounter.

**Parameters**:

| Parameter | Type | Description |
|---|---|---|
| `encounterNo` | `string` | The encounter number entered by the user |
| `hkid` | `string` | The HKID already on screen to cross-check against |
| `hospitalCode` | `string` | The hospital code for the current session |
| `serviceParameterVo` | `Record<string, any>` | Standard service parameter object from the current session context |

**Behaviour**: Calls the `checkHkidOfEncounterNo` API with `skipErrorDialog: true`, so any API-level errors are returned to the caller rather than shown in a system message box. The parent screen is responsible for handling error responses.

---

## Props Reference

| Prop | Type | Default | Purpose |
|---|---|---|---|
| `value` | `string` | — | Controlled field value |
| `defaultValue` | `string` | — | Uncontrolled initial value |
| `typographicCase` | `"uppercase" \| "lowercase" \| "normal"` | `"uppercase"` | Character casing applied to input |
| `onChange` | `(newValue: string) => void` | — | Called on each keystroke with the current (case-converted) value |
| `onBlur` | `FocusEventHandler` | — | Called whenever the field loses focus, regardless of whether the value changed |
| `onModifiedAndBlur` | `() => void` | — | Called when focus leaves the field (or Enter is pressed) **and** the value was changed since the last event |
| `onKeyDown` | `KeyboardEventHandler` | — | Called on any key press |

`maxLength` is fixed at 15 and cannot be overridden by consumers. All other standard CMS `TextField` props (label, placeholder, helperText, error, disabled, size, autoFocus, etc.) are forwarded to the underlying input.

---

## Data Saved

This component does not write data to the database. It collects an encounter number string and surfaces it to the parent screen via `onChange` and `onModifiedAndBlur`. The HKID cross-verification utility returns a result to the caller; any data the parent chooses to act on from that result is the parent's responsibility.

---

## Related Workflows

- [[CRS Request Retrieval Workflow]] — The Encounter Number Input is used as an alternative entry method to retrieve an existing request by encounter number.
- [[CRS Registration Workflow]] — The Encounter Number Input may be used during patient registration to look up an existing encounter.
