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
- **[[CRST-777]]** - Amend Request - Retrieve Request
- **[[CRST-778]]** - Amend Request - Amend Request Action

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
| **What it does** | Submits the changes made in the **Request Info Panel** (and the **Data Retention Panel** selection, where applicable) as an amendment to the retrieved request. The system validates the input before committing the change. |

#### Clear

| Property | Detail |
|----------|--------|
| **Label** | Clear |
| **When visible** | Always |
| **What it does** | Clears all fields on the screen and resets the screen to its default state, ready for a new retrieval. The user is prompted for confirmation before the clear takes effect. |

---

### Optional Buttons

These buttons are shown only when the corresponding laboratory option is enabled.

#### Input Specimen No.

| Property | Detail |
|----------|--------|
| **Label** | Input Specimen No. |
| **When visible** | Only when the USID option is enabled (`LAB_OPTION`: option_labno = 9, option_group = `USID`, option_code = `ENABLE`, option_value = 1) |
| **What it does** | Opens the specimen number input dialogue, allowing the user to associate or update a unique specimen identifier (USID) for the retrieved request. |

#### Send Out

| Property | Detail |
|----------|--------|
| **Label** | Send Out |
| **When visible** | Only when the sendout function is enabled (`LAB_OPTION`: option_group = `REQUEST_REGISTRATION`, option_code = `SENDOUT_FUNCTION_ENABLED`, option_value = 1) |
| **What it does** | Initiates the sendout process for the retrieved request, marking it for dispatch to an external laboratory or facility. |

#### Print Send Out

| Property | Detail |
|----------|--------|
| **Label** | Print Send Out |
| **When visible** | Only when the sendout function is enabled (same condition as **Send Out**) |
| **What it does** | Prints the sendout documentation for the retrieved request. |

#### Print Form

| Property | Detail |
|----------|--------|
| **Label** | Print Form |
| **When visible** | Only when the sendout function is enabled (same condition as **Send Out**) |
| **What it does** | Prints the standard request form for the retrieved request. |

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
|---------|-------------|---------|--------------------|--------------------|
| USID Enable | `ENABLE` *(option_group = `USID`, option_labno = 9)* | Controls whether specimen number input is available | **Input Specimen No.** button shown | Button hidden |
| Sendout Function | `SENDOUT_FUNCTION_ENABLED` *(option_group = `REQUEST_REGISTRATION`)* | Controls whether sendout-related actions are available | **Send Out**, **Print Send Out**, and **Print Form** buttons shown | All three buttons hidden |

---

## Related Components

- [[Request Info Panel]] — The panel whose data the **Amend** button submits.
- [[Data Retention Panel]] — The retention selection whose value is also submitted when **Amend** is clicked (General Lab only).
- [[Patient Panel]] — The read-only patient panel on the same screen.
