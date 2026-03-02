---
epic: LISP-222
status: draft
---
# Tab Sequence

## Overview

The Amend Request screen follows a defined tab order that allows registration staff to navigate through all editable fields using the keyboard **Tab** key. The sequence begins at the **Category** dropdown — the field that receives focus after a request is retrieved — and loops continuously through all interactive elements on the screen, including action buttons and the Request No. field.

---

## Related User Stories

- **[[CRST-787]]** - Amend Request - Tab Sequence

**Epic:** LISP-222 [CRST][DEV] Amend Request - Screen Object Interaction

---

## Key Concepts

### Starting Point
Because the default focus after request retrieval is on the **Category** dropdown (see [[Default Focus - After Request No.]]), the tab sequence effectively begins from **Category** when working on a retrieved request. The full loop includes all fields and buttons, cycling back to **Category** after completing the sequence.

---

## Tab Order

The following table defines the complete tab order, beginning from **Category** as the post-retrieval starting point:

| Order | Field / Control |
|-------|----------------|
| 1 | **Category** *(post-retrieval starting point)* |
| 2 | **Clinical Detail** |
| 3 | **Request Doctor Code** |
| 4 | **Request Location — Hospital** |
| 5 | **Request Location — Ward / Clinic** |
| 6 | **Request Location — Specialty** |
| 7 | **Report Location — Hospital** |
| 8 | **Report Location — Ward / Clinic** |
| 9 | **Report Copy Location — Hospital** |
| 10 | **Report Copy Location — Ward / Clinic** |
| 11 | **Report Copy to Other Location** *(button)* |
| 12 | **Reference** |
| 13 | **Comment** |
| 14 | **Urgency** |
| 15 | **Bill** |
| 16 | **Confidential** |
| 17 | **Bed** |
| 18 | **Specimen Request Datetime** |
| 19 | **Specimen Arrival Datetime** |
| 20 | **Specimen Collection Datetime** |
| 21 | **Amend** *(button)* |
| 22 | **Clear** *(button)* |
| 23 | **Request No.** |
| — | *(loops back to **Category**)* |

---

## Business Rules

1. The tab sequence applies after a registered lab request has been retrieved on the screen.
2. Because focus lands on **Category** after retrieval, the tab sequence begins from **Category** when the user first presses **Tab** after retrieval.
3. The sequence is continuous — after reaching **Request No.**, the next **Tab** press returns focus to **Category**.

---

## Related Workflows

- [[Retrieve Request]] — Request retrieval is a prerequisite; the tab sequence is only meaningful after a request is loaded.
- [[Default Focus - After Request No.]] — Defines where focus lands after retrieval, which establishes the starting point for the tab sequence.
