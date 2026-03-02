---
status: draft
---
# DFT Test Code Input

## Overview

The DFT Test Code Input is the test selection field displayed in the Requested Tests panel on the DFT Registration screen. It allows registration staff to enter or look up the DFT test code they wish to register. Only one DFT test code may be entered at a time — the panel does not support multiple concurrent test entries. The field accepts free-text input or can be used in conjunction with a selection dialogue to browse all available DFT tests for the current lab.

---

## Related User Stories

- **[[CRST-765]]** - DFT Registration - Test Code Input

**Epic:** LISP-210 [CRST][DEV] DFT Registration

---

## Visual Layout

The DFT Test Code Input occupies a single row within the Requested Tests panel on the DFT Registration screen. It consists of two fields displayed side by side:

- **Code** — a short text input field where the DFT test alpha code is entered or displayed
- **Description** — a read-only field that automatically populates with the test's full name once a valid code is entered

The Requested Tests panel in DFT Registration does not display a **More** button (unlike the standard Registration screen). Only a single test code entry row is shown, reflecting the rule that only one DFT test may be registered per request.

---

## Buttons and Actions

### Code field

| Property | Detail |
|----------|--------|
| **Keyboard shortcut** | **Ctrl+L** |
| **When enabled** | When the DFT Requested Tests panel is enabled (i.e., the patient HKID and Encounter No. have been accepted) |
| **What it does (direct entry)** | Staff type the DFT test alpha code directly into the field. On focus out, the system validates the entered code. If valid, the Description field is populated and the DFT Sequence Panel is loaded. If the code does not exist, an error is shown and the field remains unfilled. |
| **What it does (Ctrl+L)** | Opens the DFT Test Code Selection dialogue. |

---

## DFT Test Code Selection Dialogue

The DFT Test Code Selection dialogue is a modal grid selection dialogue that allows staff to browse and select a DFT test.

### Visual Layout

The dialogue contains:
- A **keyword input** field at the top where staff can type a partial code to filter the list
- A **Next** button beside the keyword input, used to cycle through matches
- A scrollable **data grid** listing all registrable DFT tests for the current lab
- **OK** and **Cancel** buttons at the bottom

### Data Grid Columns

| Column | Data Displayed | Default Visible |
|--------|---------------|-----------------|
| Code | The DFT test alpha code (`TEST_DICT.test_alpha_code`) | Yes |
| Description | The DFT test name (`TEST_DICT.test_name`) | Yes |

The grid is sorted alphabetically by Code. Only tests whose `test_attribute` starts with the DFT attribute prefix are listed — non-DFT tests do not appear in this dialogue.

### Buttons and Actions

#### Keyword input field (typing)
As the user types in the keyword field, the grid automatically scrolls to and highlights the first entry whose code begins with the typed characters.

#### Next button
Clicking **Next** moves the selection to the next entry in the grid whose code begins with the keyword currently in the keyword field. When the end of the list is reached, the selection wraps back to the first matching entry.

#### OK button
Closes the dialogue and populates the **Code** and **Description** fields in the DFT Test Code Input with the selected test. The system then validates the selection and triggers the DFT Sequence Panel loading process.

#### Cancel button
Closes the dialogue without making a selection. The DFT Test Code Input field retains its previous value (empty or unchanged).

---

## Validation Rules

### Valid DFT test code

A test code is considered a valid DFT test only if its `test_attribute` value begins with the DFT attribute prefix. The first three characters of the attribute must match this prefix.

If the entered or selected code does not meet this criterion, the system displays an error message (message 0003252) and the DFT Sequence Panel is not activated.

### Only one DFT test allowed

The Requested Tests panel on the DFT Registration screen supports only a single test code entry. Staff cannot add more than one DFT test to the same request.

### Test code not found

If the staff types a code that does not exist in the test dictionary for the current lab, the system displays an error (message 0000523). The Description field is not populated and the DFT Sequence Panel is not activated.

### Multiple matches found

If the typed code matches more than one test in the dictionary (which should not normally occur for direct entry), the system displays a message (message 0001473) indicating that the code is ambiguous.

---

## Data Sources

| Data | Source |
|------|--------|
| DFT test list | Global cached test dictionary — filtered to tests whose `test_attribute` starts with the DFT attribute prefix and which are registrable for the current lab (user access enabled) |
| Test alpha code | `TEST_DICT.test_alpha_code` |
| Test description | `TEST_DICT.test_name` |

---

## Selection and Interaction Behaviours

#### User enters a DFT test code directly

The staff types a test alpha code in the Code field and moves focus away. The system validates the code against the test dictionary for the current lab. If the code is found and is a valid DFT test, the Description field is populated with the test name, and the DFT Sequence Panel loading process begins. If the code is invalid (not found, ambiguous, or not a DFT test), an appropriate error message is shown.

#### User opens the selection dialogue (Ctrl+L)

The DFT Test Code Selection dialogue opens. The keyword field is pre-populated with any text already entered in the Code field. The grid scrolls to the first matching entry. The staff may refine the keyword or use the **Next** button to cycle through matches. Clicking **OK** applies the selected test and closes the dialogue. Clicking **Cancel** dismisses the dialogue without changing the Code field.

#### User selects a test via the dialogue

After the dialogue closes with an OK selection, the Code and Description fields are populated with the selected test's data. The system then validates the selection and triggers the DFT Sequence Panel loading process (same flow as direct entry).

#### User clears the test code field after a valid test was selected

The DFT Sequence Panel is cleared and disabled. The Save button becomes disabled. The screen returns to the state where the DFT Test Code Input is enabled and awaiting a new entry.

---

## Error Messages and System Prompts

| Message | Text (or description) | Trigger | User Options |
|---------|----------------------|---------|-------------|
| 0003252 | Only DFT tests are permitted | User enters a test code whose attribute does not begin with the DFT attribute prefix | Dismiss |
| 0000523 | Test code not found | Entered code does not exist in the test dictionary for the current lab | Dismiss |
| 0001473 | More than one test found for the entered code | Entered code matches more than one test (ambiguous) | Dismiss |

---

## Related Workflows

- [[DFT Registration - Register]] — The test code input is the trigger that activates the DFT Sequence Panel and initiates the DFT order creation workflow.
