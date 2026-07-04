---
name: lis-wiki-creator
description: >
  Creates and maintains GitLab/GitHub Wiki pages for LIS (Laboratory Information System)
  Spring Boot microservice design documentation. Use this skill whenever a user wants to
  document a new or existing LIS microservice, write a wiki page for a Spring Boot service,
  create system design docs for a DHP/LIS integration service, document API endpoints,
  message flows, logging conventions, OpenShift/Kubernetes configuration, or post-live
  monitoring guidance for any LIS service. Also triggers when the user says things like
  "write the wiki", "document this service", "create a Home/System-Overview/Receiver/Sender/
  Logging/Configuration page", "write wiki pages for my service", or asks for design docs
  modelled on lis-gcr-order-inf-svc or lis-patient-pmi-sync-svc.
---

# LIS Wiki Creator

This skill produces wiki pages for LIS Spring Boot microservices following the conventions
established in `lis-gcr-order-inf-svc.wiki` and `lis-patient-pmi-sync-svc.wiki`.

---

## Standard Wiki Structure

A complete wiki for an LIS service consists of these pages.  
Not every page is required — only produce the ones that are relevant to the service.

| Page | File | Content |
|---|---|---|
| Home | `Home.md` | Overview, background, page index table, quick-reference tables |
| System Overview | `System-Overview.md` | Legacy vs. revamp comparison, architecture diagrams, tech stack, data model |
| Inbound processing | e.g. `Receiver.md` | API endpoint spec, Mermaid flow, per-transaction business logic |
| Outbound processing *(if applicable)* | e.g. `Sender.md` | Trigger mechanism, API spec, Mermaid flow, per-message-type logic. Only relevant when the service actively pushes messages to an external system (e.g., via a scheduler-driven message queue). Purely inbound or request–response services do not need this page. |
| Logging | `Logging.md` | Log levels, format, Function IDs, component-level log-entry reference tables |
| Configuration | `OpenShift-Configuration.md` | ConfigMaps, Secrets, Spring Boot property bindings, JSON/YAML examples |
| Security | `Security.md` | Auth mechanism, environment variables, OpenShift Secret setup, protected vs. public endpoints |
| Domain reference | e.g. `Supported-Message-Types.md` | Per-type business rules, field mappings, HL7/XML/JSON structures |
| Post-Live Monitoring | `Post-Live-Monitoring.md` | Support-team SQL queries, key tables, failure indicators, verification steps |

Decide which pages to produce by reading the source code and configuration provided, or by
asking the user what they need.

---

## Conventions to Follow in Every Page

### Tone and style
- Use present tense, active voice, concise sentences.
- Prefer tables and code blocks over prose paragraphs.
- Use `---` horizontal rules to separate major sections.
- Add navigation footer at the bottom of every page (except Home):
  ```
  ## Navigation
  - [← Previous: PageName](PageName)
  - [→ Next: PageName](PageName)
  - [← Back to Home](Home)
  ```

### Mermaid diagrams
- Use `flowchart TD` (top-down) or `flowchart LR` (left-right) for architecture diagrams.
- Use `sequenceDiagram` for step-by-step API/processing flows.
- Node colour conventions (keep consistent across all diagrams in the same wiki):
  - **Main service** (the one being documented): `fill:#90EE90,stroke:#333`
  - **Database**: `fill:#DDD,stroke:#333`
  - **Scheduler / trigger**: `fill:#FFE0B2`
  - **External system / partner**: `fill:#FF99FF,stroke:#333`
  - **API Gateway / middleware**: dashed border — `stroke-dasharray: 5 5`
- Use `subgraph` blocks to group nodes by environment (e.g., `LIS Environment`, `GCRS Environment`, `API Management`).

### Tables
- Use `|---|---|` alignment rows.
- Column order for transaction/message type tables: Code/Event → Description → Service/Handler.
- Column order for log-entry tables: Log Level → Function ID → Operation ID → Description.
- Column order for ConfigMap/Secret tables: Key → Default (if applicable) → Spring Binding → Description.

### Code blocks
- JSON request/response examples: use ` ```json ` fences.
- YAML / Kubernetes manifests: use ` ```yaml ` fences.
- SQL: use ` ```sql ` fences with a comment line explaining what the query does.
- When showing multiple SQL dialects (PostgreSQL vs. Sybase), label each block clearly with a bold header (`**PostgreSQL**`, `**Sybase**`).

---

## Page-by-Page Guidance

### Home.md

```
# <service-name> Wiki

Welcome to the system design documentation for **<service-name>**, <one-sentence description>.

## Background

<2–4 sentences: what the legacy system did, why it was replaced, what the new service does>

## Pages

| Page | Description |
|---|---|
| [System Overview](System-Overview) | ... |
| ...                               | ... |

## Quick Reference

