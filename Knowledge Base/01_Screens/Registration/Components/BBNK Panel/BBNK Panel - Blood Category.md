# BBNK Panel – Blood Category

## Overview

The Blood Category button and its associated Special Blood Selection Dialogue allow registration staff to record the patient's special blood requirements as part of a blood bank registration request. Clicking the button opens a dialogue containing a list of configurable checkboxes, one per special blood category, where staff can indicate whether each category is required, not required, or unknown. The button's font style changes to italic after closing the dialogue if the selected categories differ from the patient's default blood categories, providing a visible indicator that a non-default selection has been made.

---

## Related User Stories

- **[[CRST-584]]** — Registration - BBNK Panel (Blood Category)
- **[[CRST-121]]** — Registration - BBNK Panel

**Epic:** LISP-31 [CRST][DEV] Registration - Special Lab Workflow (BBNK)

---

## Component Modes

| Mode | When It Applies | Distinguishing Feature |
|------|-----------------|----------------------|
| Default selection | Selected blood categories match the patient's default categories from the "BLOODCAT" keyword group | Button label in normal font style |
| Non-default selection | Selected categories differ from the patient's defaults | Button label in italic font style |

---

## Visual Layout

The **Blood Category** button is displayed in the BBNK Panel below the Patient Results area, in a row alongside the **Mother Results** button. The button spans approximately 150 pixels wide.

The **Special Blood Selection Dialogue** is a modal dialogue containing a scrollable list of checkboxes, one per blood category. Checkboxes are displayed using the colour and sequence defined in the blood category configuration. The dialogue has **OK** and **Cancel** buttons at the bottom.

---

## Buttons and Actions

### Blood Category Button

| Property | Detail |
|----------|--------|
| Label | Blood Category |
| Keyboard shortcut | **B** |
| When enabled | After a valid request number has been entered (Registration Input Ready state) |
| When disabled | During Initial state, and when Immunohaematology is selected as the Test Type |
| What it does | Opens the Special Blood Selection Dialogue |

**After the dialogue closes:**
- The system compares the current checkbox selections against the patient's default blood categories (from the "BLOODCAT" keyword group).
- If the selections match the defaults, the button text is displayed in **normal** font style.
- If the selections differ from the defaults, the button text is displayed in **italic** font style.

---

### Special Blood Selection Dialogue

#### OK Button
Saves the current checkbox states and closes the dialogue. The Blood Category button font style is updated to reflect whether the selections match the defaults.

#### Cancel Button
Discards all checkbox state changes made during this dialogue session and closes the dialogue. The Blood Category button font style reverts to normal (as if no changes were made).

---

## Checkbox Construction Rules

Each checkbox in the dialogue represents one blood category from the "BLOODCAT" keyword group. The checkboxes are built with the following properties:

| Property | Source |
|----------|--------|
| Label | Keyword description (`key_desc`) |
| Display colour | Keyword group display colour (`keygp_display_color`) |
| Display order | Keyword group display order (`keygp_display_order`) |
| Default state | Middle (Unknown) if `key_alpha2 > 100`; otherwise Not Selected |
| Allows three states | Yes, if `key_alpha2 > 100`; otherwise two states only |
| Corporate category flag | True if the blood category key appears in the `CORP_CATEGORY` lab option list |

**Three-state checkbox cycle (default):** Not Selected → Unknown → Selected → Not Selected

**Two-state checkbox cycle (default):** Not Selected → Selected → Not Selected

---

## State Configuration (Special Blood Config)

Each blood category can have its reachable states restricted via the `SPECIAL_BLOOD_CONFIG` LIS constant group. The constant entry for a blood category specifies which states are allowed, using `Y` (Selected), `N` (Not Selected), and `U` (Unknown), comma-delimited.

| Configuration | Effect |
|---------------|--------|
| All states allowed (Y,N,U) or none configured | Default checkbox behaviour applies |
| Y,U only | Not Selected state is skipped; cycle is Unknown ↔ Selected |
| N,U only | Selected state is skipped; cycle is Middle (Unknown) ↔ Not Selected |
| Y,N only | Unknown state is skipped; cycle is Not Selected ↔ Selected |

> If all three properties are false or all are true, the default cycle applies. Otherwise, only the enabled states are reachable.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|-------------|---------|---------------------|----------------------|
| Corporate Blood Category | `CORP_CATEGORY` *(group: PATIENT_BLOOD_REQ)* | Defines which blood categories are marked as corporate categories in the dialogue | Listed categories flagged as corporate | No categories flagged as corporate |
| Enable Blood Category List (Update Patient) | `BLOOD_CATEGORY` *(group: PATIENT_BLOOD_REQ)* | Defines which blood categories can be updated via the Update Patient function | Listed categories are editable in that context | No restriction |
| Special Blood Config | *(source: LIS constant group `SPECIAL_BLOOD_CONFIG`)* | Per-category state restrictions for the three-state checkboxes | Specific states enabled or disabled per category | Default three-state or two-state behaviour |

---

## Related Workflows

- [[BBNK Panel]] — The Blood Category button is part of the overall BBNK Panel.
- [[BBNK Panel - Mother Results]] — The Mother Results button sits alongside Blood Category and is also disabled when Immunohaematology is selected.
