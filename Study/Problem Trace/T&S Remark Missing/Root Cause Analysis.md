## Root Cause Analysis: `postRegistrationProcess` Running Before `processSave` Completes

### 1. The Design Pattern: How the Chain Normally Works

`UIComponentUtil.processFunction` passes itself as the `processNextFunction` argument to each step. Each step receives `(functions, index, callbackFunction, errorCallbackFunction, processNextFunction)` and is responsible for calling `processNextFunction(...)` when it finishes (either directly or via callback).

For **synchronous steps** this is straightforward. For **async steps**, the pattern is:

1. Call `setActionParameters(...)` to save the current chain context into **instance-level shared fields**.

2. Start the async operation, passing `processNextAction` as the "done" callback.

3. When the async op finishes, the callback fires `processNextAction()`, which reads back from those saved instance fields and advances the chain.

\---

### 2. The Fundamental Structural Flaw: Shared Mutable Instance State

`setActionParameters` overwrites **six shared instance-level fields** on every call:

```690:695:lisWeb/flex_src/hk/org/ha/lis/request/presentation/base/RequestBasePm.as

```

And `processNextAction()` reads from these at **call time**, not at capture time:

```735:738:lisWeb/flex_src/hk/org/ha/lis/request/presentation/base/RequestBasePm.as

```

**This is safe only if exactly one async operation is in-flight at a time.** If the instance-level state is overwritten between `setActionParameters` being called (in step N) and `processNextAction()` being invoked (completing step N), then `processNextAction()` will use the wrong `actionIndex` and jump to the wrong step.

\---

### 3. The Specific Vulnerability in `processSave` → `serverCallSave`

`processSave` follows the async pattern:

```919:929:lisWeb/flex_src/hk/org/ha/lis/request/presentation/base/RequestBasePm.as

```

After `setActionParameters` runs, `this.actionIndex` points to `saveScreenValuesToParam` (the step after `processSave`). The method reference `processNextAction` (not a closure — it reads shared state at call time) is passed to `serverCallSave`.

Now look at the full async chain inside `serverCallSave`:

```260:295:lisWeb/flex_src/hk/org/ha/lis/request/presentation/RegistrationPm.as

```

The async chain is **four levels deep** before `callbackFunction()` (i.e., `processNextAction()`) is finally invoked:

```

promptMessage("0000537", ...)        ← Dialog 1: "Confirm save?"

→ startMessageCallbackHandler

→ register(packing, registerCallbackHandler, ...)

→ dispatchEvent(RegistrationEvent.register(...))   ← EJB async call

→ registerHandler (called when EJB responds)

→ handleRegistrationResult(result)         ← ⚠ hook point

→ registerCallbackHandler(true)

→ promptMessage("0000553", ...)        ← Dialog 2: "Saved!"

→ endMessageCallbackHandler

→ callbackFunction()           ← processNextAction()

```

`processNextAction()` is only called at the **very end** of this entire chain. Between `setActionParameters` running (at the start of `processSave`) and `processNextAction()` being called (at the end of Dialog 2), there are **three asynchronous waits** during which the shared instance state is exposed.

\---

### 4. The Concrete Race Condition

**The critical moment is between `register()` dispatching the event and `registerHandler` being invoked.**

`register()` sets two more shared instance-level fields:

```748:753:lisWeb/flex_src/hk/org/ha/lis/request/presentation/RegistrationPm.as

```

At this point the PM has **two active "pending callback" contexts** that both use shared state:

\- The `setActionParameters` state (from `processSave`) — used by `processNextAction()` when the chain advances.

\- The `serverCallErrorCallbackFunction` — used by `serverCallErrorHandler` if a server fault occurs.

**If `serverCallErrorHandler` fires** (network error, timeout, or fault from any other in-flight event on this PM):

```816:824:lisWeb/flex_src/hk/org/ha/lis/request/presentation/RegistrationPm.as

```

It calls `serverCallErrorCallbackFunction()` which is `endFailMessageCallbackHandler`. That calls `errorCallbackFunction()` = `processNextActionFail()`. `processNextActionFail()` reads the shared state and calls `actionNextFunction(..., false)`, which triggers `errorCallbackFunction()` and aborts the save chain — which is the correct error path.

