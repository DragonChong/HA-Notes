# Patient Tag Alert

## Overview

When a patient has tag(s) recorded on their patient demographics, the Registration screen evaluates those tags upon request number assignment and provides two feedback mechanisms to the registration staff:

1. **Patient Tag Indicator** — A persistent, clickable button visible in the Patient Demographics panel.
2. **Patient Tag Warning Panel** — A pop-up dialogue that appears automatically when alert-level tags are detected.

---

## Related User Stories

- **[[CRST-98]]** - Registration - Patient Tag

**Epic:** LISP-23 [CRST][DEV] Registration - Patient Handling

---

## Trigger Point

The Patient Tag Alert workflow is initiated **after the request number has been successfully assigned** to the patient. At that point, the system evaluates the patient's tags before allowing the registration to proceed further.

---

## Step-by-Step Workflow

### 1. Determine Whether Patient Tags Exist

The system checks whether patient tag data is available for the current patient.

- **If patient tags are present** → proceed to tag evaluation (Steps 2–5).
- **If no patient tags exist** → clear and hide the Patient Tag Indicator, and skip the warning panel entirely. Registration proceeds without interruption.

---

### 2. Resolve Lab-Specific Tag Setup

For each lab associated with the current request, the system looks up a **Patient Tag Setup** configuration using the current screen name ("Registration") and the lab number. This configuration controls two behaviours:

- **Show Tag** — whether the patient tag should be shown as a tooltip on the indicator button.
- **Alert Tag** — whether the patient tag should trigger the warning pop-up dialogue.

If no setup record is found for a given lab, that lab is skipped entirely (no tag or alert is generated for it).

---

### 3. Match Patient Tags Against System Constants

For each patient tag belonging to the patient, the system checks whether the tag's lab number is relevant to the current request:

- A tag is considered relevant if its lab number is **0** (meaning it applies to all labs) or if it **matches one of the request's lab numbers**.

For each relevant tag, the system looks up the corresponding **constant detail** (from the patient tag constant group) to obtain the human-readable tag description. The match is based on the tag's code and the lab number on the constant record.

Tags already accumulated are not duplicated.

---

### 4. Classify Tags: Display vs. Alert

For each matched tag, the system determines which category it falls into, based on the lab-specific setup resolved in Step 2:

#### Tag Category (Indicator / Tooltip)

- If the screen has **Show Tag** configured for the lab:
  - The system verifies the tag against the **Patient Tag Dictionary** for that screen and lab.
  - If a match is found, the tag description is added to the **tags list**.
- If the screen does **not** have Show Tag configured:
  - The tag description is added to the **tags list** unconditionally.

#### Alert Category (Warning Pop-up)

- If the screen has **Alert Tag** configured for the lab:
  - The system verifies the tag against the **Patient Alert Dictionary** for that screen and lab.
  - If a match is found, the tag description is added to the **alerts list**.
- If the screen does **not** have Alert Tag configured:
  - The tag description is added to the **alerts list** unconditionally.

> Both the **Patient Tag Dictionary** and **Patient Alert Dictionary** use the same matching rules:
> - Screen name must match exactly.
> - Tag group code must match exactly.
> - Lab number matching: if the patient-level lab number is `0`, the request's lab number is used for matching; otherwise, the patient-level lab number is used directly.

---

### 5. Update the Patient Tag Indicator

After all tags and alerts are evaluated:

- **If at least one tag or alert was found:**
  - The Patient Tag Indicator becomes **visible**.
  - If tags exist, the indicator shows a **tooltip** listing all tag descriptions, formatted as:
    `Patient Tag found: <Tag A>, <Tag B>, ...`
  - The indicator icon is set to the patient tag alert icon.

- **If no tags or alerts were found:**
  - The Patient Tag Indicator is **hidden**.
  - No tooltip is shown.

---

### 6. Display the Patient Tag Warning Panel (Pop-up)

If the **alerts list** is non-empty, the system displays a **Patient Tag Warning Panel** as a pop-up dialogue. The panel contains a grid showing:

| Column | Content |
|---|---|
| HKID | The patient's HKID |
| Request No. | The current request number |
| Patient Tag | All alert-level tag descriptions, comma-separated |

The pop-up title is **"Patient tag warning"**.

- The control panel (OK button area) is visible.
- Clicking **OK** closes the dialogue, and the registration workflow continues to the next step.

If only tags exist (but no alert-level items), the warning pop-up is **not shown**, and the workflow proceeds directly. The indicator remains visible with a tooltip.

---

### 7. Patient Alert Text Warning (Secondary Check)

In addition to the indicator and pop-up above, a separate inline text warning message is evaluated independently. For each patient tag where:

- The tag code **starts with `ALERT_PAT`**, AND
- The tag's lab number is either `0` or belongs to one of the request's labs

→ A message is appended: `"Patient is marked alert by Request No. <request number>"`

If any such messages are collected, they are displayed as a **warning message dialogue** (separate from the Patient Tag Warning Panel pop-up) before the registration proceeds.

---

### 8. User Interaction After Warning

Once the Patient Tag Warning Panel and/or alert text warnings are acknowledged:

- The Patient Tag Indicator **remains visible** as a persistent reference in the Patient Demographics panel.
- The registration staff can **click the indicator at any time** to re-open the Patient Tag Warning Panel and review the tags again.
- Hovering over the indicator shows the **tooltip** with all tag descriptions.

---

## Visibility Rules Summary

| Condition | Indicator Visible | Tooltip Shown | Warning Pop-up Shown |
|---|---|---|---|
| No patient tags | No | No | No |
| Tags exist, alerts exist | Yes | Yes (tag descriptions) | Yes |
| Tags exist, no alerts | Yes | Yes (tag descriptions) | No |
| No tags, alerts exist | Yes | No | Yes |

---

## Data Sources

| Data | Source |
|---|---|
| Patient tags | Retrieved with patient data upon request number assignment |
| Patient Tag Setup (Show Tag / Alert Tag config) | Global cached dictionary — Patient Tag Setup |
| Patient Tag Dictionary | Global cached dictionary — Patient Tag |
| Patient Alert Dictionary | Global cached dictionary — Patient Alert |
| Tag descriptions | System constants under the patient tag constant group |

---

## Configuration

| Setting | Option Code | Purpose | Effect when enabled | Effect when disabled |
|---------|------------|---------|--------------------|--------------------|
| Patient Alert | `PATIENT_ALERT_ENABLED` | Controls whether patient tag alerts are evaluated and displayed at all | Tags are evaluated; the indicator and warning pop-up are shown when relevant tags exist | No tag evaluation occurs; neither the indicator nor the warning pop-up is shown regardless of patient tags |

> This setting is stored in the `LAB_OPTION` table under option group `PATIENT`.

---

## Related Workflows

- [[Retrieve Patient by HKID]] — Patient tags are loaded as part of patient retrieval
- [[Retrieve Patient by Encounter Number]] — Patient tags are loaded as part of patient retrieval
