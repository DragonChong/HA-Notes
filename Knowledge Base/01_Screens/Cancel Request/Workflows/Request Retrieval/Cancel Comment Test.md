---
epic: LISP-245
status: draft
---
# Cancel Comment Test

## Overview

The Cancel Comment Test is a lab-specific configuration that identifies the test code used to store a cancel reason on a request. When a request is retrieved on the Cancel Request screen, the system searches the request's existing test results for a test matching this configured code. If found, the test confirms that the request has already been cancelled and carries the previously saved cancel reason text. This mechanism is central to the Cancel Request screen: it determines whether the Cancel Request button or the Update/Authorize Reason buttons are enabled, whether the Cancel Reason field is pre-populated, and whether the screen's validation can proceed at all.

---

## Related User Stories

- **[[CRST-928]]** - Cancel Request - Cancel Comment Test

**Epic:** LISP-245 [CRST][DEV] Cancel Request — Request Retrieval

---

## What the Cancel Comment Test Is

Each lab that supports Cancel Request must have a dedicated test configured in the lab option `CANCEL_COMMENT` (option group: `CANCEL`). The value of this option is a test key — an integer identifier that corresponds to a specific test code in the system's test dictionary. This test is used as the vehicle for storing the cancel reason text: when a request is successfully cancelled, a test record with this key and a text result containing the cancel reason is written to the request's lab results.

When the Cancel Request screen loads a request, it scans all test results for a test matching this key (with counter value 1, in a group also matching this key with counter value 1). If such a test is found, the request is treated as already cancelled and the previously saved cancel reason text is loaded into the Cancel Reason field.

---

## Configuration

| Setting | Option Code | Option Group | Purpose | Effect when configured | Effect when not configured |
|---|---|---|---|---|---|
| Cancel Comment Test | `CANCEL_COMMENT` | `CANCEL` | Identifies the test key used to store the cancel reason on a cancelled request | Cancel Request screen functions normally; cancel reason can be stored and retrieved | Screen shows error message 219 on load; cancellation is blocked with message 651 |

> If `CANCEL_COMMENT` is not configured for a lab, the Cancel Request screen will show message 219 immediately on opening (before any request is entered) and will show message 651 if the user attempts to proceed with a cancellation. Both errors prevent the cancellation from completing.

---

## How the Cancel Comment Test Is Used

### At Screen Initialisation

When the Cancel Request screen opens, the system checks whether `CANCEL_COMMENT` is configured for each of the labs available on the screen. If any lab does not have this option set, **message 219** is displayed.

### At Request Retrieval

After a request is retrieved, the system searches the retrieved lab result for a test matching the configured cancel comment test key (matching both the test key and group key, with counter = 1 for both). The result of this search determines the entire subsequent behaviour of the screen:

| Search Result | Meaning | Consequence |
|---|---|---|
| Test found | Request has already been cancelled; cancel reason text is available | Cancel Reason field pre-populated; Cancel button disabled; Update/Authorize buttons potentially enabled |
| Test not found | Request has not yet been cancelled | Cancel Reason field empty (or retains user entry); Cancel button enabled; Update/Authorize buttons disabled |

### At Validation

When the Cancel Request button is clicked, the system validates that the Cancel Comment Test key is configured. If it is not (`CANCEL_COMMENT` is null), **message 651** is shown and the cancellation is aborted.

### At Cancellation

The configured cancel comment test key is included in the cancellation request sent to the server. The server uses it to write the cancel reason as a test result under this key.

### After Successful Cancellation

Once the cancel action completes, the test written under this key becomes the cancel comment test for subsequent retrievals of the same request — meaning the request will be identified as already cancelled on all future retrievals.

---

## Messages

| Message Code | Trigger | Description |
|---|---|---|
| 219 | Screen opens; `CANCEL_COMMENT` not configured for a lab | Warns that the cancel comment test is not set up for the lab |
| 651 | Cancel button clicked; `CANCEL_COMMENT` is null | Cancellation blocked — cancel comment test key not configured |

---

## Business Rules

1. Every lab that appears on the Cancel Request screen must have `CANCEL_COMMENT` configured in its lab options.
2. The cancel comment test key is used to both identify previously cancelled requests (on retrieval) and to write the cancel reason (on cancellation).
3. The search for a cancel comment test matches on both the test key and the group key, both with counter value 1. A test with any other counter value is not considered a cancel comment test.
4. If no cancel comment test is found on retrieval, the request is treated as not yet cancelled.
5. If a cancel comment test is found on retrieval, the request is treated as already cancelled, and the cancel reason text from that test is loaded into the Cancel Reason field.
6. If the cancel comment test key is not configured at the time the Cancel Request button is clicked, the cancellation is blocked and message 651 is shown.

---

## Related Workflows

- [[Retrieve Request]] — The retrieval step during which the system searches for the cancel comment test in the returned lab results.
- [[Object Enablement After Retrieval]] — The screen object states after retrieval are determined by whether a cancel comment test was found.
- [[Cancel Request (Action)]] — The cancellation pipeline that uses the cancel comment test key to write the cancel reason to the server.
- [[Request Cancelled Message]] — The message path triggered when a retrieved request already has a cancel comment test (i.e., it has already been cancelled).
- [[Validation]] — The validation step that blocks cancellation if the cancel comment test key is not configured.
