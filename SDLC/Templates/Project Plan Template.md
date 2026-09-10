---
title: 05 Project Plan — <Title>
tags:
  - sdlc-template
generated_by: project-plan
generated_on: ''
reviewed_by: ''
agent_assisted: true
promotion_window: ''
---

# 05 Project Plan — <Title>

Schedules backwards from **Promotion submission**. Re-run when a gate slips.

## Constraints

| Item | Value |
|---|---|
| Target completion | |
| Promotion window | |
| Submission date | |
| Pilot date | |
| Cut-off | |
| CP3 | |

## Work packages

| ID | Package | From design | Size | Days | Owner |
|---|---|---|---|---|---|

## Gantt

```mermaid
gantt
    title <Title>
    dateFormat  YYYY-MM-DD
    excludes weekends
    section Stages
    Requirement Confirmation    :done, req, 2026-01-01, 1d
    System Design               :done, des, after req, 1d
    Development                 :dev, after des, 5d
    System Integration Test     :sit, after dev, 3d
    User Acceptance Test        :uat, after sit, 3d
    Load Soak Test              :load, after uat, 2d
    Promotion Preparation       :prep, after load, 3d
    Promotion Submission        :milestone, sub, 2026-01-20, 0d
    Production Pilot            :pilot, after sub, 5d
```

## Milestones

| Stage | Start | End | Owner | Gate | Slack |
|---|---|---|---|---|---|

## Dependencies

| Dependency | Owner | Needed by |
|---|---|---|

## Risk to schedule

| Risk | Effect | Mitigation |
|---|---|---|

Negative slack is listed here. Do not hide it.
