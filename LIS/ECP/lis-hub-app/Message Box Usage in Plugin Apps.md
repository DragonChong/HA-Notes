# Message Box Usage in Plugin Apps

## Overview

Plug-in applications loaded within `lis-hub-app` do not instantiate their own message box system. Instead, they receive a reference to the `MessageBoxApi` that is already initialised and rendering within the hub shell. The API is passed through the CMS API context. This document describes the access pattern and the common call patterns used by `lis-aps-app`.

> For the full description of the Message Box component, its options, and its rendering system, see [[Message Box]].

---

## How the Bridge Works

`MessageBoxApi` is exposed to plug-in apps as part of the `cms.api.ui` context. In `lis-aps-app`, it is accessed once at component level and used throughout:

```ts
const MessageBoxApi = (cms.api.ui as any).MessageBoxApi;
```

The `as any` cast is a type-safety workaround because the shared API context does not currently include `MessageBoxApi` in its TypeScript interface for the `ui` namespace.

Plug-in apps **must not** instantiate their own `MessageBoxProvider` or `useMessageBoxStore`. All message boxes shown in a plug-in app appear inside the hub shell's dialogue stack.

---

## Access Pattern in lis-aps-app

`MessageBoxApi` is read from context at the top of each component where messages are needed, and passed as a `useCallback` dependency:

```ts
function MyComponent() {
  const MessageBoxApi = (cms.api.ui as any).MessageBoxApi;

  const doSomething = useCallback(() => {
    MessageBoxApi.open({
      tag: 'MYTAG1',
      code: 1234,
      params: [],
    });
  }, [MessageBoxApi]);
}
```

Because `MessageBoxApi` is a stable singleton object (not a new reference on each render), including it in `useCallback` dependency arrays is safe and follows the linting rules.

---

## Common Call Patterns

### 1. Error or Warning Notice (OK only)

Used when a condition fails and the user must acknowledge before continuing:

```ts
MessageBoxApi.open({
  tag: 'PMDATE',
  code: 3273,
  params: [],
  actionsCallback: {
    Ok() {
      MessageBoxApi.open({  // optional: chain another message
        tag: 'VERR01',
        code: 2080,
        params: [],
      });
    },
  },
});
```

The `Ok` callback may chain a second message box (e.g., a standard "re-enter" prompt). The outer box closes first, then the inner box opens.

### 2. Yes/No Confirmation Before an Action

Used before destructive or significant operations. The action proceeds only if the user selects **Yes**:

```ts
MessageBoxApi.open({
  tag: 'PAUTH1',
  code: 3305,
  params: [reportTypeDesc.toUpperCase()],
  actionsCallback: {
    Yes() {
      proceedToNextStep();
    },
  },
});
```

There is no `No` callback because the default behaviour on **No** (or any non-Yes button) is to do nothing and close the dialogue.

### 3. Validation Failure with Re-Entry Prompt Chain

The APS result entry module follows a consistent pattern for validation failures: the validation message box is shown, and its **OK** callback triggers a secondary "please re-enter" prompt:

```ts
MessageBoxApi.open({
  tag: 'VPATH2',
  code: 3299,   // e.g., Responsible Pathologist not selected
  params: [],
  actionsCallback: {
    Ok() {
      callback?.();  // caller-supplied callback for re-focus/re-entry
    },
  },
});
```

Examples of validation messages in APS result entry:

| Code | Condition | Button |
|---|---|---|
| 3273 | Post-mortem date earlier than date of death | OK |
| 3274 | Post-mortem date earlier than arrival date | OK |
| 3299 | Responsible Pathologist field is blank | OK |
| 3594 | Auth. By person is invalid | OK |
| 3601 | Current user is not the authorised person | OK |
| 3314 | User has no right to authorise this case | OK |
| 3315 | Complexity not entered for this case | OK |

### 4. Multi-Step Authorization Flow

The `preAuthActions` workflow in APS result entry uses a chained sequence of message boxes, each gating progress to the next step. Only the path where the user confirms proceeds; all other paths terminate with no further action:

```
preAuthStep1 → Message 3305 (confirm report type) → Yes → preAuthStep2
preAuthStep3 → Message 3306 (user mismatch, ask) → Yes → preAuthStep4
           → Message 3307 (user mismatch, block) → (no proceed)
preAuthStep5 → Message 3601 (wrong auth user)    → (no proceed)
preAuthStep7 → Message 3315 (complexity missing) → (no proceed)
preAuthStep8 → Message 3313 (unencoded SNOMED)   → OK → open request detail
preAuthStep10 → Message 3314 (no auth right)     → (no proceed)
preAuthStep13 → Message after attachment check   → (save proceeds)
```

Authorization flow messages in APS result entry:

| Code | Step | Condition | Button |
|---|---|---|---|
| 3305 | Pre-auth 1 | Confirm report type before authorizing | YES / NO |
| 3306 | Pre-auth 3 | Current user is not responsible/auth person — ask to continue | YES / NO |
| 3307 | Pre-auth 3 | Same mismatch condition — block authorization | OK |
| 3601 | Pre-auth 5 | Logged-in user ≠ Auth. By person | OK |
| 3315 | Pre-auth 7 | Complexity field is empty | OK |
| 3313 | Pre-auth 8 | Uncoded SNOMED entries exist | OK → opens request detail |
| 3314 | Pre-auth 10 | User has no authorization right | OK |

### 5. Save Failure (roState ≠ 0)

When the save API returns a non-success state, a two-step error sequence fires:

```ts
MessageBoxApi.open({
  tag: 'SAVE00',
  code: 3178,
  params: [formValues.reqNo],
  actionsCallback: {
    Ok() {
      MessageBoxApi.open({
        tag: 'VERR01',
        code: 2080,
        params: [],
      });
    },
  },
});
```

| Code | Meaning |
|---|---|
| 3178 | Save failed for the specified request number |
| 2080 | Standard "please re-enter" prompt |

---

## Patterns Observed Across Components

| Pattern | Description |
|---|---|
| `actionsCallback: { Yes() { nextStep() } }` | Confirmation gate — action only proceeds on Yes |
| `actionsCallback: { Ok() { MessageBoxApi.open({ code: 2080 }) } }` | Error → re-enter prompt chain |
| `MessageBoxApi.open(...)` with no `actionsCallback` | Pure notice — user acknowledges, no follow-up action |
| `return false` after `MessageBoxApi.open(...)` | Validation rejection — stops the current operation after displaying the message |
| Calling `MessageBoxApi.open(...)` then `callback?.()` in Ok | Passes a re-entry callback from the parent to restore focus after dismiss |

---

## Related Workflows

- [[Message Box]] — Full component specification including all `OpenOptions`, providers, logging flags, and silent message behaviour.
