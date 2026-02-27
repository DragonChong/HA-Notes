# ANAT Test Dropdown

## Overview

The ANAT Test Dropdown is a searchable dropdown grid on the ANAT Panel that allows Registration staff to select the anatomical pathology test to be performed for the current lab request. The dropdown lists all registrable tests associated with the current bench, displaying both the test code and the test description. When the user assigns a lab request number, the system automatically pre-selects the default test configured for that bench. Changing the test selection may also trigger defaults for other ANAT Panel fields, such as the Coroner Test checkbox and Specimen Type.

---

## Related User Stories

- **[[CRST-605]]** — Registration - ANAT Panel - ANAT Test List

**Epic:** LISP-30 [CRST][DEV] Registration - Special Lab Workflow (ANAT)

---

## Visual Layout

The ANAT Test Dropdown appears as a single-row dropdown field within the ANAT Panel. When the user opens the dropdown, a grid is displayed with two columns. The field is marked as required. It is enabled only when a valid ANAT lab request number has been assigned (STATE_READY); it is disabled in the initial and patient-ready states.

---

## Data Grid / List

| Column | Data Displayed | Default Visible |
|--------|---------------|-----------------|
| Test Code | The test code (`TEST.test_code`) | Yes |
| Description | The test description (`TEST.test_desc`) | Yes |

The list includes only tests that:
- Are linked to the current bench via the `BENCH_TEST` table (`BENCH_TEST.bench_bench` = current bench code)
- Have `TEST.test_register = 'Y'` (registrable tests only)

The list is scoped to the APS laboratory. Tests not associated with the current bench are not shown.

---

## Buttons and Actions

The dropdown supports keyboard entry: the user may type a test code or description and the system resolves it to the matching list entry. If the entered value does not match any available test, an error is shown (see Error Messages).

---

## Selection and Interaction Behaviours

#### Lab request number assigned — default test loaded

When the user assigns an ANAT lab request number and the request number prefix matches a bench code (`BENCH.bench_code`), the system retrieves the default test from `BENCH.bench_def_test` and pre-selects it in the ANAT Test Dropdown. The test description (`TEST.test_desc`) is displayed in the dropdown field.

> The default test is only loaded when there is no previously retained test value for the request.

#### User selects a test from the dropdown

When the user changes the selected test, the system automatically:
- Updates the **Coroner Test Checkbox** — ticked if the newly selected test code is listed in the Coroner Test configuration; unticked otherwise (applies only when the request is an autopsy)
- Updates the **Specimen Type Dropdown** — sets the default specimen type if a `DEFAULT_SPECTYPE_BY_TEST` mapping exists for the selected test
- Initialises default **Gynae Clinical Summary** data if the selected test is a configured gynae test and no gynae data has yet been entered

#### User types an invalid test code or description

If the user types a value that does not match any test in the current bench list, an error prompt is shown (message 3288). After the user dismisses the prompt, the dropdown is cleared.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|-------------|---------|---------------------|----------------------|
| Coroner Tests | `CORONER_TEST` *(group: ANAT)* | Defines which test codes are treated as coroner tests | Coroner Test Checkbox is ticked automatically when one of these tests is selected | Coroner Test Checkbox is not auto-ticked |
| Default Specimen Type by Test | `DEFAULT_SPECTYPE_BY_TEST` *(group: ANAT)* | Maps test codes to default specimen type values | Specimen Type Dropdown is auto-populated when a mapped test is selected | Specimen Type Dropdown is not auto-populated |

---

## Error Messages and System Prompts

| Message | Code | Trigger | User Options |
|---------|------|---------|-------------|
| Invalid ANAT test entry | 3288 | User types a value that does not match any available test in the bench list | OK (dismiss); dropdown is cleared |

---

## Related Workflows

- [[Coroner Test Checkbox]] — The Coroner Test Checkbox is automatically updated when the test selection changes.
- [[Specimen Type Dropdown]] — The Specimen Type Dropdown may be auto-populated based on the selected test.
- [[Specimen Site Input]] — Default specimen site may also be applied when the test changes, via the `DEFAULT_SITE_BY_TEST` configuration.
