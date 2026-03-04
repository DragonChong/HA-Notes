---
epic: LISP-227
status: draft
---
# BBNK Panel Tab Sequence

## Overview

The BBNK Panel supports full keyboard navigation via the Tab key. The tab sequence within the panel is defined in a fixed order starting with the Blood Category button, followed by the code inputs, and then the Inventory Reserve Product inputs. Components that are hidden due to lab option configuration are skipped automatically.

---

## Related User Stories

- **[[CRST-830]]** - Amend Request - BBNK Panel - Tab Sequence

**Epic:** LISP-227 [CRST][DEV] Amend Request - Special Lab Workflow (BBNK)

---

## Standard Tab Order (All Components Visible)

Starting from the **Blood Category** button, the tab sequence within the BBNK Panel is:

1. Blood Category button
2. Operation Code input
3. Indication Code input
4. Inventory Reserve Product — Date Required
5. Inventory Reserve Product — Type
6. Inventory Reserve Product — Unit

---

## Conditional Tab Sequences

The tab sequence adjusts automatically when components are hidden by lab option configuration:

### Indication & Operation Codes Invisible, Inventory Reserve Product Visible

1. Blood Category button
2. Inventory Reserve Product — Date Required
3. Inventory Reserve Product — Type
4. Inventory Reserve Product — Unit

### Indication & Operation Codes Visible, Inventory Reserve Product Invisible

1. Blood Category button
2. Operation Code input
3. Indication Code input

### Both Indication/Operation Codes and Inventory Reserve Product Invisible

1. Blood Category button (only)

---

## Field Inclusion Rules

| Component | Included in Tab Sequence |
|-----------|-----------------------------|
| Blood Category button | Always |
| Operation Code input | Only when Operation & Indication Code fields are visible |
| Indication Code input | Only when Operation & Indication Code fields are visible |
| Inventory Reserve Product — Date Required | Only when Inventory Reserve Product is visible |
| Inventory Reserve Product — Type | Only when Inventory Reserve Product is visible |
| Inventory Reserve Product — Unit | Only when Inventory Reserve Product is visible |

---

## Related Workflows

- [[BBNK Panel Enablement]] — Defines the visibility conditions for each component.
