---
name: lis-message-box-usage
description: >
  Guides correct implementation of user-facing messages and dialogues in LIS
  plugin/frontend applications (lis-request-app, lab-crs-app, lis-aps-app, and
  any other app loaded within lis-hub-app). Use this skill whenever a task
  involves showing a message, confirmation, error, or warning to the user.
  Triggers include: validation failures that must stop a workflow, Yes/No
  confirmation before a save or authorisation, API error handling that needs a
  pop-up, any mention of "MessageBoxApi", "showMessageBox", "message code",
  "actionsCallback", or "message dictionary". Also use this skill when code
  review reveals a call to browser alert(), window.confirm(), or a raw
  AlertDialog rendered directly from a plugin app for system messages. Use it
  any time the developer asks "how do I show an error/warning/confirmation to
  the user?" in the context of a LIS plugin application.
---

# LIS Message Box Usage in Frontend Applications

## Core Principle

`lis-hub-app` owns the message box system. Every message shown in a plugin app
is rendered inside the hub shell's dialogue stack. Plugin apps get a reference
to `MessageBoxApi` through the CMS API context — they never instantiate their
own `MessageBoxProvider` or import `useMessageBoxStore` directly.

All messages are driven by numeric codes that map to records in
`MessageDictionaryVo`. The calling code only needs to supply a code and optional
runtime parameter values — the message text, variant (error/warning/info/
question), and button layout come from the dictionary. This keeps display
behaviour consistent and audit-logged automatically.

> Full reference: `LIS/ECP/lis-hub-app/Message Box.md` and
> `LIS/ECP/lis-hub-app/Message Box Usage in Plugin Apps.md` in the Obsidian vault.

---

## Accessing MessageBoxApi in a Plugin App

Read it once from the context at the top of every component or hook that needs
to show messages, and include it as a `useCallback` dependency:

```typescript
// CMS micro-frontend plugin (lis-request-app, lis-aps-app, etc.)
const MessageBoxApi = (apiContext.ui as any).MessageBoxApi;

// Then use in callbacks:
const handleValidationError = useCallback(() => {
  MessageBoxApi.open({
    tag: 'REGVAL',
    code: 3273,
    params: [],
  });
}, [MessageBoxApi]);
```

`MessageBoxApi` is a stable singleton — including it in dependency arrays is
safe and correct. The `as any` cast is a known type-safety gap in the current
context interface.

---

## The Four Call Situations

### 1. Pure notice (OK only)

The user must acknowledge a condition before continuing. No follow-up logic:

```typescript
MessageBoxApi.open({
  tag: 'REGVAL',
  code: 3273,   // e.g., "Post-mortem date cannot be earlier than date of death"
  params: [],
});

return false;   // stop the calling function after showing the message
```

### 2. Confirmation gate (Yes / No)

The action only proceeds if the user selects Yes. Attach only a `Yes` callback —
the absence of a `No` callback is the correct pattern for "do nothing on No":

```typescript
MessageBoxApi.open({
  tag: 'REGSAV',
  code: 3305,
  params: ['REGISTRATION'],
  actionsCallback: {
    Yes() {
      proceedWithSave();   // only this path continues
    },
  },
});
```

### 3. Validation failure → re-entry chain

Show the validation error, then chain a secondary "please re-enter" prompt in
the `Ok` callback. Use a caller-supplied callback to restore focus or re-enable
the field:

```typescript
MessageBoxApi.open({
  tag: 'REGVAL',
  code: 3299,   // e.g., "Required field is blank"
  params: [],
  actionsCallback: {
    Ok() {
      // optionally chain the standard re-enter prompt
      MessageBoxApi.open({ tag: 'VERR01', code: 2080, params: [] });
      // or call a parent-supplied re-focus callback
      reEntryCallback?.();
    },
  },
});
```

### 4. Save / API failure

When an API call returns a non-success result (e.g., `roState !== 0` or a
caught exception), the save-failure sequence shows the request-specific error
then chains the standard re-enter prompt:

