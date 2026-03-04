---
epic: LISP-245
status: draft
---
# Laboratory Selection

## Overview

The **Laboratory Selection** control allows staff to specify which laboratory's database should be searched when retrieving a request on the Cancel Request screen. It is needed because, in a CRS (Central Registration System) environment, a single request number prefix may be shared across multiple laboratories — the system cannot automatically determine which lab's records to query without user input. In the current system, this appears as a pop-up dialogue when ambiguity is detected. In the revamped system, it is replaced by a **dropdown list** displayed directly on the Cancel Request screen.

---

## Related User Stories

- **[[CRST-929]]** - Cancel Request - Laboratory Selection

**Epic:** LISP-245 [CRST][DEV] Cancel Request - Request Retrieval

---

## Key Concepts

### Cross-Lab Registration
In a CRS environment, the same request number prefix (e.g., "H") may be used by multiple laboratories (e.g., Haematology Lab and Anatomical Pathology Lab). When this happens, the system cannot determine which laboratory to retrieve from based on the request number alone, and must ask the user to choose.

### Request Format Prefix
Each laboratory's request format is defined in the `REQUEST_FORMAT` table. For CRS (cross-lab registration), entries with `reqfmt_labno = 99` define which laboratory prefixes are active. If two or more labs share the same prefix under `reqfmt_labno = 99`, the Laboratory Selection step is triggered.

### Default Laboratory Selection
When the Cancel Request screen opens, the system pre-selects a default laboratory based on the workstation identifier configured in `WORKBENCH.wkbh_id`. The workstation identifier starts with a known station prefix (e.g., `CBUT` for Chemical Pathology, `HAET` for Haematology). The system matches the prefix to determine the default lab. If the workstation identifier does not match any known prefix, no default is pre-selected.

---

## Component Modes

| Mode | When It Applies | Appearance |
|------|----------------|------------|
| Single-match (no prompt) | The entered request number prefix maps to exactly one laboratory | No selection step — retrieval proceeds directly to that lab |
| Multi-match (selection required) | The entered request number prefix matches two or more laboratories | Legacy: Lab Selection dialogue shown; Revamp: dropdown list available on screen |
| USID format | A USID-format request number is entered (CRS app) | All labs configured under `reqfmt_labno = 99` are offered for selection |

---

## Visual Layout

In the **current system**, when a multi-match is detected, a modal dialogue is displayed. It contains a single-column data grid listing the matching laboratory names, with no close button. The first item is pre-selected. The user confirms by double-clicking a row or pressing Enter.

In the **revamped system**, the Laboratory Selection is presented as a **dropdown list** visible directly on the Cancel Request screen — no pop-up dialogue. The user selects a laboratory from the list before or after entering the request number.

---

## Data Grid (Legacy Dialogue)

| Column | Data Displayed |
|--------|---------------|
| Laboratory | Full name of the laboratory (e.g., "Haematology Lab", "Anatomical Pathology Lab") |

The list is populated from the matching labs resolved from the `REQUEST_FORMAT` table and displayed with their full names as sourced from the `LABORATORY` table.

---

## Dropdown List Content (Revamp)

The dropdown list is populated from the intersection of:
1. `LABORATORY` table entries for the relevant hospital — provides lab numbers and display names (`lab_labno`, `lab_desc`)
2. `REQUEST_FORMAT` entries with `reqfmt_labno = 99` — identifies which labs participate in cross-lab registration at this site

**Special case — Lab 2 (GNS / SOS):** Lab number 2 may represent either Genetic Service Lab or Sendout Service Lab depending on the `LIS_LAB_SERVER.service` value configured for the hospital:
- If `service = 'GNS'` → displayed as "Genetic Service Lab"
- If `service = 'SOS'` → displayed as "Sendout Service Lab"

### Laboratory Number to Display Name Mapping

| Lab No. | Display Name |
|---------|-------------|
| 1 | Chemical Pathology Lab (or "Transplantation and Immunogenetics" for TIS hospital) |
| 2 | Genetic Service Lab (if `LIS_LAB_SERVER.service = 'GNS'`) or Sendout Service Lab (if `service = 'SOS'`) |
| 3 | Haematology Lab |
| 4 | Immunology Lab |
| 5 | Anatomical Pathology Lab |
| 6 | Blood Bank |
| 7 | Microbiology Lab |
| 8 | Virology Lab |

---

## Default Laboratory Selection

On screen open, the system determines the default lab by matching the workstation identifier (`WORKBENCH.wkbh_id`) against known station prefix patterns:

