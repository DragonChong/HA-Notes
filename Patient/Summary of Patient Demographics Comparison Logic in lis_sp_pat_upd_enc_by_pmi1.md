# Summary of Patient Demographics Comparison Logic in `lis_sp_pat_upd_enc_by_pmi1`

As a Sybase database professional, I'll focus on the core comparison mechanics in this stored procedure, which is designed to synchronize patient demographics from a remote PMI (Patient Management Information) system into the local `patient` table. The logic prioritizes data integrity by validating key demographic fields before updates, handling exceptions for mismatches, and differentiating update paths based on search criteria (encounter ID vs. PID/HKID). It uses conditional branching with `IF` statements, null-aware comparisons, and sub-procedures for modularity.

#### High-Level Flow for Demographics Fetch and Comparison

1. **Initial Data Retrieval**:
    - Fetches existing local patient record from `patient` table using input parameters `@case_no` (encounter ID) and `@hospital_code`.
    - Key fields extracted: `pat_pid` (HKID), `pat_name` (English name), `pat_cname` (Chinese name), `pat_sex`, `pat_dob`, etc.
    - If no record found (`@pat_pid = ''`), returns error code 2.
2. **Remote PMI Data Fetch**:
    - Calls `lis_sp_pat_remote_pmi_by_enc2` to retrieve PMI demographics by encounter (`@case_no`).
        - Outputs: `@hkid`, `@patient_name`, `@sex`, `@cccode` (Chinese name), `@dob`, etc.
    - If fetch fails (`@retcode <> 0`):
        - Falls back to `lis_sp_pat_remote_demo_by_pid` using `@pat_pid` as HKID.
        - If still fails, sets `@indicator_by_pid = 1` and jumps to exception handling (returns 13 if no data).
    - Sets `@indicator_by_enc = 1` if initial fetch succeeds, to flag encounter-based criteria.
3. **Exception Handling Jump** (`check_patient_exception` label):
    - Sets update timestamp `@pat_update_date = getdate()`.
    - Proceeds to mode-specific logic.

#### Core Comparison Logic (Mode = 0: Local Update Enforcement)

This is the primary demographics validation block, executed only if `@mode = 0` (enforcing PMI updates on locally created records). It skips comparison (and allows direct update) if the record was created/updated by PAS systems (`***IPAS***`, `*** PMI ***`, or `**NDHIPAS**`).

- **Pre-Comparison Cleanup**:
    - Trims trailing spaces after commas in `@pat_name` (e.g., "Doe, John " → "Doe, John") using `CHARINDEX` and `SUBSTRING`.
- **Key Fields Compared** (5 Major Demographics):

    The procedure checks for exact matches between local (`patient` table) and remote (PMI) values. It uses explicit null-handling to avoid false mismatches (e.g., NULL vs. empty string):

```other
IF (@pat_pid <> @hkid) OR (@pat_name <> @patient_name) OR (@pat_sex <> @sex) OR (@pat_dob <> @dob) OR (@pat_cname <> @ccc_code)
   OR ((@pat_pid IS NULL) AND (@hkid IS NOT NULL)) OR ((@pat_pid IS NOT NULL) AND (@hkid IS NULL))
   OR ((@pat_name IS NULL) AND (@patient_name IS NOT NULL)) OR ((@pat_name IS NOT NULL) AND (@patient_name IS NULL))
   OR ((@pat_sex IS NULL) AND (@sex IS NOT NULL)) OR ((@pat_sex IS NOT NULL) AND (@sex IS NULL))
   OR ((@pat_dob IS NULL) AND (@dob IS NOT NULL)) OR ((@pat_dob IS NOT NULL) AND (@dob IS NULL))
   OR ((@pat_cname IS NULL) AND (@ccc_code IS NOT NULL)) OR ((@pat_cname IS NOT NULL) AND (@ccc_code IS NULL))
```

    - **Fields**:
        - HKID: `@pat_pid` vs. `@hkid`
        - English Name: `@pat_name` vs. `@patient_name`
        - Sex: `@pat_sex` vs. `@sex`
        - DOB: `@pat_dob` vs. `@dob`
        - Chinese Name: `@pat_cname` vs. `@ccc_code` (note: `@cccode` is used elsewhere for updates)
    - **Rationale**: Ensures only "trusted" matches allow updates, preventing overwrites on divergent records (e.g., data entry errors).
