# lis-gcr-order-inf-svc API Specification

Based on the documents provided, I have architected the **GCRS to LIS API Specification**.

This specification mirrors the architectural style, JSON hierarchy, and key naming conventions defined in the *GCRS-LIS API specification v1.0*, while utilizing the data fields and transaction logic from the *GCR-LIS interface specification v4.30.0*.

I have prepared two artifacts for you:

1. **Technical Specification Document (Markdown):** A readable version formatted exactly like the "v1.0" PDF you provided, ready for distribution to the GCRS team.
2. **OpenAPI 3.0 Definition (YAML):** A machine-readable format that developers can use to generate code or view in Swagger UI.

---

### Artifact 1: LIS-GCRS Restful API Technical Specification (Draft)

**Title:** LIS-GCRS Restful API Technical Specification
**Version:** 1.0
**Date:** February 2026
**Prepared By:** LIS Architecture Team

#### 1. OBJECTIVES

Provide a RESTful web service on LIS (hosted on OpenShift/Gateway) to replace the existing GCRS-LIS Listener (Unix/Socket). The web service will accept GCRS Requests based on transaction information provided by GCRS messages. The message content follows the definitions in *GCR-LIS Interface specification v4.30.0*, converted from XML to JSON format.

#### 2. TECHNICAL DIAGRAM

**POST Request:**

- **Source:** GCRS
- **Gateway:** API Gateway
- **Destination:** LIS Restful API (OpenShift Container Platform)
- **Format:** JSON String

**Response:**

- **Format:** JSON String only (Standardized Wrapper).

#### 3. OVERVIEW

#### 3.1 Service End-point

The following endpoints are proposed for the LIS environment.

| **Env.** | **Web service end-point**                                                                    | **Method** |
| -------- | -------------------------------------------------------------------------------------------- | ---------- |
| **SIT**  | `https://{gateway-url}/gateway/lis-gcrs-apiServices/v1/LisUpdateTranWebS/receiveGcrsRequest` | POST       |
| **PRD**  | `https://{gateway-url}/gateway/lis-gcrs-apiServices/v1/LisUpdateTranWebS/receiveGcrsRequest` | POST       |

#### 3.2 Web Service Security

Consumer applications (GCRS) are required to register to use the service via API gateway.

- **API Key:** Required in header.
- **Hospital Code:** Required in header.

#### 4. WEB SERVICE

#### 4.1 LisUpdateTranWebS

**Method:** `receiveGcrsRequest`
**Direction:** From GCRS to LIS

**Supported Transaction Types:**

| **Code**  | **Description**            | **Code** | **Description**            |
| --------- | -------------------------- | -------- | -------------------------- |
| **PO1**   | Print Request (New Order)  | **AT5**  | Add Test and Specimen      |
| **CS1/2** | Collect Specimen           | **UT3**  | Update Image               |
| **CC1**   | Clear Specimen Collect     | **LN2**  | Assign Lab Number          |
| **AT3**   | Add Test                   | **LN5**  | Assign Lab Specimen Number |
| **DT3**   | Delete Test                | **TC1**  | Confirm Send Out           |
| **UI1**   | Amend Test Info            | **TC2**  | Cancel Send Out            |
| **AT4**   | Add Time Interval (DFT)    | **TC3**  | End Tracking               |
| **DT4**   | Delete Time Interval (DFT) | **TE1**  | En Route                   |
| **AP2**   | Add Specimen               | **ME1**  | Move to e-Worklist         |
| **DP1**   | Delete Specimen            | **ME2**  | Remove from e-Worklist     |

#### 4.1.1 Header

| **Parameter**      | **Data type** | **Mandatory** | **Description**                       |
| ------------------ | ------------- | ------------- | ------------------------------------- |
| `x-gateway-apikey` | String        | Y             | API Key for corresponding env.        |
| `x-ha-hospcode`    | String        | Y             | Requesting Hospital code (e.g., "VH") |
| `Content-Type`     | String        | Y             | `application/json`                    |

#### 4.1.2 Input JSON Message

The JSON hierarchy and key names strictly follow the XML tags defined in *GCR-LIS Interface Specification v4.30.0*.

- Root tag `<gcrLis>` is represented by the root JSON object `{}`.
- Repeating XML tags (e.g., `<testDtl>`, `<specDtl>`) are represented as JSON Arrays `[]`.

**Sample 1: Print Request (PO1)**
*Corresponds to Page 24 of v4.30.0 spec*