| Station Prefix Pattern | Lab | Default Display Name |
|----------------------|-----|---------------------|
| Starts with `CBUT` | Lab 1 | Chemical Pathology Lab |
| Starts with `GENE` | Lab 2 | Genetic Service Lab |
| Starts with `HAET` | Lab 3 | Haematology Lab |
| Starts with `IMMT` | Lab 4 | Immunology Lab |
| Starts with `ANPT` | Lab 5 | Anatomical Pathology Lab |
| Starts with `BBKT` | Lab 6 | Blood Bank |
| Starts with `MICT` | Lab 7 | Microbiology Lab |
| Starts with `VIRT` | Lab 8 | Virology Lab |
| Starts with `SOST` | Lab 2 | Sendout Service Lab |
| Does not match any prefix | — | No default selected (blank) |

---

## Interaction Behaviours

#### Single matching lab — no dialogue shown
After the request number is entered, the system checks the `REQUEST_FORMAT` table and finds exactly one lab matching the prefix under `reqfmt_labno = 99`. The retrieval proceeds directly to that lab without any selection step.

#### Multiple matching labs — selection required (legacy dialogue)
The system detects two or more labs sharing the same prefix. A modal dialogue appears listing the matching labs by full name. The first entry is pre-selected. The user selects a lab by double-clicking the row or pressing Enter. The dialogue closes and retrieval proceeds against the selected lab's database. The dialogue cannot be closed without making a selection (no close button).

#### Multiple matching labs — selection required (revamp dropdown)
The user selects the desired laboratory from the dropdown list on the Cancel Request screen, then enters the request number. The system retrieves from the selected lab's database.

#### Request not found after lab selection
If the entered request number does not exist in the selected laboratory's `REQUEST` table, message **164** ("Request not found : [request number]") is displayed. The screen is cleared after the user dismisses the message. See [[Request Not Found Message]] for details.

#### USID-format request number (CRS app)
When the entered number is in USID format, the system offers all labs configured under `reqfmt_labno = 99` for selection — not filtered by prefix.

---

## Data Sources

| Data | Source Table | Column(s) | Notes |
|------|-------------|-----------|-------|
| Lab display name | `LABORATORY` | `lab_labno`, `lab_desc` | One row per laboratory per hospital |
| Cross-lab prefix configuration | `REQUEST_FORMAT` | `reqfmt_labno`, `reqfmt_lab`, `reqfmt_prefix` | Only rows with `reqfmt_labno = 99` are used for CRS cross-lab matching |
| GNS / SOS determination | `LIS_LAB_SERVER` | `hospital`, `service` | `service = 'GNS'` → Genetic Service Lab; `service = 'SOS'` → Sendout Service Lab |
| Default lab | `WORKBENCH` | `wkbh_id` | Prefix of `wkbh_id` matched against station prefix patterns to determine default lab |

---

## Business Rules

1. Laboratory Selection is only triggered in the **CRS application**. In a single-lab (General Lab) application, retrieval always uses the current lab directly — no selection step occurs.
2. The system uses `REQUEST_FORMAT` rows with `reqfmt_labno = 99` to identify which labs participate in cross-lab registration and which prefixes they use.
3. If only one lab matches the entered request number prefix, the selection dialogue (or dropdown) is bypassed and retrieval proceeds immediately.
4. If two or more labs share the same prefix under `reqfmt_labno = 99`, the user must select a lab before retrieval can proceed.
5. For USID-format request numbers in the CRS app, all labs under `reqfmt_labno = 99` are offered for selection regardless of prefix.
6. The default laboratory selection is derived from the workstation identifier (`WORKBENCH.wkbh_id`). If the identifier does not start with a recognised station prefix, no default is pre-selected.
7. Lab number 2 displays as "Genetic Service Lab" or "Sendout Service Lab" depending on the `LIS_LAB_SERVER.service` value — not on the `LABORATORY.lab_desc` value alone.
8. All standard retrieval error paths ([[Request Not Found Message]], [[Request Cancelled Message]], [[Not Supported Lab Message]]) apply after a lab is selected.

> **Revamp note:** The current system uses a modal grid dialogue for lab selection. The revamped system replaces this with a dropdown list displayed persistently on the Cancel Request screen, allowing the user to pre-select the lab before entering the request number.

---

## Related Workflows

- [[Retrieve Request]] — Laboratory Selection is an intermediate step within the retrieval workflow, invoked after the request number is entered and before the database is queried.
- [[Retrieve Lab Request by its Assigned Lab No.]] — Describes the underlying logic used to determine which labs are offered for selection based on the request number format.
- [[Request Not Found Message]] — Triggered if the request number does not exist in the selected lab's database.
- [[Not Supported Lab Message]] — A separate pre-retrieval check (CRS app only) that blocks retrieval entirely for labs not supported in CRS.
