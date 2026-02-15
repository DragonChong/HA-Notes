# HL7 Transaction Mapping with IOI

Absolutely! I will update the "HL7 Transaction Mapping with IOI" table in your `@background.mdce` (or equivalent background documentation) to match the attached image, ensuring all columns and values are accurate and up to date.

Below is the revised table in markdown format, ready for inclusion in your documentation:

---

### HL7 Transaction Mapping with IOI

| **Action type** | **Description**          | **Transaction type in cpi_transaction** | **Transaction type Description**            | **Event Type** | **Event Description**                    | **Remarks**                                    |
| --------------- | ------------------------ | --------------------------------------- | ------------------------------------------- | -------------- | ---------------------------------------- | ---------------------------------------------- |
| proc_type_1     | Change demo              | 030                                     | Update Patient Demographic Data             | A08            | Patient Update                           |                                                |
| proc_type_2     | Change demo              | 100                                     | In-patient Registration / OPAS Create Case  | A01, A04       | Patient Admission / Patient Registration | A01: case_type = 'I'<br/>A04: case_type != 'I' |
| proc_type_2     | Change demo              | 300                                     | A&E Registration                            | A04            | Patient Registration                     |                                                |
| proc_type_3     | Change admission         | 121                                     | Update Admission Registration               | A08            | Patient Update                           |                                                |
| proc_type_3     | Change admission         | 341                                     | A&E Register Update                         | A08            | Patient Update                           |                                                |
| proc_type_4     | Internal transfer        | 140                                     | Transfer Out                                | A02            | Patient Transfer                         |                                                |
| proc_type_4     | Internal transfer        | 160                                     | Trial Discharge                             | A21            | Patient Trial Discharge                  |                                                |
| proc_type_4     | Internal transfer        | 170                                     | Return from Trial Discharge                 | A22            | Patient Trial Discharge Return           |                                                |
| proc_type_4     | Internal transfer        | 700                                     | Bed Assignment                              | A02            | Patient Transfer                         |                                                |
| proc_type_5     | Discharge patient        | 13*                                     | Mass Discharges                             | A03            | Patient Discharge                        |                                                |
| proc_type_5     | Discharge patient        | 33*                                     | Discharge of A&E patient                    | A03            | Patient Discharge                        |                                                |
| proc_type_6     | Cancel admission         | 201                                     | Cancellation of Admission (Inpatient)       | A11            | Cancel Admission                         |                                                |
| proc_type_6     | Cancel admission         | 200                                     | Cancellation of Admission (A&E)             | A11            | Cancel Admission                         |                                                |
| proc_type_7     | Cancel discharge         | 21*                                     | Cancellation of Discharges                  | A13            | Cancel Discharge                         |                                                |
| proc_type_7     | Cancel discharge         | 35*                                     | Cancellation of A&E Discharge               | A13            | Cancel Discharge                         |                                                |
| proc_type_8     | Cancel transfer          | 220                                     | Cancellation of Transfer out                | A12            | Cancel Transfer                          |                                                |
| proc_type_8     | Cancel transfer          | 230                                     | Cancellation of Trial Discharge             | A13            | Cancel Discharge                         |                                                |
| proc_type_8     | Cancel transfer          | 240                                     | Cancellation of return from Trial Discharge | A13            | Cancel Discharge                         |                                                |
| proc_type_8     | Cancel transfer          | 710                                     | Cancellation of Bed Assignment              | A12            | Cancel Transfer                          |                                                |
| proc_type_9     | Merge patient            | 020                                     | Merge HKID                                  | A40            | Merge HKID                               |                                                |
| proc_type_010   | Patient registration     | 010                                     | PMI Registration                            | A28            | Patient PMI Registration                 |                                                |
| proc_type_031   | Change patient           | 031                                     | Change HKID                                 | A47            | Change HKID                              |                                                |
| proc_type_I     | Move episode             | 040                                     | Move episodes                               | A45            | Move Episode                             |                                                |
| proc_type_X     | Set patient deceased     | 033                                     | Update Death Indicator                      | A08            | Patient Update                           |                                                |
| proc_type_Y     | Set patient confidential | 034                                     | Update Confidentially                       | A08            | Patient Update                           |                                                |

---

**How to use:**

Replace the old mapping table in your `@background.mdce` (or equivalent background documentation) with the above markdown table. This will ensure your documentation is fully synchronized with the latest mapping as shown in your attached image.

If you need this in a different format (CSV, HTML, etc.), just let me know!