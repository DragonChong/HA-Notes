# DFT Panel Enablement — DFTS

## Overview

This workflow describes the behaviour of the DFT Sequence Panel when a **DFTS** (DFT Sample) test is selected during DFT Registration. When a DFTS test code is added to the Requested Tests panel, the DFT Sequence Panel becomes enabled with the number of active time sequence rows determined by the test's configuration. Request No. and Collection Datetime fields are editable per row, but the Time Flag values are fixed by the test dictionary and cannot be edited by the user. If the DFTS test code is removed, the DFT Sequence Panel is cleared and disabled.

---

## Related User Stories

- **[[CRST-687]]** - DFT Registration - DFT Panel Enablement (DFTS)

**Epic:** LISP-210 [CRST][DEV] DFT Registration

---

## Key Concepts

### DFTS (DFT Sample)
A DFT test series where the time flag sequence points are defined entirely by the test configuration in the test dictionary. Staff can enter Request No. and Collection Datetime for each active sequence row, but the Time Flag values themselves are read-only.

### Test Attribute
Each DFT test has a `test_attribute` value in the test dictionary that encodes both the series type and the time flag sequence. For DFTS tests the format is: `DFTS,<flag1>,<flag2>,...` (e.g., `DFTS,0,1,2`). The number of comma-separated values after `DFTS` determines how many sequence rows are activated.

### Auto-Calculation of Collection Datetime
Controlled by the lab option `AUTO_CALCULATION_DFT_COL_DTM_ENABLED`. When disabled, the system does not recalculate collection datetimes for any sequence row even if a time value on another row is changed.

---

## Trigger Point

This workflow begins when a user adds a test code to the **Requested Tests** panel on the DFT Registration screen, and that test's series type (from the test dictionary) is identified as `DFTS`.

---

## Workflow Scenarios

### Scenario 1: User adds a DFTS test code

#### Prerequisites
- The DFT Registration screen is open.
- A patient (new or existing) has been entered, enabling the Requested Tests panel.
- The test being added has a test attribute starting with `DFTS`.

#### Process Flow

```mermaid
sequenceDiagram
    User->>Requested Tests Panel: Enter DFTS test code
    Requested Tests Panel->>DFT Registration: Test code modified event
    DFT Registration->>Test Dictionary: Retrieve test attribute and time flags
    DFT Registration->>DFT Sequence Panel: Populate time flag rows (from test attribute)
    DFT Registration->>DFT Sequence Panel: Enable active rows (Request No. + Collect D/T editable; Time Flag disabled)
    DFT Registration->>Save Button: Enable
```

#### Step-by-Step Details

1. The user types or selects a DFTS test code in the **Requested Tests** panel.
2. The system reads the test's **Test Attribute** from the test dictionary. The attribute is in the format `DFTS,<flag1>,<flag2>,...`.
3. The system counts the time flag values listed after `DFTS`. This determines how many of the 14 DFT Sequence rows are activated.
4. For each activated row, the system sets the **Time Flag** value from the test attribute. The Time Flag field is shown but **not editable** by the user.
5. The **Request No.** and **Collection Datetime** fields on each activated row are visible and editable.
6. The remaining rows (up to 14 total) are visible but fully disabled.
7. The **DFT Sequence Panel** is enabled.
8. The **Save** button becomes enabled.

---

### Scenario 2: User removes a DFTS test code after data has been entered

#### Prerequisites
- A DFTS test code has been added and the DFT Sequence Panel is populated and enabled.
- The user has optionally entered Request No. and/or Collection Datetime values in the active rows.

#### Process Flow

```mermaid
sequenceDiagram
    User->>Requested Tests Panel: Remove DFTS test code
    Requested Tests Panel->>DFT Registration: Pre-modified event
    DFT Registration->>DFT Sequence Panel: Clear all data
    DFT Registration->>DFT Sequence Panel: Disable all rows
    DFT Registration->>Save Button: Disable
```

#### Step-by-Step Details

1. The user removes the DFTS test code from the **Requested Tests** panel.
2. The system immediately clears all data from every row of the **DFT Sequence Panel** — Request No., Collection Datetime, and Time Flag values are all cleared.
3. All 14 rows are disabled.
4. The **Save** button is disabled.
5. The screen returns to the "patient ready" state — Request Information and Requested Tests panels remain editable.

---

## Summary Tables

### DFT Sequence Panel field states — DFTS test active

| Field | State | Editable |
|-------|-------|----------|
| Request No. (active rows) | Enabled | Yes |
| Collection Datetime (active rows) | Enabled | Yes |
| Time Flag (active rows) | Visible, disabled | No — fixed by test dictionary |
| All fields (inactive rows) | Visible, disabled | No |

### DFT Sequence Panel field states — DFTS test removed / no test entered

| Field | State | Editable |
|-------|-------|----------|
| Request No. | Visible, disabled | No |
| Collection Datetime | Visible, disabled | No |
| Time Flag | Visible, disabled | No |
| Save button | Disabled | — |

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|-------------|---------|--------------------|--------------------|
| Auto-calculation of DFT collection datetime | `AUTO_CALCULATION_DFT_COL_DTM_ENABLED` | Controls whether collection datetimes are recalculated when a time sequence value is modified | Collection datetimes may be recalculated based on sequence changes | Collection datetimes are not recalculated; values remain as entered |

> For DFTS tests, the time flag sequence rows are determined by the test attribute (e.g., `DFTS,0,1,2`). The number of comma-separated values after `DFTS` equals the number of active rows.

---

## Business Rules

1. When a DFTS test is selected, only the rows corresponding to the time flags defined in the test attribute become active; the remaining rows are disabled.
2. The Time Flag values for DFTS tests are read-only — they are sourced from the test dictionary and cannot be changed by the user.
3. Removing the DFTS test code from the Requested Tests panel clears all DFT Sequence Panel data immediately.
4. The Save button is only enabled when a valid DFTS test code is present in the Requested Tests panel.

---

## Related Workflows

- [[DFT Registration]] — The parent screen within which this enablement occurs.
- [[DFT Panel - DFTT]] — Comparable enablement behaviour for the DFTT (DFT Timed) series.
- [[DFT Panel - DFTC]] — Enablement behaviour for the DFTC (DFT Custom) series, where time flags are editable.
