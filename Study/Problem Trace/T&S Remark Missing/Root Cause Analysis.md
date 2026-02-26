## Root Cause Analysis: `postRegistrationProcess` Running Before `processSave` Completes

### 1. The Design Pattern: How the Chain Normally Works

UIComponentUtil.processFunction passes itself as the processNextFunction argument to each step. Each step receives (functions, index, callbackFunction, errorCallbackFunction, processNextFunction) and is responsible for calling processNextFunction(...) when it finishes (either directly or via callback).

For synchronous steps this is straightforward. For async steps, the pattern is:

1. Call setActionParameters(...) to save the current chain context into instance-level shared fields.

2. Start the async operation, passing processNextAction as the "done" callback.

3. When the async op finishes, the callback fires processNextAction(), which reads back from those saved instance fields and advances the chain.

---

### 2. The Fundamental Structural Flaw: Shared Mutable Instance State

setActionParameters overwrites six shared instance-level fields on every call:

RequestBasePm.asLines 690-695

        private var actions:Array = null;       

        private var actionIndex:int=0;

        private var actionCallbackFunction:Function = null;

        private var actionErrorCallbackFunction:Function = null;

        private var actionNextFunction:Function = null;

        private var actionResult:Boolean = true;

And processNextAction() reads from these at call time, not at capture time:

RequestBasePm.asLines 735-738

        protected final function processNextAction():void

        {

            actionNextFunction(actions, actionIndex, actionCallbackFunction, actionErrorCallbackFunction, actionResult);

        }

This is safe only if exactly one async operation is in-flight at a time. If the instance-level state is overwritten between setActionParameters being called (in step N) and processNextAction() being invoked (completing step N), then processNextAction() will use the wrong actionIndex and jump to the wrong step.

---

### 3. The Specific Vulnerability in processSave → serverCallSave

processSave follows the async pattern:

RequestBasePm.asLines 919-929

        protected final function processSave(functions:Array, 

                                        index:int, 

                                        callbackFunction:Function, 

                                        errorCallbackFunction:Function,

                                        processNextFunction:Function,

                                        result:Boolean = true):void

        {

            setActionParameters(functions, index, callbackFunction, errorCallbackFunction, processNextFunction, result);

            var packing:RequestPackingVoInterface = requestDataConvertor.constructRequestPacking(); 

            serverCallSave(packing, processNextAction, processNextActionFail);

        }

After setActionParameters runs, this.actionIndex points to saveScreenValuesToParam (the step after processSave). The method reference processNextAction (not a closure — it reads shared state at call time) is passed to serverCallSave.

Now look at the full async chain inside serverCallSave:

RegistrationPm.asLines 260-295

        protected override function serverCallSave(requestPacking:RequestPackingVoInterface, callbackFunction:Function, errorCallbackFunction:Function):void

        {

            var endMessageCallbackHandler:Function = function (button:int) : void

            {

                callbackFunction();

            }

            var endFailMessageCallbackHandler:Function = function (button:int=-1) : void

            {

                errorCallbackFunction();

            }

            var registerCallbackHandler:Function = function (result:Boolean) : void

            {

                if (result) {

                    (param as RegistrationProcessParameter).isSave = true;

                    var packing:RegistrationPackingVo = requestPacking as RegistrationPackingVo;

                    var registration:RegistrationVo = packing.registrations.getItemAt(0) as RegistrationVo;

                    (param as (RegistrationProcessParameter)).labResult = registration.labResult;

                    (param as (RegistrationProcessParameter)).packing = packing;

                    promptMessage("", "0000553", UIComponentUtil.getMessageParams(requestNo), endMessageCallbackHandler);   

                } else {

                    promptMessage("", "0000752", null, endFailMessageCallbackHandler);

                }

            }

            var startMessageCallbackHandler:Function = function (button:int) : void

            {                               

                // Start Saving Request

                register(requestPacking as RegistrationPackingVo, registerCallbackHandler, endFailMessageCallbackHandler);

                //registerCallbackHandler();

            }   

            var requestNo:String = (RegistrationProcessParameter(param)).requestNo;

            promptMessage("", "0000537", UIComponentUtil.getMessageParams(requestNo), startMessageCallbackHandler);

        }

