# Printing Suite — Mechanism Documentation

> Generated: 2026-04-15  
> Services covered: `print-render-svc`, `object-storage-svc`, `print-delivery-svc`, `print-agent-app`

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [RenderPrint Flow — Full Async Sequence](#2-renderprint-flow--full-async-sequence)
3. [Render-Only Flow — Synchronous Request-Reply](#3-render-only-flow--synchronous-request-reply)
4. [Print-Only Flow — Async Pre-rendered PDF](#4-print-only-flow--async-pre-rendered-pdf)
5. [Print Agent App — Internal Processing Flow](#5-print-agent-app--internal-processing-flow)
6. [Print Delivery Service — WebSocket Connection Lifecycle](#6-print-delivery-service--websocket-connection-lifecycle)
7. [RocketMQ Topic Map](#7-rocketmq-topic-map)
8. [Print Job Status — Lifecycle State Diagram](#8-print-job-status--lifecycle-state-diagram)

---

## 1. Architecture Overview

The complete topology of all four services, their internal components, and every communication channel — RocketMQ topics, WebSocket connections, S3 API calls, HTTP REST, IPC bridge, SQLite, Java process, and physical printers.

```mermaid
flowchart TB
    subgraph External["External Callers"]
        App["External Application\n(any microservice)"]
        LocalCaller["Local Caller\n(same machine)"]
    end

    subgraph RenderSvc["print-render-svc  :8080"]
        Controller["PrintRenderController\nPOST /v1/render\nPOST /v1/renderPrint\nPOST /v1/print"]
        RenderProducer["MessageProducer\n(rocketMQTemplate\n+ deliveryRocketMQTemplate)"]
        RenderConsumer["RenderConsumer\nRocketMQReplyListener\nPrinting_Render"]
        PrintConsumer["PrintConsumer\nRocketMQListener\nPrinting_Print"]
        RPConsumer["RenderPrintConsumer\nRocketMQListener\nPrinting_RenderPrint"]
        ResourceSvc["ResourceService\nbuildResourceMap()"]
        StorageSvc["StorageService\nMinIO/S3 client"]
        JasperUtil["JasperUtil\nJasperReports engine"]
        PdfUtil["PdfUtil\niText PDF merge/\nencrypt/decrypt"]
    end

    subgraph ObjectStorage["object-storage-svc  :9000  (S3-compatible)"]
        S3API["S3 REST API\n(AWS Signature V4)"]
        FS["Filesystem Storage\nbucket/object path"]
    end

    subgraph RocketMQ["Apache RocketMQ  :9876"]
        T_Render["Printing_Render\n(sync reply)"]
        T_Print["Printing_Print\n(async)"]
        T_RenderPrint["Printing_RenderPrint\n(async)"]
        T_PrintQueue["Printing_PrintQueue_{location}\n(per-location)"]
        T_PersonalQueue["Printing_PersonalPrintQueue\n(per-user)"]
        T_Status["Printing_PrintStatus\n(status acks)"]
    end

    subgraph DeliverySvc["print-delivery-svc  :8089"]
        WSHandler["PrintWebSocketHandler\nWebSocket endpoint\n/ws"]
        MQConsumer["PrintMQPushConsumer\n(one per location/session)"]
        SessionMgr["WebSocketSessionManager\nConcurrentHashMap\nsessions"]
        DeliveryProducer["MessageProducer\nPrinting_PrintStatus"]
        LocationSvc["LocationLookupService\nhostname → location"]
    end

    subgraph AgentApp["print-agent-app  (Electron Desktop)"]
        HttpServer["Express HTTP :18300\nPOST /v1/print"]
        ReactUI["React Frontend\nuseReportQueue hook\nfastq concurrency=1"]
        IPCBridge["IPC Bridge\ncontextBridge"]
        ElectronMain["Electron Main\nipcMain handlers"]
        SQLite["SQLite DB\nTypeORM\njob history"]
        JavaProc["Java Process\nlocal-print-service.jar\nPDF/text printing"]
        Printer["Physical Printer\nWindows/Unix/Network"]
    end

    App -->|"POST /v1/renderPrint\nPOST /v1/render\nPOST /v1/print"| Controller
    LocalCaller -->|"POST /v1/print"| HttpServer
    Controller --> RenderProducer

    RenderProducer -->|"Printing_Render (sync)"| T_Render
    RenderProducer -->|"Printing_Print (async)"| T_Print
    RenderProducer -->|"Printing_RenderPrint (async)"| T_RenderPrint
    RenderProducer -->|"Printing_PrintQueue_{loc} (delivery)"| T_PrintQueue
    RenderProducer -->|"Printing_PersonalPrintQueue"| T_PersonalQueue
    RenderProducer -->|"Printing_PrintStatus (ack)"| T_Status

    T_Render --> RenderConsumer
    T_Print --> PrintConsumer
    T_RenderPrint --> RPConsumer

    RPConsumer --> ResourceSvc
    PrintConsumer --> PdfUtil
    RenderConsumer --> ResourceSvc
    ResourceSvc --> StorageSvc
    StorageSvc <-->|"S3 GET/PUT"| S3API
    S3API --> FS

    RPConsumer --> JasperUtil
    RenderConsumer --> JasperUtil
    RPConsumer --> PdfUtil
    RenderConsumer --> PdfUtil

    T_PrintQueue --> MQConsumer
    T_PersonalQueue --> MQConsumer

    WSHandler --> SessionMgr
    WSHandler --> LocationSvc
    WSHandler --> MQConsumer
    MQConsumer -->|"TextMessage JSON"| WSHandler
    WSHandler --> DeliveryProducer
    DeliveryProducer -->|"Printing_PrintStatus\nDelivered/Printed"| T_Status

    AgentApp <-->|"WebSocket\nws://print-delivery-svc/ws\n?locationTag=...&hospCode=..."| WSHandler
    HttpServer -->|"IPC event\nprintRequest"| ReactUI
    ReactUI --> IPCBridge
    IPCBridge --> ElectronMain
    ElectronMain --> SQLite
    ElectronMain --> JavaProc
    JavaProc --> Printer
    ElectronMain --> Printer

    App -.->|"consume Printing_PrintStatus\nfor async tracking"| T_Status
```

---

## 2. RenderPrint Flow — Full Async Sequence

The primary end-to-end path. The caller fires `POST /v1/renderPrint` and gets an immediate `200 OK`. All subsequent work is asynchronous, with status updates flowing through `Printing_PrintStatus:{app}`.

```mermaid
sequenceDiagram
    autonumber
    participant App as External App
    participant RenderCtrl as PrintRenderController<br/>(print-render-svc)
    participant MQProd as MessageProducer<br/>(render-svc)
    participant MQ as RocketMQ
    participant RPCons as RenderPrintConsumer<br/>(print-render-svc)
    participant ResourceSvc as ResourceService
    participant S3 as object-storage-svc<br/>:9000 (S3)
    participant Jasper as JasperUtil / PdfUtil
    participant DeliveryMQCons as PrintMQPushConsumer<br/>(print-delivery-svc)
    participant WS as PrintWebSocketHandler<br/>(print-delivery-svc)
    participant DelivProd as MessageProducer<br/>(delivery-svc)
    participant Agent as Print Agent App<br/>(Electron)
    participant Java as Java Print Service<br/>(local-print-service.jar)
    participant Printer as Physical Printer

    App->>RenderCtrl: POST /v1/renderPrint?app={app}<br/>{ jobs[], resources[], resourcesUrl }

    RenderCtrl->>MQProd: sendRenderPrintRequest(app, request)
    MQProd->>MQ: publish Printing_RenderPrint:{app}<br/>payload: RenderPrintRequest JSON
    RenderCtrl-->>App: 200 OK (fire-and-forget)

    Note over MQ,RPCons: Async consumption by RenderPrintConsumer

    MQ->>RPCons: onMessage(RenderPrintRequest)

    loop For each RenderPrintJob
        RPCons->>ResourceSvc: buildResourceMap(jobs, resources, resourcesUrl)
        ResourceSvc->>S3: GET object (templates by filename)
        S3-->>ResourceSvc: Base64-encoded template bytes
        ResourceSvc-->>RPCons: Map[filename → Resource]

        alt Template is JasperReport (.jrxml/.jasper)
            RPCons->>Jasper: JasperUtil.render(input, resourceMap)
            Jasper-->>RPCons: PDF OutputStream
        else Template is PDF
            RPCons->>Jasper: use PDF bytes directly
        end

        opt Multiple inputs → merge PDFs
            RPCons->>Jasper: PdfUtil.mergePdf(inputStreams)
            Jasper-->>RPCons: merged PDF bytes
        end

        RPCons->>MQProd: ackPrintStatus(app, Rendered, jobId)
        MQProd->>MQ: publish Printing_PrintStatus:{app}<br/>{ status: Rendered }

        alt Output → Printouts (location-based)
            RPCons->>MQProd: sendToLocationPrintQueue(locationTag, location, reportData)
            MQProd->>MQ: publish Printing_PrintQueue_{location}:{locationTag}<br/>payload: ReportData { jobId, app, report, printout }
            RPCons->>MQProd: ackPrintStatus(app, Queued, jobId, printoutId)
            MQProd->>MQ: publish Printing_PrintStatus:{app}<br/>{ status: Queued }
        else Output → Recipient (personal queue)
            RPCons->>MQProd: sendToPersonalPrintQueue(tag, recipient, reportData)
            MQProd->>MQ: publish Printing_PersonalPrintQueue:{tag}<br/>headers: X-HA-HospCode, X-HA-UserCode
        else Output → File (S3 storage)
            opt PDF post-processing (encrypt)
                RPCons->>Jasper: PdfUtil.encryptPdf(bytes, password)
                Jasper-->>RPCons: encrypted PDF bytes
            end
            RPCons->>S3: PUT object (alias/bucket/path pattern)
            RPCons->>MQProd: ackPrintStatus(app, Stored, jobId, null, fileId)
            MQProd->>MQ: publish Printing_PrintStatus:{app}<br/>{ status: Stored }
        end
    end

    Note over MQ,DeliveryMQCons: PrintMQPushConsumer subscribed per location/session

    MQ->>DeliveryMQCons: consumeMessage(ReportData)
    DeliveryMQCons->>WS: session.sendMessage(TextMessage(msg.getBody()))
    WS-->>Agent: WebSocket push: ReportData JSON<br/>{ jobId, app, report(base64 PDF), printout }

    DeliveryMQCons->>DelivProd: ackPrintStatus(app, Delivered, jobId, printoutId)
    DelivProd->>MQ: publish Printing_PrintStatus:{app}<br/>{ status: Delivered }

    Note over Agent: Print Agent queues job in fastq (concurrency=1)

    Agent->>Agent: ipc.saveReport(reportData) → SQLite
    Agent->>Agent: useReportQueue enqueues Report

    Agent->>Java: javaManager.sendCommand({ command:'print', args:[file, jobName, printOption, password] })
    Java->>Printer: Java Print Service / PDFTools → physical print
    Printer-->>Java: print complete
    Java-->>Agent: { success: true }

    Agent->>WS: WebSocket send: { app, jobId, printoutId, status:Printed }
    WS->>DelivProd: ackPrintStatus(app, Printed, jobId, printoutId)
    DelivProd->>MQ: publish Printing_PrintStatus:{app}<br/>{ status: Printed }

    App-->>MQ: (optional) consume Printing_PrintStatus:{app}<br/>to track Rendered → Queued → Delivered → Printed
```

---

## 3. Render-Only Flow — Synchronous Request-Reply

`POST /v1/render` uses RocketMQ's **request-reply** pattern. `RenderConsumer` implements `RocketMQReplyListener` and returns `EncodedData[]` (Base64 PDFs) synchronously back to the HTTP caller. No delivery or printing occurs — the caller receives and handles the PDF bytes directly.

```mermaid
sequenceDiagram
    autonumber
    participant App as External App
    participant RenderCtrl as PrintRenderController<br/>(print-render-svc)
    participant MQProd as MessageProducer<br/>(render-svc)
    participant MQ as RocketMQ
    participant RenderCons as RenderConsumer<br/>(RocketMQReplyListener)
    participant ResourceSvc as ResourceService
    participant S3 as object-storage-svc<br/>(S3 API)
    participant Jasper as JasperUtil / PdfUtil

    App->>RenderCtrl: POST /v1/render<br/>{ jobs[], resources[], resourcesUrl }

    RenderCtrl->>MQProd: sendAndReceiveRenderRequest(request)
    MQProd->>MQ: sendAndReceive Printing_Render<br/>payload: RenderRequest JSON
    Note over MQ,RenderCons: Synchronous request-reply pattern

    MQ->>RenderCons: onMessage(RenderRequest)

    loop For each RenderJob
        RenderCons->>ResourceSvc: buildResourceMap(jobs, resources, resourcesUrl)

        alt resourcesUrl provided (S3 path)
            ResourceSvc->>S3: GET object (template file by name)
            S3-->>ResourceSvc: Base64-encoded bytes
        else inline resources in request body
            ResourceSvc->>ResourceSvc: ResourceUtil.buildResourceMap(resources)
        end
        ResourceSvc-->>RenderCons: Map[filename → Resource]

        alt Template is JasperReport
            RenderCons->>Jasper: JasperUtil.render(input, resourceMap)
            Note over Jasper: Compile JRXML + fill with parameters
            Jasper-->>RenderCons: PDF bytes in OutputStream
        else Template is PDF resource
            RenderCons->>RenderCons: use Base64 PDF bytes directly
        end

        opt Multiple inputs
            RenderCons->>Jasper: PdfUtil.mergePdf(inputStreams)
            Jasper-->>RenderCons: merged PDF bytes
        end

        opt PostProcess.Encrypt defined
            RenderCons->>Jasper: PdfUtil.encryptPdf(bytes, password)
            Jasper-->>RenderCons: encrypted PDF bytes
        end

        RenderCons->>RenderCons: EncodedData { contentType, body(Base64) }
    end

    RenderCons-->>MQ: reply: JSON array of EncodedData[]
    MQ-->>MQProd: String reply received
    MQProd->>MQProd: objectMapper.readValue → EncodedData[]
    MQProd-->>RenderCtrl: EncodedData[]
    RenderCtrl-->>App: 200 OK [ { contentType, body(Base64 PDF) }, ... ]

    Note over App: Caller receives Base64-encoded PDF(s) synchronously.<br/>No routing to printers — caller handles the data directly.
```

---

## 4. Print-Only Flow — Async (Pre-rendered PDF)

`POST /v1/print` accepts already-rendered Base64 PDFs from the caller (e.g. obtained from `/v1/render`). `PrintConsumer` optionally decrypts and merges them, then routes to location print queues — same downstream delivery path as RenderPrint.

```mermaid
sequenceDiagram
    autonumber
    participant App as External App
    participant RenderCtrl as PrintRenderController<br/>(print-render-svc)
    participant MQProd as MessageProducer<br/>(render-svc)
    participant MQ as RocketMQ
    participant PrintCons as PrintConsumer<br/>(print-render-svc)
    participant PdfUtil as PdfUtil<br/>(iText)
    participant DelivMQCons as PrintMQPushConsumer<br/>(print-delivery-svc)
    participant WS as PrintWebSocketHandler<br/>(print-delivery-svc)
    participant DelivProd as MessageProducer<br/>(delivery-svc)
    participant Agent as Print Agent App<br/>(Electron)
    participant Printer as Physical Printer

    App->>RenderCtrl: POST /v1/print?app={app}<br/>{ jobs[{ id, inputs[EncodedData], output }] }
    Note over App: Caller provides pre-rendered Base64 PDFs<br/>(e.g. obtained from /v1/render)

    RenderCtrl->>MQProd: sendPrintRequest(app, request)
    MQProd->>MQ: publish Printing_Print:{app}<br/>payload: PrintRequest JSON
    RenderCtrl-->>App: 200 OK (fire-and-forget)

    MQ->>PrintCons: onMessage(PrintRequest)

    loop For each PrintJob
        alt Single pre-rendered input
            PrintCons->>PrintCons: internalPrint → use EncodedData directly
            Note over PrintCons: Optionally decrypt PDF if password provided
        else Multiple inputs → merge
            PrintCons->>PdfUtil: decryptPdf(bytes, password) for each encrypted input
            PdfUtil-->>PrintCons: decrypted PDF bytes
            PrintCons->>PdfUtil: PdfUtil.mergePdf(inputStreams)
            PdfUtil-->>PrintCons: merged EncodedData
            PrintCons->>MQProd: ackPrintStatus(app, Rendered, jobId)
            MQProd->>MQ: publish Printing_PrintStatus:{app}<br/>{ status: Rendered }
        end

        alt Output → Location-based printout
            PrintCons->>MQProd: sendToLocationPrintQueue(locationTag, location, reportData)
            MQProd->>MQ: publish Printing_PrintQueue_{location}:{locationTag}<br/>ReportData { jobId, app, report, printout }
            PrintCons->>MQProd: ackPrintStatus(app, Queued, jobId, printoutId)
            MQProd->>MQ: publish Printing_PrintStatus:{app}<br/>{ status: Queued }
        else Output → Recipient (personal)
            PrintCons->>MQProd: sendToPersonalPrintQueue(tag, recipient, reportData)
            MQProd->>MQ: publish Printing_PersonalPrintQueue:{tag}
        end
    end

    MQ->>DelivMQCons: consumeMessage(ReportData)
    DelivMQCons->>WS: session.sendMessage(payload)
    WS-->>Agent: WebSocket push: ReportData JSON

    DelivMQCons->>DelivProd: ackPrintStatus(app, Delivered, jobId, printoutId)
    DelivProd->>MQ: Printing_PrintStatus:{app} { status: Delivered }

    Agent->>Printer: print PDF/text to physical printer
    Agent->>WS: WebSocket send: { app, jobId, printoutId }
    WS->>DelivProd: ackPrintStatus(app, Printed, jobId, printoutId)
    DelivProd->>MQ: Printing_PrintStatus:{app} { status: Printed }
```

---

## 5. Print Agent App — Internal Processing Flow

How the Electron desktop application starts up, connects to the delivery service, receives jobs via two ingress paths, and executes them sequentially on the physical printer.

```mermaid
flowchart TD
    subgraph Startup["App Startup (Electron Main)"]
        A([App launched]) --> B[Initialize SQLite DB via TypeORM]
        B --> C[Start Express HTTP server :18300]
        C --> D[Load pending reports from DB]
        D --> E[Start Java process manager\nlocal-print-service.jar via stdin/stdout]
    end

    subgraph WebSocketConn["WebSocket Connection (React Frontend)"]
        F[Connect to print-delivery-svc\nws://PRINT_SERVER_URL/ws\n?locationTag=...&hospCode=...]
        F --> G{Connection accepted?}
        G -->|capacity exceeded| H[Connection closed 1008]
        G -->|accepted| I[Server creates PrintMQPushConsumer\nsubscribes Printing_PrintQueue_location]
    end

    subgraph Ingress["Job Ingress — Two Paths"]
        J1["WebSocket message received\n(from print-delivery-svc)"]
        J2["HTTP POST /v1/print :18300\n(from local caller)"]
        J1 --> K[IPC event 'printRequest'\nforward to renderer via win.webContents.send]
        J2 --> K
    end

    subgraph Queue["Print Queue Processing (useReportQueue hook)"]
        K --> L[ipc.saveReport → SQLite\nReportStatus = Pending]
        L --> M[fastq.push report\nconcurrency = 1 — sequential]
        M --> N{Queue paused?}
        N -->|yes| O[Wait / resume]
        N -->|no| P[dequeue next report\ninner.printReport called]
        O --> P
        P --> Q{Report ID in\ndeleted set?}
        Q -->|deleted| R[Skip — no print]
        Q -->|active| S[ipc.printReport → IPC invoke\n'printReport' to Electron Main]
    end

    subgraph PrintExec["Print Execution (Electron Main — printReport.ts)"]
        S --> T{File type?}
        T -->|PDF or TXT on Windows| U{Java process running?}
        U -->|yes| V[javaManager.sendCommand\n{ command:'print', args:[file, jobName, option, password] }]
        V --> W{waitForPrintResult?}
        W -->|yes| X[getWin32PrintLog → Windows Event Log\ncheck for successful print event]
        W -->|no| Y[sleep 1000ms]
        X --> Z{Event ID 824?}
        Z -->|error event| AA[ReportStatus = Failed\nreturn error]
        Z -->|success| AB[continue]
        Y --> AB
        U -->|no| AC[fallback path]
        T -->|PDF or TXT on Unix| AD[lp command\nlp -n copies -d printer file]
        T -->|Direct path printer\nWindows| AE[COPY /B file printer]
        T -->|Unix path printer| AF[copy file to printer path]
        AD --> AB
        AE --> AB
        AF --> AB
        AB --> AG[reportRepository.updateStatus\nReportStatus = Completed]
        AG --> AH[setReports filter out completed]
        AH --> AI["notifyPrinted(report)"]
        AI --> AJ[ipc send PrintStatus{Printed}\nback over WebSocket]
    end

    E --> F
    I --> J1
    D --> M
```

---

## 6. Print Delivery Service — WebSocket Connection Lifecycle

Full lifecycle of a WebSocket session in `print-delivery-svc`, from the initial `UPGRADE` handshake through dynamic consumer creation, message forwarding, ack handling, and clean shutdown.

```mermaid
sequenceDiagram
    autonumber
    participant Agent as Print Agent App
    participant WS as PrintWebSocketHandler<br/>(print-delivery-svc)
    participant Intercept as PrintHandshakeInterceptor
    participant SessionMgr as WebSocketSessionManager
    participant LocSvc as LocationLookupService
    participant LocClient as LocationClient<br/>(Feign → location-svc)
    participant MQCons as PrintMQPushConsumer<br/>(per location)
    participant MQ as RocketMQ<br/>Printing_PrintQueue_{location}
    participant DelivProd as MessageProducer<br/>(delivery-svc)

    Note over Agent,WS: WebSocket Handshake
    Agent->>WS: WebSocket UPGRADE<br/>/ws?locationTag=OPD&locationTag=LAB&hospCode=HA0
    WS->>Intercept: beforeHandshake(request, response, handler, attributes)
    Intercept->>Intercept: extract X-Forwarded-For / remote addr → KEY_CLIENT_IP
    Intercept->>Intercept: extract hostname → KEY_CLIENT_NAME
    Intercept->>WS: attributes{ clientIp, clientName }
    WS-->>Agent: 101 Switching Protocols

    Note over WS,MQCons: afterConnectionEstablished
    WS->>SessionMgr: getActiveSessionCount()
    SessionMgr-->>WS: count

    alt count >= maxConcurrentConnections (default 500)
        WS-->>Agent: close(1008, "Server capacity reached")
    else capacity available
        WS->>LocSvc: getLocations(clientName, "OPD", "HA0")

        alt location-lookup.enabled = true
            LocSvc->>LocClient: Feign GET /locations?hostname=clientName&tag=OPD&hospCode=HA0
            LocClient-->>LocSvc: LocationDto[]
        else disabled / fallback
            LocSvc->>LocSvc: derive location from clientName<br/>(replace '.' with '_')
        end

        LocSvc-->>WS: [LocationDto{ location:"HA0_OPD_A" }]

        loop For each unique location
            WS->>MQCons: new PrintMQPushConsumer(<br/>  group="print_delivery_HA0_OPD_A",<br/>  topic="Printing_PrintQueue_HA0_OPD_A",<br/>  subExpression="OPD||LAB",<br/>  session, rocketMQProps, ...)
            WS->>MQCons: consumer.start()
            MQCons->>MQ: subscribe Printing_PrintQueue_HA0_OPD_A<br/>filter: OPD||LAB
        end

        WS->>SessionMgr: add(sessionId, { location → consumer })
    end

    Note over MQ,Agent: Message delivery loop (while connected)
    MQ-->>MQCons: ReportData message pushed
    MQCons->>MQCons: check session.isOpen()
    MQCons->>WS: session.sendMessage(TextMessage)
    WS-->>Agent: WebSocket TEXT frame: ReportData JSON
    MQCons->>DelivProd: ackPrintStatus(app, Delivered, jobId, printoutId)
    DelivProd->>MQ: Printing_PrintStatus:{app}

    Note over Agent,WS: Agent sends Printed acknowledgment
    Agent->>WS: WebSocket TEXT: { app, jobId, printoutId, status }
    WS->>WS: handleTextMessage → objectMapper.readValue → PrintStatus
    WS->>DelivProd: ackPrintStatus(app, Printed, jobId, printoutId)
    DelivProd->>MQ: Printing_PrintStatus:{app} { status: Printed }

    Note over Agent,SessionMgr: Connection closed
    Agent->>WS: WebSocket CLOSE
    WS->>SessionMgr: remove(sessionId) → Map of consumers
    loop For each consumer
        WS->>MQCons: consumer.shutdown()
        MQCons->>MQ: unsubscribe + shutdown thread pool
    end

    Note over SessionMgr: Health check every 5 minutes<br/>log active count, warn if > 80% capacity
```

---

## 7. RocketMQ Topic Map

All 6 topics, which producer publishes to them, which consumer reads from them, how tags and filters work, and the `KEYS=jobId` header used for message tracing.

```mermaid
flowchart LR
    subgraph Producers["Producers"]
        P1["print-render-svc<br/>MessageProducer<br/>(rocketMQTemplate)"]
        P2["print-render-svc<br/>MessageProducer<br/>(deliveryRocketMQTemplate)"]
        P3["print-delivery-svc<br/>MessageProducer"]
    end

    subgraph Topics["RocketMQ Topics"]
        T1[["Printing_Render<br/>(sync req-reply)"]]
        T2[["Printing_RenderPrint<br/>:{app} tag"]]
        T3[["Printing_Print<br/>:{app} tag"]]
        T4[["Printing_PrintQueue_{location}<br/>:{locationTag} filter"]]
        T5[["Printing_PersonalPrintQueue<br/>:{tag}<br/>headers: HospCode, UserCode"]]
        T6[["Printing_PrintStatus<br/>:{app} tag"]]
    end

    subgraph Consumers["Consumers"]
        C1["RenderConsumer<br/>RocketMQReplyListener<br/>group: render.group"]
        C2["RenderPrintConsumer<br/>RocketMQListener<br/>group: render-print.group"]
        C3["PrintConsumer<br/>RocketMQListener<br/>group: print.group"]
        C4["PrintMQPushConsumer<br/>(print-delivery-svc)<br/>group: print_delivery_{location}<br/>created per WebSocket session"]
        C5["External App<br/>(optional status polling)"]
    end

    P1 -->|"Render (sync)"| T1
    P1 -->|"RenderPrint (async)"| T2
    P1 -->|"Print (async)"| T3
    P1 -->|"Status Ack"| T6

    P2 -->|"Location queue<br/>KEYS=jobId"| T4
    P2 -->|"Personal queue<br/>KEYS=jobId"| T5

    P3 -->|"Delivered / Printed<br/>KEYS=jobId"| T6

    T1 --> C1
    T2 --> C2
    T3 --> C3
    T4 --> C4
    T5 --> C4
    T6 --> C5

    style T1 fill:#d4edda,stroke:#28a745
    style T2 fill:#fff3cd,stroke:#ffc107
    style T3 fill:#fff3cd,stroke:#ffc107
    style T4 fill:#d1ecf1,stroke:#17a2b8
    style T5 fill:#d1ecf1,stroke:#17a2b8
    style T6 fill:#f8d7da,stroke:#dc3545
```

### Topic Reference Table

| Topic | Pattern | Direction | Notes |
|---|---|---|---|
| `Printing_Render` | Sync req-reply | render-svc internal | `rocketMQTemplate.sendAndReceive` |
| `Printing_RenderPrint` | Async, tag=`{app}` | render-svc internal | Fire-and-forget from controller |
| `Printing_Print` | Async, tag=`{app}` | render-svc internal | Pre-rendered PDFs only |
| `Printing_PrintQueue_{location}` | Async, filter=`{locationTag}` | render-svc → delivery-svc | `deliveryRocketMQTemplate`, `KEYS=jobId` |
| `Printing_PersonalPrintQueue` | Async, tag=`{app}` | render-svc → delivery-svc | Headers: `X-HA-HospCode`, `X-HA-UserCode` |
| `Printing_PrintStatus` | Async, tag=`{app}` | render-svc / delivery-svc → caller | Statuses: `Rendered`, `Queued`, `Stored`, `Delivered`, `Printed`, `Error` |

---

## 8. Print Job Status — Lifecycle State Diagram

All possible states a print job passes through, including parallel output paths (print, store, render-only) and error states.

```mermaid
stateDiagram-v2
    [*] --> Submitted : App calls POST /v1/renderPrint<br/>or POST /v1/print

    state "RocketMQ Published" as Submitted
    state "Rendering in progress" as Rendering {
        [*] --> FetchingTemplates : buildResourceMap()
        FetchingTemplates --> RunningJasper : templates loaded from S3
        RunningJasper --> MergingPDFs : JasperUtil.render() per input
        MergingPDFs --> PostProcessing : PdfUtil.mergePdf()
        PostProcessing --> [*] : BytesData ready
    }

    Submitted --> Rendering : RenderPrintConsumer<br/>or RenderConsumer<br/>picks up message

    Rendering --> Rendered : ackPrintStatus(Rendered)<br/>Printing_PrintStatus

    state "Render-Only Output" as RenderOnly
    Rendered --> RenderOnly : POST /v1/render (sync reply)<br/>Returns EncodedData[] to caller

    state "File Storage Output" as Stored
    Rendered --> Stored : output.files defined<br/>PUT to object-storage-svc<br/>ackPrintStatus(Stored)

    state "Queued for printing" as Queued
    Rendered --> Queued : output.printouts defined<br/>Printing_PrintQueue_{location} published<br/>ackPrintStatus(Queued)

    Queued --> Delivered : PrintMQPushConsumer<br/>forwards via WebSocket<br/>ackPrintStatus(Delivered)

    state "Delivered to agent" as Delivered

    state "Printing in progress" as Printing {
        [*] --> Saved : saveReport → SQLite
        Saved --> Enqueued : fastq.push(report)
        Enqueued --> Executing : dequeued (concurrency=1)
        Executing --> SentToJava : Java Process (Windows PDF/TXT)
        Executing --> SentToLp : lp command (Unix)
        Executing --> SentToCopy : COPY /B (Windows direct path)
        SentToJava --> WaitingLog : waitForPrintResult=true
        WaitingLog --> [*] : Windows Event ID success
        SentToJava --> [*]
        SentToLp --> [*]
        SentToCopy --> [*]
    }

    Delivered --> Printing : Print Agent App<br/>receives WebSocket push

    Printing --> Printed : print complete<br/>Agent sends PrintStatus over WebSocket<br/>ackPrintStatus(Printed)

    state "Error" as ErrorState
    Rendered --> ErrorState : exception during render<br/>ackPrintStatus(Error)
    Printing --> ErrorState : Java print failed<br/>or Windows Event 824<br/>ReportStatus = Failed

    Printed --> [*]
    RenderOnly --> [*]
    Stored --> [*]
    ErrorState --> [*]

    note right of Queued : Topic: Printing_PrintQueue_{location}<br/>or Printing_PersonalPrintQueue<br/>(for recipient-based delivery)
    note right of Delivered : print-delivery-svc acts as<br/>RocketMQ ↔ WebSocket bridge
    note right of Printed : Printing_PrintStatus:{app}<br/>consumed by original caller<br/>for end-to-end tracking
```

---

## Key Design Decisions

| Concern | Decision | Rationale |
|---|---|---|
| Render sync vs async | `/v1/render` is sync (req-reply), `/v1/renderPrint` and `/v1/print` are async | Sync render suits callers needing the PDF bytes immediately; async suits fire-and-forget workflows |
| Two RocketMQ templates | `rocketMQTemplate` for internal ops, `deliveryRocketMQTemplate` for print queues | Print queues may target a different RocketMQ nameserver from internal topics |
| Dynamic consumer creation | `PrintMQPushConsumer` created per WebSocket session, not at startup | Location binding happens at connect time from client hostname/locationTag query params |
| Sequential print queue | `fastq` with concurrency=1 in `useReportQueue` | Prevents overlapping print jobs on a single physical printer |
| Java process for printing | `local-print-service.jar` via stdin/stdout JSON on Windows | Java Print Service API provides reliable cross-printer PDF/text support on Windows |
| Status tracking | `Printing_PrintStatus:{app}` carries all lifecycle events keyed by `jobId` | Enables caller to correlate async events back to the originating job |
