---
epic: LISP-223
status: draft
---
# Amend Request Validation

## Overview

When the **Amend** button is clicked, the system runs a series of validation checks before committing the amendment. These checks include ensuring the patient category is valid, detecting changes to Private Referral or Lab Only status, verifying the patient age value, and warning when Clinical Detail text exceeds five lines. Depending on the outcome of each check, the system either blocks the amendment with an error, or presents a confirmation prompt allowing staff to proceed or cancel.

Most of the underlying validation rules are shared with Manual Registration. The Amend Request-specific validations add checks for Private Referral changes, Lab Only changes, age value integrity, and Clinical Detail length.

---

## Related User Stories

- **[[CRST-797]]** - Amend Request - Validation (AmendRequestDataValidator)
- **[[CRST-104]]** - Registration - Validation *(shared rules reference)*
- **[[CRST-501]]** - Registration - Validation *(shared rules reference)*
- **[[CRST-502]]** - Registration - Validation *(shared rules reference)*
- **[[CRST-535]]** - Registration - Age Validation *(shared rules reference)*
- **[[CRST-536]]** - Registration - Validation *(shared rules reference)*
- **[[CRST-537]]** - Registration - Clinical Detail *(reference — different behaviour from Amend Request)*

**Epic:** LISP-223 [CRST][DEV] Amend Request - Amend Action

---

## Key Concepts

### Shared Validation Rules
The majority of validation rules (e.g., required fields, format checks) are shared between Manual Registration and Amend Request. Those shared rules are documented under the Registration screen. Only the Amend-specific rules are documented here.

### Private Referral Change
A change occurs when the **Private Referral** status of the request is toggled — either from Non-Private to Private Referral, or from Private Referral to Non-Private. Both directions trigger a confirmation prompt.

### Lab Only
A request marked as **Lab Only** is one where clinical details are restricted to laboratory staff only. Changing a request to Lab Only status requires an additional confirmation before the Private Referral change confirmation is shown.

