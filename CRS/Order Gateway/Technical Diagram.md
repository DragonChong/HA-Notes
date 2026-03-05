# Order
```mermaid
flowchart TD
    %% Node Definitions
    subgraph GCRS_Env [GCRS Environment]
        GCRS["GCRS"]
    end

    subgraph API_Mgmt [API Management]
        Gateway["API Gateway<br/>(Validation & Routing)"]
    end

    subgraph LIS_Env [LIS Environment]
        API["LIS Restful API<br/>(lis-crs-gcrOrderServices)"]
        DB[(LIS Database<br/>Oracle)]
    end

    %% Connections
    GCRS -->|1. POST JSON Request<br/>Payloads: PO1, CS1, AT3, etc<br/>Header: x-gateway-apikey| Gateway
    Gateway -->|2. Secure Forward| API
    API -->|3. Update Order/Specimen| DB
    DB -->|4. Confirmation| API
    API -->|5. JSON Response<br/>rtnCode: 0, ackCode: MA| GCRS

    %% Styling
    style GCRS fill:#FF99FF,stroke:#333,stroke-width:1px
    style API fill:#90EE90,stroke:#333,stroke-width:1px
    style Gateway stroke-dasharray: 5 5
    style DB fill:#DDD,stroke:#333
```
