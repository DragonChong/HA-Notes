# Requested Test Panel

## Overview

The Requested Test Panel allows registration staff to enter or select the laboratory tests to be performed for a request. The panel becomes visible and active once a valid request number has been entered — but only when the request number prefix corresponds to a supported lab (CHEM, SOS, HAET, IMMU, BBNK, MICR, or VIRO). For requests belonging to the ANAT laboratory (lab 5), the Test Panel is not shown, as test registration is not handled through the standard panel for that lab. Within the panel, staff can enter up to 10 test codes by default, with an option to expand to 20 by clicking a **More** button.

---

## Related User Stories

- **[[CRST-460]]** - Registration - Requested Test Panel Enablement

**Epic:** LISP-25 [CRST][DEV] Registration - Screen Object Enablement

---

## Key Concepts

### Request Lab
The laboratory associated with a request number, determined by matching the request number prefix against the `REQUEST_FORMAT` table (`reqfmt_prefix` and `reqfmt_lab` columns). This is the lab that will process the tests.

### Registrable Tests
Tests available for selection in the panel are drawn from the `TEST_REGISTRABLE` table for the relevant lab number. Only tests that are user-accessible (i.e., `testreg_user_access = 1`) and either reportable or non-reportable (`testreg_reportable = 0 or 1`) are displayed.

### Test Coordinates
The panel organises test input fields in a fixed grid layout. Each input position in the grid is referred to as a "coordinate". The default layout contains 10 coordinates; clicking **More** expands this to 20.

---

## Trigger Point

This behaviour applies once the screen has reached the ready state — that is, after a valid request number has been entered and accepted. At that point, the system determines the request lab from the request number prefix and decides whether to show or hide the Test Panel accordingly.

---

## Enablement Rules

### Lab-Based Visibility

| Request Lab | Lab No. | Test Panel Visible & Enabled |
|---|---|---|
| CHEM | 1 | ✅ Yes |
| SOS | 2 | ✅ Yes |
| HAET | 3 | ✅ Yes |
| IMMU | 4 | ✅ Yes |
| ANAT | 5 | ❌ No (invisible) |
| BBNK | 6 | ✅ Yes |
| MICR | 7 | ✅ Yes |
| VIRO | 8 | ✅ Yes |

> The lab is determined by matching the request number prefix against the `REQUEST_FORMAT` table. Both `reqfmt_lab` (lab number) and `reqfmt_prefix` (request number prefix) must match, and the row must belong to `reqfmt_labno = 99` (the hospital-wide format definition).

---

## Visual Layout

### Default State (10 Test Inputs)

The panel displays a grid of 10 test code input fields arranged in two rows of five. Each field accepts a single test alpha code. Below the grid, a **More** button is shown (when enabled).

### Expanded State (20 Test Inputs)

Clicking **More** reveals an additional 10 input fields below the initial two rows, for a total of 20 test code input fields. Clicking **More** again collapses the additional fields and hides those that have already been expanded.

---

## Test Code Entry

Staff may enter tests in two ways:

### Direct Entry
Type the test alpha code directly into any test input field. The system validates the code against the registrable test list for the request lab.

### Test Code Panel (Selection Dialogue)
Each test input field provides access to a searchable test code selection dialogue. The dialogue displays:

| Column | Data Displayed |
|---|---|
| Code | Test alpha code |
| Description | Test name |

Tests shown are those registrable for the request lab (`testreg_labno` matching the lab number), with user access permitted and reportability status of 0 or 1.

---

## Buttons and Actions

### More
- **When visible:** Always shown when the Test Panel is active, unless the configuration suppresses the More button.
- **What it does:** Expands the test input grid from 10 to 20 fields. A second click collapses the previously expanded fields, hiding those that have already been shown in the expanded area.

---

## Data Sources

| Data | Source |
|---|---|
| Request lab number | Derived from the request number prefix via `REQUEST_FORMAT` (`reqfmt_prefix`, `reqfmt_lab`, `reqfmt_labno = 99`) |
| Registrable test list | `TEST_REGISTRABLE` joined with `TEST_DICT` for the applicable lab number |
| Test code | `TEST_DICT.test_alpha_code` |
| Test description | `TEST_DICT.test_name` |

---

## Business Rules

1. The Test Panel is only shown when the request number prefix maps to a supported lab (CHEM, SOS, HAET, IMMU, BBNK, MICR, or VIRO). It is not shown for ANAT (lab 5).
2. The request lab is resolved from the request number prefix by matching against `REQUEST_FORMAT`, using both the prefix and the hospital-wide format row (`reqfmt_labno = 99`).
3. Tests available for selection depend on the resolved request lab — only tests registrable for that lab are presented.
4. The default panel provides 10 test input coordinates. Clicking **More** expands to 20. Clicking **More** again collapses the additional fields.
5. The Test Panel remains disabled (invisible) until the screen reaches the ready state, regardless of what has been entered in the Registration Keys Panel.

---

## Related Workflows

- [[Request No. Enablement after Registration Key Input]] — The Test Panel becomes visible only after the ready state is reached, which requires a valid request number to have been entered.
- [[Default Opening Behaviour]] — On screen open, the Test Panel is invisible by default.
- [[Test Code Selection Behavior]] — When a test code is entered or a profile checkbox is selected, the system checks for duplicates against all existing Test Panel entries and prompts the user if a duplicate is detected.
