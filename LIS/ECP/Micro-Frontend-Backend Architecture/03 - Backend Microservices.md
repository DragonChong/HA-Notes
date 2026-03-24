---
created: '2026-03-09'
status: final
tags:
  - architecture
  - microservice
  - backend
  - LIS
  - Spring-Boot
  - Keycloak
  - database
  - security
updated: '2026-03-09'
---
# 03 — Backend Microservices

> **Source:** Direct analysis of Java source code in `lis-hub-svc/` and `lis-crs-spec-ack-svc/`

---

## 3.1 Service Overview

| | `lis-hub-svc` | `lis-crs-spec-ack-svc` | `lis-request-svc` | `lis-patient-svc` |
|---|---|---|---|---|
| **Role** | Hub BFF (Backend-for-Frontend) | CRS Domain Microservice | Registration & Request Service | Patient Service |
| **Port** | 5000 | 8118 | TBD | TBD |
| **Java** | 17 | 17 | 17 | 17 |
| **Spring Boot** | 3.3.13 | (via `ha-spring-boot-starter 3.0.0`) | TBD | TBD |
| **Main class** | `LisApplication` | `LisCrsSpecAckSvcApplication` | TBD | TBD |
| **Security** | ✅ **Fully secured** | ❌ **Security DISABLED** | TBD | TBD |
| **Databases** | PostgreSQL + Oracle + Sybase + Redis | Oracle + Sybase | TBD | TBD |
| **Consumed by** | `lis-hub-app` | `lis-crs-common-app`, `lab-crs-app` | `lis-request-app` | `lis-request-app` |

---

## 3.2 Security Architecture — Asymmetric Trust Model

```mermaid
graph TB
    Browser["Browser<br>(lis-hub-app + CRS Plugin)"]

    subgraph "lis-hub-svc (SECURED — Port 5000)"
        SEC1["ha-spring-boot-starter-security<br>OAuth2 Resource Server<br>JWT validation (Keycloak/SAM3)"]
        SEC2["SecurityServiceImpl (812 lines)<br>isGranted(destination, method)<br>hasRight(userId, functionId, labId)<br>isEnquiryAuthorized(scope, dept)"]
        SEC3["CustomOAuthClientService<br>extends OAuthClientService<br>OAuth2 Client Credentials<br>Calls UAM/SAM3 REST API"]
        SEC4["LisClientResolver<br>Extracts X-HA-ProfileCode header"]
    end

    subgraph "lis-crs-spec-ack-svc (UNSECURED — Port 8118)"
        NOSEC["ha-spring-boot-starter-security<br>⚠️ COMMENTED OUT in pom.xml<br><br>All controllers: @CrossOrigin(origins='*')<br>No JWT validation<br>No ACL checks<br>Network isolation only"]
    end

    KC["Keycloak / SAM3<br>OIDC + OAuth2"]
    UAM["UAM Service<br>ACL / Role API"]

    Browser -->|"Bearer JWT<br>+ X-HA-ProfileCode<br>+ ServiceParameterVo"| SEC1
    Browser -->|"Direct REST<br>(no auth header)"| NOSEC
    SEC3 -->|"OAuth2 Client Credentials"| KC
    SEC2 -->|"REST ACL check"| UAM
```

> **⚠️ Security Finding:** `lis-crs-spec-ack-svc` has `ha-spring-boot-starter-security` commented out in `pom.xml`. All 7 controllers are annotated `@CrossOrigin(origins = "*")`. Security depends entirely on Kubernetes NetworkPolicy preventing external exposure. This is an intentional architectural choice: the BFF (`lis-hub-svc`) acts as the single validated entry point.

---

## 3.3 Dynamic Multi-Database Routing (lis-hub-svc)

