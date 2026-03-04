---
epic: LISP-220
status: draft
---
# Buttons

## Overview

The action buttons on the Amend Request screen are located near the **Request No.** input field at the top of the screen. Two buttons (**Amend** and **Clear**) are always present. Additional buttons for specimen number input and sendout functions are shown only when the corresponding laboratory options are enabled.

---

## Related User Stories

- **[[CRST-775]]** - Amend Request - Buttons
- **[[CRST-779]]** - Amend Request - Retrieve Request
- **[[CRST-778]]** - Amend Request - Object Enablement After Retrieval

**Epic:** LISP-220 [CRST][DEV] Amend Request - Layout

---

## Visual Layout

The buttons are grouped near the **Request No.** field at the top of the screen. Mandatory buttons are always present. Optional buttons appear between or alongside the mandatory buttons depending on which laboratory options are active. The sendout-related buttons (**Send Out**, **Print Send Out**, **Print Form**) appear as a group when the sendout function is enabled.

---

## Buttons and Actions

### Mandatory Buttons

These buttons are always present on the Amend Request screen regardless of system configuration.

#### Amend

| Property | Detail |
|----------|--------|
| **Label** | Amend |
| **When visible** | Always |
| **When enabled** | Enabled only after a request has been successfully retrieved. Disabled when no request is loaded. |
| **What it does** | Submits the changes made in the **Request Info Panel** (and the **Data Retention Panel** selection, where applicable) as an amendment to the retrieved request. The system validates the input before committing the change. |

#### Clear

| Property | Detail |
|----------|--------|
| **Label** | Clear |
| **When visible** | Always |
| **When enabled** | Always enabled regardless of whether a request is loaded (current system behaviour). |
| **What it does** | Clears all fields on the screen and resets the screen to its default state, ready for a new retrieval. The user is prompted for confirmation before the clear takes effect. |

> **Revamp note:** In the revamped system, the **Clear** button should be disabled when no request has been retrieved, and enabled only after a request is loaded. This is a deliberate change from the current system, where Clear is always enabled.

---

### Optional Buttons

These buttons are shown only when the corresponding laboratory option is enabled.

#### Input Specimen No.

| Property | Detail |
|----------|--------|
| **Label** | Input Specimen No. |
| **When visible** | Only when the USID option is enabled (`LAB_OPTION`: option_labno = 9, option_group = `USID`, option_code = `ENABLE`, option_value = 1) |
| **When enabled** | Enabled after a request with a USID format request number is retrieved, provided the USID option_value is `1`. If option_value is `0`, `2`, or `3`, the button is not enabled even after retrieval. |
| **What it does** | Opens the specimen number input dialogue, allowing the user to associate or update a unique specimen identifier (USID) for the retrieved request. |

#### Send Out

| Property | Detail |
|----------|--------|
| **Label** | Send Out |
| **When visible** | Only when the sendout function is enabled (`LAB_OPTION`: option_group = `REQUEST_REGISTRATION`, option_code = `SENDOUT_FUNCTION_ENABLED`, option_value = 1) |
| **When enabled** | Enabled after a request for the relevant lab number is retrieved. |
| **What it does** | Initiates the sendout process for the retrieved request, marking it for dispatch to an external laboratory or facility. |

#### Print Send Out

| Property | Detail |
|----------|--------|
| **Label** | Print Send Out |
| **When visible** | Only when the sendout function is enabled (same condition as **Send Out**) |
| **When enabled** | Enabled after retrieval only if a sendout has already been registered against the request. If no sendout has been registered for the request, the button remains disabled until one is registered. |
| **What it does** | Prints the sendout documentation for the retrieved request. |

#### Print Form

| Property | Detail |
|----------|--------|
| **Label** | Print Form |
| **When visible** | Only when the sendout function is enabled (same condition as **Send Out**) |
| **When enabled** | Enabled after retrieval only if the `SENDOUT_FORM_PRINTING_ENABLED_ON_AMEND` lab option is also enabled for the lab. If that option is disabled, the control is disabled regardless of retrieval. |
| **Default state** | When enabled after retrieval, the **Print Form** checkbox is **checked by default**. |
| **What it does** | When checked and the user clicks **Amend**, the standard request form is printed as part of the amendment action. |

---

## Button Enablement After Retrieval

The table below summarises when each button is present (shown/hidden by lab option) and whether it is enabled or disabled after a request is retrieved.

| Button | Always Present | Request Retrieved | Additional Condition | Enabled? |
|--------|:--------------:|:-----------------:|----------------------|:--------:|
| **Amend** | ✅ | No | — | Disabled |
| **Amend** | ✅ | Yes | — | ✅ Enabled |
| **Clear** | ✅ | No | — | ✅ Enabled *(current system; revamp: disabled)* |
| **Clear** | ✅ | Yes | — | ✅ Enabled |
| **Input Specimen No.** | USID option_value = 1 only | Yes | Request has USID format | ✅ Enabled |
| **Input Specimen No.** | USID option_value = 1 only | Yes | option_value = 0 / 2 / 3 | Disabled |
| **Send Out** | SENDOUT_FUNCTION_ENABLED = 1 only | Yes | — | ✅ Enabled |
| **Print Send Out** | SENDOUT_FUNCTION_ENABLED = 1 only | Yes | Sendout registered on request | ✅ Enabled |
| **Print Send Out** | SENDOUT_FUNCTION_ENABLED = 1 only | Yes | No sendout registered | Disabled |
| **Print Form** | SENDOUT_FUNCTION_ENABLED = 1 only | Yes | SENDOUT_FORM_PRINTING_ENABLED_ON_AMEND = 1 | ✅ Enabled (default: checked) |
| **Print Form** | SENDOUT_FUNCTION_ENABLED = 1 only | Yes | SENDOUT_FORM_PRINTING_ENABLED_ON_AMEND = 0 | Disabled |

---

## Button Visibility Matrix

| USID Option Enabled | Sendout Function Enabled | Input Specimen No. | Send Out | Print Send Out | Print Form |
|--------------------|--------------------------|--------------------|----------|---------------|------------|
| No | No | No | No | No | No |
| Yes | No | Yes | No | No | No |
| No | Yes | No | Yes | Yes | Yes |
| Yes | Yes | Yes | Yes | Yes | Yes |

> **Amend** and **Clear** are always visible regardless of any option setting.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|-------------|---------|--------------------|---------------------|
| USID Enable | `ENABLE` *(option_group = `USID`, option_labno = 9)* | Controls whether specimen number input is available | **Input Specimen No.** button shown; enabled for USID format requests | Button hidden |
| Sendout Function | `SENDOUT_FUNCTION_ENABLED` *(option_group = `REQUEST_REGISTRATION`)* | Controls whether sendout-related actions are available | **Send Out**, **Print Send Out**, and **Print Form** controls shown | All three hidden |
| Sendout Form Printing on Amend | `SENDOUT_FORM_PRINTING_ENABLED_ON_AMEND` *(option_group = `REQUEST_REGISTRATION`)* | Controls whether the Print Form checkbox is enabled on Amend Request | **Print Form** checkbox enabled and checked by default after retrieval | **Print Form** checkbox disabled |

---

## Related Components

- [[Request Info Panel]] — The panel whose data the **Amend** button submits.
- [[Data Retention Panel]] — The retention selection whose value is also submitted when **Amend** is clicked (General Lab only).
- [[Patient Panel]] — The read-only patient panel on the same screen.
