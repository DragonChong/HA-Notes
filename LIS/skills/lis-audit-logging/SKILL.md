---
name: lis-audit-logging
description: >
  Authoritative guide for implementing audit logging in LIS Java backend services
  using the `audit-logging` library (`hk.org.ha.lis:audit-logging`). Use this
  skill whenever a task involves: extending `AbstractService`, calling `info()`,
  `warn()`, `critical()`, `audit()`, `logExceptionWithWarn()`, or
  `logExceptionWithCritical()`; inserting audit records via `AuditService`,
  `PrintService`, or `FileAuditService`; setting up `ServiceParameterVo` or
  `AlsMessageVo`; propagating Correlation IDs across microservices with
  `RestTemplate`; configuring `application.yml` logging trace settings; or
  handling global exceptions in a LIS service. Also triggers whenever a developer
  asks "how do I log this?", "which log level?", "how do I add audit trail?",
  or "how do I propagate correlation ID?" in a LIS backend Java context.
---

# LIS Audit Logging (Java Backend)

## Core Principle

Every Spring service in LIS backend **inherits from `AbstractService`** and uses
its protected logging methods. Do not use raw SLF4J or `System.out` as a
substitute for ALS logging in production code. The library is auto-configured
via Spring Boot — no manual bean wiring is needed. All logging is thread-safe
through `ThreadLocal` contexts.

```xml
<!-- pom.xml dependency -->
<dependency>
    <groupId>hk.org.ha.lis</groupId>
    <artifactId>audit-logging</artifactId>
    <version>${lis-svc-lib.version}</version>
</dependency>
```

---

## Service Inheritance Pattern

All services that need logging must extend `AbstractService`:

```java
@Service
public class OrderService extends AbstractService {

    public void processOrder(String orderId) {
        info("ORDER_PROCESS", "Processing order", "orderId=" + orderId);
        // operationId is auto-set to the calling method name: "processOrder"
    }
}
```

`operationId` is **automatically resolved** from the call stack to the
enclosing method name — you never set it manually.

---

## Log Levels

| Method | Severity | Use when… |
|---|---|---|
| `info(...)` | INFO | Successful operations, record retrieved, step completed |
| `warn(...)` | WARN | Non-fatal: validation failure, expected edge case, lock contention |
| `critical(...)` | CRITICAL | Severe: DB lock timeout, JPA system error, cannot create transaction |
| `audit(...)` | AUDIT | Regulatory/compliance audit trail (not general diagnostics) |
| `logExceptionWithWarn(ex)` | WARN | Catch-block exception at warn severity |
| `logExceptionWithCritical(ex)` | CRITICAL | Catch-block exception at critical severity |

---

## Logging Method Signatures

### Plain (no patient data)
```java
info(String functionId, String description, String content)
warn(String functionId, String description, String content)
critical(String functionId, String description, String content)
audit(String functionId, String description, String content)
```

### With Patient Identity (encrypted content)
```java
info(functionId, description, content, patientId, encryptedContent)
warn(functionId, description, content, patientId, encryptedContent)
critical(functionId, description, content, patientId, encryptedContent)
audit(functionId, description, content, patientId, encryptedContent)
```

### With Patient Identity + Case Number
```java
info(functionId, description, content, patientId, caseNo, encryptedContent)
warn(functionId, description, content, patientId, caseNo, encryptedContent)
```

### With Exception (WARN / CRITICAL)
The exception message is appended to `content` automatically. If the exception
message is null, the library traverses the cause chain to find a meaningful
message (1.0.4+).
```java
warn(functionId, description, content, ex)
warn(functionId, description, content, patientId, encryptedContent, ex)
warn(functionId, description, content, patientId, caseNo, encryptedContent, ex)
critical(functionId, description, content, ex)
critical(functionId, description, content, patientId, encryptedContent, ex)
```

### Exception helpers
```java
logExceptionWithWarn(Throwable ex)
logExceptionWithWarn(Throwable ex, String message)
logExceptionWithCritical(Throwable ex)
logExceptionWithCritical(Throwable ex, String message)
```

### Fully Custom — `AlsMessageVo`
Use when you need to override any field (locationCd, userId, logType, etc.):
```java
AlsMessageVo msg = AlsMessageVo.builder()
        .logType(Severity.INFO.toString())
        .functionId("FUNC_ID")
        .description("Custom log")
        .content("details here")
        .build();
log(msg);
```

---

## ServiceParameterVo — Per-Request Context

`AbstractServiceAspect` intercepts every `@RestController` method and
automatically extracts the first `ServiceParameterVo` argument from the request
body, storing it in `ThreadLocal`. This populates `locationCd`, `workstationId`,
and `userId` in every log entry without manual code.

If you need to set it manually (e.g., in a scheduled job):
```java
AbstractService.setServiceParameter(serviceParameterVo);
// ... do work ...
AbstractService.removeServiceParameter(); // always clean up in finally
```

---

## Custom ALS Fields (1.0.3+)

Attach domain-specific fields to all log entries for the current thread:

```java
// Single field
AbstractService.setCustomAlsField("ORDER_NO", "ORD-12345");

// Multiple at once
Map<String, Object> fields = new HashMap<>();
fields.put("ORDER_NO", "ORD-12345");
fields.put("REQUEST_NO", "REQ-67890");
AbstractService.setCustomAlsFields(fields);

// Cleanup (called automatically by endAlsLogContext(), but can be done earlier)
AbstractService.clearCustomAlsFields();
AbstractService.removeCustomAlsField("ORDER_NO");
```