```mermaid
flowchart TD
    Request["Incoming Request<br>ServiceParameterVo:<br>{ serverName: 'QEH-CRS', labNo: 3, hospital: 'QEH' }"]
    Aspect["DataSourceAspect<br>@Around AOP"]
    Holder["DataSourceContextHolder<br>(ThreadLocal<ServerInfo>)"]
    Resolver["DataSource Resolver<br>dataSourceMap.get(key)"]

    DB_PG["PostgreSQL<br>(COMMON_USED_LAB: CPS, HMS, IMS, APS, BBS, MBS, VRS, CRS)"]
    DB_ORA["Oracle<br>(legacy hospital systems)"]
    DB_SYB["Sybase<br>(legacy lab systems, jtds 1.2.2)"]

    Request --> Aspect
    Aspect --> Holder
    Holder --> Resolver
    Resolver -->|"serverName matches PG config"| DB_PG
    Resolver -->|"serverName matches Oracle config"| DB_ORA
    Resolver -->|"serverName matches Sybase config"| DB_SYB
```

### Implementation Detail

```java
// DataSourceContextHolder.java
public class DataSourceContextHolder {
    private static final ThreadLocal<ServerInfo> contextHolder = new ThreadLocal<>();
    
    // COMMON_USED_LAB = ["CPS", "HMS", "IMS", "APS", "BBS", "MBS", "VRS", "CRS"]
    static final List<String> COMMON_USED_LAB = List.of("CPS","HMS","IMS","APS","BBS","MBS","VRS","CRS");
    
    public static void setServerInfo(ServerInfo info) { contextHolder.set(info); }
    public static ServerInfo getServerInfo() { return contextHolder.get(); }
    public static void clearServerInfo() { contextHolder.remove(); }
}
```

```java
// DataSourceAspect.java — @Around advice
@Around("execution(* hk.org.ha.lis.repository.QueueConfigRepository.*(..))" +
        " || execution(* hk.org.ha.lis.repository.GlobalCtrRepository.*(..))")
public Object setDataSource(ProceedingJoinPoint joinPoint) throws Throwable {
    // Override ThreadLocal for these specific repositories
    DataSourceContextHolder.setServerInfo(resolveFromArgs(joinPoint.getArgs()));
    try {
        return joinPoint.proceed();
    } finally {
        DataSourceContextHolder.clearServerInfo();
    }
}
```

**Key:** `COMMON_USED_LAB` lists all lab codes that route to PostgreSQL. Other lab codes route to Oracle or Sybase based on `application.yml` datasource configuration.

---

## 3.4 lis-hub-svc — OAuth2 & UAM Integration

```mermaid
sequenceDiagram
    participant Client as Frontend (Axios)
    participant Filter as Spring Security Filter
    participant JWT as JWT Validator
    participant Ctrl as Controller
    participant SecSvc as SecurityServiceImpl
    participant OAuth as CustomOAuthClientService
    participant KC as Keycloak / SAM3
    participant UAM as UAM Service

    Client->>Filter: POST /api/* Bearer {JWT}
    Filter->>JWT: validate JWT signature + expiry
    JWT-->>Filter: Authentication principal
    Filter->>Ctrl: pass if valid
    Ctrl->>SecSvc: isGranted(destination, method) or hasRight(...)
    SecSvc->>OAuth: getServiceToken(clientId, secret)
    OAuth->>KC: POST /token (client_credentials grant)
    KC-->>OAuth: service access_token
    SecSvc->>UAM: GET /uam/access-rights?userId=&functionId=
    UAM-->>SecSvc: Map<functionId, Boolean>
    SecSvc-->>Ctrl: boolean authorized
```

### `UamProperties` Configuration

```yaml
# application.yml binding
uam-config:
  AccessToken:
    client-id: ${UAM_CLIENT_ID}
    client-secret: ${UAM_CLIENT_SECRET}
    token-url: ${UAM_TOKEN_URL}
  AccessUrl:
    base-url: ${UAM_BASE_URL}
  Sam3Admin:
    admin-url: ${SAM3_ADMIN_URL}
    admin-secret: ${SAM3_ADMIN_SECRET}
```

---

## 3.5 lis-hub-svc — Outbound REST Calls

