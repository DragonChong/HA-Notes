# Patient Location Validation on Save

## Overview

When a registration request is saved, the system performs up to three sequential checks on the **Patient Location** field. The first check ensures the entered location is a recognised, valid location for the patient's hospital and specialty. The second check warns the user if the location exists in the system but has been marked as inactive. The third check, triggered only when the user proceeds past the inactive warning, verifies that any associated Primary Report Copy Location is still populated. Together, these checks prevent registrations from being saved with invalid or obsolete patient locations, while still allowing staff to make informed decisions when a location has been recently deactivated.

---

## Related User Stories

- **[[CRST-533]]** - Registration - Pre-register: Patient Info Validation - Patient Location

**Epic:** LISP-27 [CRST][DEV] Registration - Register Workflow

---

## Key Concepts

### Patient Location
The hospital ward, clinic, or outpatient location assigned to the patient for the current registration. This is looked up against the OFFICE reference data, matched by hospital code, specialty, and location code.

### Active vs. Inactive Location
A location that exists in the OFFICE reference data is considered **inactive** when the system flag for that record indicates it has been deactivated. Inactive locations are still present in the reference data but are no longer in normal use. The system warns the user rather than blocking outright, because operational needs may require completing a registration for a patient already assigned to a recently deactivated location.

### Primary Report Copy Location
When a patient has one or more Primary Report Copy entries configured (recipients who automatically receive copies of reports), each entry carries a location. If the patient location changes or is affected by an inactive location scenario, that downstream copy location may become blank, which is not permitted.

---

## Trigger Point

These validations are triggered when the user initiates a save on the Registration screen, as part of the pre-save validation pipeline for patient demographic information. The Patient Location checks form part of the broader [[Patient Info Validation on Save]] chain.

---

## Workflow Scenarios

### Scenario 1: Location Does Not Exist (Message 497)

#### Prerequisites
- The **Patient Location** field contains a value.
- The entered location code cannot be matched in the OFFICE reference data for the patient's hospital and specialty combination — either it does not exist at all, or the specialty context does not match any recognised entry.

#### Process Flow

```mermaid
sequenceDiagram
    User->>Registration Screen: Clicks Save
    Registration Screen->>Validation Pipeline: Run Patient Location check
    Validation Pipeline->>Location Reference Data: Look up location by hospital + specialty + code
    Location Reference Data-->>Validation Pipeline: No matching record found
    Validation Pipeline-->>Registration Screen: Validation fails — message 497
    Registration Screen->>User: Show error "Patient Location is invalid" (OK only)
    User->>Registration Screen: Clicks OK
    Registration Screen->>User: Returns focus; save is blocked
```

#### Step-by-Step Details

1. The validation pipeline looks up the entered location code against the OFFICE reference data, filtered by the patient's hospital code and specialty.
2. If no matching record is found — or if the location code cannot be reconciled under any recognised office type — the check fails.
3. The system displays message **497**: *"Patient Location is invalid."* with a single **OK** button.
4. The user clicks **OK** to dismiss the error.
5. The save operation is blocked. The user must correct the **Patient Location** field before the registration can be saved.

---

### Scenario 2: Location Is Inactive (Message 2514)

#### Prerequisites
- The **Patient Location** field contains a value.
- The entered location code is found in the OFFICE reference data but is marked as inactive.
- The location is recognised — it passed the Scenario 1 validity check (active/inactive status is checked separately from existence).

#### Process Flow

```mermaid
sequenceDiagram
    User->>Registration Screen: Clicks Save
    Registration Screen->>Validation Pipeline: Run Inactive Patient Location check
    Validation Pipeline->>Location Reference Data: Look up location by hospital + specialty + code
    Location Reference Data-->>Validation Pipeline: Record found; location is inactive
    Validation Pipeline-->>Registration Screen: Warning — message 2514
    Registration Screen->>User: Show warning "Location 'XXXX' has been inactivated. Proceed?" (Yes / No)
    alt User clicks Yes
        Registration Screen->>Validation Pipeline: Continue pipeline
        Note over Validation Pipeline: Proceeds to Scenario 3 check (490)
    else User clicks No
        Registration Screen->>User: Warning dismissed; save is cancelled
    end
```

#### Step-by-Step Details

