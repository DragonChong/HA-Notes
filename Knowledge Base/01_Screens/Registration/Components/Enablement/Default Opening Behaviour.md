# Default Opening Behaviour

## Overview

When a user opens the Manual Registration screen from the top menu, the screen enters its initial state. In this state, the Registration Keys Panel is active and ready for input, while the Patient Demographics Panel, Request Information Panel, and Test Panel remain disabled or invisible until a valid request number has been assigned. The Save button is also disabled at this point. The Clear and Exit buttons are always available throughout the session.

---

## Related User Stories

- **[[CRST-456]]** - Registration - Default Opening Behavior

**Epic:** LISP-25 [CRST][DEV] Registration - Screen Object Enablement

---

## Trigger Point

This state is applied immediately when the Manual Registration screen is opened via the top menu **Request Registration → Manual Registration**. No user input is required to reach this state.

---

## Screen Object States on Opening

### Registration Keys Panel

| Field / Button | Default State | Default Value | Keyboard Shortcut |
|---|---|---|---|
| Enc No. (Encounter No.) | Visible, **editable** | Blank | Ctrl+Shift+E |
| Req No. (Request No.) | Visible, **non-editable** | Blank | N/A |
| HKID | Visible, **editable** | Blank | Ctrl+Shift+H |

> The default initial focus is placed on the **Enc No.** field. This can be reconfigured to focus on the **HKID** field instead via the **Default Tab Order HKID** lab option.

---

### Patient Demographics Panel

| State on Opening |
|---|
| Visible, **disabled** |

The panel becomes interactive only after a valid request number has been assigned and the screen transitions to the ready state.

---

### Request Information Panel

| State on Opening |
|---|
| Visible, **disabled** |

The panel becomes interactive only after a valid request number has been assigned and the screen transitions to the ready state.

---

### Test Panel

| State on Opening |
|---|
| **Invisible** (not shown) |

The Test Panel is not visible when the screen first opens. It becomes visible and active only after the screen transitions to the ready state.

---

### Buttons

| Button | State on Opening | Keyboard Shortcut |
|---|---|---|
| Save | Visible, **disabled** | N/A |
| Clear | Visible, **enabled** | Ctrl+Shift+A |
| Exit | Visible, **enabled** | Ctrl+Shift+X |

---

## Keyboard Shortcut Behaviours

| Shortcut | Action |
|---|---|
| Ctrl+Shift+E | Moves focus to the **Enc No.** field |
| Ctrl+Shift+H | Moves focus to the **HKID** field |
| Ctrl+Shift+A | Displays the confirmation message "Clear current record?" (message 648) |
| Ctrl+Shift+X | Closes the Manual Registration screen |

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---|---|---|---|---|
| Default Tab Order HKID | `DEFAULT_TAB_ORDER_HKID` | Controls which Registration Keys field receives focus when the screen opens | Initial focus placed on the **HKID** field | Initial focus placed on the **Enc No.** field (default) |

---

## Business Rules

1. On opening, only the Registration Keys Panel is interactive; all other panels and the Save button are disabled or invisible.
2. The Clear and Exit buttons are always enabled, regardless of screen state.
3. Request No. is never directly editable by the user on opening; it is populated only after the system assigns a request number.
4. The Test Panel is not shown until the screen is in the ready state (request number assigned).
5. The default initial focus field is Enc No., unless the **Default Tab Order HKID** option is configured to direct focus to HKID instead.

---

## Related Workflows

- [[Retrieve Patient by HKID]] — The HKID field in the Registration Keys Panel is the entry point for patient lookup by identity card number.
- [[Retrieve Patient by Encounter Number]] — The Enc No. field in the Registration Keys Panel is the entry point for patient lookup by encounter number.
- [[Input Specimen No. Button]] — The Input Specimen No. button is disabled in the initial state and is only enabled after the screen reaches the Ready state with a non-USID request number.
- [[Sendout Button]] — The Sendout button is either invisible (when the Sendout option is disabled) or visible but disabled (when the option is enabled) when the screen first opens, consistent with the overall initial disabled state.