```mermaid
graph LR
    HubSvc["lis-hub-svc"]

    HubSvc -->|"OAuth2 Client Creds<br>RestTemplate"| KC["Keycloak/SAM3<br>token endpoint"]
    HubSvc -->|"Bearer token + ACL query<br>RestTemplate"| UAM["UAM Service<br>/uam/access-rights"]
    HubSvc -->|"PAS patient lookup<br>RestTemplate<br>(if OPTION PAS/SERVER enabled)"| PAS["PAS System<br>(Hospital Patient Admin)"]
    HubSvc -->|"cross-lab result aggregation<br>/api/resultEnquiry/remote/*"| OtherLab["Peer lis-hub-svc<br>(other lab instance)"]
```

### `PasApiServiceImpl` — PAS Integration

```java
// Called only when serverOption "PAS/SERVER" is enabled in DB config
@Service
public class PasApiServiceImpl implements PasApiService {
    private final RestTemplate restTemplate;
    
    public PasPatientVo searchPatient(String hkid, String pasUrl) {
        return restTemplate.getForObject(pasUrl + "/api/patient/" + hkid, PasPatientVo.class);
    }
}
```

---

## 3.6 lis-hub-svc — Redis Caching

```java
// RedisConfig.java
@Bean
public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
    RedisTemplate<String, Object> template = new RedisTemplate<>();
    template.setConnectionFactory(factory);
    
    Jackson2JsonRedisSerializer<Object> serializer = 
        new Jackson2JsonRedisSerializer<>(Object.class);
    template.setValueSerializer(serializer);
    template.setHashValueSerializer(serializer);
    template.setKeySerializer(new StringRedisSerializer());
    return template;
}
```

Redis is used for:
- Session/token caching (access tokens from OAuth2 client credentials flow)
- Dictionary/reference data caching (avoid repeated DB queries per request)
- Distributed state sharing between multiple hub-svc pod replicas

---

## 3.7 lis-crs-spec-ack-svc — Controller Catalogue

| Controller | Lines | Responsibility |
|---|---|---|
| `CrsSpecAckController` | ~891 | Core specimen acknowledgment operations (receive, verify, authorise, reject, return) |
| `CrsRegController` | ~289 | CRS specimen registration |
| `CrsSearchController` | — | Specimen / request search |
| `CrsSearchAuditController` | — | Search audit trail |
| `CrsAmendRequestController` | — | Amend/modify existing requests |
| `CrsDftRegController` | — | Default registration settings |
| `CrsMaintController` | — | CRS maintenance operations |

### Database Access Pattern

```mermaid
graph LR
    Controller["CRS Controller"]
    Service["CRS Service"]
    
    subgraph "Repositories"
        Temp["repository/temp/<br>(PostgreSQL — migration target)"]
        Legacy["repository/<br>(Oracle + Sybase — legacy)"]
    end

    DB_PG["PostgreSQL"]
    DB_ORA["Oracle"]
    DB_SYB["Sybase (jtds 1.2.2)"]

    Controller --> Service
    Service --> Temp
    Service --> Legacy
    Temp --> DB_PG
    Legacy --> DB_ORA
    Legacy --> DB_SYB
```

> **Active Migration:** `repository/temp/` packages contain PostgreSQL equivalents of legacy Oracle/Sybase queries, indicating an ongoing Sybase/Oracle → PostgreSQL migration.

---

## 3.8 API Contract Pattern

Both services follow the HA LIS standard response envelope:

```java
// Standard response wrapper
public class ResultDataResponse<T> {
    private int code;        // 200 = success
    private String message;
    private T data;
    private String traceId;  // Micrometer correlation
    private String spanId;
}
```

```java
// Standard exception response
public class ExceptionResponse {
    private int code;
    private String message;
    private String traceId;
    private String spanId;
    private LocalDateTime timestamp;
}
```

All endpoints use `POST` (no `GET` for data operations), following HA security convention.

---

## 3.8b lis-request-svc — Registration & Request APIs

