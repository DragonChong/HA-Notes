---
name: lis-als-logger
description: >
  Guides correct implementation of audit and error logging using the ALS Logger
  (createLogger) in LIS frontend applications (lis-request-app, lab-crs-app,
  lis-aps-app, and any other CRS micro-frontend). Use this skill whenever a
  task involves logging a user action, save event, API error, workflow step, or
  audit trail entry. Triggers include: any mention of "alsLogger", "createLogger",
  "ALS", "audit log", "log INFO", "log WARN", "log CRITICAL", "alsSearchKey",
  "transactionId", "correlationId", or "flush". Also use this skill when
  implementing a save operation, API error handler, or screen-level hook that
  needs to produce a traceable audit record. Use it any time a developer asks
  "how do I log this?" or "what log level should I use?" in a LIS frontend
  context, even if they don't use the word "ALS".
---

# LIS ALS Logger

## Core Principle

The ALS Logger is the single standard for audit trails, error reporting, and
traceability in all LIS frontend applications. One logger instance per screen
or feature area; log meaningful events at the right level; always attach
clinical search keys so logs can be found by request number or HKID. Never
use `console.log` / `console.error` as a substitute for ALS logging in
production code.

> Full reference: `LIS/ECP/lis-hub-lib/ALS Logger.md` in the Obsidian vault.

---

## Setup — One Instance Per Screen

Create the logger once (typically in a shared module or hook for the screen)
using `createLogger` from `@lis/lis-hub-lib`:

```typescript
import { createLogger } from '@lis/lis-hub-lib';

export const screenLogger = createLogger({
  max: 10,                        // flush after 10 buffered entries
  url: process.env.REACT_APP_ALS_URL,
  getParams() {
    return {
      token:          apiContext.auth.getToken(),
      profileCode:    apiContext.global.getProfileCode(),
      servicesParams: apiContext.global.getServiceParams(),
    };
  },
});
```

Share this instance across all hooks and components for the screen — do not
create a new logger per component. The shared instance means all entries from
a user session on that screen share the same Transaction ID, so they can be
correlated later.

---

## Log Levels — Which One to Use

| Level | Method | Use when… |
|---|---|---|
| `info()` | Successful operations | A save completed, a record was retrieved, a workflow step finished |
| `warn()` | Non-fatal problems | Validation failed, a VO returned empty data, an expected condition was not met |
| `critical()` | Severe failures | API call returned 5xx, data integrity problem, unrecoverable error |
| `audit()` | Regulatory trail | Explicit audit events required by compliance (e.g., authorisation, release) |
| `debug()` | Development diagnostics | Step-by-step state during development; avoid in production paths |
| `trace()` | Fine-grained tracing | Detailed execution trace; only when diagnosing a specific problem |

---

## Logging Patterns

### Save success

```typescript
screenLogger.info('Registration saved successfully.', {
  tag: 'REG_SAVE',
  alsSearchKey: { reqNo, hkid },
});
```

### API error

```typescript
try {
  const res = await apiContext.request.post(...);
  // handle success
} catch (err: any) {
  screenLogger.critical('Registration save failed.', {
    tag: 'REG_SAVE',
    alsSearchKey: { reqNo, hkid },
  });
  // show AlertBox to user
}
```

For HTTP errors where you have the status code, prefer passing it through
`showMessageBox`'s `httpstatus` option (which escalates to `critical` for 5xx
automatically) rather than calling `critical()` manually — this avoids double
logging.

### Workflow step boundary

```typescript
screenLogger.info('Pre-register validation passed.', {
  tag: 'REG_VALID',
  alsSearchKey: { reqNo, hkid },
});
```

### Dictionary / data loading problem

```typescript
if (!KeywordVo?.length) {
  screenLogger.warn('KeywordVo returned empty from dictionary.', {
    tag: 'DICT_CHK',
  });
}
```

---

## Always Include `alsSearchKey`

`alsSearchKey` is what makes log entries findable in the ALS search interface
by clinical staff or support. Include it whenever the context has a request
number, HKID, or encounter number:

```typescript
{
  alsSearchKey: {
    reqNo:  '1234567A',   // request number
    hkid:   'A1234567',   // patient HKID
    encNo:  '123456789',  // encounter number (when available)
  }
}
```

Fields you don't have can simply be omitted — partial `alsSearchKey` is fine.

---

## Transaction ID and Correlation ID

The logger automatically manages these IDs. You don't need to set them
manually for most use cases:

- **Transaction ID** — resets automatically on URL change. All entries between
  URL changes share a TID, making navigation sessions traceable.
- **Correlation ID (common)** — shared by all log calls unless you explicitly
  name one.
- **Named Correlation ID** — for long-running operations (a multi-step save
  workflow, an authorization chain) that need their own grouping within a page:

```typescript
// Start a named sub-workflow
screenLogger.refreshCorrelationId('SAVE_FLOW');

screenLogger.info('Save started.', {
  tag: 'REG_SAVE',
  correlationId: screenLogger.getCorrelationId('SAVE_FLOW'),
  alsSearchKey: { reqNo },
});

// ... later steps in the same flow use the same CID
```

Use named CIDs when a workflow has multiple async steps that should be
groupable independently of other concurrent logging.

---

## Explicit Flush

The logger buffers entries up to `max` before auto-flushing. If you need
guaranteed delivery before a critical action (e.g., before navigating away
after a save):

```typescript
await screenLogger.flush();
```

---

## Plugin Apps: `alsLoggerPlugin`

When logging from a plugin app for events that originate in that plugin's
backend (not the hub), use `alsLoggerPlugin` with the plugin's own backend URL:

```typescript
import { alsLoggerPlugin } from '@lis/lis-hub-lib';

const pluginLogger = alsLoggerPlugin(process.env.REACT_APP_LIS_REQUEST_URL);
pluginLogger.warn('...', { alsSearchKey: { reqNo } });
```

This routes the log transmission to the correct backend endpoint rather than
the hub's ALS URL. Use this pattern in `lis-request-app` and `lab-crs-app`
where the domain service differs from `lis-hub-svc`.

---

## What Not to Do

| Mistake | Correct approach |
|---|---|
| `console.error('Save failed', err)` in production | Use `screenLogger.critical(...)` with `alsSearchKey` |
| Creating a new `createLogger(...)` in every component | Create once per screen/feature, share the instance |
| Logging at `info()` level for API errors | Use `warn()` for recoverable, `critical()` for 5xx or unrecoverable |
| Omitting `alsSearchKey` for save/delete operations | Always include `reqNo` and `hkid` where available |
| Using `debug()` in production save paths | Use `info()` for successful saves, `critical()` for failures |
| Calling `flush()` on every log entry | Trust the buffer; only call `flush()` explicitly before navigation or critical transitions |
