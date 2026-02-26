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

### Diagram 1 — Normal Sequential Flow (How the Chain Is Designed to Work)

```other
sequenceDiagram
    participant Chain as processFunction<br/>(UIComponentUtil)
    participant PS as processSave
    participant SCS as serverCallSave
    participant REG as register()
    participant EJB as EJB Server
    participant SharedState as SharedState<br/>(actions/actionIndex/...)

    Chain->>PS: call processSave(functions, N, cb, ecb, pnf)
    PS->>SharedState: setActionParameters()<br/>actionIndex = N<br/>(next = saveScreenValuesToParam)
    PS->>SCS: serverCallSave(packing, processNextAction, processNextActionFail)

    Note over SCS: Dialog 1: "Confirm save?"
    SCS-->>SCS: promptMessage("0000537", startMsgHandler)
    Note over SCS: ⏳ ASYNC WAIT — user clicks OK

    SCS->>REG: register(packing, registerCallbackHandler, ...)
    REG->>SharedState: saveCallbackFunction = registerCallbackHandler
    REG->>EJB: dispatchEvent(REGISTER)
    Note over EJB: ⏳ ASYNC WAIT — EJB call in-flight

    EJB-->>REG: registerHandler(SUCCESS)
    REG->>REG: handleRegistrationResult(result)
    REG->>SCS: registerCallbackHandler(true)

    Note over SCS: Dialog 2: "Saved successfully!"
    SCS-->>SCS: promptMessage("0000553", endMsgHandler)
    Note over SCS: ⏳ ASYNC WAIT — user clicks OK

    SCS->>SharedState: reads actionIndex = N (correct ✅)
    SCS->>Chain: processNextAction()<br/>→ advance to saveScreenValuesToParam
    Chain->>Chain: saveScreenValuesToParam
    Chain->>Chain: postRegistrationProcess
```

---

### Diagram 2 — The Race Condition (State Corruption Path)

```other
sequenceDiagram
    participant Chain as processFunction
    participant PS as processSave
    participant SCS as serverCallSave
    participant REG as register()
    participant EJB as EJB Server
    participant HRR as handleRegistrationResult()<br/>(subclass override / side effect)
    participant SharedState as ⚠️ SharedState<br/>(actions / actionIndex / ...)

    Chain->>PS: call processSave(functions, N, cb, ecb, pnf)
    PS->>SharedState: setActionParameters()<br/>✅ actionIndex = N<br/>(next = saveScreenValuesToParam)
    PS->>SCS: serverCallSave(packing, processNextAction, ...)

    Note over SCS: Dialog 1 — promptMessage("0000537")
    Note over SCS: ⏳ WAIT (user clicks OK)

    SCS->>REG: register(packing, registerCallbackHandler, ...)
    REG->>EJB: dispatchEvent(REGISTER)
    Note over EJB: ⏳ WAIT (EJB in-flight)

    EJB-->>REG: registerHandler(SUCCESS)

    rect rgb(255, 220, 220)
        Note over HRR,SharedState: ⚠️ DANGER ZONE — processNextAction not yet called,<br/>but shared state is about to be corrupted
        REG->>HRR: handleRegistrationResult(result) ← runs BEFORE saveCallbackFunction(true)
        HRR->>SharedState: setActionParameters()<br/>💥 actionIndex OVERWRITTEN<br/>(now points to step M > N)
    end

    REG->>SCS: saveCallbackFunction(true) → registerCallbackHandler(true)
    Note over SCS: Dialog 2 — promptMessage("0000553")
    Note over SCS: ⏳ WAIT (user clicks OK)

    SCS->>SharedState: reads actionIndex = M ❌ (CORRUPTED!)
    SCS->>Chain: processNextAction()<br/>→ jumps to step M, SKIPPING saveScreenValuesToParam!
    Chain->>Chain: ❌ postRegistrationProcess runs<br/>BEFORE processSave chain<br/>is properly completed!
```

---

### Diagram 3 — Root Cause: Closure vs. Shared State Comparison

```other
flowchart TB
    subgraph SAFE["✅ SAFE — serverCallSave uses closure capture"]
        direction TB
        A1["processSave calls serverCallSave(packing, processNextAction, processNextActionFail)"]
        A2["serverCallSave captures callbackFunction\nin local closure variable\n(endMessageCallbackHandler)"]
        A3["No matter what happens to shared state,\nendMessageCallbackHandler always calls\nthe ORIGINAL processNextAction reference"]
        A1 --> A2 --> A3
    end

    subgraph UNSAFE["❌ UNSAFE — processNextAction reads shared mutable state"]
        direction TB
        B1["processSave calls setActionParameters()\n→ writes actionIndex=N into this.actionIndex"]
        B2["serverCallSave starts async chain\n(Dialog 1 → EJB → Dialog 2)"]
        B3["⏳ During async wait, handleRegistrationResult()\nor any other code path calls setActionParameters()\n→ this.actionIndex is OVERWRITTEN to M"]
        B4["endMessageCallbackHandler eventually fires\n→ callbackFunction() = processNextAction()"]
        B5["processNextAction() reads this.actionIndex = M ❌\n→ advances to WRONG step\n→ postRegistrationProcess runs prematurely!"]
        B1 --> B2 --> B3 --> B4 --> B5
    end

    subgraph FIX["🔧 FIX — Capture continuation in closure inside processSave"]
        direction TB
        C1["processSave captures functions/index/cb/ecb/pnf\nin LOCAL closure variables at call time"]
        C2["var capturedNextAction = function():void {\n    processNextFunction(functions, index, cb, ecb, true)\n}"]
        C3["serverCallSave(packing, capturedNextAction, capturedNextActionFail)"]
        C4["Even if shared state is overwritten later,\ncapturedNextAction always holds the correct\nfunctions+index for THIS call — immune to corruption ✅"]
        C1 --> C2 --> C3 --> C4
    end
```

---

### Diagram 4 — All Async Save Actions and Their Shared-State Exposure Windows

```other
gantt
    title Save Action Chain — Shared State Exposure Windows (⚠️ = vulnerable)
    dateFormat  X
    axisFormat %s

    section Action Sequence
    processFreeze           :done,    f,  0, 1
    resetRequestLabs        :done,    r,  1, 2
    gatherServerInfo ⚠️     :active,  g,  2, 4
    convertDataForSave      :done,    c,  4, 5
    validate ⚠️             :active,  v,  5, 7
    preRegistrationProcess ⚠️ :active, pr, 7, 9
    popUpPrivateReason ⚠️   :active,  pp, 9, 12
    popUpResultEntry ⚠️     :active,  pe, 12, 16
    popUpVerification ⚠️    :active,  pv, 16, 20
    processSave ⚠️⚠️⚠️      :crit,    ps, 20, 30
    saveScreenValuesToParam :done,    ss, 30, 31
    postRegistrationProcess ⚠️ :active, po, 31, 34
    printWorksheet          :active,  pw, 34, 37
    processUnfreeze         :done,    pu, 37, 38
    processClear            :done,    pc, 38, 39
    retainScreenValues      :done,    rs, 39, 40
    returnToScreen          :done,    rt, 40, 41
```

The key insight across all four diagrams: `processSave` has the **longest exposure window** (three nested async layers: Dialog 1 → EJB call → Dialog 2) and is the only step where an extensibility hook (`handleRegistrationResult`) runs synchronously **between** the EJB response arriving and `processNextAction()` being called — making it the most likely point of state corruption.