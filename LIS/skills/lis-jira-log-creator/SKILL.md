---
name: lis-jira-log-creator
description: >
  Prepares LIS change-request JIRA log content (Request Type, Summary, Background,
  Change Description, Justification, Target Completion Date) from user descriptions
  and technical context, then creates an Obsidian note in LIS/JIRA and updates
  LIS/JIRA/JIRA Log List. Use when the user asks to create a JIRA log, prepare a
  change request, document a LIS service change for JIRA submission, or says
  "request to create change".
---

# LIS JIRA Log Creator

Prepare structured JIRA change-request content and persist it in the Obsidian vault
(`LIS/JIRA/`). Follow team email conventions (SM → SA change requests).

## Workflow

```
Task Progress:
- [ ] Step 1: Gather inputs
- [ ] Step 2: Draft all six sections
- [ ] Step 3: Confirm with user (if details are incomplete)
- [ ] Step 4: Create Obsidian note via MCP
- [ ] Step 5: Update JIRA Log List
```

### Step 1: Gather inputs

Collect from the user (or infer from code/wiki/conversation):

| Input | Required | Notes |
|---|---|---|
| Service name(s) | Yes | e.g. `lis-gcr-order-inf-svc` |
| What is changing | Yes | Bug fix, new service, enhancement |
| Technical details | Yes | Files, classes, APIs, DB tables, transaction types |
| Problem / current state | For fixes & revamps | Legacy behaviour, trigger names, race conditions |
| Reference JIRA tickets | No | e.g. LIS-7291 |
| Target completion date | Yes | Ask if not provided |
| Request type | Default | `Change Request` unless user specifies otherwise |
| Priority | Default | `Medium` unless user specifies otherwise |

Explore the codebase or wiki when the user provides a service name but sparse detail.

### Step 2: Draft the six sections

Use [template.md](template.md) for structure and [examples.md](examples.md) for tone.

**Writing rules:**

1. **Request Type** — `Change Request` (default) or user-specified type; include **Priority** on the same line or immediately below.
2. **Request Summary** — One sentence. Start with a verb (`Fix`, `Develop`, `Enhance`). Name the service in backticks. Mirror email subject lines.
3. **Background** — 2–4 short paragraphs: current state → problem or migration driver → scope of this change. Name legacy components (triggers, socket programs, tables) when relevant.
4. **Change Description** — Numbered list for distinct work items; use sub-bullets for file/class/API specifics. Include Mermaid diagrams only when architecture clarity helps (new services, inbound/outbound flows).
5. **Justification** — 1–2 paragraphs on business/technical impact: reliability, data integrity, DHP migration, load handling.
6. **Target Completion Date** — Format: `Dth Mon YYYY` (e.g. `29th May, 2026`, `17th Apr 2026`).

Mark unknowns as `[TBD]` and ask the user before writing to Obsidian.

### Step 3: Present draft

Show the full draft in chat before creating the Obsidian note, unless the user explicitly asks to skip review.

### Step 4: Create Obsidian note (MCP)

Use the **user-obsidian** MCP server. Read tool schemas before calling.

**Note path:** `LIS/JIRA/<Short Title>.md`

Filename rules:
- Derive from Request Summary (drop leading verb if redundant)
- Replace `/` and `\` with `-`
- Max ~80 characters
- Example: `Fix Race Condition in lis-gcr-order-inf-svc.md`

**Frontmatter:**

```yaml
---
title: "<Request Summary>"
tags:
  - jira-log
  - lis
request_type: Change Request
priority: Medium
services:
  - lis-gcr-order-inf-svc
target_completion_date: 2026-05-29
status: draft
created: 2026-07-02
reference_jira: []
---
```

**Body:** Use the section headings from [template.md](template.md). Add `## Reference Logs` only when reference JIRA tickets exist.

Call `write_note` with `path`, `content`, and `frontmatter`.

### Step 5: Update JIRA Log List

1. `read_note` → `LIS/JIRA/JIRA Log List.md`
2. If empty or missing the table header, initialize using the list template below
3. `patch_note` to prepend a new row after the table header row (newest first)

**List template** (initialize when file is empty):

```markdown
# JIRA Log List

Index of LIS change-request JIRA logs. Newest entries at the top.

| Created | Summary | Service | Type | Priority | Target Date | Status | Note |
|---|---|---|---|---|---|---|---|
```

**New row format:**

```markdown
| 2026-07-02 | Fix Race Condition in lis-gcr-order-inf-svc | lis-gcr-order-inf-svc | Change Request | Medium | 29th May, 2026 | draft | [[Fix Race Condition in lis-gcr-order-inf-svc]] |
```

Use wikilinks (`[[Note Title]]`) in the Note column — Obsidian resolves by title.

## Obsidian MCP quick reference

| Action | Tool | Key args |
|---|---|---|
| Read list or note | `read_note` | `path` |
| Create log note | `write_note` | `path`, `content`, `frontmatter` |
| Add list row | `patch_note` | `path`, `oldString` (header row), `newString` (header + new row) |
| Search existing logs | `search_notes` | `query`, `limit` |

Paths are relative to vault root (e.g. `LIS/JIRA/...`).

## Quality checklist

- [ ] Summary is one clear sentence naming the service
- [ ] Background explains *why*, not just *what*
- [ ] Change Description names concrete artefacts (classes, endpoints, tables)
- [ ] Justification states operational impact
- [ ] Target date uses team format (`Dth Mon YYYY`)
- [ ] Obsidian note created under `LIS/JIRA/`
- [ ] JIRA Log List row added with wikilink

## Additional resources

- Section templates: [template.md](template.md)
- Full examples from team emails: [examples.md](examples.md)