```typescript
MessageBoxApi.open({
  tag: 'SAVE00',
  code: 3178,
  params: [reqNo],   // insert the request number so the user knows which record failed
  actionsCallback: {
    Ok() {
      MessageBoxApi.open({ tag: 'VERR01', code: 2080, params: [] });
    },
  },
});
```

---

## Parameter Substitution

Message text may contain `[@PARM1]`, `[@PARM2]`, etc. Replace them via the
`params` array — positions correspond to placeholder numbers:

```typescript
// MessageDictionaryVo record: "Warning: [@PARM1] service is down."
MessageBoxApi.open({
  tag: 'DICT_INIT',
  code: 4136,
  params: ['GNS'],   // → "Warning: GNS service is down."
});
```

---

## Silent Messages (`logMessagebox = 0`)

When a message code has `logMessagebox = 0` in the dictionary, no dialogue
appears. The `open()` call still executes logging (monitor, ALS) and the primary
action fires immediately. The calling code does not need to handle this case
specially — the store suppresses the UI automatically.

---

## ALS Logging

Every `open()` call with `logAls = 1` in the dictionary triggers an ALS log
entry. To add clinical search keys (reqNo, hkid, encNo) to that entry, pass
`alsSearchKey`:

```typescript
MessageBoxApi.open({
  tag: 'SAVE00',
  code: 3178,
  params: [reqNo],
  alsSearchKey: { reqNo, hkid },   // appended to the ALS log
});
```

For HTTP errors, pass `httpstatus` so the logger upgrades severity to
`critical` for 5xx responses:

```typescript
MessageBoxApi.open({
  tag: 'APIERR',
  code: 4458,
  params: [],
  httpstatus: 500,
  alsSearchKey: { reqNo },
});
```

---

## Custom Messages (no dictionary code)

When no message code exists for a condition, use `openCustom`, which returns a
Promise that resolves with the label of the button clicked:

```typescript
const clicked = await MessageBoxApi.openCustom({
  variant: 'question',
  title: 'Unsaved Changes',
  content: 'You have unsaved changes. Do you want to discard them?',
  primaryAction: {
    label: 'Discard',
    onClick() {},
  },
  otherActions: [{ label: 'Cancel', onClick() {} }],
});

if (clicked === 'Discard') {
  clearForm();
}
```

Use custom messages sparingly — prefer dictionary codes wherever possible so
messages are consistently logged and easily searched across the system.

---

## tag Naming Convention

The `tag` prefix is displayed in the additional info panel of the dialogue
(format: `TAG-CODE`, e.g., `PMDATE-3273`). Keep tags short (≤6 characters),
uppercase, and descriptive of the screen/step that raised the message:

| Context | Tag suggestion |
|---|---|
| Registration screen validation | `REGVAL` |
| Registration save | `REGSAV` |
| Patient lookup | `PTLKUP` |
| Pre-authorization step | `PAUTH1`, `PAUTH2`, … |
| Dictionary initialisation | `DICTNT` |
| API error | `APIERR` |

---

## Common Mistakes

| Mistake | Correct approach |
|---|---|
| `alert('Invalid input')` or `window.confirm(...)` | Use `MessageBoxApi.open()` with the appropriate code |
| Rendering `<AlertDialog>` directly in plugin JSX for system messages | System messages must go through `MessageBoxApi.open()` |
| Importing `useMessageBoxStore` from `lis-hub-app` | Never import hub stores in plugin apps — use the context API |
| Instantiating `MessageBoxProvider` inside a plugin component | The provider is already in the hub shell; plugin apps must not add a second one |
| Attaching both `Yes` and `No` callbacks where No should do nothing | Omit the `No` callback — the dialogue closes and nothing happens, which is correct |
| Not calling `return false` after a blocking validation message | Always stop the calling function after opening a blocking message; otherwise execution continues |
| Forgetting to pass `alsSearchKey` on save / delete operations | Always include `reqNo` and `hkid` where available so log entries are clinically searchable |