### Age Calculation
The patient's age is re-calculated at validation time using the **Specimen Collection Datetime** and the patient's date of birth. If the result is NULL or negative (e.g., collection date is before the patient's birth date), the amendment is blocked.

---

## Trigger Point

Validation runs when the user clicks the **Amend** button after editing a retrieved request.

---

## Validation Scenarios

### Scenario 1: Patient Category Blank or Invalid

#### Prerequisites
- A request has been retrieved.
- The **Category** field has been cleared or set to an invalid value.

#### Process Flow

```mermaid
sequenceDiagram
    User->>Amend Request Screen: Click Amend
    Amend Request Screen->>Validation: Check patient category
    Validation-->>Amend Request Screen: Category blank or invalid
    Amend Request Screen->>User: Message 490 — "Patient Category must not be blank."
    User->>Amend Request Screen: Click OK
    Amend Request Screen->>User: Message closed; amendment not saved
```

#### Step-by-Step Details

1. The user clicks **Amend**.
2. The system checks whether the **Category** field contains a valid patient category.
3. If the field is blank or contains an invalid value, message **490** is displayed: *"Patient Category must not be blank."*
4. The user clicks **OK** to dismiss the message. The amendment is not submitted; the screen remains open for correction.

---

### Scenario 2: Private Referral Status Changed

#### Prerequisites
- A request has been retrieved.
- The **Private** field has been changed — either from a Non-Private value to **Private Referral**, or from **Private Referral** to a Non-Private value.

#### Process Flow

```mermaid
sequenceDiagram
    User->>Amend Request Screen: Click Amend
    Amend Request Screen->>Validation: Detect Private Referral change
    Validation-->>Amend Request Screen: Private Referral status changed
    Amend Request Screen->>User: Message 3840 — "Please check all the information. Are you sure to make the change?"
    alt User clicks No
        User->>Amend Request Screen: Click No
        Amend Request Screen->>User: Message closed; amendment undone
    else User clicks Yes
        User->>Amend Request Screen: Click Yes
        Amend Request Screen->>User: Amendment saved; req_lab_only updated
    end
```

#### Step-by-Step Details

1. The user clicks **Amend**.
2. The system detects that the Private Referral status has changed (in either direction).
3. Message **3840** is displayed: *"Please check all the information. Are you sure to make the change?"*
4. **If the user clicks No:** The message closes and the amendment is undone. The screen remains open.
5. **If the user clicks Yes:** The amendment is committed. The `REQUEST.req_lab_only` field is updated to reflect the new Private Referral status.

> This prompt applies in both directions: Non-Private → Private Referral, and Private Referral → Non-Private.

---

### Scenario 3: Lab Only Status Set

#### Prerequisites
- A request has been retrieved.
- The **Private** field has been changed to **Lab Only**.

#### Process Flow

```mermaid
sequenceDiagram
    User->>Amend Request Screen: Click Amend
    Amend Request Screen->>Validation: Detect Lab Only change
    Validation-->>Amend Request Screen: Lab Only selected
    Amend Request Screen->>User: Message 2599 — "This request is marked as Lab Only Request. Do you want to Proceed?"
    alt User clicks No
        User->>Amend Request Screen: Click No
        Amend Request Screen->>User: Message closed; amendment undone
    else User clicks Yes
        User->>Amend Request Screen: Click Yes
        Amend Request Screen->>User: Message 3840 — "Please check all the information. Are you sure to make the change?"
        alt User clicks No on 3840
            User->>Amend Request Screen: Click No
            Amend Request Screen->>User: Message closed; amendment undone
        else User clicks Yes on 3840
            User->>Amend Request Screen: Click Yes
            Amend Request Screen->>User: Amendment saved; req_lab_only updated
        end
    end
```

#### Step-by-Step Details

1. The user clicks **Amend**.
2. The system detects that the **Private** field has been set to **Lab Only**.
3. Message **2599** is displayed: *"This request is marked as Lab Only Request. Do you want to Proceed?"*
4. **If the user clicks No:** The message closes and the amendment is undone.
5. **If the user clicks Yes:** Message **3840** is displayed as the second confirmation: *"Please check all the information. Are you sure to make the change?"*
   - **If the user clicks No on 3840:** The message closes and the amendment is undone.
   - **If the user clicks Yes on 3840:** The amendment is committed. `REQUEST.req_lab_only` is updated.

---

### Scenario 4: Age Value Invalid

#### Prerequisites
- A request has been retrieved.
- The age calculated from the **Specimen Collection Datetime** and the patient's date of birth is NULL or negative (i.e., the collection date is before the patient's birth date, or the date of birth is missing).

#### Process Flow

```mermaid
sequenceDiagram
    User->>Amend Request Screen: Click Amend
    Amend Request Screen->>Validation: Calculate age from Collection Date vs DOB
    Validation-->>Amend Request Screen: Age is NULL or negative
    Amend Request Screen->>User: Message 4121 — "Age value is invalid. Please contact LIS support."
    User->>Amend Request Screen: Click OK
    Amend Request Screen->>User: Message closed; amendment not saved
```

#### Step-by-Step Details

1. The user clicks **Amend**.
2. The system calculates the patient age using the **Specimen Collection Datetime** and the patient's date of birth. This recalculation runs at validation time, so any edits to the Specimen Collection Datetime made during the session are taken into account.
3. If the calculated age is NULL or negative, message **4121** is displayed: *"Age value is invalid. Please contact LIS support."*
4. The user clicks **OK** to dismiss. The amendment is not submitted.

---

### Scenario 5: Clinical Detail Exceeds Five Lines

#### Prerequisites
- A request has been retrieved.
- The **Clinical Detail** field has been edited to contain more than five lines of text.

#### Process Flow

