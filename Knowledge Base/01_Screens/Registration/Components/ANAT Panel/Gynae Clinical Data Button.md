# Gynae Clinical Data Button

## Overview

The Gynae Clinical Data Button is an action button on the ANAT Panel that opens the Gynae Clinical Data Request Panel for gynaecological pathology requests. When clicked for a request whose ANAT test is a configured gynae test, a hospital-specific data entry panel is presented, allowing staff to record gynaecological clinical information alongside the lab request. The button's visibility and enablement are controlled by a lab option. If the button is clicked for a request that does not qualify as a gynae case, a warning message is shown.

---

## Related User Stories

- **[[CRST-608]]** — Registration - ANAT Panel - Gynae Clinical Data

**Epic:** LISP-30 [CRST][DEV] Registration - Special Lab Workflow (ANAT)

---

## Key Concepts

### Gynae Test
A test code that is associated with a gynae bench in the HISTO_SETUP table (bench category "GYNAE CLINICAL DATA"). A request qualifies as a gynae case when the ANAT lab request number prefix matches a bench listed under this HISTO_SETUP category and the selected test is linked to that bench via the `BENCH_TEST` table.

### Hospital-Specific Panel
The Gynae Clinical Data Request Panel has multiple hospital-specific variants. The correct variant is displayed based on the hospital associated with the ANAT request.

---

## Visual Layout

The **Gynae Clinical Data** button appears within the ANAT Panel alongside the other ANAT Panel fields. It is only visible when the `MORE` lab option (GYNAE group) is enabled. When the option is disabled, the button is hidden entirely. When visible, it is enabled in STATE_READY and disabled in the initial and patient-ready states.

---

## Buttons and Actions

### Gynae Clinical Data Button

| Property | Detail |
|----------|--------|
| Label | Gynae Clinical Data |
| When visible | Only when `MORE` lab option (GYNAE group) is enabled (value = 1) |
| When enabled | When the ANAT Panel is in ready state (request number assigned) and `MORE` option is enabled |

#### User clicks Gynae Clinical Data — qualifying gynae test selected

The Gynae Clinical Data Request Panel opens. The panel displayed is hospital-specific, based on the hospital associated with the request. If default gynae clinical data has not yet been entered, the panel is pre-populated with default values. When the user confirms the panel, the gynae clinical data is stored against the request.

#### User clicks Gynae Clinical Data — non-gynae test selected

The system displays message 1300 ("This function is only available for Gynae case"). The user dismisses the prompt by clicking OK. No panel is opened.

---

## Configuration

### Gynae Test Setup (HISTO_SETUP + BENCH_TEST)

Gynae tests are identified by cross-referencing two data sources:

| Data | Source | Notes |
|------|--------|-------|
| Gynae bench list | `HISTO_SETUP` table (`histo_system_code` / `histo_site_code`, category "GYNAE CLINICAL DATA") | Defines which bench codes are gynae benches |
| Gynae test list | `BENCH_TEST` table (`bench_bench` = gynae bench code, `bench_test`) | Tests linked to gynae benches |

A request qualifies as a gynae case when:
- The lab request number prefix matches a `BENCH_TEST.bench_bench` value that corresponds to a HISTO_SETUP "GYNAE CLINICAL DATA" bench, **and**
- The selected ANAT test matches `BENCH_TEST.bench_test` for that bench.

### Lab Options

| Setting | Option Code | Purpose | Effect when enabled (value = 1) | Effect when disabled (value = 0) |
|---------|-------------|---------|----------------------------------|-----------------------------------|
| Gynae Clinical Data Button | `MORE` *(group: GYNAE)* | Controls visibility and enablement of the Gynae Clinical Data button | Button is visible and enabled on the ANAT Panel | Button is hidden and disabled |
| Gynae Clinical Data Compulsory | `COMPULSORY` *(group: GYNAE)* | Controls whether Gynae Clinical Data must be entered before saving | Save is blocked with message 1299 if data is absent | No compulsory check on save |

---

## Error Messages and System Prompts

| Message | Code | Trigger | User Options |
|---------|------|---------|-------------|
| "This function is only available for Gynae case" | 1300 | User clicks Gynae Clinical Data button when the selected test is not a configured gynae test | OK (dismiss) |
| "Please input gynae clinical data." | 1299 | Save attempted when `COMPULSORY` option is enabled and gynae data has not been entered | OK (dismiss); save blocked |

---

## Related Workflows

- [[ANAT Panel Save Validation]] — The Gynae Clinical Data compulsory check (message 1299) is part of the ANAT Panel save validation sequence.
- [[ANAT Test Dropdown]] — Selecting a gynae test triggers default initialisation of the Gynae Clinical Data structure; the Gynae Clinical Data button only opens the panel when a qualifying test is selected.
