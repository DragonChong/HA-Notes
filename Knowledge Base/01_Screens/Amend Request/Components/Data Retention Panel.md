---
epic: LISP-220
status: draft
---
# Data Retention Panel

## Overview

The **Data Retention Panel** is a control panel unique to the Amend Request screen that determines whether an amended request's data is stored permanently or subject to the laboratory's standard data retention schedule. The panel presents two mutually exclusive options as radio buttons. It is available only in the General Laboratory Amend Request screen — it does not appear in the CRS application variant of Amend Request. Access to this panel is controlled by the user's **LAB_FUNCTION** access right; users without the required grant see the panel in a disabled state.

---

## Related User Stories

- **[[CRST-776]]** - Amend Request - Data Retention Selection Panel
- **[[CRST-779]]** - Amend Request - Retrieve Request
- **[[CRST-778]]** - Amend Request - Object Enablement After Retrieval

**Epic:** LISP-220 [CRST][DEV] Amend Request - Layout

---

## Visual Layout

The Data Retention Panel appears as a small control group within the Amend Request screen, separate from the Patient Panel and Request Info Panel. It contains two radio buttons arranged side by side or vertically. Only one option can be selected at a time.

---

## Controls

| Control | Description |
|---------|-------------|
| **Permanent** | Selecting this option marks the amendment as permanently retained. The amended data will not be subject to scheduled purging or deletion under the laboratory's retention policy. |
| **Follow Laboratory** | Selecting this option means the amended data follows the laboratory's configured data retention schedule — it may be purged or archived in accordance with the lab's rules. |

---

## Behaviour

### Before Request Retrieval

The panel is visible but **disabled**. Neither radio button can be selected until a request has been successfully retrieved.

### After Request Retrieval

The panel becomes **enabled** once a request has been retrieved. The enabled state is tied to the specific lab number of the retrieved request. The user can then select either **Permanent** or **Follow Laboratory** before clicking **Amend**.

### Access Control

The panel is enabled only if the user has been granted the required **LAB_FUNCTION** access right, either directly or through a user group assignment. If the user does not hold this access right, the panel remains disabled even after a request is retrieved — the radio buttons cannot be interacted with.

### Application Scope

This panel is present only on the **General Laboratory Amend Request** screen. It does **not** appear on the CRS application variant of Amend Request.

---

## Button Visibility / Enablement Matrix

| Request Retrieved | User Has LAB_FUNCTION Grant | General Lab App | Panel Enabled |
|-------------------|-----------------------------|-----------------|---------------|
| No | Any | Yes | No |
| Yes | No | Yes | No |
| Yes | Yes | Yes | Yes |
| Any | Any | No (CRS app) | Not present |

---

## Configuration

| Setting | Option Code | Purpose | Effect when granted | Effect when not granted |
|---------|-------------|---------|---------------------|------------------------|
| Data Retention access | *(source: LAB_FUNCTION access right — individual or group grant)* | Controls whether the user can interact with the Data Retention Panel | Panel enabled after request retrieval | Panel visible but disabled |

> The **LAB_FUNCTION** access right can be granted to a user directly or inherited through a user group membership. Both grant paths have the same effect on panel enablement.

---

## Business Rules

1. The Data Retention Panel is exclusive to the General Laboratory Amend Request screen. It is not present in the CRS application variant.
2. The panel is always visible on the General Lab screen but is disabled until a request has been retrieved.
3. Even after retrieval, the panel remains disabled if the user does not hold the required LAB_FUNCTION access right.
4. The enablement of the panel is scoped to the lab number of the retrieved request — retrieving a request for a different lab number controls whether the panel is active for that session.
5. Exactly one radio button (**Permanent** or **Follow Laboratory**) must be selected when submitting an amendment via the **Amend** button.

---

## Related Components

- [[Buttons]] — The **Amend** button submits the Data Retention Panel selection together with the request information changes.
- [[Request Info Panel]] — The editable panel whose changes are submitted alongside the retention selection.
- [[Patient Panel]] — The read-only patient demographic panel on the same screen.
