# Message Box

## Overview

The Message Box is a modal dialogue component in `lis-hub-app` that displays system messages to the user. All messages are driven by a message dictionary (the `MessageDictionaryVo` loaded at startup), so the calling code only needs to supply a **numeric message code** and optional runtime parameters — the message text, variant (error, warning, info, question), and button layout are all looked up from the dictionary. The component supports both code-driven messages and fully custom messages (where the caller supplies all text directly).

---

## Related User Stories

*(No dedicated user story — this is a platform capability.)*

---

## Visual Layout

A modal overlay dialogue with:
- A **variant icon** in the top-left (colour and icon change based on message type: error, warning, info, question)
- A **title bar** (optional; drawn from `MessageVo.title`)
- A **main instruction** text
- An optional **supplementary instruction** below the main text
- An **additional information panel** at the bottom showing a code reference (`TAG-CODE` format) and the date/time the message was raised
- A **button bar** at the bottom right with one or more action buttons
- An optional **checkbox** at the bottom (used for "do not show again" suppression) — present only when the button string ends with `|~`

---

## Message Variants

| Variant | `type` Code | Icon Style | When Used |
|---|---|---|---|
| Error | `E` | Red error icon | System errors, failed operations |
| Warning | `W` | Amber warning icon | Cautionary messages, empty data |
| Info | `I` | Blue info icon | Informational notices |
| Question | `Q` | Question mark icon | Confirmation prompts (Yes/No) |
| System Error | `S` | Red error icon | Severe system-level errors |

---

## Message Dictionary (MessageVo)

Each message code resolves to a `MessageVo` record from the `MessageDictionaryVo` dictionary. Key fields:

| Field | Description |
|---|---|
| `code` | Numeric message code — the primary lookup key |
| `type` | Variant code: `E`, `W`, `I`, `Q`, `S` |
| `mainInstruction` | Primary message text; may contain `[@PARMn]` placeholders |
| `suppInstruction` | Secondary message text (optional); same placeholder support |
| `title` | Optional dialogue title |
| `button` | Pipe-delimited button label string, e.g., `OK`, `YES\|NO`, `YES\|NO\|~` |
| `defaultButton` | Which button is the primary (focused) action |
| `logMessagebox` | `1` = show a pop-up dialogue; `0` = silent (log only, no pop-up) |
| `logMonitor` | `1` = write to the Monitor log panel |
| `logAls` | `1` = write to the ALS audit log |
| `logBubble` | `1` = trigger a bubble notification |

### Parameter Substitution

Message text may contain positional placeholders in the form `[@PARM1]`, `[@PARM2]`, etc. These are replaced at display time with the `params` array passed in the call:

```
mainInstruction: "Warning: [@PARM1] service is down."
params: ["GNS"]
→ "Warning: GNS service is down."
```

### Silent Messages (`logMessagebox = 0`)

When `logMessagebox = 0`, no dialogue is shown. The call to `MessageBoxApi.open()` still executes, but it logs the event to the Monitor and/or ALS and returns immediately. The `primaryAction` callback fires automatically.

---

## Buttons and Actions

### Standard Messages

Button labels are derived from the `button` field of the `MessageVo`, split on `|`.

The `defaultButton` field determines which button is the **primary action** (receives focus and is styled differently). All remaining buttons are **other actions**.

Calling code can attach callbacks to any button by name via `actionsCallback`:

```ts
actionsCallback: {
  Yes() { /* triggered when user clicks Yes */ },
  No()  { /* triggered when user clicks No  */ },
}
```

Key behaviour rules:
- Callback key matching is **case-insensitive** — `Yes`, `YES`, and `yes` all match.
- If `autoClose = true` (the default), the dialogue closes automatically after any button click, regardless of whether a callback is defined.
- If `autoClose = false`, the dialogue remains open after the button click and the calling code is responsible for programmatically closing it.
- A `close()` function is returned from `MessageBoxApi.open()` and can be called to dismiss the dialogue programmatically.

### Custom Messages

`MessageBoxApi.openCustom(options)` opens a dialogue that is not backed by any message code. The caller supplies all content directly and receives a Promise that resolves with the label of the button the user clicked:

| Property | Description |
|---|---|
| `title` | Dialogue title |
| `content` | Message body text |
| `variant` | `'warning'`, `'error'`, `'info'`, or `'question'` |
| `primaryAction` | `{label, onClick}` — the primary button |
| `otherActions` | Array of `{label, onClick}` — additional buttons |