The async chain is four levels deep before callbackFunction() (i.e., processNextAction()) is finally invoked:

promptMessage("0000537", ...)        ← Dialog 1: "Confirm save?"

  → startMessageCallbackHandler

      → register(packing, registerCallbackHandler, ...)

          → dispatchEvent(RegistrationEvent.register(...))   ← EJB async call

              → registerHandler (called when EJB responds)

                  → handleRegistrationResult(result)         ← ⚠ hook point

                  → registerCallbackHandler(true)

                      → promptMessage("0000553", ...)        ← Dialog 2: "Saved!"

                          → endMessageCallbackHandler

                              → callbackFunction()           ← processNextAction()

processNextAction() is only called at the very end of this entire chain. Between setActionParameters running (at the start of processSave) and processNextAction() being called (at the end of Dialog 2), there are three asynchronous waits during which the shared instance state is exposed.

---

### 4. The Concrete Race Condition

The critical moment is between register() dispatching the event and registerHandler being invoked.

register() sets two more shared instance-level fields:

RegistrationPm.asLines 748-753

        protected function register(registrationPacking:RegistrationPackingVo, callbackFunction:Function, errorCallbackFunction:Function):void

        {

            this.saveCallbackFunction = callbackFunction;

            this.serverCallErrorCallbackFunction = errorCallbackFunction;

            dispatchEvent(RegistrationEvent.register(registrationPacking, registerHandler, serverCallErrorHandler));

        }

At this point the PM has two active "pending callback" contexts that both use shared state:

- The setActionParameters state (from processSave) — used by processNextAction() when the chain advances.

- The serverCallErrorCallbackFunction — used by serverCallErrorHandler if a server fault occurs.

If serverCallErrorHandler fires (network error, timeout, or fault from any other in-flight event on this PM):

RegistrationPm.asLines 816-824

        protected function serverCallErrorHandler(fault:FaultEvent, trigger:Event):void

        {

            //Alert.show("Server Call Error !!!");  

            promptMessage("", "0003385");

            if (serverCallErrorCallbackFunction!=null)

            {

                serverCallErrorCallbackFunction();

            }

        }

It calls serverCallErrorCallbackFunction() which is endFailMessageCallbackHandler. That calls errorCallbackFunction() = processNextActionFail(). processNextActionFail() reads the shared state and calls actionNextFunction(..., false), which triggers errorCallbackFunction() and aborts the save chain — which is the correct error path.

But here is the more dangerous scenario — the handleRegistrationResult extensibility hook:

RegistrationPm.asLines 799-801

        protected function handleRegistrationResult(result:ResponseObject):void {

        }

This is called synchronously inside registerHandler, BEFORE saveCallbackFunction(true) triggers registerCallbackHandler:

RegistrationPm.asLines 778-782

            if (result.roState == LisErrorConstants.SUCCESS)

            {

                handleRegistrationResult(result);

                saveCallbackFunction(true);             

            }

If any subclass overrides handleRegistrationResult and inside it calls any method that invokes setActionParameters — directly or indirectly (e.g., via another processFunctions() call, via triggering another save-like action, or via dispatching another RegistrationEvent whose response handler calls setActionParameters) — then by the time saveCallbackFunction(true) → ... → processNextAction() is finally called, the this.actionIndex has already been overwritten to point to a later step, and postRegistrationProcess runs before the processSave chain has cleanly completed.

---

### 5. Secondary Flaw: processNextAction Is Not a Safe Closure

The deeper design issue is this contrast:

serverCallSave correctly uses closures — callbackFunction and errorCallbackFunction are captured by value in endMessageCallbackHandler and endFailMessageCallbackHandler. No matter what happens to the outside world, those closures will call exactly the right function.

processNextAction() does NOT use a closure — it reads this.actionIndex, this.actions, etc. dynamically at call time. It is equivalent to:

// What processNextAction() effectively does:

