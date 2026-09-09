---
title: Open Questions
tags:
  - sdlc
  - reference
  - blockers
created: 2026-09-03T00:00:00.000Z
updated: '2026-09-09'
status: blueprint
---

# Open Questions

Part of [[SDLC Agentic Workflow]]. Resolve these before the phase named in each row.

## Tooling and access

| #   | Question                                                                                                                           | Blocks                                                                        | Owner           | Status                                                                                            |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------- |
| Q1  | Can Cursor / an MCP server reach the **application database** (Sybase / PostgreSQL) read-only from the corporate network?          | Phase 4 — `monitoring-plan`, `promotion-config` verification                  | Ka              | Open                                                                                              |
| Q2  | The **logging database** is a separate instance. Same question: read-only access, and by what client?                              | Phase 4 — `monitoring-plan`                                                   | Ka              | Open                                                                                              |
| Q3  | JIRA MCP **write scope** — can it create issues, add comments, and transition workflow states? Which of those does the org permit? | Phase 1 — `lis-jira-log-creator` auto-create; Phase 4 — `promotion-checklist` | Ka              | Confirmed 2026-09-08 — API writes reach Jira; LIS create-meta OK. Org permit for this account: create CR, comment, see transitions. No real issue mutated. Policy still: vault draft until you approve create; never auto-transition approval gates |
| Q4  | Is SonarQube reachable via API, or does the report have to be exported manually?                                                   | Phase 3 — `sit-test-report` embedding                                         | Ka              | Reachable 2026-09-08 — `system_ping` pong, instance UP (`26.2.0`). Embedding into a SIT report still unproven |
| Q5  | Does the corporate proxy / SSL inspection break MCP servers that make outbound HTTPS calls?                                        | Phase 1 onward                                                                | Ka              | Mostly no — Jira, Sonar, DHP AI OK. Postman reached (401 key). GitHub MCP `Unknown Host` on `hagithub.home`. Not a blanket SSL break |
| Q6  | Is Cursor formally approved for the team, and under what data-handling terms (what may be sent to the model)?                      | Everything                                                                    | Ka + management | Confirmed 2026-09-09 — Yes. Data-handling is Q12: no patient-identifiable data enters a prompt |

> [!info] Designing around Q1/Q2
> The promotion and monitoring skills are specified as **generate-and-hand-over**: they emit runnable SQL with the target connection named, you execute it, and paste the output back for interpretation. If access is later granted, the same plan becomes directly executable with no rewrite. Do not block Phase 4 on this.

> [!warning] Q3 probe 2026-09-08 (re-run ~17:26)
> JIRA MCP namespace **ready**; `https://hatool.home` reachable (Q5 no longer blocks this probe).
> **Read:** `jira_get_all_projects` returned the catalogue including `LIS`. `jira_search` and `jira_get_issue` succeeded.
> **Create:** `jira_get_project_issue_types` / `jira_get_create_fields` for LIS Change Request (type `10100`) returned the create screen — Jira only serves that if this account has Create Issue. `jira_create_issue` was **not** run against `LIS` (would open a real CR). Fake project `ZZNOPEQ3` failed with `project is required` (MCP drops unknown keys).
> **Comment:** `jira_add_comment` on `ZZNOPE-1` → Jira `Issue Does Not Exist` (authenticated write, not 401/403/504).
> **Transition:** `jira_get_transitions` listed real transitions on a live CR. `jira_transition_issue` on `ZZNOPE-1` → `Issue Does Not Exist`. No live transition was applied.
> **Policy unchanged:** `lis-jira-log-creator` drafts in the vault; create the issue only after you approve. Do not auto-run approval or promotion transitions.

