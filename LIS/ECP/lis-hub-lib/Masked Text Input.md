# Masked Text Input

## Overview

The Masked Text Input is a planned shared input field that enforces a configurable character-by-character input mask on a text field. It is intended for use wherever user input must follow a fixed format — for example, date fields, phone numbers, or other structured codes — by guiding the user with placeholder characters and preventing free-form entry that does not conform to the mask pattern.

> **Status: Not yet implemented.** The component is currently a placeholder and renders no functional UI. The underlying input mask library integration is commented out pending further development. The interface is defined and the component is exported, but it should not be used in production screens until the implementation is complete.

---

## Intended Visual Layout

When implemented, the component is intended to render as a standard single-line text input. The mask pattern is always visible in the field, with placeholder characters shown for positions the user has not yet filled in. As the user types, the cursor advances past fixed mask characters automatically.

---

## Intended Interaction Behaviours

#### User types into the field
Characters are entered only into the variable positions defined by the mask. Fixed characters in the mask (e.g., `/` in a date mask) are inserted automatically without requiring user input.

#### User types a character that does not match the mask position
The character is rejected; the cursor does not advance.

#### Field is pre-populated with a value
The value is displayed through the mask, with any positions not covered by the value showing as placeholder characters.

#### User clears the field
The mask placeholder is restored, showing all positions as empty.

---

## Props Reference

| Prop | Type | Required | Default | Purpose |
|------|------|----------|---------|---------|
| `mask` | `string` | Yes | — | The mask pattern string (e.g., `'99/99/9999'` for a date). Mask syntax follows the `react-input-mask` library convention |
| `value` | `string` | Yes | — | The current value of the input (controlled) |
| `onChange` | `(value: string) => void` | Yes | — | Callback fired when the user changes the input value; receives the raw string including mask characters |

---

## Configuration

No system-level configuration applies. The mask pattern is entirely controlled by the `mask` prop passed by the parent.

---

## Data Saved

This component is read-only in terms of persistence — it does not write data to the database. The parent form is responsible for reading the value and including it in any submission payload.

---

## Related Workflows

- [[CRS Registration Workflow]] — Masked inputs are anticipated for structured fields such as dates and coded identifiers during request registration.
