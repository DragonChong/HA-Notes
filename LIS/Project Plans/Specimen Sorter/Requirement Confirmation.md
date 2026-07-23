## A. Scope gates (before validation)

1. Confirm v1 rejects BBS / APS / STAR / DFT special panels even if retrieve succeeds?
2. Confirm multi-specimen on order-no / request-no lookup fails (no specimen picker)?
3. Confirm auto-register does not run post-register print / worksheet / label?
4. Confirm soft warnings are ALS/log only, not returned in the API body (or should response include a warning list)?

---

## B. Hard validations — confirm each blocks auto-register

### B1. Retrieve / lookup

5. Specimen / USID / order / request not found → fail?
6. Duplicate USID (`GCR_UI_USID_DUPLICATE`) → fail?
7. Invalid order-no registration (non-BBS order with specimens) → fail?
8. USID already used / existed (`0000888`) → fail even if specimen looks registrable?

### B2. Registrability

9. All tests already registered → fail?
10. All tests deleted → fail?
11. Specimen deleted / rejected → fail?
12. Partial registration: register remaining unregistered tests only → allowed?

### B3. Ward / location mapping

13. Unmapped request doctor (`0001162`) → fail?
14. Unmapped request location (`0001165`) → fail?
15. Unmapped specialty (`0001167`) → fail?
16. Unmapped report destination (`0001170`) → fail?
17. Unmapped report copy (`0001090`) → fail?
18. If dictionary allows auto-create doctor, should auto-register create it, or still fail until manually created?
19. Should auto-register attempt the same dictionary-driven location mapping as Spec Ack UI, or only accept already-mapped locations from retrieve?

### B4. Datetime

20. Ack datetime missing → fail? (default = server now unless override)
21. Ack in the future → fail?
22. Ack < collected date → fail?
23. Ack < order request date → fail?
24. Collected date < DOB → fail?
25. Already-acked specimen: register/ack time < prior ack → fail?
26. Collected date missing: fail, or allow register with null collected date?
27. If specimen already acknowledged: use existing ack time, server now, or require override?

### B5. Request number

28. Confirm assignment precedence:  
    `assignedRequestNo` override → USID (if eligible) → pre-assigned → server auto-gen → fail?
29. If USID eligible but caller also sends `assignedRequestNo`, override wins?
30. Relabel cases (multi test-group / multi-specimen / suffix ≠ 0 / force relabel): do not use USID as request no — correct?
31. If auto-gen is disabled in dictionary and no USID/pre-assigned/override → fail?
32. Who owns uniqueness check for override `assignedRequestNo` — auto-register API, or existing `register()`?

### B6. Backend register errors (pass-through)

33. Confirm these remain hard fails as returned by `register()`:  
    `INVALID_PATIENT_DATA`, `ORDER_NO_UNMATCHED`, `REQUEST_NO_NOT_FOUND`, patient PMI mismatch, etc.?
34. Should auto-register pre-check patient age/unit before calling `register()`, or rely on `register()` only?

---

## C. Soft validations — confirm each is skipped (no block) + logged

35. Outstanding specimens with different suffix (`0002162`) — skip & log?
36. Private referral Yes/No (`0004058`) — skip & proceed (treat as Yes)?
37. Pregnancy test vs male (`0004379`) — skip & proceed?
38. Overnight specimen — skip & log?
39. Test validity / valid-period warnings — skip & log?
40. Duplication check warning — skip & log?
    - If yes: leave `duplicateReason` null unless caller override provided?
41. Patient alert tags — skip & log?
42. Private patient warning — skip & log?
43. Mixed local + send-out tests — skip & log?
44. Spec already acked + informational “all tests registered” style messages — N/A if hard-fail on not registrable?
45. Missing collected-date UI popup — replaced by hard rule in B26?
46. Ward-printed request-no label alert — skip & log, or affect request-no assignment?

---

## D. Soft items that were UI-gated — confirm still out of soft list for v1

47. STAR not unboxed / missing workbench location — out of scope fail (unsupported), not soft-skip?
48. DFT specimen alerts — out of scope fail?
49. BBS component / order-no special auth — out of scope fail?

---

## E. Defaults vs overrides (affects when hard rules fire)

50. Default ack datetime = server current time — OK?
51. Default collected date = specimen’s existing collected date — OK?
52. Optional overrides allowed: `assignedRequestNo`, `ackDatetime`, `collectedDate`, `duplicateReason`, `labOnly` — complete?
53. Any other overrides required for go-live (urgency, `labOnly`, service type, macroscopic)?
54. AAR always off in v1 — confirm?
55. Urgent workstation always off in v1 — confirm?

---

## F. Error contract for requirement sign-off

56. Prefer existing `LisErrorConstants` / message codes where mapped, or new auto-register-specific codes for multi-specimen / unsupported-lab?
57. On hard fail before `register()`, should API return `ResultDataResponse.fail(code, message)` without calling register?
58. On soft-skip success, is ALS warn enough for audit, or must an audit table row be written?