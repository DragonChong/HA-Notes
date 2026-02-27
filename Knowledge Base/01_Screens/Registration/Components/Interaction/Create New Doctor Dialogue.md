# Create New Doctor Dialogue

## Overview

The Create New Doctor Dialogue is a modal popup that allows Registration staff to look up a doctor from the hospital's source system (CMS) and register that doctor in the LIS Location Dictionary. It is opened from the Registration screen when a doctor code entered in the Requesting Doctor field does not yet exist in LIS. Once a doctor is successfully created, the dialogue closes and the Requesting Doctor field on the Registration screen is populated with the new doctor's hospital and doctor code.

---

## Related User Stories

- **[[CRST-512]]** - Registration - Create New Doctor

**Epic:** LISP-29 [CRST][DEV] Registration - Screen Object Interaction

---

## Trigger

The dialogue opens when the **"+"** button next to the Requesting Doctor field on the Registration screen is clicked. The current Requesting Doctor hospital code and doctor code values are passed into the dialogue as initial values.

---

## Initialisation

When the dialogue opens, the following steps occur automatically:

1. The **Hospital** dropdown list is populated from the cached Hospital dictionary.
2. The **Create Doctor** button is disabled.
3. The **Hospital** dropdown is pre-filled with the Requesting Doctor hospital code from Registration and set to editable. If no hospital code was entered in Registration, the dropdown has no default selection.
4. The **Doctor Code** field is pre-filled with the doctor code from Registration and set to editable. If no doctor code was entered in Registration, the field is blank.
5. Doctor code input is enforced as uppercase.
6. The system immediately attempts to retrieve doctor information using the pre-filled values (equivalent to clicking the **Retrieve Doctor** button).

---

## Visual Layout

A modal dialogue containing:
- A **Hospital** dropdown list (editable)
- A **Doctor Code** text input field (editable, uppercase-enforced)
- Read-only display fields for **Doctor Code**, **Department**, and **Name** (populated after a successful retrieval)
- An **"Inactive"** label (shown only when the retrieved doctor has a deleted/inactive status)
- Three buttons at the bottom: **Retrieve Doctor**, **Create Doctor**, and **Cancel**

---

## Buttons and Actions

### Retrieve Doctor

| Property | Detail |
|----------|--------|
| **Label** | Retrieve Doctor |
| **When enabled** | Always available while the dialogue is open |
| **What it does** | Looks up the doctor using the entered Hospital and Doctor Code values. See [Retrieve Doctor Behaviour](#retrieve-doctor-behaviour) below. |

### Create Doctor

| Property | Detail |
|----------|--------|
| **Label** | Create Doctor |
| **When enabled** | Only after a successful retrieval of an active doctor who does not yet exist in LIS |
| **What it does** | Registers the retrieved doctor into the LIS Location Dictionary. See [Create Doctor Behaviour](#create-doctor-behaviour) below. |

### Cancel

| Property | Detail |
|----------|--------|
| **Label** | Cancel |
| **When visible** | Always |
| **What it does** | Closes the dialogue without creating any doctor record. The Requesting Doctor field on the Registration screen is not changed. |

---

## Retrieve Doctor Behaviour

Triggered either by opening the dialogue (if hospital and doctor code were pre-filled) or by clicking the **Retrieve Doctor** button.

### Step-by-Step

1. If the **Hospital** dropdown has no selection, or the **Doctor Code** field is blank, message **490** is shown and the **Create Doctor** button remains disabled.

2. Otherwise, the system checks whether a doctor with the given Hospital and Doctor Code already exists in the LIS Location Dictionary:
   - **If the doctor already exists in LIS:** Message **4054** ("Doctor Code already exists") is shown. The **Create Doctor** button remains disabled.

3. If the doctor is not yet in LIS, the system queries the hospital's backend service for the doctor record:
   - **If the backend query fails:** Message **4052** is shown.
   - **If the doctor is found and active:** The Doctor Code, Department, and Name fields are populated with the retrieved information. The **Hospital** dropdown and **Doctor Code** field are disabled. The **Create Doctor** button is enabled.
   - **If the doctor is found but has a deleted / inactive status:** The Doctor Code, Department, and Name fields are populated. The **"Inactive"** label is displayed. The **Create Doctor** button remains disabled.
   - **If the doctor is not found in the backend:** Message **3409** is shown. The **Create Doctor** button remains disabled.

---

## Create Doctor Behaviour

Triggered by clicking the **Create Doctor** button (only available after a successful active-doctor retrieval).

### Step-by-Step

1. The system re-checks the LIS Location Dictionary to confirm the doctor still does not exist:
   - **If the doctor now exists in LIS** (e.g., created by another user in the interim): Message **4054** is shown. The **Create Doctor** button is disabled and the **Hospital** dropdown and **Doctor Code** field are re-enabled.

2. If the doctor does not yet exist, the system creates the doctor record in the LIS Location Dictionary.
   - **If creation succeeds:** Message **4053** is shown. The dialogue closes and the Requesting Doctor field on the Registration screen is updated with the new hospital code and doctor code.
   - **If creation fails:** Message **4055** is shown. The **Hospital** dropdown and **Doctor Code** field are re-enabled so the user can retry or correct the input.

---

## Summary: Retrieve Doctor Outcomes

| Hospital Selected | Doctor Code Entered | Doctor in LIS | Found in Backend | Doctor Status | Outcome |
|---|---|---|---|---|---|
| No | Any | N/A | N/A | N/A | Message 490; Create button disabled |
| Yes | Blank | N/A | N/A | N/A | Message 490; Create button disabled |
| Yes | Yes | Yes | N/A | N/A | Message 4054; Create button disabled |
| Yes | Yes | No | Query failed | N/A | Message 4052 |
| Yes | Yes | No | Yes | Active | Fields populated; Create button enabled |
| Yes | Yes | No | Yes | Deleted / Inactive | Fields populated; "Inactive" shown; Create button disabled |
| Yes | Yes | No | Not found | N/A | Message 3409; Create button disabled |

---

## Error Messages

| Message | Trigger | User Options |
|---------|---------|-------------|
| 490 | Hospital or Doctor Code is blank when retrieval is attempted | Dismiss and correct input |
| 3409 | Doctor code not found in backend service | Dismiss |
| 4052 | Backend service error during doctor retrieval | Dismiss |
| 4053 | Doctor successfully created in LIS | Dismiss (dialogue then closes) |
| 4054 | Doctor code already exists in LIS Location Dictionary | Dismiss |
| 4055 | Doctor creation failed | Dismiss; Hospital and Doctor Code fields re-enabled |

---

## Related Workflows

- [[Request Doctor Description]] — After the dialogue closes successfully, the Requesting Doctor field is populated; the doctor description auto-updates with the new doctor's name and department.
- [[Location Interaction - Change Doctor Hospital]] — The hospital pre-filled into this dialogue is derived from the Requesting Doctor hospital field, which may itself have been defaulted from the Request Location.
