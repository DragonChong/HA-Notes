---
epic: LISP-258
status: draft
---
# Decode Text

## Overview

The **Cancel Reason Text Input** supports a shorthand comment code entry system. When staff type a code tag (`&`) followed by a comment code and then move focus away from the field, the system automatically replaces the tagged code with the corresponding comment description from the comment setup for the relevant lab. This allows staff to enter common cancel reasons quickly by typing a short code rather than the full text. Multiple codes can be decoded in a single pass, and the decode is case-insensitive. If a code cannot be matched, the tagged text is left unchanged.

---

## Related User Stories

- **[[CRST-936]]** - Cancel Request - Decode Text

**Epic:** LISP-258 [CRST][DEV] Cancel Request - Screen Object Interaction

---

## Key Concepts

### Code Tag
The code tag character is `&`. When the system detects `&` followed by a sequence of characters in the **Cancel Reason Text Input**, it treats the characters after `&` as a comment code to look up.

### Comment Setup
Comment codes and their descriptions are configured per lab in the `comment` table:

| Column | Purpose |
|--------|---------|
| `com_code` | The comment code to match against the input after `&` |
| `com_desc` | The comment description that replaces `&com_code` in the text |

Comment codes are lab-specific. For Cancel Request in CRS, the comment description is retrieved from the **performing lab** of the retrieved request, not from the user's default lab.

### Double Code Tag
If the input contains `&&` (two consecutive `&` characters) followed by a comment code, the first `&` is treated as a literal character and the second `&` begins a normal decode attempt. The result is that the leading `&` is preserved in the output and the remainder is decoded normally.

---

## Trigger

Decoding occurs automatically when the user **moves focus away** (focus-out) from the **Cancel Reason Text Input** after typing. The decode fires on every focus-out event — if the user returns to the field and types a new code, it will be decoded on the next focus-out.

---

## Decode Scenarios

| Input Text | Behaviour | Output After Focus-Out |
|------------|-----------|------------------------|
| `&COMMENT_CODE` | Matching code found | Replaced by the corresponding comment description |
| `&comment_code` (lowercase) | Decode is case-insensitive | Replaced by the corresponding comment description |
| `Some text &COMMENT_CODE more text` | Code in the middle of text | Only `&COMMENT_CODE` is replaced; surrounding text is preserved |
| `&CODE1 &CODE2` | Multiple codes | Both are decoded independently and replaced in place |
| `&&COMMENT_CODE` | Double code tag | First `&` is preserved; `&COMMENT_CODE` is decoded normally. Output: `&<decoded description>` |
| `&UNKNOWN_CODE` | Code not found in comment setup for the lab | Text is left unchanged |

---

## Business Rules

1. Decoding is triggered on every **focus-out** from the **Cancel Reason Text Input** — not on every keystroke.
2. The code tag character is `&`. Any text immediately following `&` up to the next whitespace or field boundary is treated as a candidate comment code.
3. Comment code matching is **case-insensitive** — `&abc` and `&ABC` both match the same comment setup entry.
4. If a matching comment code is found, the entire `&com_code` substring is replaced by the `com_desc` value from the comment setup.
5. If no matching comment code is found for a given tag, the tagged text (`&com_code`) is left unchanged in the field.
6. Multiple comment codes in a single field value are decoded in a single pass — all valid codes are replaced at once on focus-out.
7. A double code tag (`&&`) preserves the first `&` as a literal character; the second `&` is used as the code tag for the decode attempt.
8. In CRS, the comment code lookup uses the comment setup of the **performing lab** of the retrieved request, not the user's logged-in lab.

---

## Data Sources

| Data | Source |
|------|--------|
| Comment codes and descriptions | `comment` table; `com_code` and `com_desc` columns; filtered by lab |

---

## Related Components

- [[Default Screen Behavior]] — The **Cancel Reason Text Input** is only editable after a request is retrieved; decoding only has effect when the field is editable.
- [[Object Enablement After Retrieval]] — Defines when the **Cancel Reason Text Input** becomes editable.

## Related Workflows

- [[Retrieve Request]] — A request must be retrieved before the Cancel Reason Text Input is editable and decoding can occur.
