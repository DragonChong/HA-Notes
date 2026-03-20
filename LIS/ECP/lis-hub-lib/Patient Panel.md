# Patient Panel

## Overview

The Patient Panel is a read-only information banner that displays patient demographics, encounter details, and (optionally) the associated request or order details in a compact horizontal card. It is intended to appear at the top of clinical screens to give staff immediate context about who the current patient is and what request or order they are working on.

The panel is fully data-driven: it renders nothing when no data is provided, and automatically adapts its layout and content to one of three modes depending on the type of data passed to it. It also applies distinct visual styling when a patient is deceased.

---

## Component Modes

| Mode | When It Applies | Distinguishing Feature |
|------|-----------------|------------------------|
| Patient | Only `patient` prop is provided | Shows full encounter row including ward/bed and encounter number inline; no request or order number shown |
| Request | `requestInfo` prop is provided (and `orderInfo` is absent) | Shows request number, confidentiality label, and urgency below the encounter row; optionally shows expanded request detail area on the right |
| Order | `orderInfo` prop is provided | Shows the composite order number (hospital code + order number) below the encounter row; shows expanded order detail area on the right |

> **Data priority:** When both `requestInfo` and `orderInfo` are provided, the panel operates in Order mode. `orderInfo` takes precedence.

---

## Visual Layout

The panel renders as a horizontal card with a minimum height of approximately 110px. The background colour adapts to the patient's sex and deceased status.

**Left section** (always present when any data is loaded):

1. **Name row** — Chinese name (if available), followed by English name, then age with unit (e.g., `45Y`). If age is unknown and date of birth is absent, age displays as `-`.
2. **Identity and encounter row** — A horizontal row of patient identity and encounter fields (see table below). Fields are separated by vertical dividers.
3. **Reference number and status row** (Request and Order modes only) — The request or order number, confidentiality label, and urgency label. A source toggle icon button and action buttons (EPR, Patient Album) also appear on this row.

**Right section** (Request or Order mode only, when detail is enabled):

A collapsible detail block showing request or order metadata fields. When these fields wrap beyond one visible line (~70px height threshold), an expand/collapse toggle appears at the right edge of the panel.

---

## Displayed Fields by Mode

### Name Row (all modes)

| Field | Description |
|-------|-------------|
| Chinese Name | Decoded from the patient's CCC code using the application dictionary. Shown only if present |
| English Name | Patient's full English name |
| Age | Numeric age with unit (e.g., `45Y`, `3M`). Shows `-` if age is 0 and date of birth is absent |

### Identity and Encounter Row

| Field | Patient Mode | Request Mode | Order Mode |
|-------|:-----------:|:------------:|:----------:|
| HKID | ✓ | ✓ | ✓ |
| Sex | ✓ | ✓ | ✓ |
| Date of Birth | ✓ | ✓ | ✓ |
| Specialty | ✓ (inline, first group) | ✓ (inline, first group) | ✓ (second group) |
| Ward-Bed | ✓ (inline, first group) | ✓ (second group) | ✓ (second group) |
| Encounter No | ✓ (inline, first group) | ✓ (second group) | ✓ (second group) |

### Reference Number Row (Request and Order modes only)

| Field | Request Mode | Order Mode |
|-------|:-----------:|:----------:|
| Reference Number | Request number | Hospital code + Order number (concatenated) |
| Confidentiality | "Confidential", "Restricted", or hidden | Not shown |
| Urgency | "Urgent" or "Non-Urgent" | Not shown |

**Confidentiality label rules:**

| Stored Value | Displayed Label |
|-------------|-----------------|
| Confidential type | Confidential |
| Restricted type | Restricted |
| Any other value | (field hidden entirely) |

**Urgency label rules:**

| Stored Value | Displayed Label |
|-------------|-----------------|
| Urgent or Desperate | Urgent |
| Any other value | Non-Urgent |

---

## Request Detail Fields (Request mode — right section)

Shown only when `requestShowDetail` is `true` (default).

| Field Label | Description |
|-------------|-------------|
| Request By | Name of the requesting doctor |
| Request Location | Hospital / Specialty / Ward of the requesting location |
| Collected Time | Date and time specimen was collected |
| Arrived Time | Date and time specimen arrived at the lab |
| Registered Time | Date and time the request was registered |

---

## Order Detail Fields (Order mode — right section)

