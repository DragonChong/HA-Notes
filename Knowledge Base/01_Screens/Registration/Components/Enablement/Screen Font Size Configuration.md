# Screen Font Size Configuration

## Overview

The Registration screen can be opened in either **Normal** or **Large** font size. The font size is not a runtime user preference — it is determined by which menu item is configured in the system menu table. A system administrator configures each lab's Registration menu item to point to either the Normal or Large variant of the screen. The two variants are functionally identical; they differ only in the size of labels, button text, and field values displayed on screen, as well as the physical size of the panel for sub-panels and dialogues.

This capability exists so that labs whose staff have difficulty reading smaller text (e.g., due to monitor size, viewing distance, or accessibility needs) can be given a larger-font version of the same Registration screen without any changes to business logic or workflow.

---

## Related User Stories

- **[[CRST-647]]** - Registration - Default Screen Font Size

**Epic:** LISP-25 [CRST][DEV] Registration - Screen Object Enablement

---

## Key Concepts

### Normal Font Size
The standard Registration screen variant. Labels, button text, and field values are rendered at font size 14. This is the default variant used by most labs.

### Large Font Size
An alternative Registration screen variant where labels, button text, and field values are rendered at font size 18. All dialogues and sub-panels that open from the Registration screen are also styled with the larger font.

### Menu Item Configuration
The Registration menu item in the system menu table (`top_menu`) has an `object_class` field that specifies which screen class to load when the user clicks the menu item. Pointing this field to the Normal or Large class is the sole mechanism for selecting the font size variant.

### Lab-Specific Configuration
Each lab's menu item is configured independently. One lab can use the Large variant while another uses the Normal variant, and both can coexist in the same system.

---

## Configuration

| Setting | Source Table / Field | Purpose | Large Font Value | Normal Font Value |
|---------|---------------------|---------|-----------------|-------------------|
| Registration screen variant | `top_menu.object_class` | Determines which Registration screen class (and therefore which font size) is loaded when the user opens Registration from the menu | `hk.org.ha.lis.request.presentation.LargeRegistration` | `hk.org.ha.lis.request.presentation.Registration` |

> There is no `LAB_OPTION` row for this setting. The font size variant is selected entirely through the `top_menu.object_class` column. The two values above are the only supported values for standard Registration. Lab-specific variants (e.g., for BBNK, APS, MBS, VRS) follow the same pattern with their own class names.

---

## Behaviour

### Visual Scope of Large Font

When the Large variant is opened, the following elements are rendered at the larger font size:

- All labels and field values on the main Registration screen panels (Patient Demographics Panel, Request Information Panel, Registration Keys Panel, Requested Test Panel)
- Button text on all action buttons
- All dialogues that open from the Registration screen (e.g., Patient Selection Dialogue, Send Out Dialogue, Verification Dialogue, Test Selection Dialogue, Alert Dialogue, and others)

The font size is applied uniformly across the entire screen and its child dialogues — there is no partial large-font mode.

### Normal Font Size

When the Normal variant is opened, all text is rendered at font size 14. The behaviour and layout are otherwise identical to the Large variant.

### No Runtime Switching

There is no option for a user to switch between Normal and Large font size while the Registration screen is open. The font size is fixed at the point the menu item is clicked. To change font size, a system administrator must update the `top_menu.object_class` value and the user must reopen the screen.

---

## Lab-Specific Variants

In addition to the standard Normal and Large Registration classes, lab-specific sub-classes exist for specialised labs:

| Lab Module | Large Font Class | Normal Font Class |
|---|---|---|
| Standard (all labs) | `LargeRegistration` | `Registration` |
| APS (Anatomical Pathology) | `ApsLargeRegistration` | *(use standard)* |
| BBNK (Blood Bank) | `BbsLargeRegistration` | *(use standard)* |
| MBS (Microbiology) | `MbsLargeRegistration` | *(use standard)* |
| VRS (Virology) | `VrsLargeRegistration` | *(use standard)* |

Each of these lab-specific Large variants extends the standard `LargeRegistration` class and adds any lab-specific panel overrides on top of the large font styling.

---

## Business Rules

1. The font size of the Registration screen is determined solely by the menu item configuration (`top_menu.object_class`). It is not controllable by the user at runtime.
2. When the Large variant is used, **all** text on the screen and in its dialogues is rendered at the larger size — there is no selective application.
3. The Large and Normal variants are functionally identical. No business logic, field set, or workflow behaviour differs between them.
4. Each lab's Registration menu item is configured independently; different labs in the same system can use different font size variants simultaneously.
5. Lab-specific screen variants (APS, BBNK, MBS, VRS) have their own Large classes. The standard `LargeRegistration` class is used for general labs.

---

## Related Workflows

- [[Default Opening Behaviour]] — Describes the overall behaviour of the Registration screen when it is first opened, including the initial state of all panels regardless of font size variant.