```json
{
  "tranDtl": {
    "msgId": "20260000000000004925",
    "tranTyp": "PO1",
    "tranDtm": "202602051005"
  },
  "patInfo": {
    "patId": "C7514288",
    "patName": "AE, PATINETONE",
    "sex": "F",
    "patDob": "20240810",
    "hospCode": "VH",
    "caseNum": "HN25010300U",
    "spec": "ONC"
  },
  "reqStdInfo": {
    "hospCode": "VH",
    "ordNum": "OR250004992U",
    "verNum": 0,
    "reqBy": "AST671",
    "reqByDept": "MED",
    "reqlocWardClinic": "5K",
    "requestDtm": "202602050000",
    "admitDiag": "Acute conjunctivitis",
    "createBy": "@CMSIT",
    "createDtm": "202602051005",
    "updateBy": "@CMSIT",
    "updateDtm": "202602051005",
    "createSys": "GCR",
    "notifyMe": "N",
    "payCode": "EP1",
    "jsPrinted": "E"
  },
  "testDtl": [
    {
      "requestNum": "RQ2500001054",
      "testNum": "01",
      "labCode": "1",
      "testCode": "SI501",
      "testCat": "HLA Typing",
      "testUrg": "N",
      "testSts": "P",
      "testDesc": "HLA Typing",
      "specNum": "SP2500013772",
      "testInfo": [
        {
          "infoCode": "1080020",
          "infoDesc": "Diagnosis:",
          "infoValue": "GN: presumed no biopsy"
        }
      ]
    }
  ],
  "specDtl": [
    {
      "specNum": "SP2500013772",
      "specNumsuffix": "0",
      "specDesc": "(Renal) EDTA Blood",
      "specSts": "P",
      "worklistType": "B"
    }
  ]
}
```

**Sample 2: Collect Specimen (CS1)**
*Corresponds to Page 32 of v4.30.0 spec*

```json
{
  "tranDtl": {
    "msgId": "20260000000000012345",
    "tranTyp": "CS1",
    "tranDtm": "202602051200"
  },
  "ordInfo": {
    "hospCode": "TMH",
    "ordNum": "OR0000000001",
    "specNum": "SP020000001",
    "specNumsuffix": "0",
    "verNum": 2
  },
  "modDtl": {
    "colDtm": "202602051200",
    "colBy": "CHANTM",
    "colByName": "CHAN Tai Man",
    "checkBy": "LEESM",
    "checkByName": "LEE Sai Man",
    "handleBy": "CHANTM",
    "specSts": "C"
  }
}
```

#### 4.1.3 Output Message

JSON string using the standardized GCRS-LIS wrapper.

**Success Response (Normal Return):**

```json
{
  "data": {
    "ackDtl": {
      "msgId": "20260000000000004925",
      "ackCode": "MA",
      "hospCode": "VH",
      "ordNum": "OR250004992U",
      "verNum": 1
    }
  },
  "message": "ok",
  "rtnCode": 0,
  "duration": 132
}
```

**Exception Response (System Error):**

```json
{
  "data": {
    "ackDtl": {
      "msgId": "20260000000000004925",
      "ackCode": "SE",
      "hospCode": "VH",
      "ordNum": "OR250004992U",
      "verNum": 0,
      "errTxt": "Invalid JSON format or mandatory field missing."
    }
  },
  "message": "Invalid JSON format or mandatory field missing.",
  "rtnCode": -2,
  "duration": 15
}
```

---

### Artifact 2: OpenAPI 3.0 Specification (YAML)

This file defines the schema programmatically.