// Reads whatever this.actionIndex currently is — vulnerable to overwrite

actionNextFunction(this.actions, this.actionIndex, ...);

Compare with what serverCallSave's closures do:

// What endMessageCallbackHandler does:

// callbackFunction is captured by value in the closure — safe

callbackFunction();

The same safety that was correctly applied in serverCallSave (capturing callbacks in closures) was NOT applied to the setActionParameters / processNextAction pattern used by processSave and all other async save actions.

---

### 6. The Fix

Every async save action should capture its continuation state in a local closure rather than in the shared instance fields. In processSave specifically:

protected final function processSave(functions:Array, 

                                     index:int, 

                                     callbackFunction:Function, 

                                     errorCallbackFunction:Function,

                                     processNextFunction:Function,

                                     result:Boolean = true):void

{

    // Capture the continuation in a closure at this exact point in time,

    // independent of any future changes to the shared instance state.

    var capturedNextAction:Function = function():void {

        processNextFunction(functions, index, callbackFunction, errorCallbackFunction, true);

    };

    var capturedNextActionFail:Function = function():void {

        processNextFunction(functions, index, callbackFunction, errorCallbackFunction, false);

    };

    var packing:RequestPackingVoInterface = requestDataConvertor.constructRequestPacking(); 

    serverCallSave(packing, capturedNextAction, capturedNextActionFail);

}

This removes the dependency on this.actions, this.actionIndex, etc. and makes the continuation immune to any subsequent setActionParameters calls. The same pattern should be applied to any other async save action where the gap between setActionParameters and the eventual processNextAction() call is long (especially those involving server calls or multi-step dialogs).

---

### Summary Table

|Layer|What can corrupt state|Window of exposure|
|---|---|---|
|processFreeze|Fast — freeze completes quickly|Minimal|
|gatherServerInformationForValidation|EJB call in-flight|Medium|
|preRegistrationProcess|EJB call in-flight|Medium|
|popUpVerificationDialogue / popUpPrivateChangeReasonDialogue / popUpResultEntryDialogue|Waiting for user|Long — user interaction time|
|processSave|Dialog 1 → EJB call → Dialog 2|Very long — 3 async layers deep|
|postRegistrationProcess|EJB call in-flight|Medium|

processSave has the longest exposure window and is the most dangerous step. Any action between the moment Dialog 1 is shown and the moment Dialog 2 is dismissed that writes to the six shared instance fields will cause the sequence to skip steps or advance prematurely — which is exactly the symptom observed (postRegistrationProcess running before processSave completes).

---

### Diagram 1 — Normal Sequential Flow (How the Chain Is Designed to Work)

```mermaid
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

```mermaid
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

```mermaid
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

```mermaid
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

---
### Diagram 1 — Exact Log Timeline with All Server Sessions

