---
title: Specimen Sorter
tags:
  - project-plan
  - specimen-sorter
updated: '2026-09-10'
---
# Specimen Sorter

Programme home. LIS API dossier: [[TMP-specimen-sorter-api — Specimen Sorter API/_Dossier]].

## LIS API schedule

Draft: [[05 Project Plan]]. Estimates not accepted. `plan` gate not closed.

Schedules backwards from **Promotion submission** (01–30 Jun 2027). The 2027 window is **not** on [[Promotion Windows]] (last named: 2026-24). Dossier target **30 May 2027** is Promotion Preparation end, not submission.

```mermaid
gantt
    title Specimen Sorter API
    dateFormat  YYYY-MM-DD
    excludes weekends
    section Programme
    Requirement Confirmation       :done, req, 2026-07-13, 2026-08-14
    System Design                  :done, des, 2026-08-01, 2026-08-31
    System Development             :active, dev, 2026-09-01, 2026-12-31
    Testing Environment Setup      :env, 2026-12-15, 2026-12-31
    Integration Test               :sit, 2027-01-02, 2027-02-28
    UAT HI                         :uathi, 2027-03-01, 2027-03-30
    UAT User                       :uatuser, 2027-04-01, 2027-04-30
    Load Test / Soak Test          :load, 2027-05-01, 2027-05-15
    Promotion Preparation          :prep, 2027-05-15, 2027-05-30
    Production Environment Setup   :prodenv, 2027-05-15, 2027-05-30
    Promotion Submission           :sub, 2027-06-01, 2027-06-30
    Pilot                          :pilot, 2027-07-01, 2027-07-30
```

| Stage | Start | End | Owner |
|---|---|---|---|
| Requirement Confirmation | 13 Jul 2026 | 14 Aug 2026 | LIS Product Team, LIS Support Team, HI |
| System Design | 01 Aug 2026 | 31 Aug 2026 | LIS Support Team, Vendor |
| System Development | 01 Sep 2026 | 31 Dec 2026 | LIS Product Team, Vendor |
| Testing Environment Setup | 15 Dec 2026 | 31 Dec 2026 | Vendor, Local IT |
| Integration Test | 02 Jan 2027 | 28 Feb 2027 | LIS Product Team, Vendor |
| UAT (HI) | 01 Mar 2027 | 30 Mar 2027 | HI |
| UAT (User) | 01 Apr 2027 | 30 Apr 2027 | User |
| Load Test / Soak Test | 01 May 2027 | 15 May 2027 | LIS Product Team, Vendor |
| Promotion Preparation | 15 May 2027 | 30 May 2027 | LIS Product Team |
| Production Environment Setup | 15 May 2027 | 30 May 2027 | Vendor, Local IT |
| Promotion Submission | 01 Jun 2027 | 30 Jun 2027 | LIS Product Team |
| Pilot | 01 Jul 2027 | 30 Jul 2027 | LIS Product Team, LIS Support Team, Vendor, User |

Negative slack on this draft: design closed 10 Sep vs 31 Aug (~7 working days); no JIRA key; unnamed 2027 promotion window. Package effort (41 working days) fits the remaining Sep–Dec development window.
