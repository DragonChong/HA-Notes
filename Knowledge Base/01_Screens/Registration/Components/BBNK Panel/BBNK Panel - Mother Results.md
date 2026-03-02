# BBNK Panel – Mother Results

## Overview

The Mother Results button and its associated dialogue allow registration staff to view the blood bank results of the current patient's mother as part of a blood bank registration request. This is particularly relevant for neonatal or obstetric cases where the mother's blood group and antibody status inform the clinical management of the request. The dialogue is read-only and is pre-populated with the mother's data when a patient with mother blood history is identified. If no mother results are on file, the dialogue opens with all fields empty.

---

## Related User Stories

- **[[CRST-585]]** — Registration - BBNK Panel (Mother Results)
- **[[CRST-121]]** — Registration - BBNK Panel

**Epic:** LISP-31 [CRST][DEV] Registration - Special Lab Workflow (BBNK)

---

## Visual Layout

The **Mother Results** button appears in the BBNK Panel in a row alongside the **Blood Category** button, directly below the Patient Results display area. It spans approximately 150 pixels wide.

The **Mother Results Dialogue** is a modal dialogue containing read-only fields for the mother's identification (HKID and Name) and blood bank results (ABO, Antibody). An **OK** button closes the dialogue.

---

## Buttons and Actions

### Mother Results Button

| Property | Detail |
|----------|--------|
| Label | Mother Results |
| Keyboard shortcut | **M** |
| When enabled | After a valid request number has been entered (Registration Input Ready state) |
| When disabled | During Initial and Patient Ready states; also disabled when Immunohaematology is selected as the Test Type |
| What it does | Opens the Mother Results Dialogue |

**Data preparation:** When the patient is identified and has blood history on file, the system prepares the mother's blood bank results for display in the dialogue. This preparation happens at the time the patient is retrieved, not when the button is clicked.

---

### Mother Results Dialogue

A read-only modal dialogue. All fields are for display only; no data entry is permitted.

#### Fields Displayed

| Field | Data Displayed |
|-------|---------------|
| HKID | Mother's Hong Kong Identity Card number (read-only) |
| Name | Mother's name (read-only) |
| ABO | Mother's ABO blood group result, with colour coding applied (see rules below) |
| Antibody | Mother's antibody screen result, with colour coding applied (see rules below) |

#### Colour Coding Rules

**ABO Result:**

| Condition | Display |
|-----------|---------|
| O Neg, A Neg, B Neg, AB Neg, O para-Bombay Neg, A para-Bombay Neg, B para-Bombay Neg, AB para-Bombay Neg, Bombay Neg, or Unknown | Text in red |
| Any other ABO result | Text in blue |

**Antibody Result:**

| Condition | Display |
|-----------|---------|
| Positive | Text in red and bold |
| Negative | Text in black |
| Pending | Text in blue |

#### OK Button
Closes the Mother Results Dialogue. No data is changed.

---

## Selection and Interaction Behaviours

#### Patient with mother results is identified

When the patient is retrieved and mother blood history exists, the dialogue data is pre-populated with the mother's HKID, name, ABO result, and antibody result. The colour coding rules are applied at the time of preparation. When the staff member subsequently clicks the Mother Results button, the pre-populated dialogue is displayed immediately.

#### Patient without mother results

If the identified patient has no mother results on file, the dialogue opens with all fields showing empty values.

#### Immunohaematology Test Type is selected

When the Immunohaematology option is chosen in the Test Type radio group, the Mother Results button is disabled. It becomes re-enabled when any other Test Type is selected.

---

## Related Workflows

- [[BBNK Panel]] — The Mother Results button is part of the overall BBNK Panel.
- [[BBNK Panel - Blood Category]] — The Blood Category button sits alongside Mother Results and is subject to the same Immunohaematology-driven disable rule.
