# Stage routing and refusals

Load only when delegating or refusing.

## Vocabulary

`requirement` → `design` → `design-review` → `jira` → `plan` → `development` →
`code-review` → `sit` → `load-test` → `promotion-prep` → `promotion-submit` →
`pilot` → `closed`

Exception: `work_type: fix` may run `jira` before `design`.

## Stage → skill

| Stage | Skill |
|---|---|
| requirement | `requirement-confirmation` |
| design | `system-design` |
| design-review | `design-review-pptx` |
| jira | `lis-jira-log-creator` |
| plan | `project-plan` |
| development | `implement-task`, then `code-change-log` |
| code-review | `code-review` |
| sit | `sit-test-report` |
| load-test | `load-test-scenario` |
| promotion-prep | `promotion-config`, `promotion-form`, `monitoring-plan` |
| promotion-submit | `promotion-checklist` |
| pilot | `pilot-monitor` |

Phase 1 on disk: `requirement-confirmation`, `system-design`,
`design-review-pptx`, `lis-jira-log-creator`. If the routed skill is
missing, say so on the Next line and stop.

## Refusals (one sentence)

- `stage: closed` without the stage-12 knowledge-base update
- Advancing past `promotion-submit` (a person submits production changes)
- Marking a Required human checkpoint passed without the user confirming
- A `stage` value outside the vocabulary
- Treating CP3 "pass with actions" or requirement "pass with assumptions" as `pass`
- `promotion-submit` while any artifact is `agent_assisted: true` and `reviewed_by` is empty