Fields persist until the thread context is cleared. Thread-Local fields take
precedence over fields set on `AlsMessageVo` directly when there are duplicates.

---

## Correlation ID Propagation

The library auto-manages distributed tracing across microservices:

- **Incoming requests**: `CorrelationIdInterceptor` extracts `X-Correlation-ID`
  from the request header (or generates a new UUID if absent) and stores it in
  `ThreadLocal`.
- **Outgoing RestTemplate calls**: `CorrelationIdClientInterceptor` adds
  `X-Correlation-ID` to all outgoing requests automatically when
  `propagate-to-clients: true`.
- **Response headers**: Both `X-Correlation-ID` and `X-Transaction-ID` are added.
- `X-Transaction-ID` is **service-local** — it is NOT propagated.

Enable in `application.yml`:
```yaml
logging:
  trace:
    correlation-id:
      enabled: true               # default: true
      propagate-to-clients: true  # auto-add interceptor to ALL Spring @Bean RestTemplates
```

### Accessing IDs Programmatically
```java
String correlationId  = AbstractService.getCurrentCorrelationId();
String transactionId  = AbstractService.getCurrentTransactionId();
String messageId      = AbstractService.getCurrentMessageId();
```

### Manual RestTemplate (not a Spring bean)
```java
// Recommended — creates with interceptor pre-installed
RestTemplate rt = RestTemplateHelper.createRestTemplateWithCorrelationId();

// Or add to existing instance
RestTemplateHelper.addCorrelationIdInterceptor(existingRestTemplate);

// Or add header manually
RestTemplateHelper.addCorrelationIdHeader(headers);
```

---

## Audit Database Inserts

Inject `AuditService` (or specialised services) to write audit rows. These are
separate from ALS log entries — they persist to database tables.

| Table | Service | Method |
|---|---|---|
| `admin_audit` | `AuditService` | `insertAdminAudit(AdminAuditVo)` |
| `patient_audit` | `AuditService` | `insertPatientAudit(PatientAuditVo)` |
| `operation_audit` | `AuditService` | `insertOperationAudit(OperationAuditVo)` |
| `testrslt_audit` | `AuditService` | `insertResultAudit(TestrsltAuditVo)` |
| `labuser_password_audit` | `UserAccountService` | `insertLabuserPasswordAudit(LabuserPasswordAuditVo)` |
| `bb_ot_print_audit` | `PrintService` | `insertBbOtPrintAudit(...)` |
| `print_audit` | `PrintService` | `insertPrintAudit(...)` |
| `report_audit` | `PrintService` | `insertReportAudit(...)` |
| `file_audit` | `FileAuditService` | `insertFileAudit(...)` |

```java
@Autowired
private AuditService auditService;

auditService.insertAdminAudit(adminAuditVo);
auditService.insertPatientAudit(patientAuditVo);
```

---

## Global Exception Handler

`GlobalExceptionHandler` automatically catches thrown exceptions and logs them
at the appropriate level — **no manual catch needed** in controllers for these:

| Exception | Log Level |
|---|---|
| `MethodArgumentNotValidException`, `BindException`, `WebExchangeBindException` | WARN |
| `ConstraintViolationException`, `DataAccessException`, `PersistenceException` | WARN |
| `AuthenticationException`, `AccessDeniedException` | WARN |
| `Exception`, `RuntimeException` | WARN |
| `CannotAcquireLockException`, `JpaSystemException`, `LockTimeoutException` | CRITICAL |
| `CannotCreateTransactionException` | CRITICAL |

---

## application.yml Configuration

```yaml
logging:
  trace:
    include-packages:
      - hk.org.ha.lis.controller
      - hk.org.ha.lis.service
      - hk.org.ha.lis.repository
    exclude-proxy-classes: true    # default: true — strips $$EnhancerBy... from stack traces
    show-full-stack-trace: false   # default: false — only logs matching packages
    correlation-id:
      enabled: true
      propagate-to-clients: true
```

`include-packages` controls which classes appear in filtered stack traces **and**
determines the `operationId` resolution. Keep it aligned with your project's
actual package structure.

---

## Quick Reference — Common Patterns

### Logging a service operation
```java
@Service
public class SampleService extends AbstractService {

    public ResponseDto processRequest(RequestDto dto) {
        try {
            // ... business logic ...
            info("PROCESS_REQUEST", "Request processed successfully", "reqId=" + dto.getReqId());
            return result;
        } catch (DataAccessException e) {
            warn("PROCESS_REQUEST", "DB error during processing", "reqId=" + dto.getReqId(), e);
            throw e;
        }
    }
}
```

### Logging with patient data
```java
// NEVER put HKID/patient info in plain `content` — use encryptedContent
info("PATIENT_LOOKUP", "Patient record retrieved",
        "Found patient record",     // content — non-sensitive summary
        patientId,                  // patientIdentity (HKID or patient key)
        encryptedPatientDetails);   // encryptedContent — sensitive data
```

### Exception logging (catch block)
```java
try {
    service.doSomething();
} catch (Exception e) {
    LoggingVo result = logExceptionWithCritical(e);
    // result.getTransactionId() and result.getCorrelationId() available for response
    throw new ServiceException("Operation failed");
}
```

### Custom fields for domain traceability
```java
// At the start of the request handler or service entry point
AbstractService.setCustomAlsField("ORDER_NO", orderId);
AbstractService.setCustomAlsField("REQUEST_NO", requestId);
// All subsequent log() calls in this thread will include ORDER_NO, REQUEST_NO
```
