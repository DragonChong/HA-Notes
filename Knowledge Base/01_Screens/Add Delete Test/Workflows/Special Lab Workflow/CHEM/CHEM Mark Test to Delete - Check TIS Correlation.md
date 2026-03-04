# CHEM: Mark Test to Delete - Check TIS Correlation

## Overview

This workflow describes the TIS Correlation check applied as the first step of the [[CHEM Mark Test to Delete]] sequence on the Add Delete Test screen. When the `CHECK_TIS_CORRELATION` lab option is enabled and the retrieved TIS lab request has an active correlation to another request, any attempt to mark a test or test group for deletion is blocked with a message. The deletion can only proceed if the correlation is removed first. If the lab option is disabled, the check is skipped and deletion proceeds normally.

---

## Related User Stories

- **[[CRST-1043]]** - Add Delete Test - CHEM: Mark Test to Delete - Check TIS Correlation

**Epic:** LISP-267 [CRST][DEV] Add/Delete Test - Special Lab Workflow (CHEM)

---

## Key Concepts

### TIS (Therapeutic Index Service)
A lab service type within the CRS application that handles correlated drug-monitoring requests. TIS requests can be linked to other requests via a correlation record.

### TIS Correlation
A linkage between a TIS lab request and one or more other requests. When a correlation exists, the system treats the requests as related. Deleting tests from a correlated request may affect downstream processing, which is why this check is enforced.

---

## Trigger Point

This check is step 1 of the [[CHEM Mark Test to Delete]] sequence, executed when the user double-clicks a test or test group on the Add Delete Test screen for a CHEM/TIS lab request, and the `CHECK_TIS_CORRELATION` lab option is enabled.

---

## Workflow Scenarios

### Scenario 1: TIS Correlation Check Enabled — Correlation Exists

#### Prerequisites

- The `CHECK_TIS_CORRELATION` lab option is enabled for the lab.
- The retrieved TIS lab request has at least one active TIS correlation.

#### Process Flow

```mermaid
sequenceDiagram
    User->>Add Delete Test Screen: Double-click test or test group
    System->>System: CHECK_TIS_CORRELATION option enabled
    System->>System: Correlation found on request
    System->>User: Display message 2737
    User->>System: Click OK
    System->>Add Delete Test Screen: Abort deletion; data unchanged
```

#### Step-by-Step Details

1. The user double-clicks a test or test group.
2. The system checks whether the `CHECK_TIS_CORRELATION` lab option is enabled.
3. Because the option is enabled, the system checks whether the retrieved request has an active TIS correlation.
4. A correlation exists, so message **2737** is displayed — *"Request number correlated, please delete all correlation before add/delete request!"*
5. The user clicks **OK**.
6. The deletion sequence is aborted. No delete flag is assigned. The test data remains unchanged.

> The user must remove all TIS correlations from the request before it is possible to mark tests for deletion.

---

### Scenario 2: TIS Correlation Check Enabled — No Correlation

#### Prerequisites

- The `CHECK_TIS_CORRELATION` lab option is enabled.
- The retrieved request has **no** active TIS correlation.

#### Step-by-Step Details

1. The system checks whether a TIS correlation exists on the request — none is found.
2. Message 2737 is **not** displayed.
3. The sequence proceeds to step 2 of [[CHEM Mark Test to Delete]]: the User Access Right check.

---

### Scenario 3: TIS Correlation Check Disabled

#### Prerequisites

- The `CHECK_TIS_CORRELATION` lab option is disabled (`option_value = 0`) or absent.

#### Step-by-Step Details

1. The system checks whether the `CHECK_TIS_CORRELATION` option is enabled — it is not.
2. The TIS Correlation check is skipped entirely.
3. The sequence proceeds directly to step 2 of [[CHEM Mark Test to Delete]]: the User Access Right check.
4. If all subsequent checks pass, the delete flag is assigned normally, even if a TIS correlation exists.

---

## Error Messages and System Prompts

| Message | Text | Trigger | User Options |
|---|---|---|---|
| 2737 | *"Request number correlated, please delete all correlation before add/delete request!"* | `CHECK_TIS_CORRELATION` enabled and request has an active TIS correlation | OK (aborts deletion; data unchanged) |

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---|---|---|---|---|
| Check TIS Correlation | `CHECK_TIS_CORRELATION` | Controls whether TIS correlation is checked before allowing test deletion | Message 2737 displayed and deletion blocked if correlation exists | Correlation check skipped; deletion allowed regardless of correlation |

> Source: `LAB_OPTION` table, `option_group = 'TEST_MAINTENANCE'`, `option_code = 'CHECK_TIS_CORRELATION'`, `option_value = 1` (enabled).

---

## Business Rules

1. The TIS Correlation check is only performed when `CHECK_TIS_CORRELATION` is enabled. If the option is absent or disabled, no correlation check is performed.
2. If a correlation exists and the option is enabled, the deletion is blocked regardless of which test or test group the user selected.
3. To proceed with deletion on a correlated request, the user must first remove all TIS correlations through the appropriate workflow — this cannot be done from the Add Delete Test screen.
4. Clicking **OK** on message 2737 returns focus to the screen with all data unchanged.

---

## Related Workflows

- [[CHEM Mark Test to Delete]] — The parent sequence; this check is step 1.
- [[Mark Test to Delete - User Access Right Validation]] — Step 2, checked after this check passes.
- [[CHEM Mark Test to Delete - Check DFT]] — Step 3 of the same sequence.
