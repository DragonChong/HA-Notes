# Clinical Detail and Text Field Length Validation on Save

## Overview

When a lab request is saved on the Registration screen, the system validates the length of three free-text fields: **Clinical Detail**, **Reference**, and **Request Comment**. Each field has a defined maximum character count. If a field exceeds its limit at save time, the save is blocked and an error message is displayed. In normal use, the input areas themselves also enforce these character limits as the user types, preventing most over-limit situations before save is ever attempted.

---

## Related User Stories

- **[[CRST-501]]** - Registration - Pre-register: Request Info Validation - Clinical Detail / Reference / Request Comment
- **[[CRST-537]]** - Registration - Line Limit for Clinical Detail *(related — covers the 5-line limit on Clinical Detail, message 650)*

**Epic:** LISP-27 [CRST][DEV] Registration - Register Workflow

---

## Key Concepts

### UI-Level vs Save-Time Enforcement
The character limits are enforced at **two levels**:
1. **UI level (input enforcement):** The text input areas for Clinical Detail, Reference, and Request Comment each restrict the number of characters a user can type in real time. Under normal circumstances, it is not possible to enter more than the maximum.
2. **Save-time validation:** A `StringValidator` check runs at save time as a safety net. If the field somehow contains more characters than allowed (e.g., due to pasted content or programmatic population), the save is blocked and an error message is shown.

### 5-Line Limit vs Character Limit (Clinical Detail)
Clinical Detail is subject to **two separate** save-time checks:
- A **line limit** of 5 lines (message 650) — see [[Request Info Validation on Save]] and [[CRST-537]]
- A **character limit** of 510 characters (message 3528) — documented in this note

Both checks apply independently. A Clinical Detail entry could exceed 5 lines without exceeding 510 characters, or vice versa.

---

## Trigger Point

These validations run during the save process as part of the request information validation pass, after mandatory and validity field checks.

---

## Validation Rules

| Field | Maximum Characters | Message on Exceed | Message Text |
|-------|--------------------|------------------|-------------|
| **Clinical Detail** | 510 | 3528 | "Clinical Detail cannot more than 510 characters!" |
| **Reference** | 255 | 552 | "Reference cannot more than 255 characters!" |
| **Request Comment** | 255 | 552 | "Request Comment cannot more than 255 characters!" |

> **Note:** Messages 552 for Reference and Request Comment share the same message code but display different field-specific text.

---

## Workflow Scenarios

### Scenario 1: All Fields Within Length Limits

#### Prerequisites
- Clinical Detail, Reference, and Request Comment each contain text at or below their respective character limits.

#### Step-by-Step Details

1. The user clicks **Save**.
2. The system runs the length validation on all three fields.
3. All fields are within their limits. No error is shown.
4. The save proceeds.

---

### Scenario 2: Clinical Detail Exceeds 510 Characters — Message 3528

#### Prerequisites
- The Clinical Detail field contains more than 510 characters.

#### Process Flow

```mermaid
sequenceDiagram
    User->>Registration Screen: Click Save
    Registration Screen->>Validation Engine: Check Clinical Detail length
    Validation Engine-->>Registration Screen: Exceeds 510 characters
    Registration Screen->>User: Show message 3528 "Clinical Detail cannot more than 510 characters!"
    User->>Message: Click OK
    Message-->>Registration Screen: Message dismissed; save blocked
    Registration Screen->>User: User can re-edit Clinical Detail
```

#### Step-by-Step Details

1. The user clicks **Save**.
2. The system checks the character count of the Clinical Detail field.
3. The count exceeds 510. Message **3528** is displayed.
4. The user clicks **OK** to dismiss the message.
5. The save is blocked. The user must shorten the Clinical Detail text before saving again.

---

### Scenario 3: Reference or Request Comment Exceeds 255 Characters — Message 552

#### Prerequisites
- The Reference field or the Request Comment field contains more than 255 characters.

#### Process Flow

```mermaid
sequenceDiagram
    User->>Registration Screen: Click Save
    Registration Screen->>Validation Engine: Check Reference / Request Comment length
    Validation Engine-->>Registration Screen: Exceeds 255 characters
    Registration Screen->>User: Show message 552 identifying the field
    User->>Message: Click OK
    Message-->>Registration Screen: Message dismissed; save blocked
    Registration Screen->>User: User can re-edit the field
```

#### Step-by-Step Details

1. The user clicks **Save**.
2. The system checks the character count of the Reference and Request Comment fields.
3. If either exceeds 255 characters, message **552** is displayed, identifying the affected field.
4. The user clicks **OK** to dismiss the message.
5. The save is blocked. The user must shorten the text in the affected field before saving again.

---

## Business Rules

1. The maximum character limits are: Clinical Detail — 510 characters; Reference — 255 characters; Request Comment — 255 characters.
2. The text input areas enforce these limits as the user types, so exceeding the limit at save time is an edge case that serves as a safety net rather than a common path.
3. The save-time length check is separate from and independent of the Clinical Detail 5-line check (message 650). Both checks may apply simultaneously to the Clinical Detail field.
4. Clicking **OK** on message 3528 or 552 dismisses the message only. The save is not retried automatically; the user must edit the field and click **Save** again.
5. Reference and Request Comment share message code 552, but the message text identifies the specific field that exceeded the limit.

---

## Related Workflows

- [[Request Info Validation on Save]] — This length validation is part of the broader request information validation pass; the full set of request info validations is documented there, including the Clinical Detail 5-line limit (message 650).
