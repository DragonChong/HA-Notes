# BBNK Panel – Patient Results

## Overview

The Patient Results display is a read-only information panel within the [[BBNK Panel]]. It shows a summary of the identified patient's blood bank history, including ABO type, antibody screen, transfusion reaction, Direct Antiglobulin Test (DAT), and last transfusion type. The display uses colour coding to draw attention to clinically significant results, giving registration staff an immediate visual indication of the patient's blood bank status before proceeding with the request.

---

## Related User Stories

- **[[CRST-583]]** — Registration - BBNK Panel (Patient Results)
- **[[CRST-121]]** — Registration - BBNK Panel

**Epic:** LISP-31 [CRST][DEV] Registration - Special Lab Workflow (BBNK)

---

## Visual Layout

The Patient Results display occupies the upper portion of the BBNK Panel. It is always visible. The display area shows up to five rows of results, each with a result value and a corresponding date. The results are shown in the following order: ABO, Antibody, TxRx (Transfusion Reaction), DAT, and Last Tx.

---

## Component Modes

| State | Behaviour |
|-------|-----------|
| Initial | Visible; all result fields empty |
| Patient Ready | Populated with the patient's blood bank history; all fields read-only |
| Registration Input Ready | Continues to display the loaded data; read-only |
| Cleared | All result fields cleared (e.g., after the Clear button is clicked) |

---

## Data Fields

| Field | Data Displayed |
|-------|---------------|
| ABO | The patient's ABO blood group, expressed as the keyword description for the ABO value; accompanied by the date of the result |
| Antibody | The patient's antibody screen result, expressed as the keyword alpha code; accompanied by the date of the result |
| TxRx | The patient's transfusion reaction history, expressed as the keyword description; accompanied by the date |
| DAT | Direct Antiglobulin Test result; displayed as "Positive" or "Negative"; accompanied by the date |
| Last Tx | The most recent transfusion type, expressed as the keyword description; accompanied by the date |

---

## Colour Coding Rules

### ABO Result

| Condition | Display |
|-----------|---------|
| Result is Deactivated | Text: "Deactivated" in pink |
| Result is O Neg, A Neg, B Neg, AB Neg, O para-Bombay Neg, A para-Bombay Neg, B para-Bombay Neg, AB para-Bombay Neg, Bombay Neg, or Unknown | Text in red |
| Any other ABO result | Text in blue |
| ABO result has a remark | Border shown in shadow style |

### Antibody Result

| Condition | Display |
|-----------|---------|
| Positive | Text in red and bold |
| Negative | Text in black |
| Pending | Text in blue |

### DAT Result

| Condition | Display |
|-----------|---------|
| DAT value > 0 | Text "Positive" in red and bold |
| DAT value ≤ 0 | Text "Negative" in blue |

### TxRx and Last Tx

TxRx and Last Tx results are displayed in standard text colour; no colour coding applies. The fields are populated with keyword descriptions when data exists; otherwise they are left empty.

---

## Selection and Interaction Behaviours

#### Patient is identified

When the patient's blood bank history is available, all five result fields are populated simultaneously. The colour coding rules are applied to each field at the time of population.

#### No ABO result exists

If the patient has no ABO history on file, the ABO field remains empty and the date field is blank.

#### No Antibody result exists

If the patient has no antibody screen on file, the Antibody field remains empty.

#### No TxRx or Last Tx data exists

If no transfusion reaction or last transfusion data exists, the corresponding fields remain empty.

#### No DAT data exists

If no DAT result is on file, the DAT field remains empty.

#### Clear button clicked

When the registration clerk clicks the Clear button on the Registration screen, all Patient Results fields are cleared and the colour styles are reset to their default (empty) state.

---

## Related Workflows

- [[BBNK Panel]] — The Patient Results display is part of the overall BBNK Panel component.
