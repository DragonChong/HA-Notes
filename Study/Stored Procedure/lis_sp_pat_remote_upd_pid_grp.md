# lis_sp_pat_remote_upd_pid_grp

To analyze the tables updated by each stored procedure and identify which tables are common across multiple procedures or specific to particular ones, I'll examine the `UPDATE`, `DELETE`, and `INSERT` statements in each SQL file. Below is the breakdown:

---

### Stored Procedures and Updated Tables

1. **lis_sp_pat_upd_pid_grp_im.sql**
    - **Tables Updated**:
        - `derived_work` (`UPDATE`)
        - `pcum_command` (`UPDATE`)
        - `pagedcum` (`UPDATE`, `DELETE`)
        - `request` (`UPDATE`)
        - `request_copy_hist` (`UPDATE`)
        - `pid_lab_checked` (`UPDATE`)
        - `testrslt` (`UPDATE`)
        - `print_list` (`UPDATE`)
2. **lis_sp_pat_upd_pid_grp_mb.sql**
    - **Tables Updated**:
        - `mb_request` (`UPDATE`)
        - `request` (`UPDATE`)
        - `request_copy_hist` (`UPDATE`)
        - `pid_lab_checked` (`UPDATE`)
        - `testrslt` (`UPDATE`)
        - `print_list` (`UPDATE`)
3. **lis_sp_pat_upd_pid_grp_vr.sql**
    - **Tables Updated**:
        - `derived_work` (`UPDATE`)
        - `mb_request` (`UPDATE`)
        - `request` (`UPDATE`)
        - `request_copy_hist` (`UPDATE`)
        - `pid_lab_checked` (`UPDATE`)
        - `testrslt` (`UPDATE`)
        - `print_list` (`UPDATE`)
4. **lis_sp_pat_upd_pid_grp_ap.sql**
    - **Tables Updated**:
        - `followup` (`UPDATE`)
        - `derived_work` (`UPDATE`)
        - `patient_record` (`UPDATE`)
        - `request` (`UPDATE`)
        - `request_copy_hist` (`UPDATE`)
        - `pid_lab_checked` (`UPDATE`)
        - `testrslt` (`UPDATE`)
        - `print_list` (`UPDATE`)
        - `pagedcum` (`UPDATE`)
5. **lis_sp_pat_upd_pid_grp_ch.sql**
    - **Tables Updated**:
        - `dft_link` (`UPDATE`)
        - `derived_work` (`UPDATE`)
        - `pcum_command` (`UPDATE`)
        - `pagedcum` (`UPDATE`, `DELETE`)
        - `request` (`UPDATE`)
        - `request_copy_hist` (`UPDATE`)
        - `pid_lab_checked` (`UPDATE`)
        - `testrslt` (`UPDATE`)
        - `print_list` (`UPDATE`)
6. **lis_sp_pat_upd_pid_grp_he.sql**
    - **Tables Updated**:
        - `derived_work` (`UPDATE`)
        - `pcum_command` (`UPDATE`)
        - `pagedcum` (`UPDATE`, `INSERT`)
        - `request` (`UPDATE`)
        - `request_copy_hist` (`UPDATE`)
        - `pid_lab_checked` (`UPDATE`)
        - `testrslt` (`UPDATE`)
        - `print_list` (`UPDATE`)

---

### Common Tables Across Stored Procedures

The following tables are updated in **multiple** stored procedures:

- **`request`**:
    - Updated in: All procedures (`im`, `mb`, `vr`, `ap`, `ch`, `he`)
    - **Commonality**: Appears in every stored procedure, indicating it’s a core table for updating the `req_pid_group` field during PID group changes.
- **`request_copy_hist`**:
    - Updated in: All procedures (`im`, `mb`, `vr`, `ap`, `ch`, `he`)
    - **Commonality**: Also present in every procedure, likely storing historical request data that needs consistent PID group updates.
- **`pid_lab_checked`**:
    - Updated in: All procedures (`im`, `mb`, `vr`, `ap`, `ch`, `he`)
    - **Commonality**: Universal across all procedures, suggesting it tracks lab-related checks tied to PID groups.
- **`testrslt`**:
    - Updated in: All procedures (`im`, `mb`, `vr`, `ap`, `ch`, `he`)
    - **Commonality**: Appears in every procedure, indicating test results are consistently updated with new PID groups.
- **`print_list`**:
    - Updated in: All procedures (`im`, `mb`, `vr`, `ap`, `ch`, `he`)
    - **Commonality**: Universal, likely used for managing print-related data tied to PID groups.