```mermaid
sequenceDiagram
    participant FC as Flex Client<br/>(BlazeDS)
    participant S173 as Session 173<br/>(gcrSpecAckRegister)
    participant S183 as Session 183<br/>(checkCrossLabRequest)
    participant S198 as Session 198<br/>(printReport)
    participant DB as Database

    Note over FC,DB: ── Pre-save steps (simplified) ──

    FC->>S173: checkCrossLabRequest(26BB002610)
    Note over S173: .123 BEGIN
    S173-->>FC: existed=false
    Note over S173: .181 COMMIT
    FC->>FC: processNextAction() → advances chain

    Note over FC: ⚠️ Action chain is advancing toward processSave

    par Concurrent EJB calls triggered simultaneously
        FC->>S183: checkCrossLabRequest(26BB002610)
        Note over S183: .377 BEGIN<br/>same requestNo!
    and
        FC->>S173: gcrSpecAckRegister(packing)
        Note over S173: .386 BEGIN T1
        S173->>DB: INSERT request 26BB002610<br/>(UNCOMMITTED in T1)
        Note over S173: .516 insertCrsRequest<br/>registeredDate=09:49:39.45
    end

    Note over FC: processSave called setActionParameters()<br/>❌ actionIndex NOW points to saveScreenValuesToParam
    Note over S183: .429 checkCrossLabRequest response

    S183-->>FC: existed=false
    Note over S183: .436 COMMIT

    rect rgb(255, 180, 180)
        Note over FC: ⚠️ SESSION 183 CALLBACK FIRES!<br/>calls processNextAction()<br/>reads actionIndex = saveScreenValuesToParam (CORRUPTED!)<br/>chain jumps past processSave!
        FC->>FC: saveScreenValuesToParam()
        FC->>FC: postRegistrationProcess()<br/>BbsGcrSpecAckDataConvertor.printTsRemark() [.491]
        FC->>FC: printRegistrationWorksheet()
        FC->>S198: printReport(TS_REMARK_REPORT, 26BB002610)
        Note over S198: .544 BEGIN T2
        Note over S198: .546 createReport[TS_REMARK_REPORT] starts
        S198->>DB: SELECT * FROM crs_request<br/>WHERE reqno='26BB002610'
        Note over DB: ❌ 26BB002610 NOT VISIBLE<br/>T1 (session 173) not committed!
        DB-->>S198: Empty result (size=0)
        S198->>S198: Vector.get(0)<br/>→ ArrayIndexOutOfBoundsException
        Note over S198: .564 EXCEPTION!<br/>selectRequestInfoByRequestNoAndLabNo<br/>Array index out of range: 0
    end

    Note over S173: T1 still processing...
    S173->>DB: INSERT audit, GCR data... (.563)
    S173->>DB: COMMIT T1 (.836)
    S173-->>FC: gcrSpecAckRegister response
    Note over FC: ✅ Should have waited HERE<br/>before calling printReport
```

---

### Diagram 2 — Exact Log Line Evidence

```mermaid
timeline
    title Server Log Evidence  (2026-02-25 09:49:39.xxx, Session IDs in brackets)
    section .118 — .200
        .118 [S198] : Security check — new session 198 preparing
        .123 [S173] : checkCrossLabRequest BEGIN (req 26BB002610)
        .172 [S173] : checkCrossLabRequest response → existed=false
        .181 [S173] : checkCrossLabRequest COMMIT
    section .370 — .450
        .372 [S183] : Security check — new session 183 preparing
        .377 [S183] : checkCrossLabRequest BEGIN (SAME req 26BB002610!)
        .378 [S173] : Security check — session 173 preparing next EJB
        .386 [S173] : gcrSpecAckRegister T1 BEGIN ⚡ CONCURRENT with S183!
        .429 [S183] : checkCrossLabRequest response → existed=false
        .436 [S183] : checkCrossLabRequest COMMIT → ❌ callback fires with wrong actionIndex
    section .510 — .570
        .516 [S173] : INSERT 26BB002610 registeredDate=(09 49 39.45 UNCOMMITTED)
        .536 [S198] : Security check for printReport
        .544 [S198] : printReport T2 BEGIN (called from Flex via BlazeDS!)
        .546 [S198] : createReport TS_REMARK_REPORT starts
        .563 [S173] : INSERT GCR audit data (still in T1!)
        .564 [S198] : EXCEPTION ArrayIndexOutOfBoundsException
    section .830+
        .836 [S173] : gcrSpecAckRegister T1 COMMIT — 292ms TOO LATE
```

---

### Diagram 3 — The Shared State Corruption Mechanism (Root Cause)

