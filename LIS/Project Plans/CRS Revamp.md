
```mermaid
gantt
    dateFormat  YYYY-MM-DD
    title       CRS Revamp
    excludes    weekends
    %% (`excludes` accepts specific dates in YYYY-MM-DD format, days of the week ("sunday") or "weekends", but not the word "weekdays".)
    
    section Specimen Acknowledgement
    Use data-source for BE service      :active,  des1, 2026-03-03, 2026-03-04
    New Changes in ECPath               :active,  des2, 2026-03-04, 7d
    Revise registration API             :  des2, 2026-03-16, 5d
    
    section Registration
    Setup new screen in local server    :         des1, 2026-03-09, 2d
```
