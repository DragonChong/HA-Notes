# Specimen and Test Profile Manipulation

## Overview

This document describes the business rules that govern how specimens are assigned to test profiles within the [[USID Input Dialogue]] and [[Remap Specimen Dialogue]]. These rules control how test profile codes are determined and displayed in the Specimen Test Relation data grid, how a newly entered specimen is mapped when some test profiles already have specimens assigned, and how the mapping state is updated when test profiles or specimens are added or removed.

---

## Related User Stories

- **[[CRST-624]]** - Registration - USID Input Dialogue: Specimen & Test Profile Manipulation

**Epic:** LISP-29 [CRST][DEV] Registration - Screen Object Interaction

---

## Key Concepts

### Test Profile Code
The code that identifies a test profile entered on the request. In most labs this is the profile code as typed. In Blood Bank (BBS) Registration, the code shown in the Specimen Test Relation data grid may be a standardised type code rather than the raw input code (see [BBS Test Type Code Determination](#bbs-test-type-code-determination) below).

### Specimen Test Relation
A mapping between one specimen identifier and one or more test profile codes for a given request number. A relation without a specimen (a "profiles-only relation") represents test profiles that have not yet been assigned a specimen.

### Profiles-Only Relation
A special relation row that holds test profiles not yet mapped to any specimen. When a new specimen is entered and only one such unmapped profile exists, the specimen is assigned directly to that profile.

---

## BBS Test Type Code Determination

For Blood Bank (BBS) Registration only, test profiles entered in the Test Panel and test types selected in the Test Type selector are both normalised to a standardised code before being shown in the Specimen Test Relation data grid:

### Test Type Selector → Display Code

| Test Type Selected | Code Shown in Data Grid |
|---|---|
| T&S / XM | T&S |
| Component | COMPONENT |
| No Sample | NOSAMPLE |

### Test Profile Code Input → Display Code

| Test Profile Codes Entered | Code Shown in Data Grid |
|---|---|
| TSI, TSII, TSMI, TSMII, and profiles defined in the **TS Tests** lab option | T&S |
| COMPI, COMPII | COMPONENT |
| NOSAMPLE | NOSAMPLE |
| All other profile codes | Profile code as entered |

> **Rule:** If both a Test Type and a Test Profile Code of the same category are present (e.g., T&S type selected and TSI code entered), the system displays only the normalised type code once — it does not appear as duplicate rows.

---

## Assigning a New Specimen to Test Profiles

When a new specimen identifier is entered in the Specimen No. field of the Input Specimen Dialogue, the system determines how to assign it to the existing test profile relations using the following rule:

### Rule: Only One Unmapped Test Profile

If exactly **one** test profile in the current relations has no specimen assigned to it (i.e., there is a single profiles-only relation), the new specimen is mapped **to that profile only** — it is not added to the profiles that already have specimens.

**Example:**
1. Two test profiles (NA, K) are both mapped to specimen USID-001.
2. A third test profile (RFT) is added to the request.
3. RFT has no specimen assigned yet.
4. The user enters a new specimen USID-002.
5. USID-002 is mapped to RFT only. NA and K retain their mapping to USID-001.

### Rule: More Than One Unmapped Test Profile (or No Existing Relations)

If there is no existing specimen mapping yet, or if no single unmapped profile can be identified, the new specimen is assigned to **all** current test profile codes.

---

## Updating Mappings When Test Profiles Change

When the user returns from the Input Specimen Dialogue (by clicking OK) and then adds or removes test profiles in the Test Panel before re-opening the dialogue, the system updates the Specimen Test Relation data grid as follows:

### New Test Profile Added
A newly added test profile that is not already present in any relation is added to the profiles-only relation (unmapped). If the lab option `SKIP_ASSIGN_NEW_PROFILE_TO_ALL_SPECIMENS` is **not** enabled and the profile is not configured to skip specimen assignment, it is instead added to all existing specimen relations.

### Test Profile Removed
A test profile removed from the Test Panel is stripped from all specimen relations in the data grid.

---

## Updating Mappings When a Specimen is Deleted

When a specimen row is deleted from the Specimen Test Relation data grid:
1. The specimen is removed from all relations.
2. Any test profiles that were mapped only to the deleted specimen and are now unmapped are moved into a profiles-only relation, so they can be reassigned.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|------------|---------|--------------------|--------------------|
| Skip Assign New Profile to All Specimens | `SKIP_ASSIGN_NEW_PROFILE_TO_ALL_SPECIMENS` *(option_group: SPECIMEN)* | Controls whether newly added test profiles are automatically assigned to all existing specimens | New profiles go into a profiles-only relation (awaiting manual assignment) | New profiles are automatically added to every existing specimen relation |
| TS Tests | `TS_TESTS` *(option_group: REQUEST_REGISTRATION)* | Defines which test profile codes are classified as T&S type in BBS Registration | Profiles listed here display as T&S in the data grid | No BBS T&S normalisation applied |

---

## Related Workflows

- [[USID Input Dialogue]] — The specimen-to-profile assignment rules described here govern how the data grid in the Input Specimen Dialogue is populated and updated.
- [[Remap Specimen Dialogue]] — The same relations structure is used when remapping specimens across test profiles.
