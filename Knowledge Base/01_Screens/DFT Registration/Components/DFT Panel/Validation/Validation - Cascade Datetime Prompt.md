# Validation – Message 1510: Cascade Collection Datetime Recalculation Prompt

## Overview

When the user modifies the collection datetime on the anchor row of a DFT time sequence, or assigns the anchor time flag to a row for the first time, the system can automatically recalculate the collection datetimes of all other rows in the sequence. Before doing so, it prompts the user with message 1510 to confirm whether they want the other rows updated accordingly. This behaviour applies to DFTT and DFTC series when automatic datetime calculation is enabled.

---

## Related User Stories

- **[[CRST-754]]** - Registration - DFT Time Sequence Panel - Message 1510

**Epic:** LISP-23 [CRST][DEV] Registration - Patient Handling

---

## Key Concepts

### Anchor Row
The row in the DFT time sequence that carries the anchor time flag (Time Flag **0** for DFTT and DFTC; Time Flag **1** for DFTS). All other rows' collection datetimes are calculated as offsets from this row's datetime.

### Cascade Recalculation
When the anchor row's datetime changes, the system can recalculate the collection datetime of every other row by adding that row's time flag offset (in the unit defined by the test attribute, e.g. minutes or hours) to the new anchor datetime.

---

## Trigger Point

Occurs **during data entry** (not at save time) when:
- The user changes the **collection datetime** on the anchor row (the row with the anchor time flag), **or**
- The user sets the time flag of a row to the anchor value for the first time

This prompt is only shown when the **Automatic Datetime Calculation** (`AUTO_CALCULATION_DFT_COL_DTM_ENABLED`) lab option is enabled, and only for DFTT and DFTC series.

---

## Message Text

> `Would you like to change the other collective date/time accordingly?`

---

## Prompt Behaviour by Series and Configuration

| Series | AUTO_CALC Enabled | Force Recalculation Enabled | Message 1510 Shown? | Recalculation Behaviour |
|--------|------------------|----------------------------|--------------------|-----------------------|
| DFTT | Yes | No | **Yes** | User chooses Yes/No |
| DFTT | Yes | Yes | **Yes** | User chooses Yes/No (DFTT always prompts even when Force is enabled) |
| DFTT | No | Any | No | No recalculation |
| DFTC | Yes | No | **Yes** | User chooses Yes/No |
| DFTC | Yes | Yes | **No** | Recalculation happens silently without prompting |
| DFTC | No | Any | No | No recalculation |
| DFTS | Any | Any | **Never** | DFTS does not support cascade recalculation |

> **Note:** The key difference between DFTT and DFTC when both AUTO_CALC and Force Recalculation are enabled: DFTT still presents the prompt to the user, while DFTC silently recalculates without asking.

---

## Behaviour on User Response

### On "Yes"
All rows in the sequence (other than the anchor row itself) have their collection datetimes recalculated. Each row's new datetime is computed as:

> **New Datetime = Anchor Datetime + (Row's Time Flag − Anchor Time Flag) offset**

The offset unit (minutes, hours, etc.) is determined by the time unit configured in the test attribute.

**Example (DFTT, unit = minutes, anchor row at Time Flag 0 with datetime 27-Jan-2025 01:00):**

| Time Flag | Calculated Collection Datetime |
|-----------|-------------------------------|
| 0 (anchor) | 27-Jan-2025 01:00 (unchanged) |
| 10 | 27-Jan-2025 01:10 |
| 20 | 27-Jan-2025 01:20 |
| 60 | 27-Jan-2025 02:00 |
| 120 | 27-Jan-2025 03:00 |

> **Special case — DFTS-style unit (no explicit unit):** When the test has no unit defined and the time flag value is between 1 and 15 inclusive, all other rows receive the same datetime as the anchor row (no offset is applied).

### On "No"
No other rows are changed. The anchor row retains its new datetime but all other rows keep their existing collection datetimes unchanged.

---

## Interaction Behaviours

#### User edits the collection datetime on the anchor row — AUTO_CALC enabled, Force disabled (DFTT or DFTC)
Message 1510 is displayed.

#### User clicks Yes
All non-anchor rows have their collection datetimes recalculated based on their time flag offset from the anchor row's new datetime.

#### User clicks No
No recalculation is performed. Only the anchor row's datetime is updated.

#### User edits the anchor row datetime — AUTO_CALC enabled, Force enabled, DFTC series
No message is displayed. The system silently recalculates all other rows' datetimes automatically.

#### User edits the anchor row datetime — AUTO_CALC enabled, Force enabled, DFTT series
Message 1510 is displayed (DFTT always prompts regardless of Force setting).

#### User edits the anchor row datetime — AUTO_CALC disabled
No message is displayed and no recalculation occurs regardless of the Force setting.

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|------------|---------|--------------------|--------------------|
| Automatic Datetime Calculation | `AUTO_CALCULATION_DFT_COL_DTM_ENABLED` | Controls whether cascade recalculation of collection datetimes is available | Recalculation prompt (or silent recalc) is triggered when anchor row is edited | No recalculation occurs; no prompt is shown |
| Force Recalculation | *(related DFT lab option)* | When enabled alongside AUTO_CALC, controls whether DFTC silently recalculates or still prompts | DFTC: silent recalculation; DFTT: still prompts | Prompt is always shown when AUTO_CALC is enabled |

---

## Business Rules

1. The cascade recalculation only runs from the anchor row outward; editing a non-anchor row never triggers message 1510.
2. DFTS does not support cascade recalculation under any configuration.
3. For DFTT, the prompt is always displayed when AUTO_CALC is enabled, regardless of the Force Recalculation setting.
4. For DFTC, when both AUTO_CALC and Force Recalculation are enabled, the recalculation happens without user confirmation.
5. Only rows that are enabled (editable in the current session) are recalculated when cascade is triggered.
6. If the anchor row's time flag has not yet been set, no cascade recalculation can occur.

---

## Related Workflows

- [[DFT Panel - DFTT]] — Describes how DFTT rows and time flags are configured.
- [[DFT Panel - DFTC]] — Describes how DFTC rows and time flags are entered manually.
- [[Validation - Invalid Datetime Order]] — Save-time validation that checks the resulting datetime sequence is in non-decreasing order.