- **Mismatch Handling (Exception Logging)**:
    - Counts active exceptions (`status = 0`) in `patient_pmi_ex` table by `@pat_encounter_group`.
    - If exception exists: `UPDATE` with new PMI values (`pmi_pid`, `pmi_name`, etc.) and timestamp.
    - If no exception: `INSERT` new record into `patient_pmi_ex` with PMI details, creation timestamp, and `status = 0`.
    - Returns error code 9 (exception logged; no update performed).
    - Error handling: Returns 8 (count query fail), 11 (update fail), or 12 (insert fail).
- **Match Outcome**: If all fields align (including nulls), proceeds to update paths below.

#### Update Paths Post-Comparison

Updates are conditional on the fetch criteria flag, with varying column sets to minimize side-effects:

- **By PID (`@indicator_by_pid = 1`)**: Jumps to `update_lis_patient_basic`.
    - `UPDATE patient` on `pat_encounter = @case_no AND pat_pid = @hkid AND pat_hospital = @hospital_code`.
    - Sets: Name, sex, DOB, race, MRN, Chinese name, death/confidential flags, exact DOB flag, patient type, etc.
    - Returns 7 on error.
- **By Encounter (`@indicator_by_enc = 1`)**:
    - If HKID mismatch: Calls `lis_sp_pat_move_episode1` to reassign episodes (returns 5 on fail).
    - Adjusts ward/specialty if needed (e.g., if `@last_ward_code = @hospital_code` and specialty is NULL).
    - Jumps to `update_lis_patient_detail`.
    - `UPDATE patient` on `pat_encounter = @case_no AND pat_pid = @hkid AND pat_hospital = @hospital_code`.
    - Sets: Above fields + admission/discharge dates, address, location/bed/unit, ward class.
    - Returns 7 on error.

#### Post-Update Logging (`update_pid_check_table` label)

- If name, sex, or DOB changed post-update: Calls `lis_sp_pat_log_pid_check` with type `'DEMOC'` (demographics change).
- For HKID changes (in encounter path): Logs with type `'CASEM'`.
- Final return: 0 (success).

#### Edge Cases and Error Codes

| **Scenario**                            | **Return Code** | **Notes**                                      |
| --------------------------------------- | --------------- | ---------------------------------------------- |
| No local patient                        | 2               | Early exit.                                    |
| PMI fetch by enc fails; PID fetch fails | 13              | No data available.                             |
| PID fetch query error                   | 14              | SQL error in fallback.                         |
| HKID move fails                         | 5               | Episode reassignment issue.                    |
| Mismatch exception                      | 9               | Logged but no update.                          |
| Update errors                           | 7, 11, 12       | SQL failures in `patient` or `patient_pmi_ex`. |
| Option STOP enabled                     | 0               | Bypasses entire process.                       |

#### Observations as a Sybase Expert

- **Strengths**: Robust null handling prevents common Sybase pitfalls (e.g., `<> NULL` always false). Modular sub-procedures enhance maintainability.
- **Potential Improvements**: Consider indexing on `pat_encounter`, `pat_pid_group` for performance. The string trims could use `LTRIM/RTRIM` more consistently. In a PostgreSQL/Oracle migration, map `@@error` to exception blocks and `getdate()` to `CURRENT_TIMESTAMP`.
- **Overall Purpose**: This enforces referential integrity across systems, logging discrepancies to `patient_pmi_ex` for audit/compliance, while allowing controlled updates.

If you need a deeper dive (e.g., execution trace or schema assumptions), provide more context!