- **`derived_work`**:
    - Updated in: `im`, `vr`, `ap`, `ch`, `he`
    - **Commonality**: Appears in 5 out of 6 procedures, suggesting it’s a frequently used table for derived work data, except in `mb`.
- **`pagedcum`**:
    - Updated in: `im` (`UPDATE`, `DELETE`), `ap` (`UPDATE`), `ch` (`UPDATE`, `DELETE`), `he` (`UPDATE`, `INSERT`)
    - **Commonality**: Present in 4 procedures, with varying operations (`UPDATE`, `DELETE`, `INSERT`), indicating it handles cumulative page data but is managed differently across procedures.
- **`pcum_command`**:
    - Updated in: `im`, `ch`, `he`
    - **Commonality**: Found in 3 procedures, likely related to command data for page cumulative operations.
- **`mb_request`**:
    - Updated in: `mb`, `vr`
    - **Commonality**: Specific to 2 procedures, suggesting it’s related to a specific request type (possibly microbiology or similar).

---

### Tables Specific to Particular Stored Procedures

The following tables are updated in **only one** stored procedure:

- **`followup`**:
    - Updated in: `ap`
    - **Specificity**: Unique to `ap`, likely related to follow-up actions or records specific to that procedure’s context.
- **`patient_record`**:
    - Updated in: `ap`
    - **Specificity**: Unique to `ap`, indicating it handles patient-specific records not touched by other procedures.
- **`dft_link`**:
    - Updated in: `ch`
    - **Specificity**: Unique to `ch`, possibly related to default links or configurations specific to that procedure.

---

### Summary Table

| **Table**           | **im** | **mb** | **vr** | **ap** | **ch** | **he** | **Notes**                                   |
| ------------------- | ------ | ------ | ------ | ------ | ------ | ------ | ------------------------------------------- |
| `request`           | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | Common across all procedures                |
| `request_copy_hist` | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | Common across all procedures                |
| `pid_lab_checked`   | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | Common across all procedures                |
| `testrslt`          | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | Common across all procedures                |
| `print_list`        | ✅      | ✅      | ✅      | ✅      | ✅      | ✅      | Common across all procedures                |
| `derived_work`      | ✅      |        | ✅      | ✅      | ✅      | ✅      | Common in 5 procedures, absent in `mb`      |
| `pagedcum`          | ✅      |        |        | ✅      | ✅      | ✅      | Common in 4 procedures, varies in operation |
| `pcum_command`      | ✅      |        |        |        | ✅      | ✅      | Common in 3 procedures                      |
| `mb_request`        |        | ✅      | ✅      |        |        |        | Specific to `mb` and `vr`                   |
| `followup`          |        |        |        | ✅      |        |        | Specific to `ap`                            |
| `patient_record`    |        |        |        | ✅      |        |        | Specific to `ap`                            |
| `dft_link`          |        |        |        |        | ✅      |        | Specific to `ch`                            |

---

### Observations

1. **Core Common Tables**:
    - `request`, `request_copy_hist`, `pid_lab_checked`, `testrslt`, and `print_list` are updated in **all** stored procedures, indicating they are central to the PID group update process, likely representing requests, historical data, lab checks, test results, and print outputs.
2. **Frequently Common Tables**:
    - `derived_work` (5 procedures) and `pagedcum` (4 procedures) are widely used but not universal. `derived_work` is absent in `mb`, suggesting `mb` may not involve derived data. `pagedcum` varies in operation (`UPDATE`, `DELETE`, `INSERT`), reflecting different handling of cumulative page data.
3. **Moderately Common Tables**:
    - `pcum_command` (3 procedures) and `mb_request` (2 procedures) are less common, indicating specialized roles in command management and specific request types, respectively.
4. **Specific Tables**:
    - `followup` and `patient_record` are unique to `ap`, suggesting `ap` handles follow-up actions and patient records not relevant elsewhere.
    - `dft_link` is unique to `ch`, possibly for default configurations.
    - No unique tables in `im`, `mb`, `vr`, or `he`, indicating they rely on shared tables.
5. **Procedure-Specific Notes**:
    - `im`, `ch`, and `he` heavily interact with `pagedcum` and `pcum_command`, suggesting they manage complex page cumulative data.
    - `mb` and `vr` share `mb_request`, indicating a focus on a specific request type.
    - `ap` is unique in updating `followup` and `patient_record`, suggesting a broader scope involving patient follow-ups and records.

---

This analysis shows the overlap and specialization in table usage across the stored procedures, highlighting the core tables critical to all PID group updates and the specific tables tied to unique functionalities in certain procedures. If you need further details or comparisons, let me know!