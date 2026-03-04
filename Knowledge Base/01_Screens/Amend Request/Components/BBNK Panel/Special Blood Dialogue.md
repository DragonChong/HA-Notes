---
epic: LISP-227
status: draft
---
# Special Blood Dialogue

## Overview

The **Special Blood Selection Dialogue** is a modal dialogue opened from the Blood Category button on the BBNK Panel. It presents a list of special blood category checkboxes that the user can toggle to specify the patient's blood requirements for the request. Each checkbox supports up to three states (Selected, Unknown, Not Selected) depending on the configuration for that blood category. On closing the dialogue, the Blood Category button's font style updates to reflect whether the selection differs from the system default.

---

## Related User Stories

- **[[CRST-833]]** - Amend Request - Special Blood Dialogue

**Epic:** LISP-227 [CRST][DEV] Amend Request - Special Lab Workflow (BBNK)

---

## Key Concepts

### Three-State Checkbox
A checkbox that supports three states: **Not Selected**, **Unknown**, and **Selected**. The cycling order is: Not Selected → Unknown → Selected → (back to Not Selected). If a state is disabled by configuration, that state is skipped.

### Two-State Checkbox
A standard checkbox supporting only **Not Selected** and **Selected**. Used for blood categories where `key_alpha2 ≤ 100`.

### Special Blood Config
A per-blood-category configuration (from `lis_constant` with `const_group = "SPECIAL_BLOOD_CONFIG"`) that defines which states are enabled for each category. Each category may allow any combination of:
- **Y** — Selected state enabled
- **N** — Not Selected state enabled
- **U** — Unknown state enabled

If none or all states are configured, the default checkbox behaviour applies.

### Corp Blood Category
Blood categories that appear in the corporate blood category list (configured via `lab_option` with `option_group = 'PATIENT_BLOOD_REQ'` and `option_code = 'CORP_CATEGORY'`). These are flagged as corporate categories in the dialogue.

---

## Visual Layout

The dialogue is a modal pop-up containing a scrollable list of checkboxes — one per blood category in the BLOODCAT keyword group. Checkboxes are arranged in order of the keyword group's display sequence. Each checkbox shows its label in the configured display colour.

---

## Buttons and Actions

### Blood Category Button (on BBNK Panel)

**Keyboard shortcut:** B

**When clicked:** Opens the Special Blood Selection Dialogue. The dialogue is pre-populated with the current special blood selections for the request.

**After the dialogue closes:** The system compares the current selection against the system default special blood configuration:
- If the selection matches the default → Blood Category button displays in **normal** font style.
- If the selection differs from the default → Blood Category button displays in **italic** font style.

---

### Inside the Special Blood Selection Dialogue

#### OK Button
Confirms the current checkbox selections. The dialogue closes and the selected states are retained in the BBNK Panel's special blood data. The Blood Category button font style is updated on return.

#### Cancel Button
Discards any changes made in the dialogue since it was opened. The dialogue closes and the previous special blood selections are restored. The Blood Category button font style reflects the pre-open state.

---

## Checkbox Behaviour

Each checkbox is generated from the **BLOODCAT** keyword group with the following attributes:

| Attribute | Source |
|-----------|--------|
| Display order | `keyword_group.keygp_display_order` |
| Label | `keyword_list.key_desc` |
| Display colour | `keyword_group.keygp_display_color` |
| Supports 3 states | True if `keyword_list.key_alpha2 > 100` |
| Default to Unknown state | If `key_alpha2 > 100` and the request's saved value for this category is Unknown |
| Product type | `keyword_list.key_type` |
| Is Corp Blood Category | True if `key_ckey` exists in the Corp Blood Category list |

### State Cycling Logic

The checkbox cycling order depends on which states are enabled by the Special Blood Config for that category:

| Select Enable | Not Select Enable | Unknown Enable | Cycling Behaviour |
|--------------|-------------------|----------------|-------------------|
| All false or all true | — | — | Default cycling behaviour |
| Selective | — | — | Skip disabled states |

**Example — ZIKV -ve (Select Enable = true, Not Select Enable = false, Unknown Enable = true):**
The checkbox cycles between **Unknown** and **Selected** only. The Not Selected state is skipped.

---

## Configuration

| Setting | Source | Purpose |
|---------|--------|---------|
| Blood Category list | Keyword group `BLOODCAT` | Defines which special blood categories appear in the dialogue |
| Special Blood Config | `lis_constant` with `const_group = "SPECIAL_BLOOD_CONFIG"`; `const_type` = `key_ckey` of the blood category | Defines which states (Y/N/U) are enabled per category |
| Corp Blood Category list | `lab_option` (`option_group = 'PATIENT_BLOOD_REQ'`, `option_code = 'CORP_CATEGORY'`, `option_value = 1`) | `option_text` contains `,`-delimited keyword ckeys of corporate categories |
| Enable Blood Category list | `lab_option` (`option_group = 'PATIENT_BLOOD_REQ'`, `option_code = 'BLOOD_CATEGORY'`, `option_value = 1`) | `option_text` contains `,`-delimited keyword ckeys of categories enabled for Update Patient function |

---

## Related Workflows

- [[BBNK Panel Enablement]] — Defines when the Blood Category button is enabled.
- [[BBNK Load Data]] — Loads the initial special blood selection into the dialogue when a BBS request is retrieved.
- [[BBNK Amend Request]] — Collects the final special blood selection for saving, including the ZIKV pre-save check.
