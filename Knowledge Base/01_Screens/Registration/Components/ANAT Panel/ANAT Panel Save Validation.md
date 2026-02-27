# ANAT Panel Save Validation

## Overview

When Registration staff attempt to save an ANAT lab request, the system performs a series of validation checks against the ANAT Panel fields before allowing the save to proceed. Each check is evaluated in a defined sequence; if any check fails, an error prompt is displayed and the save is blocked until the issue is resolved. The validations cover mandatory fields, date range constraints on the Date of Death, and optional configuration-controlled requirements for Site, Responsible Person, and Gynae Clinical Data.

---

## Related User Stories

- **[[CRST-607]]** — Registration - ANAT Panel - Validation Checking (Save Lab Request)

**Epic:** LISP-30 [CRST][DEV] Registration - Special Lab Workflow (ANAT)

---

## Trigger Point

All validation checks run when the user attempts to save the ANAT lab request from Manual Registration.

---

## Validation Sequence

The validations are evaluated in the following order. Processing stops at the first failure.

| # | Condition | When Active | Error |
|---|-----------|-------------|-------|
| 1 | DOD is blank | Autopsy requests only | 3297 |
| 2 | DOD is later than today or earlier than Date of Birth | Autopsy requests only | 1303 |
| 3 | DOD is later than the Arrival Date | Autopsy requests only | 3298 |
| 4 | X-Ray No. exceeds 20 characters | Autopsy requests only | 3528 |
| 5 | Gynae Clinical Data not entered for a gynae test | Only when `COMPULSORY` option (GYNAE group) is enabled | 1299 |
| 6 | Test field is blank | Always (when test has been interacted with) | 490 |
| 7 | Site field is blank | Only when `SITE_MANDATORY` option is enabled and a specimen number has been entered | 490 |
| 8 | Responsible Person (Path/Tech) is blank | Only when `RESP_PERSON_MANDATORY` option is enabled | 490 |

---

## Workflow Scenarios

### Scenario 1: DOD is blank (Autopsy only)

If the lab request is an autopsy case and the **Date of Death** field is empty, the system displays message 3297 and blocks the save. The user must enter a valid Date of Death before proceeding.

### Scenario 2: DOD date range invalid (Autopsy only)

If the Date of Death is later than today's date or earlier than the patient's Date of Birth, the system displays message 1303 and blocks the save.

### Scenario 3: DOD later than Arrival Date (Autopsy only)

If the Date of Death is later than the specimen arrival date, the system displays message 3298 and blocks the save.

### Scenario 4: X-Ray No. too long (Autopsy only)

If the X-Ray No. field contains more than 20 characters, the system displays message 3528 (referencing "X-ray no." and the limit of 20) and blocks the save.

### Scenario 5: Gynae Clinical Data not entered

If the `COMPULSORY` lab option (GYNAE group) is enabled and the selected test is a configured gynae test but no Gynae Clinical Data has been entered, the system displays message 1299 and blocks the save.

> This check does not apply if the `COMPULSORY` option is disabled.

### Scenario 6: Test field is blank

If the ANAT Test Dropdown has been interacted with but no valid test is selected, the system displays message 490 ("Test must not be blank") and blocks the save.

### Scenario 7: Site is mandatory but blank

If the `SITE_MANDATORY` lab option is enabled, a specimen number has been entered, and the Specimen Site area is empty, the system displays message 490 ("Site must not be blank") and blocks the save.

> This check does not apply if the `SITE_MANDATORY` option is disabled.

### Scenario 8: Responsible Person is mandatory but blank

If the `RESP_PERSON_MANDATORY` lab option is enabled and the Path/Tech dropdown is blank, the system displays message 490 ("Responsible Person must not be blank") and blocks the save.

> This check does not apply if the `RESP_PERSON_MANDATORY` option is disabled.

### All validations pass

If all checks pass, the lab request is saved and processing continues normally.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|-------------|---------|---------------------|----------------------|
| Site Mandatory | `SITE_MANDATORY` *(group: REQUEST_REGISTRATION)* | Controls whether the Specimen Site field is required on save | Site blank → message 490 "Site must not be blank" | Site field not validated on save |
| Responsible Person Mandatory | `RESP_PERSON_MANDATORY` *(group: REQUEST_REGISTRATION)* | Controls whether Path/Tech is required on save | Path/Tech blank → message 490 "Responsible Person must not be blank" | Path/Tech not validated on save |
| Gynae Clinical Data Compulsory | `COMPULSORY` *(group: GYNAE)* | Controls whether Gynae Clinical Data must be entered for gynae tests | Gynae data absent → message 1299 | Gynae data not validated on save |

---

## Error Messages and System Prompts

| Message | Code | Trigger | User Options |
|---------|------|---------|-------------|
| "DOD cannot be blank for Autopsy case!" | 3297 | DOD field is blank on an autopsy request | OK (dismiss); save blocked |
| "DOD cannot later than today or earlier than DOB" | 1303 | DOD is in the future or before the patient's date of birth | OK (dismiss); save blocked |
| "DOD cannot later than arrival date!" | 3298 | DOD is later than the specimen arrival date | OK (dismiss); save blocked |
| X-Ray No. length exceeded | 3528 | X-Ray No. is more than 20 characters | OK (dismiss); save blocked |
| "Please input gynae clinical data." | 1299 | Gynae Clinical Data compulsory and no data entered for a gynae test | OK (dismiss); save blocked |
| "Test must not be blank" | 490 | ANAT Test Dropdown is blank | OK (dismiss); save blocked |
| "Site must not be blank" | 490 | Site mandatory option enabled; Specimen Site area is empty | OK (dismiss); save blocked |
| "Responsible Person must not be blank" | 490 | Responsible Person mandatory option enabled; Path/Tech is blank | OK (dismiss); save blocked |

---

## Related Workflows

- [[Date of Death Field]] — DOD validation checks apply only to autopsy requests; the DOD field enablement is described there.
- [[X-Ray No Field]] — X-Ray No. length validation applies to autopsy requests.
- [[Specimen Site Input]] — The Site mandatory check applies to the Specimen Site area.
- [[Path Tech Dropdown]] — The Responsible Person mandatory check applies to the Path/Tech dropdown.
- [[ANAT Test Dropdown]] — The Test blank check applies to the ANAT Test Dropdown.