```yaml
openapi: 3.0.3
info:
  title: LIS-GCRS API (GCRS to LIS)
  description: API for GCRS to push orders, specimen updates, and modifications to LIS.
  version: 1.0.0
servers:
  - url: https://apim-gateway-sit.server.ha.org.hk:8443/gateway/lis-gcrs-apiServices/v1
    description: SIT Environment
paths:
  /LisUpdateTranWebS/receiveGcrsRequest:
    post:
      summary: Receive GCRS Request (PO1, CS1, AT3, etc.)
      description: Endpoint for GCRS to send transaction messages to LIS.
      operationId: receiveGcrsRequest
      parameters:
        - in: header
          name: x-gateway-apikey
          schema:
            type: string
          required: true
          description: API Key
        - in: header
          name: x-ha-hospcode
          schema:
            type: string
          required: true
          description: Hospital Code (e.g., VH)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              oneOf:
                - $ref: '#/components/schemas/PrintRequest_PO1'
                - $ref: '#/components/schemas/CollectSpecimen_CS1'
                - $ref: '#/components/schemas/GeneralUpdateTransaction'
              discriminator:
                propertyName: tranTypDescription
                mapping:
                  PO1: '#/components/schemas/PrintRequest_PO1'
                  CS1: '#/components/schemas/CollectSpecimen_CS1'
                  CS2: '#/components/schemas/CollectSpecimen_CS1'
                  AT3: '#/components/schemas/GeneralUpdateTransaction'
      responses:
        '200':
          description: Successful Response (MA, SE, or OE)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/StandardResponse'

components:
  schemas:
    # --- Common Headers ---
    TranDtl:
      type: object
      required: [msgId, tranTyp, tranDtm]
      properties:
        msgId:
          type: string
          maxLength: 20
        tranTyp:
          type: string
          maxLength: 3
          description: Transaction Type (e.g., PO1, CS1)
        tranDtm:
          type: string
          description: Format YYYYMMDDHHmm

    # --- PO1: Print Request Schema ---
    PrintRequest_PO1:
      type: object
      properties:
        tranDtl:
          $ref: '#/components/schemas/TranDtl'
        patInfo:
          type: object
          properties:
            patId: { type: string }
            patName: { type: string }
            sex: { type: string }
            hospCode: { type: string }
            caseNum: { type: string }
            spec: { type: string }
        reqStdInfo:
          type: object
          properties:
            hospCode: { type: string }
            ordNum: { type: string }
            verNum: { type: integer }
            reqBy: { type: string }
            createSys: { type: string }
        testDtl:
          type: array
          items:
            type: object
            properties:
              requestNum: { type: string }
              testNum: { type: string }
              testCode: { type: string }
              testDesc: { type: string }
              specNum: { type: string }
        specDtl:
          type: array
          items:
            type: object
            properties:
              specNum: { type: string }
              specNumsuffix: { type: string }
              specDesc: { type: string }
              specSts: { type: string }

    # --- CS1: Collect Specimen Schema ---
    CollectSpecimen_CS1:
      type: object
      properties:
        tranDtl:
          $ref: '#/components/schemas/TranDtl'
        ordInfo:
          type: object
          properties:
            hospCode: { type: string }
            ordNum: { type: string }
            specNum: { type: string }
            specNumsuffix: { type: string }
            verNum: { type: integer }
        modDtl:
          type: object
          properties:
            colDtm: { type: string }
            colBy: { type: string }
            specSts: { type: string }

    # --- General Schema for Updates (AT3, DT3, etc) ---
    GeneralUpdateTransaction:
      type: object
      properties:
        tranDtl:
          $ref: '#/components/schemas/TranDtl'
        ordInfo:
          type: object
          properties:
            hospCode: { type: string }
            ordNum: { type: string }
            verNum: { type: integer }
        modDtl:
          type: object
          description: Contains requestNum, testNum, and specific update fields
          additionalProperties: true

    # --- Standard Response Wrapper ---
    StandardResponse:
      type: object
      properties:
        data:
          type: object
          properties:
            ackDtl:
              type: object
              properties:
                msgId: { type: string }
                ackCode: 
                  type: string
                  enum: [MA, SE, OE]
                hospCode: { type: string }
                ordNum: { type: string }
                verNum: { type: integer }
                errTxt: { type: string }
        message:
          type: string
          example: "ok"
        rtnCode:
          type: integer
          example: 0
        duration:
          type: integer
          example: 100
```



```bash
graph TD
    %% Nodes
    subgraph Client_Side [GCRS Environment]
        GCRS("GCRS<br>(Sender)")
    end

    subgraph Security_Layer [API Management]
        Gateway["API Gateway<br>(Validation & Routing)"]
    end

    subgraph Server_Side [LIS Environment]
        LIS_Service("LIS Restful API<br>(lis-crs-gcrOrderServices)")
        LIS_DB[("LIS Database<br>(Oracle)")]
    end

    %% Styles
    style GCRS fill:#f9f,stroke:#333,stroke-width:2px,color:black
    style Gateway fill:#fff,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5,color:black
    style LIS_Service fill:#90EE90,stroke:#333,stroke-width:2px,color:black
    style LIS_DB fill:#ddd,stroke:#333,stroke-width:2px,color:black

    %% Connections
    GCRS -- "1. POST JSON Request<br>(Header: x-gateway-apikey)" --> Gateway
    Gateway -- "2. Secure Forward" --> LIS_Service
    LIS_Service -- "3. Update Order/Specimen" --> LIS_DB
    LIS_DB -- "4. Confirmation" --> LIS_Service
    LIS_Service -- "5. JSON Response<br>(rtnCode: 0, ackCode: MA)" --> GCRS

    %% Notes
    classDef note fill:#fff,stroke:#333,stroke-width:1px;
    Note1["Payloads:<br>PO1, CS1, AT3, etc."]---GCRS
```