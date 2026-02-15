# Diagram

## Temp Table

```bash
graph TD
    subgraph IOI
        E[PAS] --> F[CPI Transaction Table]
        F --> G[IOI]
         G --> H[patient]
         
    end
    subgraph LisPasPatientSyncSvc
         A[PMI-BAR] --> B[API]
         B --> C[Message Queue]
         C --> D[Scheduler]
         D -- Option exists & enabled --> I[patient_bus]
         D -. Option not existed .-> H
         H <-- Compare --> I
    end
```