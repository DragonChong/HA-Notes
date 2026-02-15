# Age Calculation

## Age & Age Unit

### Front-end (LisDobAndAgeManipulationPm)

- Year Diff > 0 è Age Unit = Y
- Year Diff Calculation
    - Year Diff = End Year – Start Year
    - If any of followings fulfilled, Year Diff -= 1
        - End Month < Start Month
        - End Month = Start Month & End Day < Start Day
- Year Diff = 0, Month Diff > 0 è Age Unit = M
- Month Diff Calculation
    - Month Diff = End Month <= Start Month ? 12 – Start Month + End Month : End Month – Start Month
    - If following fulfilled, Month Diff -=1
        - End Day < Start Day

### Back-end (AgeAndAgeUnitHelper#calculateAgeAndAgeUnit)

This is being used in many different areas. E.g. patient retrieval, reports

[calculateAgeAndAgeUnit 1.pdf](Age%20Calculation.assets/calculateAgeAndAgeUnit%201.pdf)

[calculateAgeAndAgeUnit 2.pdf](Age%20Calculation.assets/calculateAgeAndAgeUnit%202.pdf)

[calculateAgeAndAgeUnit 3.pdf](Age%20Calculation.assets/calculateAgeAndAgeUnit%203.pdf)

## Age Value Calculation

### HA

- If Day Diff = 0, Day Diff è 1
- Age Value = Day Diff / 365.25

### CPLC (Age Value Adjusted by Displayed Age)

- Displayed Age Value
    - Age Unit = M
        - Displayed Age = Age * 31 / 365.25
    - Age Unit = Y
        - Displayed Age = Age
- Calculated Age Value
    - Calculated Age Value = Day Diff / 365.25
- If Start Month = End Month & Start Day = End Day
    - Calculated Age Value = Displayed Age Value
- If Calculated Age Value <= Displayed Age Value
    - Adjusted Date
        - Age Unit = M
            - Adjusted Date = End Date – n Months
        - Age Unit = Y
            - Adjusted Date = End Date – n Years
    - Day Diff between DOB & Adjusted Date
        - If Day Diff >= 0
            - Final Age Value = Displayed Age Value + Day Diff * 0.0001
        - If Day Diff < 0
            - Final Age Value = Displayed Age Value
- If Calculated Age Value > Displayed Age Value
    - Final Age Value = Calculated Age Value

[Age Value Adjusted By Displayed Age (CPLC).xlsx](Age%20Calculation.assets/Age%20Value%20Adjusted%20By%20Displayed%20Age%20(CPLC).xlsx)

## Age Calculation Related Setup

### Allow Zero Day Age (Introduced by NSL)

- Setup
    - LAB_OPTION[option_group = 'PATIENT' AND option_code = 'ZERO_DAY_AGE_ALLOWED']
- Age & Age Unit
    - Allow Day Diff = 0
    - Age & Age Unit = 0D
- Age Value
    - Day Diff = 0 è Age Value = 0.0001