1. The validation pipeline looks up the entered location code. The record is found, but the location is marked as inactive.
2. The system displays message **2514**: *"Location 'XXXX' has been inactivated. Do you still want to proceed?"* where `XXXX` is the actual location code the user entered. The message offers two options: **Yes** and **No**.
3. **If the user clicks No:** The warning is dismissed and the save operation is cancelled. The user is returned to the Registration screen with the **Patient Location** field still populated, where they can change it to an active location.
4. **If the user clicks Yes:** The validation pipeline continues to the next check. The inactive location is accepted for this registration. Proceed to Scenario 3.

---

### Scenario 3: Primary Report Copy Location Is Blank (Message 490)

#### Prerequisites
- The user has clicked **Yes** on the message 2514 inactive location warning (Scenario 2).
- The registration has at least one Primary Report Copy entry configured.
- The location associated with one or more Primary Report Copy entries is blank or unresolved.

#### Process Flow

```mermaid
sequenceDiagram
    Validation Pipeline->>Primary Report Copies: Check each Primary Report Copy location
    Primary Report Copies-->>Validation Pipeline: One or more entries have no location set
    Validation Pipeline-->>Registration Screen: Validation fails — message 490
    Registration Screen->>User: Show error "Primary Report Copy Location (Patient Location / Report Location) cannot be blank" (OK only)
    User->>Registration Screen: Clicks OK
    Registration Screen->>User: Returns focus; save is blocked
```

#### Step-by-Step Details

1. After the user proceeds past the 2514 warning, the pipeline checks all Primary Report Copy entries associated with the request.
2. If any Primary Report Copy entry has no location set (i.e., its location identifier is absent), the check fails.
3. If the registration has no Primary Report Copy entries at all, this check also fails — at least one resolved Primary Report Copy location must be present when Primary Report Copies are configured.
4. The system displays message **490**: *"Primary Report Copy Location (Patient Location / Report Location) cannot be blank."* with a single **OK** button.
5. The user clicks **OK** to dismiss the error.
6. The save operation is blocked. The user must resolve the Primary Report Copy location configuration before the registration can be saved.

---

## Summary Table

| Check | Message | Severity | User Options | Blocks Save? |
|-------|---------|----------|-------------|--------------|
| Location does not exist in OFFICE reference data | 497 | Hard stop | OK only | Yes |
| Location exists but is inactive | 2514 | Warning | Yes / No | Yes if No; continues if Yes |
| Primary Report Copy Location is blank (after 2514-Yes) | 490 | Hard stop | OK only | Yes |

---

## Data Sources

| Data | Source |
|------|--------|
| Patient Location validity and active/inactive status | OFFICE reference data, matched by hospital code, office type, and specialty |
| Primary Report Copy entries and their locations | Report Copies data linked to the current registration request |

---

## Configuration

There are no configurable options that enable or disable the Patient Location validity and inactive checks. These validations run whenever the **Patient Location** field contains a value at save time. They are not gated by any LAB_OPTION setting.

> The check for whether the Patient Location field is **mandatory** (i.e., whether a blank location is permitted) is governed by a separate configuration and is documented in [[Patient Info Validation on Save]].

---

## Business Rules

1. The **location existence check (497)** runs before the **inactive location check (2514)**. If a location code is entirely unrecognised, the inactive check is not reached.
2. Message **497** is a hard stop — the user cannot proceed until a valid location is entered.
3. Message **2514** is a non-blocking warning — the user may choose to proceed with an inactive location by clicking **Yes**, or abandon the save by clicking **No**.
4. The inactive location lookup matches by location code and hospital code, with a fallback to generic hospital and doctor office types if the specialty-specific lookup returns no result. A location may therefore be recognised even if it does not match the patient's current specialty.
5. Message **490** is only reachable after the user has clicked **Yes** on the 2514 warning. It is not an independently triggered check at save time.
6. If no Primary Report Copy entries exist at all when the configuration expects them, the 490 check also fires.
7. These three checks are distinct from the blank-field mandatory check for Patient Location, which is a separate rule and fires earlier in the validation pipeline.

---

## Related Workflows

- [[Patient Info Validation on Save]] — This validation is one component of the full pre-save patient information validation chain; the order of checks and the overall pipeline are described there.
- [[Patient Demographics Panel]] — The Patient Location field is part of the Patient Demographics Panel on the Registration screen.