<Optional: one or more quick-reference tables — e.g., inbound transaction codes, outbound
transaction codes, supported HL7 event types, API endpoints — whatever is most useful for
someone skimming the service>
```

### System-Overview.md

1. **Background and Migration Context** — Describe the legacy system and the revamped system
   using side-by-side comparison tables:

   | Aspect | Legacy | Revamped |
   |---|---|---|
   | Communication protocol | ... | ... |
   | Message format | ... | ... |
   | Framework | ... | ... |
   | Database access | ... | ... |
   | Configuration | ... | ... |
   | Scheduling | ... | ... |
   | Deployment | ... | ... |

2. **System Architecture** — One Mermaid `flowchart` per major data direction (inbound and/or
   outbound). Show the full path: external system → API Gateway → this service → database,
   including relevant annotations on the arrows (HTTP method, payload type, header names,
   response codes).

3. **Technology Stack** — Table: Component → Technology.

4. **Environment Endpoints** — Table per environment (DEV, SIT, DEVQA, LPT, PROD) with base
   URLs.

5. **Data Model** — Key database tables, their purpose, and (if useful) their primary/foreign
   key relationships. Keep this brief — deeper field-level docs go in domain reference pages.

### Inbound Processing Page (e.g. Receiver.md)

1. **Overview paragraph** — what triggers this flow, source system, routing mechanism.
2. **API** section:
   - Endpoint (`POST /api/...`)
   - Request headers table
   - Request body structure (JSON code block showing the common envelope + a placeholder for
     transaction-specific fields)
   - Success response (JSON code block)
   - Business-error response (JSON code block)
   - `ackCode` values table (if applicable)
3. **Supported Transaction Types** — table: Code → Description → Handler Service.
4. **Flow Overview** — `sequenceDiagram` covering the happy path end-to-end.
5. **Per-Transaction Detail** — one H2/H3 section per transaction type:
   - Purpose
   - Database operations (tables read and written)
   - Business rules and validation
   - Mermaid fragment if the flow is complex

### Outbound Processing Page (e.g. Sender.md)

1. **Overview paragraph** — what this flow does.
2. **Trigger** section — how it is invoked (scheduler, API call, event). If there are multiple
   triggers, use a table.
3. **API** section — same structure as inbound page.
4. **Flow Overview** — `sequenceDiagram` covering the happy path.
5. **Message Queue** — table: queue table columns → type → description. Status values list.
6. **Per-Message-Type Detail** — one section per outbound type.

### Logging.md

1. **Log Levels** — bulleted list (TRACE, DEBUG, INFO, WARN, CRITICAL, AUDIT with one-line
   descriptions).
2. **Log Format** — list the fields present in each structured log entry.
3. **Function IDs** — table: Constant → Value → Description (one row per processing pipeline).
4. **Logging Components** — one H3 per major component. Each has a table:

   | Log Level | Function ID | Operation ID | Description |
   |---|---|---|---|

   Use the actual Function ID value (not the constant name) in the table.

### OpenShift-Configuration.md / Security.md

For ConfigMaps:
- One H3 per ConfigMap name.
- Table: Key → Default → Spring Binding → Description.
- Full JSON example of the ConfigMap manifest.
- A `> Note:` callout for any environment-specific overrides.

For Secrets:
- One H3 per Secret name.
- Table: Key → Spring Binding → Description (omit Default — secrets have no default).
- YAML creation example.
- Note about base64 encoding.

For Security:
- Auth mechanism overview.
- Environment variables table.
- Protected vs. public endpoint table.
- BCrypt / CSRF / session notes as applicable.

### Supported-Message-Types / Domain Reference Pages

For each message type or transaction type, structure as:

```markdown
## <Code> — <Full Name>

**Purpose**: <one sentence>

**Message Structure**: <HL7/XML/JSON format>

**Business Logic**:
- General data insert/update: field-mapping table (Source Field → Description → Target Field)
- Special business rules: bulleted list

**Database Operations**:
| Operation | Table | Condition |
|---|---|---|
```

### Post-Live Monitoring.md

1. Opening paragraph — purpose, audience (support team), the "fingerprint" that identifies this
   service's writes (e.g., `amend_action_by = '***IPAS***'`).
2. **Key Database Tables** — table: Table → Purpose.
3. **General Health Checks** — SQL queries to confirm recent activity.
4. **Per-Event-Type Verification** — one H2/H3 per event type:
   - Which tables are written
   - Fields to inspect
   - Ready-to-run SQL (PostgreSQL and/or Sybase as applicable)
   - Common failure indicators

---

## Gathering Information

Before writing, collect the following from source code, config files, and the user:

| What you need | Where to look |
|---|---|
| Service name, description | `pom.xml` (artifactId, description), `README.md` |
| API endpoints and request/response structure | Controller classes, `@RequestMapping` / `@PostMapping` |
| Transaction / message types | Enums, switch statements, service classes |
| Database tables | Entity classes, DAO/Repository interfaces, SQL files |
| Log entries | Logger calls in service classes; look for Function ID constants |
| ConfigMap keys and Spring bindings | `application*.yaml`, `@Value` / `@ConfigurationProperties` |
| Secrets | `values-*.yaml`, Spring Security config |
| Legacy system | Legacy source files, the project's `DESIGN.md` or migration notes |
| Mermaid diagram data flow | Trace call chains from Controller → Service → Repository |

If key information is missing and cannot be inferred from code, ask the user to supply it
rather than inventing values.

---

## Output

- Write each page as a complete, standalone Markdown file.
- Start every file directly with the `#` heading — no frontmatter or preamble.
- When asked for multiple pages, produce them one after another, each clearly labelled with its
  filename (e.g., `**Home.md**`).
- After producing the pages, offer to create any remaining pages from the standard set that
  were not yet written.