| Field Label | Description |
|-------------|-------------|
| Order Date | Date the order was placed |
| Request By | Name of the requesting doctor |
| Pay Code | Payment code associated with the order |
| Request Location | Hospital / Specialty / Location code of the requesting location |
| Report Location | Location to which the report should be sent |
| Copy To | Location(s) that should receive a copy of the report |
| Admit Dx | Admitting diagnosis |
| Clinical Info | Clinical information notes |

---

## Buttons and Actions

### Source Toggle Button

**When visible:** Request mode only, when `latestPatient` is provided.

**What it does:** Toggles the patient demographics displayed between two views:
- **Snapshot view** (default): Shows patient data as recorded on the request at the time of creation. The snapshot icon is shown.
- **Current view**: Shows the most recently loaded patient demographics (`latestPatient`), reflecting any updates since the request was registered. The update icon is shown.

Clicking toggles between the two views. The name row, identity row, and encounter row all update to reflect the active view.

### EPR Button

**When visible:** Shown only when the logged-in user has the EPR enquiry search security right.

**What it does:** Opens the EPR (Electronic Patient Record) system for the current patient, identified by HKID.

If the user is accessing from outside a green zone network, an access audit dialogue appears first, prompting the user to enter a reason for accessing the record. The EPR opens only when a non-blank reason is provided.

### Patient Album Button

**When visible:** Shown only when imaging data is associated with the current record:
- In Request mode: when the request has an associated imaging order with a result type of IMG_ID.
- In Order mode: when the order has an image usage identifier.

**What it does:** Opens the Patient Album viewer for the associated imaging record, passing the patient identity, image usage key, source hospital, source record identifier, and (in request mode) the request number.

### Expand / Collapse Toggle

**When visible:** Request or Order mode only, and only when the right-side detail area content wraps beyond approximately 70px in height.

**What it does:** Toggles the right-side detail section between:
- **Collapsed**: content clipped to approximately 63px (one wrapped line visible).
- **Expanded**: all detail fields shown without clipping.

---

## Deceased Patient Styling

When the patient has a recorded date of death, the panel applies a distinct visual treatment:
- The panel background shifts to the deceased-patient colour scheme.
- All text and icon tint colours change to muted tones to visually distinguish deceased patients from living patients.
- This is determined solely from the date of death field on the patient record — if it is populated, the deceased style is applied.

---

## Props Reference

| Prop | Type | Required | Default | Purpose |
|------|------|----------|---------|---------|
| `patient` | `PatientVo` | No | — | Patient data for Patient mode. Provides patient identity and encounter information |
| `requestInfo` | `RequestInfoVo` | No | — | Request data for Request mode. Provides patient info, encounter info, request number, and request detail fields |
| `latestPatient` | `PatientVo` | No | — | The most recently loaded version of the patient record. Enables the source toggle button in Request mode |
| `requestShowDetail` | `boolean` | No | `true` | When `true`, the right-side request detail section is shown in Request mode |
| `orderInfo` | `GcrsOrderDto` | No | — | Order data for Order mode. When provided, takes priority over `requestInfo` for determining the display type |
| `maxWidth` | `number` | No | `auto` | Maximum width of the panel in pixels |
| `dataSource` | `any` | No | — | The application dictionary object used to decode Chinese names, resolve doctor names, and resolve location names from stored identifiers |

---

## Configuration

The panel's action buttons depend on application-level integration points and security rights, not on props.

| Setting | Source | Effect |
|---------|--------|--------|
| EPR enquiry right | Security user rights (`EPR_ENQUIRY_ENABLE_SEARCH`) | Controls whether the EPR button is visible |
| EPR enquiry function | Application-level integration (`inquireEpr`) | Required for the EPR button to open the external EPR system |
| EPR access audit function | Application-level integration (`getEprAccessInfo`) | Required for the non-green zone access audit; submits the audit reason to allow EPR access |
| Patient Album function | Application-level integration (`openPatientAlbum`) | Required for the Patient Album button to open the imaging viewer |

---

## Data Saved

This component is read-only and does not write data to the database.

---

## Related Workflows

- [[CRS Registration Workflow]] — The Patient Panel is displayed on registration screens to show the currently selected patient and request context.
- [[CRS Request Retrieval Workflow]] — The panel is populated after a request is retrieved; the source toggle is enabled when both the request snapshot and the latest patient data are available.
- [[CRS Spec-Ack Workflow]] — The Patient Panel appears on the specimen acknowledgement screen to identify the patient associated with the incoming specimen.