> [!info] Status
> `lis-request-svc` is a new Spring Boot service introduced in the CRS Revamp to own all registration and request-related operations. It is consumed exclusively by `lis-request-app` (the new Registration Remote MFE).

### Responsibilities

| API Category | Description |
|---|---|
| Registration | Main registration save (`RegisterRequest`, `RegisterANATRequest`, `RegisterMICRVIRORequest`) |
| Request No. Generation | System-assigned request number pre-save |
| Test Validation | Test existence, registrability, valid period checks |
| Default Values | Default category, doctor, request info (`CrsDftRegController` equivalent) |
| Doctor Lookup | Doctor search and lookup by hospital |
| Location Lookup | Location search by hospital/specialty/ward |
| Lab Options | `RETAIN_MASTER`, tab sequence (`OBJECT_ATTRIBUTE`), lab options configuration |

### API Call Pattern

All endpoints follow the HA LIS standard:
- **Method:** `POST` only
- **Response envelope:** `ResultDataResponse<T>`
- **Request header:** `ServiceParameterVo` fields (`serverName`, `serverLab`, `hospital`, `userKey`, `functionId`)

---

## 3.8c lis-patient-svc — Patient APIs

> [!info] Status
> `lis-patient-svc` is a new Spring Boot service introduced in the CRS Revamp to own all patient-related lookup operations. It is consumed exclusively by `lis-request-app`.

### Responsibilities

| API Category | Description |
|---|---|
| HKPMI Patient List | Retrieve list of PMI patient episodes by HKID — used in the **Select an Episode (PMI List)** panel |
| LIS Patient by HKID | Retrieve local LIS patient records and episodes by HKID — primary patient lookup at registration |
| LIS Patient by Encounter Number | Retrieve local LIS patient and episode by encounter number — alternative registration entry point |
| PMI Patient Write-back | Update patient name / race / Chinese name back to PMI on first registration; conditional on access right `u_lis_obj_hkpmi_security_check` |

### Workflow Integration

```mermaid
sequenceDiagram
    participant UI as lis-request-app
    participant PatSvc as lis-patient-svc
    participant LIS as LIS Patient DB
    participant PMI as HKPMI / PMI Service

    UI->>PatSvc: POST /patient/byHkid { hkid }
    PatSvc->>LIS: Query local patient records
    LIS-->>PatSvc: Patient + episode list
    PatSvc-->>UI: ResultDataResponse<PatientEpisodeListVo>

    UI->>PatSvc: POST /patient/pmiList { hkid }
    PatSvc->>PMI: Query HKPMI by HKID
    PMI-->>PatSvc: PMI episode records
    PatSvc-->>UI: ResultDataResponse<PmiEpisodeListVo>

    UI->>PatSvc: POST /patient/byEncounterNo { encounterNo, hospital }
    PatSvc->>LIS: Query local patient by encounter number
    LIS-->>PatSvc: Patient record
    PatSvc-->>UI: ResultDataResponse<PatientVo>
```

### API Call Pattern

All endpoints follow the HA LIS standard:
- **Method:** `POST` only
- **Response envelope:** `ResultDataResponse<T>`
- **Request header:** `ServiceParameterVo` fields (`serverName`, `serverLab`, `hospital`, `userKey`, `functionId`)

---

## 3.9 Observability

| Concern | Tool | Notes |
|---|---|---|
| Distributed tracing | Micrometer Tracing | `traceId` + `spanId` in all responses |
| Metrics | Micrometer + Prometheus (via Spring Boot Actuator) | `values-DEV.yaml: monitoring.enable: true` |
| Logging | `system.log-privacy: ${LOG_PRIVACY:1}` | Privacy-aware logging (masks patient data) |
| ALS (App Logging) | `LIS_ALS_URL` injected via K8s env | Centralised log shipping |
| Kubernetes metadata | Downward API (`MY_POD_NAME`, `MY_NAMESPACE`) | Injected as env vars in `values-DEV.yaml` |
