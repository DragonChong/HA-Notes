# Fluid Result Entry Dialogue

## Overview

The Fluid Result Entry Dialogue is a modal dialogue that appears during the registration save sequence when a test with a fluid specimen type is being registered. It prompts the registration staff to enter the **Fluid Type** — a free-text description of the body fluid specimen. The entered value is stored as a pending test result that is processed after registration completes. Without a valid Fluid Type entry, the save cannot proceed. This dialogue is part of the Result Entry step in the pre-register save sequence as defined in [[Result Entry on Save]].

---

## Related User Stories

- **[[CRST-555]]** - Registration - Pre-register: Result Entry (FLUID)

**Epic:** LISP-27 [CRST][DEV] Registration - Register Workflow

---

## Key Concepts

### Fluid Type Test
A specific test in the test dictionary whose alpha code is configured in the lab option for Fluid Result Entry (`option_code = 'FLUID'`, `option_text` field). The default alpha code is `FTYPE`. The result entered in the Fluid Type field is stored as the result for this test.

### Authorize Flag
Controls whether the pending result record should be created with an authorised status. Configured via the `option_value` field of the Fluid lab option. A value of `0` (default) means the result is stored without authorisation. A value of `1` means the result is stored as authorised.

### GCR Test Information Panel
An optional read-only panel that appears on the right side of the dialogue when GCR (General Clinical Record) information is available for the test being registered. It displays contextual clinical information to assist staff in entering the correct Fluid Type. This panel is only shown when the calling context provides GCR test information for the specific test code.

---

## Trigger Point

This dialogue is shown as part of the Result Entry step during the registration save sequence, after the Private Change Reason step and before the Verification step. It is triggered when at least one of the test profiles being registered has a specimen type that matches the REG_SPEC keyword configured with Enter Code `w_lis_fluid_popup`.

---

## Workflow Scenarios

### Scenario 1: Fluid Type Entered and Confirmed

#### Prerequisites
- The Fluid Result Entry Dialogue has been opened.
- The staff enters a non-blank value in the **Fluid Type** field.

#### Process Flow

```mermaid
sequenceDiagram
    Registration Screen->>Fluid Result Entry Dialogue: Open dialogue
    Fluid Result Entry Dialogue->>User: Display Fluid Type field (focused)
    User->>Fluid Result Entry Dialogue: Type fluid type description
    User->>Fluid Result Entry Dialogue: Click Done
    Fluid Result Entry Dialogue->>Fluid Result Entry Dialogue: Validate Fluid Type is not blank
    Fluid Result Entry Dialogue-->>Registration Screen: Close; result collected
    Registration Screen->>Registration Screen: Continue save sequence
```

#### Step-by-Step Details

1. The dialogue opens. Focus is set automatically on the **Fluid Type** text input field and any existing text is selected.
2. The staff types the fluid type description into the field.
3. The staff clicks **Done** (or presses the default keyboard shortcut, as Done is the default button).
4. The system validates that the Fluid Type field is not blank.
5. A pending result record is constructed using: the request number, the entered Fluid Type text, and the configured Fluid Type test code. The authorize flag is set according to the lab option configuration.
6. The dialogue closes and the result is passed back to the save sequence.
7. The save sequence continues to the next step.

---

### Scenario 2: Fluid Type Left Blank — Validation Error

#### Prerequisites
- The Fluid Result Entry Dialogue has been opened.
- The staff clicks **Done** without entering any text in the Fluid Type field.

#### Process Flow

```mermaid
sequenceDiagram
    User->>Fluid Result Entry Dialogue: Click Done with empty Fluid Type field
    Fluid Result Entry Dialogue->>User: Show message 1561 "Fluid Type Not Specified"
    User->>Fluid Result Entry Dialogue: Click OK on message
    Fluid Result Entry Dialogue->>User: Focus returns to Fluid Type field; all text selected
```

#### Step-by-Step Details

1. The staff clicks **Done** without entering a Fluid Type.
2. **Message 1561** ("Fluid Type Not Specified") is displayed.
3. The staff clicks **OK** to dismiss the message.
4. Focus returns to the **Fluid Type** field and any existing content is selected, ready for the staff to type.
5. The dialogue remains open. The staff must enter a valid Fluid Type before proceeding.

---

