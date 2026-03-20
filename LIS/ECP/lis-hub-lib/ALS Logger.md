# ALS Logger

## Overview

The ALS Logger is a shared client-side logging utility that collects structured log entries from application code and sends them in batches to the ALS (Application Log System) backend service. It is the standard mechanism for audit trails, error reporting, and traceability across the CRS micro-frontend applications.

Rather than sending one HTTP request per log call, the logger buffers entries in an in-memory cache and flushes them when the buffer reaches a configured threshold, or automatically when the browser URL changes. Failed transmissions are queued for retry up to three times.

Each logger instance maintains a **Transaction ID** and one or more **Correlation IDs** to link related log entries across a user session or workflow.

---

## How It Works

### Buffering and Flushing

1. Each call to a log method (`info`, `warn`, etc.) adds a log entry to an internal cache.
2. When the cache reaches the configured `max` threshold, the logger automatically flushes — serialising all buffered entries into a single HTTP POST request to the ALS endpoint.
3. If a flush is already in progress when a new log call arrives, the entry is held in a secondary pending cache. Once the in-progress flush completes, the pending cache is promoted and checked against the threshold.
4. The `flush()` method can also be called explicitly to force immediate transmission regardless of buffer size.

### URL Change Auto-Flush

When `openUrlChangedAutoReport` is enabled (default: on), the logger watches for browser URL changes. On each URL change:
- Any buffered entries are flushed immediately.
- If `resetTransactionIdOnUrlChange` is enabled (default: on), a new Transaction ID is generated — marking a new user navigation context.

### Retry Mechanism

If an HTTP transmission fails (4xx or 5xx response), the failed batch is placed in a retry queue with a maximum of **3 retry attempts**. Retries are attempted at 1-second intervals via a background timer. Batches that exhaust all retry attempts are discarded.

---

## Log Levels

| Level | Method | Typical Use |
|-------|--------|-------------|
| TRACE | `trace()` | Detailed step-by-step execution tracing |
| DEBUG | `debug()` | Development and diagnostic information |
| INFO | `info()` | Normal business events and state changes |
| WARN | `warn()` | Non-fatal issues requiring attention |
| AUDIT | `audit()` | Regulatory audit trail entries |
| CRITICAL | `critical()` | Severe errors requiring immediate attention |

All methods accept the same parameters: a required message string and an optional `ParamsOptions` object for additional metadata.

---

## Transaction ID and Correlation ID

The logger uses two types of identifier to link related log entries:

| Identifier | Purpose | Lifetime |
|------------|---------|----------|
| **Transaction ID** | Groups all log entries within a single navigation context (a "page view"). Reset on URL change when `resetTransactionIdOnUrlChange` is enabled | Per page navigation |
| **Correlation ID** | Groups log entries within a specific function or workflow within a page. A common (default) ID exists; named per-function IDs can be created and refreshed independently | Per logical operation |

The Transaction ID and Correlation ID are automatically resolved from the application-level `getCorrelation()` integration if not explicitly provided per log call. They can also be overridden per-call via the `correlationId` and `transactionId` options.

---

## Setup

A logger instance is created once per application using `createLogger`. The parent application passes the ALS endpoint URL and a function that returns the current authentication token, profile code, and service parameters on each flush.

```
createLogger({
  max: 10,                          // flush after 10 buffered entries
  url: '<ALS endpoint URL>',
  getParams() {
    return {
      token:         <current access token>,
      profileCode:   <current profile code>,
      servicesParams: <current service params object>,
    };
  },
})
```

The returned logger instance is then passed to, or shared across, the application's screens and components.

---

## API Reference

### Log Methods

All six methods (`trace`, `debug`, `info`, `warn`, `audit`, `critical`) have the same signature:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `msg` | `string` | Yes | The log message text |
| `options` | `ParamsOptions` | No | Additional metadata for the log entry (see Log Entry Options below) |

### Utility Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `flush()` | `Promise<void>` | Immediately flushes all buffered log entries to the ALS endpoint, regardless of buffer size |
| `getTransactionId()` | `string` | Returns the current Transaction ID |
| `getCorrelationId(key?)` | `string` | Returns the common Correlation ID, or the named per-function Correlation ID if a key is provided. Falls back to the common ID if the key has no registered ID |
| `refreshCorrelationId(key?)` | `void` | Generates a new Correlation ID. If no key is given, refreshes the common ID. If a key is given, registers a new ID for that named function context |
| `getRetryList()` | `RetryItem[]` | Returns the current list of failed batches awaiting retry |
| `clearUrlDetectTimer()` | `void` | Stops the URL change detection timer |

---

## Log Entry Options (`ParamsOptions`)

These options can be passed to any log method to attach metadata to the entry:

| Option | Type | Description |
|--------|------|-------------|
| `tag` | `string` | A free-form tag for grouping or filtering log entries |
| `messageId` | `string` | A structured message identifier |
| `functionId` | `number` | The function identifier associated with the log entry |
| `isServer` | `string` | Flag indicating server-side origin |
| `withTransactionId` | `boolean` | When `true`, the current Transaction ID is embedded in the log entry |
| `correlationId` | `string` | Overrides the auto-resolved Correlation ID for this entry |
| `transactionId` | `string` | Overrides the auto-resolved Transaction ID for this entry |
| `alsSearchKey` | `object` | Structured search keys for ALS lookup — see below |

### ALS Search Keys

The `alsSearchKey` object allows log entries to be found by clinical identifiers in the ALS search interface:

| Field | Type | Description |
|-------|------|-------------|
| `reqNo` | `string` | Request number |
| `hkid` | `string` | Patient HKID |
| `patientHosp` | `string` | Patient hospital |
| `encNo` | `string` | Encounter number |
| `searchKey2` | `string` | Additional search key 2 |
| `searchKey3` | `string` | Additional search key 3 |
| `searchKey4` | `string` | Additional search key 4 |
| `operationId` | `number` | Operation identifier |

---

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `max` | `number` | `1` | Number of log entries to buffer before an automatic flush is triggered |
| `url` | `string` | Required | The ALS batch insert endpoint URL |
| `getParams` | `function` | Required | Called on each flush to retrieve the current authentication token, profile code, and service parameters |
| `openUrlChangedAutoReport` | `boolean` | `true` | Whether to automatically flush and reset the Transaction ID when the browser URL changes |
| `openApiRetry` | `boolean` | `true` | Whether to retry failed transmissions (up to 3 times at 1-second intervals) |
| `resetTransactionIdOnUrlChange` | `boolean` | `true` | Whether to generate a new Transaction ID on each URL change. Only applies when `openUrlChangedAutoReport` is enabled |

---

## Related Workflows

- [[CRS Registration Workflow]] — The logger is used to record audit and error events during request registration.
- [[CRS Request Retrieval Workflow]] — Log entries with `reqNo` search key allow ALS queries by request number to trace retrieval events.
- [[CRS Spec-Ack Workflow]] — Specimen acknowledgement events are logged with relevant clinical search keys for traceability.
