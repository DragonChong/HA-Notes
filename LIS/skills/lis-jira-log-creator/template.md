# JIRA Log Note Template

Use this structure for the Obsidian note body (frontmatter is separate).

---

```markdown
# <Request Summary — exact; same as frontmatter title (filename = this with / \ → -)>

## Request Type

**Type:** Change Request  
**Priority:** Medium

## Request Summary

<Identical to frontmatter title / H1 — no shortening or rephrasing>

## Background

<One focused paragraph (two max):
  1. Operational context in the named service
  2. Concrete artefacts — message types with expansions, statuses, tables/columns
  3. Current gap or risk in that flow
  4. Closing sentence: what must be done and why (reason for this ticket)
Do not lead with parent JIRA keys; put them under Reference Logs.>

## Change Description

1. **<Work item title>:**
   - <Specific change with class/file/API names>
   - <Sub-detail>

2. **<Work item title>:**
   - <Specific change>

## Justification

<1 short paragraph: operational outcome this change enables, using the same named artefacts as Background>

## Target Completion Date

<Dth Mon YYYY>

## Design

<!-- Populated by generate-design skill before CP3 review. See design-template.md. -->

## Reference Logs

- LIS-XXXX
```

---

## Optional: architecture diagram

Add inside Change Description when documenting a new service or API flow:

```markdown
### System Architecture

```mermaid
flowchart LR
    EXT[External System] -->|POST JSON| GW[API Gateway]
    GW --> SVC[lis-example-svc]
    SVC --> DB[(Oracle DB)]
    SVC -->|JSON Response| GW
    GW --> EXT
```
```

---

## Email-ready output

When the user needs copy-paste text for email (SM → SA), reproduce the same sections
as plain text with bold headings matching team convention:

```
**Request Type**
Change Request
Priority: Medium

**Request Summary**
...

**Background**
...

**Change Description**
...

**Justification**
...

**Target Completion Date**
...
```
