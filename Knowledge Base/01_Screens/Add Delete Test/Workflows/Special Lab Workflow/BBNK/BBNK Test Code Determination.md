# BBNK Test Code Determination

## Overview

When a BBNK request is submitted through the Add Delete Test screen, the system does not register the test code that the user originally selected. Instead, it resolves the correct BBNK-specific test code based on two patient-level factors: whether the patient is a **baby** (under 120 days old at the time of the request) and whether the patient has a **historical ABO** record. This determination is performed separately for Type & Screen tests, Component tests, and Immunohaematology tests. Tests of any other type are submitted with their original test code unchanged.

---

## Related User Stories

- **[[CRST-1047]]** — Add Delete Test - BBNK: Test Code Determination

**Epic:** LISP-268 [CRST][DEV] Add/Delete Test — Special Lab Workflow (BBNK)

---

## Key Concepts

### Baby Case
A patient is considered a baby if their age at the time of the request is less than 120 days. Age is calculated using the collection date (if available and not zero in hour and minute), otherwise the arrival date (if available and not zero in hour and minute), otherwise the current date. If no date of birth is recorded for the patient, the patient is not treated as a baby case.

### Historical ABO
A patient is considered to have historical ABO if the Patient Blood History Service (or test-result query, depending on lab configuration) confirms a prior blood history record. See [[BBNK Get Patient Blood History]].

### BBS Test Types
BBNK tests are classified into three categories for determination purposes:

| Test Type | Definition |
|-----------|-----------|
| Type & Screen (T&S) | Test codes matching the T&S list defined in the lab option `TS_TESTS` (option group `REQUEST_REGISTRATION`), plus the hard-coded codes: `TSI`, `TSII`, `TSMI`, `TSMII`; also `NOSAMPLE` is treated as T&S |
| Component (COMP) | Test codes matching the hard-coded list: `COMPI`, `COMPII`, `COMPMI`, `COMPMII` |
| Other | All test codes not matching either list above |

---

## Trigger Point

This logic runs as part of the add-test determination step during [[Add Delete Test (Action)]] submission, after the patient blood history has been retrieved (see [[BBNK Get Patient Blood History]]).

---

## Workflow Scenarios

### Scenario 1: Type & Screen Test Code Determination

#### Prerequisites

- The user has added a test to a BBNK request on the Add Delete Test screen whose test code is on the T&S list or is `NOSAMPLE`.
- The patient's baby status and historical ABO status have been established.

#### Step-by-Step Details

1. The system retrieves the test code entered in the Test Panel.
2. The system checks whether the test code matches any entry on the T&S list (hard-coded codes `TSI`, `TSII`, `TSMI`, `TSMII`, `TS`, `TSM`, or any code in the `TS_TESTS` lab option).
3. If it matches, the system resolves the actual test code to register:

| Baby Case | Historical ABO | Registered Test Code |
|-----------|---------------|---------------------|
| No | Yes | `TSI` |
| No | No | `TSII` |
| Yes | Yes | `TSMI` |
| Yes | No | `TSMII` |

4. If the lab option `TS_II_TESTS` (option group `REQUEST_REGISTRATION`) is configured and the patient has **no** historical ABO, and the original test code appears in the `TS_II_TESTS` list, the system appends the suffix `"II"` to the test code (overriding the resolved code above). This reset step applies only to patients without historical ABO.

---

### Scenario 2: Component Test Code Determination

#### Prerequisites

- The user has added a test to a BBNK request whose test code is on the Component list (`COMPI`, `COMPII`, `COMPMI`, `COMPMII`).

#### Step-by-Step Details

1. The system checks whether the test code matches the Component list.
2. If it matches, the system resolves the actual test code to register:

| Baby Case | Historical ABO | Registered Test Code |
|-----------|---------------|---------------------|
| No | Yes | `COMPI` |
| No | No | `COMPII` |
| Yes | Yes | `COMPMI` |
| Yes | No | `COMPMII` |

3. If `TS_II_TESTS` is configured and the patient has no historical ABO, and the resolved code appears in the `TS_II_TESTS` list, the suffix `"II"` is appended (same reset mechanism as for T&S).

---

### Scenario 3: Immunohaematology Test Code Determination

#### Prerequisites

- The user has added a test to a BBNK request whose test code is on the Immunohaematology list.

#### Step-by-Step Details

1. The system identifies the list of Immunohaematology II test codes:
   - If the lab option `IMMUNO_II_TESTS` (option group `REQUEST_REGISTRATION`) is configured with a list of test codes, that list is used.
   - If `IMMUNO_II_TESTS` is not configured or has no test codes defined, the hard-coded fallback list is used: `RHOG`, `ACHK`, `ABOP`.
2. If the patient has **no historical ABO** and the original test code appears in the Immunohaematology II list, the system appends the suffix `"II"` to the test code.
3. If the patient has historical ABO, no change is made — the test code is submitted as-is.

---

### Scenario 4: Other Test Codes

If the test code does not match the T&S list or the Component list, it is classified as **Other** and no code substitution is performed. The test code entered by the user is submitted unchanged.

---

## Summary: Test Code Resolution Matrix

### Type & Screen and Component Tests (by patient profile)

| Baby Case | Historical ABO | T&S Resolves To | COMP Resolves To |
|-----------|---------------|-----------------|-----------------|
| No | Yes | `TSI` | `COMPI` |
| No | No | `TSII` | `COMPII` |
| Yes | Yes | `TSMI` | `COMPMI` |
| Yes | No | `TSMII` | `COMPMII` |

### Immunohaematology Tests (by historical ABO only)

| Historical ABO | Test Code in Immuno II List | Result |
|---------------|----------------------------|--------|
| Yes | N/A | Original code unchanged |
| No | Yes | Code + `"II"` suffix |
| No | No | Original code unchanged |

---

## Configuration

| Setting | Option Code | Option Group | Purpose | Effect when configured | Effect when absent |
|---------|------------|--------------|---------|------------------------|-------------------|
| Type & Screen Tests | `TS_TESTS` | `REQUEST_REGISTRATION` | Extends the T&S test code list beyond hard-coded constants | Additional codes treated as T&S | Only hard-coded constants used |
| Type & Screen II Tests | `TS_II_TESTS` | `REQUEST_REGISTRATION` | Overrides T&S and Component resolution for patients without historical ABO by appending `"II"` | Codes in the list get `"II"` suffix for patients without historical ABO | Standard resolution matrix used |
| Immunohaematology II Tests | `IMMUNO_II_TESTS` | `REQUEST_REGISTRATION` | Defines which Immuno test codes get `"II"` suffix for patients without historical ABO | Codes in the list get `"II"` suffix | Hard-coded list (`RHOG`, `ACHK`, `ABOP`) used as fallback |

---

## Business Rules

1. Test code determination applies only to BBNK requests — all other labs submit the test code as entered.
2. The baby age threshold is hard-coded as 120 days.
3. The date used for age calculation is: collection date (if set, with non-zero hour and minute) → arrival date (if set, with non-zero hour and minute) → current date.
4. If the patient has no date of birth recorded, they are **not** treated as a baby.
5. The `TS_II_TESTS` reset step is applied only to patients without historical ABO; patients with historical ABO are unaffected.
6. The Immunohaematology suffix append is applied only to patients without historical ABO.
7. If a test code does not match any recognised BBNK test type, it is submitted unchanged.

---

## Related Workflows

- [[BBNK Get Patient Blood History]] — Retrieves the `patientHasHistoricalAbo` flag consumed by this workflow.
- [[Add Delete Test (Action)]] — The overall submission workflow; test code determination runs during the add-test packing step.
