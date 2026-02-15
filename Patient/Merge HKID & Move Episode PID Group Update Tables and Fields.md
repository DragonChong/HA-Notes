# Merge HKID & Move Episode PID Group Update Tables and Fields

| **Lab**         | **Table**         | **Field**         |
| --------------- | ----------------- | ----------------- |
| **CPS (Lab 1)** | dft_link          | dftPidGp          |
|                 | derived_work      | derwkPidGroup     |
|                 | pcum_command      | pcomPidGroup      |
|                 | pagedcum          | pcumPidGroup      |
|                 | request           | reqPidGroup       |
|                 | request_copy_hist | reqcpPidGroup     |
|                 | pid_lab_checked   | pidlabchkPidGroup |
|                 | testrslt          | testrsltPidGroup  |
|                 | print_list        | prtPidGroup       |
| **HMS (Lab 3)** | derived_work      | derwkPidGroup     |
|                 | pcum_command      | pcomPidGroup      |
|                 | pagedcum          | pcumPidGroup      |
|                 | request           | reqPidGroup       |
|                 | request_copy_hist | reqcpPidGroup     |
|                 | pid_lab_checked   | pidlabchkPidGroup |
|                 | testrslt          | testrsltPidGroup  |
|                 | print_list        | prtPidGroup       |
| **IMS (Lab 4)** | derived_work      | derwkPidGroup     |
|                 | pcum_command      | pcomPidGroup      |
|                 | pagedcum          | pcumPidGroup      |
|                 | request           | reqPidGroup       |
|                 | request_copy_hist | reqcpPidGroup     |
|                 | pid_lab_checked   | pidlabchkPidGroup |
|                 | testrslt          | testrsltPidGroup  |
|                 | print_list        | prtPidGroup       |
| **APS (Lab 5)** | followup          | followupPidGroup  |
|                 | derived_work      | derwkPidGroup     |
|                 | patient_record    | patRecPidGroup    |
|                 | request           | reqPidGroup       |
|                 | request_copy_hist | reqcpPidGroup     |
|                 | pid_lab_checked   | pidlabchkPidGroup |
|                 | testrslt          | testrsltPidGroup  |
|                 | print_list        | prtPidGroup       |
|                 | pagedcum          | pcumPidGroup      |
| **MB (Lab 7)**  | mb_request        | reqPidGroup       |
|                 | request           | reqPidGroup       |
|                 | request_copy_hist | reqcpPidGroup     |
|                 | pid_lab_checked   | pidlabchkPidGroup |
|                 | testrslt          | testrsltPidGroup  |
|                 | print_list        | prtPidGroup       |
| **VR (Lab 8)**  | derived_work      | derwkPidGroup     |
|                 | mb_request        | reqPidGroup       |
|                 | request           | reqPidGroup       |
|                 | request_copy_hist | reqcpPidGroup     |
|                 | pid_lab_checked   | pidlabchkPidGroup |
|                 | testrslt          | testrsltPidGroup  |
|                 | print_list        | prtPidGroup       |

### Notes:

- **CPS (Lab 1)** is the most comprehensive, updating 9 tables including the unique `dft_link` table
- **HMS (Lab 3)** and **IMS (Lab 4)** have identical table structures, updating 8 tables each
- **APS (Lab 5)** includes the unique `followup` and `patient_record` tables, updating 9 tables total
- **MB (Lab 7)** and **VR (Lab 8)** both include the `mb_request` table, with VR also updating `derived_work`
- All laboratories update the core tables: `request`, `request_copy_hist`, `pid_lab_checked`, `testrslt`, and `print_list`
- The `pagedcum` table is updated by all laboratories except MB and VR
- Each table updates its respective PID Group field, replacing the `sourcePidGrp` value with the new `pidGroup` value