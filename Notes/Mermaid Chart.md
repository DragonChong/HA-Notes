# Mermaid Chart

## Sequence Diagram

```bash
sequenceDiagram
    participant Frontend
    participant DataConversion as Data Conversion Layer
    participant Backend

    Frontend->>DataConversion: Send User Input/Data
    activate DataConversion
    DataConversion->>DataConversion: Process/Transform Data
    DataConversion->>Backend: Send Converted Data
    deactivate DataConversion
    activate Backend
    Backend->>Backend: Process Request
    Backend->>DataConversion: Return Response Data
    activate DataConversion
    DataConversion->>DataConversion: Convert Response Data
    DataConversion->>Frontend: Send Converted Response
    deactivate DataConversion
    Frontend->>Frontend: Render Response
```

## Flow Chart

![Mermaid Chart - Create complex, visual diagrams with text. A smarter way of creating diagrams.-2025-08-09-152312.png](Mermaid%20Chart.assets/Mermaid%20Chart%20-%20Create%20complex,%20visual%20diagrams%20with%20text.%20A%20smarter%20way%20of%20creating%20diagrams.-2025-08-09-152312.png)

```javascript
flowchart TB
    subgraph Old_Flow[IOI]
        SRC[Source System] --> SYB[CPI Transaction Table]
        SYB --> CPG[IOI]
        CPG --> PT_C[Patient]
    end

    subgraph New_Flow[lis-pas-patient-sync-svc]
        HL7[HL7 Source] --> API[API]
        API --> MQ[Message Queue]
        MQ --> SCHED[Scheduler]
        SCHED --> PT_S[TempPatient]
    end

    PT_C <-->|Comparison| PT_S



```

Message Queue

```bash
graph TD
    A["Application Calls getNextBatchOfMessages(batchSize=10)"] --> B["Database Query Execution"]
    
    B --> C["Before Optimization:<br/>N+1 Query Problem"]
    B --> D["After Optimization:<br/>Single Efficient Query"]
    
    C --> E["1. SELECT * FROM MessageQueue<br/>WHERE status IN (0, -2, -3)<br/>ORDER BY created_date<br/><br/>Returns 1000+ messages"]
    E --> F["2. For each message (1000+ times):<br/>SELECT COUNT(*) FROM MessageQueue<br/>WHERE hkid = ? AND status IN (-1, -2, 98)<br/>AND created_date < ?"]
    F --> G["3. Application filters and limits<br/>to 10 messages"]
    
    D --> H["Single Query with Pageable:<br/>SELECT m FROM MessageQueue m<br/>WHERE m.status IN (0, -2, -3)<br/>AND NOT EXISTS (<br/>  SELECT 1 FROM MessageQueue blocking<br/>  WHERE blocking.hkid = m.hkid<br/>  AND blocking.caseNo = m.caseNo<br/>  AND blocking.status IN (-1, -2, 98)<br/>  AND blocking.createdDate < m.createdDate<br/>)<br/>ORDER BY m.createdDate<br/>LIMIT 10"]
    
    H --> I["Returns exactly 10 eligible messages"]
    
    C --> J["Performance Impact:<br/>🔴 1000+ database round trips<br/>🔴 High memory usage<br/>🔴 Slow response time"]
    
    D --> K["Performance Benefits:<br/>🟢 1 database query only<br/>🟢 Minimal memory usage<br/>🟢 Fast response time<br/>🟢 Database-level filtering"]
    
    style C fill:#ffcccc
    style D fill:#ccffcc
    style J fill:#ffcccc
    style K fill:#ccffcc
```