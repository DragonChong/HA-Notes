
```mermaid
gantt
    dateFormat  YYYY-MM-DD
    title       CRS Revamp
    excludes    weekends
    %% (`excludes` accepts specific dates in YYYY-MM-DD format, days of the week ("sunday") or "weekends", but not the word "weekdays".)

    section Specimen Acknowledgement
    Use data-source for BE service      :active,  des1, 2026-03-02, 2d
    New Changes in ECPath               :active,  des2, 2026-03-04, 14d
    Revise registration API             : 5d
    User permission                     : 1w
    Worksheet Printing                  : 2w
    Label Printing                      : 1w

    section Registration
    Setup new screen in local server    :         des1, 2026-03-13, 2d
    Common Components:                  :         des2, after des1, 3d
    Layout                              : 3d
```

## Specimen Acknowledgement
### New Changes in ECPath
- LIS-9567
- LIS-9593
- LIS-9610
- LIS-9698
- LIS-9767
- LIS-9801