---

## API

### `MessageBoxApi.open(options)`

Opens a code-driven message box.

| Option | Type | Required | Description |
|---|---|---|---|
| `code` | number | Yes | Message code to look up in `MessageDictionaryVo` |
| `tag` | string | No | Short tag prefix displayed in the code reference field (e.g., `"PAUTH1"`) |
| `params` | string[] | No | Values to substitute into `[@PARMn]` placeholders |
| `actionsCallback` | Record<string, fn> | No | Per-button callbacks, keyed by button label (case-insensitive) |
| `autoClose` | boolean | No | Default `true`. Set `false` to keep the dialogue open after a button click. |
| `additionalList` | {field, value}[] | No | Extra rows appended to the information panel at the bottom of the dialogue |
| `alsSearchKey` | Record<string, any> | No | ALS clinical search key (reqNo, hkid, encNo) — appended to the ALS log entry |
| `correlationId` | string | No | Correlation ID included in ALS log entry |
| `transactionId` | string | No | Transaction ID included in ALS log entry |
| `afterClose` | fn | No | Callback fired after the dialogue is closed (regardless of which button was pressed) |
| `onLogMonitor` | fn | No | Override for the default monitor log handler |
| `onLogAls` | fn | No | Override for the default ALS log handler |
| `onLogBubble` | fn | No | Override for the default bubble notification handler |
| `isPluginApi` | boolean | No | When `true`, uses the plugin ALS logger URL instead of the hub URL |
| `httpstatus` | number | No | HTTP status code of a failed request; if 5xx, logs as `critical` severity instead of `warn` |

**Returns:** `{ close?: () => void; getTransformedItem: () => MessageVo }`

### `MessageBoxApi.openCustom(options)`

Opens a custom message box not backed by a dictionary code. **Returns a Promise** that resolves with the label of the button clicked.

### `MessageBoxApi.closeAll()`

Dismisses all open code-driven message boxes.

### `MessageBoxApi.closeCustomAll()`

Dismisses all open custom message boxes.

### `MessageBoxApi.getMessage(code, params?)`

Looks up and transforms a message without opening a dialogue. Useful for reading message text programmatically.

### `showMessageBox(params)`

A convenience wrapper around `MessageBoxApi.open()` that automatically:
- Attaches the standard `onLogAls` handler (logs message code and text to ALS)
- Routes ALS logs to the plugin ALS logger if `isPluginApi = true`
- Uses `critical` severity for 5xx HTTP errors

### `useMessageBox()`

React hook that returns `MessageBoxApi` — equivalent to calling `MessageBoxApi` directly but follows React hook conventions.

---

## Providers and Rendering

### `MessageBoxProvider`

Must wrap the application (or part of it) to render code-driven message boxes. It initialises the message dictionary from `MessageDictionaryVo` and renders active dialogues into a portal:

```tsx
<MessageBoxProvider messageDictionaryVo={messageDictionaryVo}>
  {children}
</MessageBoxProvider>
```

### `CustomMessageBoxProvider`

Renders active custom message boxes. Must also be present in the component tree.

### `MessageBoxContainer`

A convenience wrapper that wires both providers automatically from the `useDictionaryStore`:

```tsx
<MessageBoxContainer />
```

This is the component placed in the `lis-hub-app` root layout.

---

## Dialogue Suppression (`disabledBoxList`)

Any message code can be added to `disabledBoxList` in the store. When a suppressed code is opened, the dialogue does not appear; instead the primary action callback fires immediately and silently. This is used for testing and automated flows.

---

## Logging Behaviour

Every `MessageBoxApi.open()` call automatically performs the following based on the `MessageVo` flags:

| Flag | Effect |
|---|---|
| `logMonitor = 1` | Writes the message code and text to the Monitor log panel |
| `logAls = 1` | Calls `onLogAls`; by default (via `showMessageBox`) writes to ALS with `warn` severity (or `critical` for 5xx) |
| `logBubble = 1` | Calls `onLogBubble` |

The additional info panel in the dialogue always shows the tag-code reference and the exact timestamp of the open call.

---

## Related Workflows

- [[Message Box Usage in Plugin Apps]] — How `lis-aps-app` and other plug-in applications access and invoke the Message Box.
- [[Dictionary Loading]] — The `MessageDictionaryVo` that backs all code lookups is loaded as part of the standard dictionary load.