```mermaid
sequenceDiagram
    User->>Amend Request Screen: Click Amend
    Amend Request Screen->>Validation: Check Clinical Detail length
    Validation-->>Amend Request Screen: More than 5 lines detected
    Amend Request Screen->>User: Message 3734 — "Clinical Details is more than 5 lines, are you confirm to save?"
    alt User clicks No
        User->>Amend Request Screen: Click No
        Amend Request Screen->>User: Message closed; amendment undone
    else User clicks Yes
        User->>Amend Request Screen: Click Yes
        Amend Request Screen->>User: Amendment saved; req_cdetail / req_cdetail2 updated
    end
```

#### Step-by-Step Details

1. The user clicks **Amend**.
2. The system checks whether the **Clinical Detail** field contains more than five lines of text.
3. If it does, message **3734** is displayed: *"Clinical Details is more than 5 lines, are you confirm to save?"*
4. **If the user clicks No:** The message closes and the amendment is undone.
5. **If the user clicks Yes:** The amendment is committed. The clinical detail text is saved.

> **Note:** The behaviour for Clinical Detail exceeding five lines differs between Manual Registration and Amend Request. Refer to [[CRST-537]] and the Registration screen documentation for the Manual Registration behaviour. Alignment between the two screens requires product owner clarification.

---

## Summary Tables

### Validation Messages

| Message | Text | Trigger | User Options | On OK / Yes | On No / Cancel |
|---------|------|---------|-------------|-------------|----------------|
| 490 | "Patient Category must not be blank." | Category is blank or invalid | OK | Message closes; amendment not saved | — |
| 2599 | "This request is marked as Lab Only Request. Do you want to Proceed?" | Private field changed to Lab Only | Yes / No | Proceed to message 3840 | Amendment undone |
| 3734 | "Clinical Details is more than 5 lines, are you confirm to save?" | Clinical Detail has more than 5 lines | Yes / No | Amendment saved; clinical detail text stored | Amendment undone |
| 3840 | "Please check all the information. Are you sure to make the change?" | Private Referral status changed; or following message 2599 Yes | Yes / No | Amendment saved; `req_lab_only` updated | Amendment undone |
| 4121 | "Age value is invalid. Please contact LIS support." | Age is NULL or negative at validation time | OK | Message closes; amendment not saved | — |

### Validation Sequence

When multiple conditions apply simultaneously, the checks run in the following order:

1. Patient Category blank / invalid → message 490 (blocks further processing)
2. Age value invalid → message 4121 (blocks further processing)
3. Lab Only change → message 2599, then 3840 (sequential confirmations)
4. Private Referral change (non-Lab-Only) → message 3840 (single confirmation)
5. Clinical Detail > 5 lines → message 3734 (confirmation)

---

## Data Saved

| Field Label | Table | Column | Notes |
|-------------|-------|--------|-------|
| Private / Lab Only flag | `REQUEST` | `req_lab_only` | Updated when amendment proceeds through message 3840 confirmation |
| Clinical Detail | `REQUEST` | `req_cdetail` | Primary clinical detail text |
| Clinical Detail (overflow) | `REQUEST` | `req_cdetail2` | Overflow field when clinical detail text exceeds the primary column capacity |

---

## Business Rules

1. The patient category must not be blank or invalid when the **Amend** button is clicked.
2. Age is re-calculated at validation time using the Specimen Collection Datetime and the patient's date of birth; a NULL or negative result blocks the amendment.
3. Any change to the Private Referral status — in either direction — requires confirmation via message 3840 before the amendment is saved.
4. Setting a request to Lab Only requires a two-step confirmation: message 2599 first, then message 3840.
5. Clinical Detail text exceeding five lines triggers a confirmation prompt (3734); the user may choose to save or cancel.
6. The five-line Clinical Detail behaviour differs from Manual Registration; product owner alignment is required.

---

## Related Workflows

- [[Retrieve Request]] — Retrieval is a prerequisite; the Amend button is only enabled after a request is loaded.
- [[Location Interaction - Private Referral]] — Private Referral status may be set automatically by location selection before the user clicks Amend, which would then trigger message 3840.