**But here is the more dangerous scenario** — the `handleRegistrationResult` extensibility hook:

```799:801:lisWeb/flex_src/hk/org/ha/lis/request/presentation/RegistrationPm.as

```

This is called **synchronously inside `registerHandler`**, BEFORE `saveCallbackFunction(true)` triggers `registerCallbackHandler`:

```778:782:lisWeb/flex_src/hk/org/ha/lis/request/presentation/RegistrationPm.as

```

If any subclass overrides `handleRegistrationResult` and inside it calls **any method that invokes `setActionParameters`** — directly or indirectly (e.g., via another `processFunctions()` call, via triggering another save-like action, or via dispatching another `RegistrationEvent` whose response handler calls `setActionParameters`) — then by the time `saveCallbackFunction(true)` → ... → `processNextAction()` is finally called, the `this.actionIndex` has already been overwritten to point to a later step, and `postRegistrationProcess` runs before the `processSave` chain has cleanly completed.

\---

### 5. Secondary Flaw: `processNextAction` Is Not a Safe Closure

The deeper design issue is this contrast:

**`serverCallSave` correctly uses closures** — `callbackFunction` and `errorCallbackFunction` are captured by value in `endMessageCallbackHandler` and `endFailMessageCallbackHandler`. No matter what happens to the outside world, those closures will call exactly the right function.

**`processNextAction()` does NOT use a closure** — it reads `this.actionIndex`, `this.actions`, etc. dynamically at call time. It is equivalent to:

```actionscript

// What processNextAction() effectively does:

// Reads whatever this.actionIndex currently is — vulnerable to overwrite

actionNextFunction(this.actions, this.actionIndex, ...);

```

Compare with what `serverCallSave`'s closures do:

```actionscript

// What endMessageCallbackHandler does:

// callbackFunction is captured by value in the closure — safe

callbackFunction();

```

The same safety that was correctly applied in `serverCallSave` (capturing callbacks in closures) was NOT applied to the `setActionParameters` / `processNextAction` pattern used by `processSave` and all other async save actions.

\---

### 6. The Fix

Every async save action should capture its continuation state in a **local closure** rather than in the shared instance fields. In `processSave` specifically:

```actionscript

protected final function processSave(functions:Array,

index:int,

callbackFunction:Function,

errorCallbackFunction:Function,

processNextFunction:Function,

result:Boolean = true):void

{

// Capture the continuation in a closure at this exact point in time,

// independent of any future changes to the shared instance state.

var capturedNextAction:Function = function():void {

processNextFunction(functions, index, callbackFunction, errorCallbackFunction, true);

};

var capturedNextActionFail:Function = function():void {

processNextFunction(functions, index, callbackFunction, errorCallbackFunction, false);

};

var packing:RequestPackingVoInterface = requestDataConvertor.constructRequestPacking();

serverCallSave(packing, capturedNextAction, capturedNextActionFail);

}

```

This removes the dependency on `this.actions`, `this.actionIndex`, etc. and makes the continuation immune to any subsequent `setActionParameters` calls. The same pattern should be applied to any other async save action where the gap between `setActionParameters` and the eventual `processNextAction()` call is long (especially those involving server calls or multi-step dialogs).

\---

\### Summary Table

| Layer | What can corrupt state | Window of exposure |

|---|---|---|

| `processFreeze` | Fast — freeze completes quickly | Minimal |

| `gatherServerInformationForValidation` | EJB call in-flight | Medium |

| `preRegistrationProcess` | EJB call in-flight | Medium |

| `popUpVerificationDialogue` / `popUpPrivateChangeReasonDialogue` / `popUpResultEntryDialogue` | Waiting for user | Long — user interaction time |

| **`processSave`** | **Dialog 1 → EJB call → Dialog 2** | **Very long — 3 async layers deep** |

| `postRegistrationProcess` | EJB call in-flight | Medium |

`processSave` has the **longest exposure window** and is the most dangerous step. Any action between the moment Dialog 1 is shown and the moment Dialog 2 is dismissed that writes to the six shared instance fields will cause the sequence to skip steps or advance prematurely — which is exactly the symptom observed (`postRegistrationProcess` running before `processSave` completes).

---