```mermaid
flowchart TD
    subgraph BEFORE_SAVE["Before processSave — Session 173"]
        A1["checkCrossLabRequest() called\n(session 173, .123)\nsetActionParameters:\nactionIndex → processSave"]
        A2["checkCrossLabRequest returns (.181)\ncallback → processNextAction()\n→ advances chain toward processSave"]
    end

    subgraph RACE_WINDOW["⚠️ Race Window — Two concurrent actions"]
        direction LR
        B1["Session 183:\ncheckCrossLabRequest(.377)\n(triggered from popUpResultEntryDialogue\nor a save chain step that was\nalso async-pending)\nsets actionIndex → processSave"]
        B2["Session 173:\nprocessSave starts (.386)\ngcrSpecAckRegister T1 begins\n❌ setActionParameters OVERWRITES:\nactionIndex → saveScreenValuesToParam"]
        B1 ~~~ B2
    end

    subgraph CORRUPT_CALLBACK["💥 Corrupted Callback — Session 183 returns"]
        C1["checkCrossLabRequest returns (.436)\ncallback calls processNextAction()"]
        C2["processNextAction() reads\nthis.actionIndex = saveScreenValuesToParam\n❌ WRONG! Should read 'processSave'"]
        C3["Chain jumps PAST processSave:\nsaveScreenValuesToParam →\npostRegistrationProcess (.491) →\nprintRegistrationWorksheet →\nprintReport via BlazeDS (.544)"]
    end

    subgraph FAILURE["❌ Server Failure — Session 198"]
        D1["printReport queries 26BB002610\nfrom DB via\nselectRequestInfoByRequestNoAndLabNo"]
        D2["Query returns EMPTY Vector\n(T1 not committed, data invisible)"]
        D3["Vector.get(0) throws\nArrayIndexOutOfBoundsException!\n(.564)"]
        D4["T1 commits at .836\n— 292ms after T2 already failed"]
    end

    A1 --> A2 --> RACE_WINDOW
    RACE_WINDOW --> CORRUPT_CALLBACK
    C1 --> C2 --> C3 --> FAILURE
    D1 --> D2 --> D3
    D4 -.->|"Too late"| D1

    style B2 fill:#ff6666,color:#fff
    style C2 fill:#ff6666,color:#fff
    style D3 fill:#ff4444,color:#fff
    style RACE_WINDOW fill:#fff0f0
    style CORRUPT_CALLBACK fill:#ffe0e0
```

---

### Diagram 4 — The Two Key Concurrent EJB Calls Proven by Session IDs

Mermaid Syntax Error

View diagram source

block-beta
  columns 4
  block:timeline["Timeline ms"]:1
    t386[".386"]
    t436[".436"]
    t516[".516"]
    t544[".544"]
    t564[".564"]
    t836[".836"]
  end
  block:s173["Session 173\n(gcrSpecAckRegister T1)"]:1
    r1["T1 BEGIN\ngcrSpecAckRegister\nline 131"]
    space
    r3["INSERT 26BB002610\nregisteredDate=.45\nline 168"]
    space
    space
    r6["T1 COMMIT\nline ~200+\n.836"]
  end
  block:s183["Session 183\n(checkCrossLabRequest)"]:1
    space
    r2["COMMIT .436\n❌ callback fires\nwrong actionIndex\nline 135"]
    space
    space
    space
    space
  end
  block:s198["Session 198\n(printReport T2)"]:1
    space
    space
    space
    r4["T2 BEGIN\nprintReport\nline 173"]
    r5["EXCEPTION!\nArrayIndexOutOfBounds\nVector.get(0)\nline 190"]
    space
  end

---

### Summary: What the Log Proves

|Evidence|Log Line|Significance|
|---|---|---|
|gcrSpecAckRegister T1 starts|line 131 .386|T1 begins|
|INSERT 26BB002610 with registeredDate=09:49:39.45|line 168 .516|Data written but NOT committed|
|Session 183 checkCrossLabRequest same requestNo|line 129 .377|Concurrent with T1 — will fire callback with corrupted state|
|Session 183 callback fires|line 135 .436|processNextAction() reads actionIndex pointing to saveScreenValuesToParam|
|printReport called via BlazeDS|line 234 in stacktrace|Flex client called this — NOT from within gcrSpecAckRegister|
|selectRequestInfoByRequestNoAndLabNo returns empty|line 192 stacktrace|26BB002610 not visible — T1 uncommitted|
|Vector.get(0) → ArrayIndexOutOfBoundsException|line 191|Exception caused by empty DB result|
|T1 commits at .836|292ms after T2 failed|Too late|

The fix must ensure that Session 183's checkCrossLabRequest callback, when it fires, cannot advance the chain past processSave by capturing its own continuation state in a closure rather than relying on the shared actionIndex instance field.