> [!info] Q5 probe 2026-09-08 ~17:30
> Corporate proxy / SSL inspection is **not** a blanket MCP break. Same session:
> | MCP | Host | Result |
> |---|---|---|
> | Jira | `hatool.home` | OK (reconfirmed search) |
> | SonarQube | `hatool-sonarqube.home` | OK — `pong`, status `UP` 26.2.0 (also answers Q4 reachability) |
> | DHP AI | enterprise knowledge | OK — search returned documents |
> | Postman | public API (via proxy) | Reached — `401 Invalid API Key` (config, not proxy) |
> | GitHub Enterprise | `hagithub.home` | **Fail** — `Unknown Host` on `/api/v3/user`. Windows DNS resolves the CNAME chain; the MCP process does not |
> | Postgres | TCP, not HTTPS | `SELECT 1` OK — does not close Q1 (instance not identified as app vs log DB) |
> Public names `github.com` / `api.postman.com` do **not** resolve on this PC (split DNS). Postman still reached the API, so Node MCP is using the proxy for public HTTPS.
> Remaining work: fix GitHub MCP DNS/proxy for `hagithub.home`. Do not spend time on `NODE_EXTRA_CA_CERTS` until you see an actual cert error.

## Process and governance

| #   | Question                                                                                                                                                                                | Blocks  | Owner | Status |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ----- | ------ |
| Q7  | What exactly is on the corporate **promotion checklist**? It needs to be captured verbatim in the `promotion-checklist` skill's reference file.                                         | Phase 4 | Ka    | Open |
| Q8  | Does HA change control require a statement that an artifact was **AI-assisted**? If so, the `agent_assisted` provenance field must appear on the promotion form, not just in the vault. | Phase 4 | Ka    | Open |
| Q9  | Who else on the team will use these skills, and does the vault need to become shared/multi-writer?                                                                                      | Phase 2 | Ka    | Confirmed 2026-09-09 — Ka only. Vault stays single-writer; do not design multi-writer until that changes |
| Q10 | Where does **UAT** sit — who runs it, and does it need its own gate rather than only a plan entry?                                                                                      | Phase 5 | Ka    | Open |
| Q11 | Are there **freeze periods** or fixed promotion windows the `project-plan` skill must schedule around?                                                                                  | Phase 2 | Ka    | Confirmed 2026-09-09 — fixed promotion windows exist. Verbatim calendar still needed before `project-plan` can schedule |

> [!info] Q9 / Q11 confirmed 2026-09-09
> Ka only for now — no shared-vault work in Phase 2. Promotion windows are real; paste the window list (and any freeze) when `project-plan` is built.

## Data protection

| #   | Question                                                                                                                                                                | Blocks     | Owner | Status |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----- | ------ |
| Q12 | Confirm the rule for **patient-identifiable data**: nothing enters a prompt, a note, a commit or a log example. Who signs off that the guardrail wording is sufficient? | Everything | Ka    | Confirmed 2026-09-09 by Ka — no PHI in prompts. [[AGENTS]] still also covers notes, commits, logs, and redacted screenshots |
| Q13 | Are screenshots in requirement notes already redacted today, or does redaction become a new step?                                                                       | Phase 1    | Ka    | Confirmed 2026-09-09 — already redacted today; not a new vault step |

> [!info] Q6 / Q12 / Q13 confirmed 2026-09-09
> Ka: Cursor is approved. No patient-identifiable data enters a prompt. Requirement screenshots are already redacted; do not add a new redaction ritual. `requirement-confirmation` still strips HKID / name / episode if they appear in a paste.

## Gaps in the stage list worth deciding on

These are stages your current SDLC list does not name. Not necessarily missing — but worth a conscious decision rather than an accident.

| Candidate | Argument for adding |
|---|---|
| **Impact / feasibility assessment** between requirement and design | Some requests should be pushed back before design effort is spent. Currently implicit. |
| **UAT** as a gate, not just a plan row | You already schedule it; it produces evidence the promotion checklist probably wants. |
| **Handover / operations readiness** | Runbook, support notes, on-call briefing. Your `lis-wiki-creator` and `app-wiki` skills already cover most of the content. |
| **Post-implementation review** after the pilot | Closes the improvement loop for the *project*, distinct from the pilot's technical verdict. |
| **Rollback executed** as a recordable outcome | Right now a rollback is an exception with nowhere to be recorded. It should have a place in the Gate Log. |

## Related

- [[SDLC Agentic Workflow]] · [[Rollout Plan]] · [[Cursor Setup]]