### Scenario 3: Staff Cancels the Dialogue

#### Prerequisites
- The Fluid Result Entry Dialogue has been opened.
- The staff clicks **Cancel**.

#### Process Flow

```mermaid
sequenceDiagram
    User->>Fluid Result Entry Dialogue: Click Cancel
    Fluid Result Entry Dialogue-->>Registration Screen: Close; isFail = true
    Registration Screen->>User: Show message 3386
    Registration Screen->>Registration Screen: Abort save sequence
```

#### Step-by-Step Details

1. The staff clicks **Cancel**.
2. The dialogue closes without collecting any result.
3. The calling save sequence detects that the result entry failed.
4. **Message 3386** is displayed, notifying the staff that registration has been aborted.
5. The entire registration save is cancelled. The Registration screen remains open with the entered data intact.

> **Note:** Cancelling the Fluid Result Entry Dialogue cancels the entire registration, not just this step.

---

## Visual Layout

The dialogue is a modal window approximately **320 × 170 pixels** in its base configuration (no GCR panel). It contains:
- A label in blue text identifying the **Fluid Type** input area
- A multi-line scrollable text input field for entering the Fluid Type description
- A **Done** button (left-aligned at the bottom) — this is the default button, activated by pressing Enter
- A **Cancel** button (right-aligned at the bottom)

When GCR test information is available for the registered test, a second panel appears to the right of the Fluid Type area, approximately 320 pixels wide, showing:
- A label reading "Information for [Test Category]"
- A read-only, grey-background text area displaying the clinical information associated with the test

In this expanded state, the total dialogue width increases to approximately **640 pixels**.

---

## Buttons and Actions

### Done
- **When visible:** Always, when the dialogue is open
- **Default button:** Yes — pressing Enter activates Done
- **What it does:** Validates that the Fluid Type field is not blank, then constructs the pending result record and closes the dialogue. If the field is blank, message 1561 is shown and the dialogue remains open.

### Cancel
- **When visible:** Always, when the dialogue is open
- **What it does:** Closes the dialogue without saving any result. The calling save sequence detects the failure and aborts the entire registration. Message 3386 is shown after the dialogue closes.

---

## Error Messages and System Prompts

| Message | Text | Trigger | User Options |
|---------|------|---------|-------------|
| 1561 | "Fluid Type Not Specified" | Done clicked with blank Fluid Type field | OK — dismisses message; focus returns to Fluid Type field |
| 3386 | Registration process aborted | Cancel clicked on this dialogue | Acknowledged automatically by close handler |

---

## Configuration

| Setting | Option Code | Purpose | Effect when `option_value = 1` | Effect when `option_value = 0` (default) |
|---------|------------|---------|-------------------------------|------------------------------------------|
| Fluid Result Entry — Authorize | `FLUID` | Controls whether the pending result record is created with an authorised status | Result stored as authorised | Result stored as not authorised (default) |

> The `option_text` field of the `FLUID` lab option stores the test alpha code for the Fluid Type test. The default value is `FTYPE`. This identifies which test dictionary entry the entered fluid type text is recorded against.

Both settings are read from `LAB_OPTION` with `option_group = 'REQUEST_REGISTRATION'` and `option_code = 'FLUID'`, scoped to the lab number of the test being registered.

---

## Business Rules

1. The Fluid Type field must not be blank before the result can be accepted. There is no partial save or bypass for this field.
2. The dialogue opens with focus on the Fluid Type field and any pre-existing text selected, ready for immediate input.
3. The pending result record is constructed using the configured Fluid Type test alpha code (`option_text` of the FLUID lab option, default `FTYPE`). If no lab option is configured, the system falls back to the default alpha code `FTYPE`.
4. The authorize flag applied to the pending result is determined by the lab-specific `FLUID` lab option value (0 = not authorised, 1 = authorised). The default is not authorised.
5. Cancelling the dialogue aborts the entire registration save — it is not possible to skip Fluid Type entry and continue.
6. The GCR test information panel is shown only when contextual GCR data is provided by the calling context for the specific test code being registered. It is read-only and does not affect result entry.
7. Done is the default button — pressing Enter is equivalent to clicking Done.

---

## Related Workflows

- [[Result Entry on Save]] — Parent workflow; describes when and how this dialogue is triggered as part of the registration save sequence.
