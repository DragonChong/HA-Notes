---
name: create-user-story
description: "Creates revamp-ready LIS business workflow documentation from a CRST/JIRA user story by tracing requirements across legacy and revamp code, resolving intended behavior, documenting scenarios, data sources, configurations, messages, database writes, and parity gaps, then writing the validated note to Obsidian. Always use when the user asks to create, document, analyze, continue, or proceed to a User Story/US; mentions a CRST story; asks for the next story; or wants workflow documentation derived from ActionScript, Java, React, TypeScript, source code, or acceptance criteria."
argument-hint: "CRST ticket, User Story file, screen, or 'next US'"
user-invocable: true
disable-model-invocation: false
---

# Create User Story Workflow Documentation

Create a durable, business-facing workflow note from a LIS User Story and its implementation evidence. Preserve intended business behavior for the revamp rather than treating either legacy or revamp code as automatically correct.

## Outcome

Produce one Obsidian note at:

`Knowledge Base/01_Screens/<Screen Name>/Workflows/<Business Workflow Name>.md`

The note must be understandable without reading source code and detailed enough to reimplement the behavior in a different technology.

## Inputs and Source Priority

Accept any of these inputs:

- A CRST/JIRA ticket number.
- An extracted User Story file.
- A screen or workflow name.
- “Proceed to next US” or equivalent continuation request.

Use evidence in this order when sources conflict:

1. Explicit business requirement and acceptance criteria.
2. Clarifications and intent recorded in the User Story.
3. Stable domain rules, message definitions, configuration records, and database schema.
4. Legacy behavior, including modification-history rationale.
5. Revamp behavior.

Do not silently choose between conflicting sources. Make the intended behavior canonical in the main narrative and record implementation mismatches in Technical Notes.

## Procedure

### 1. Resolve the Story

1. If a ticket is supplied, locate its extracted User Story by ticket prefix.
2. If the user says “next US,” read the authoritative story catalogue, such as `References/User Story.md`, and continue from the last documented story in catalogue order—not numeric ticket order.
3. Read the complete User Story, including acceptance criteria, examples, message text, data mappings, and linked stories.
4. Identify whether the story contains multiple distinct workflows. Keep separate trigger points and scenarios; do not merge unrelated warnings or actions merely because they share a ticket.
5. Derive a business workflow title. Never use a class, method, event, or internal property name as the note title.

### 2. Build a Traceability Map

Break the story into atomic requirements before searching code:

- Actor and trigger.
- Prerequisites.
- Happy path.
- Alternate, cancellation, and error paths.
- Field enablement, focus, and reset behavior.
- Messages: exact code, text, severity, buttons, and parameters.
- Configuration-dependent behavior.
- Data read and written.
- Follow-on workflows.

Maintain an internal evidence table mapping each requirement to User Story, legacy, frontend revamp, backend revamp, database, and test evidence. Use this to detect omissions and contradictions.

### 3. Trace All Implementations

Search broadly enough to explain the complete behavior:

1. Legacy UI and presentation logic: ActionScript, MXML, Java, EJB, services, dictionaries, and message builders.
2. Revamp frontend: React components, hooks, state stores, validators, generated clients, messages, and option loading.
3. Revamp backend: controllers, services, DTO/VO conversion, repositories, entities, status mappings, and transactions.
4. Database: exact table and column names, configuration keys, joins, and whether each operation is read-only or writes data.
5. Tests: focused tests for every branch, status mapping, message, configuration, and persistence effect.

Trace symbols through callers and callees rather than documenting one isolated method. Verify exact identifiers directly from authoritative files such as entity annotations, schemas, repository queries, or User Story mappings.

### 4. Resolve Intended Behavior

Classify each requirement:

- **Implemented consistently** — legacy, revamp, and story agree.
- **Legacy-only** — likely parity gap unless intentionally retired.
- **Revamp-only** — enhancement or regression requiring explanation.
- **Partial** — condition, branch, message, focus, or data behavior differs.
- **Missing** — no implementation found.
- **Ambiguous** — insufficient evidence; flag for clarification.

Apply these rules:

- Business requirements define intended behavior, not implementation proxies.
- Separate configuration that controls presentation from data that defines business state.
- Interpret known story typos using the full condition, message, and acceptance context, then record the discrepancy.
- Do not attribute later save/register/acknowledge writes to a read-only confirmation or retrieval step.
- Do not invent message text, option codes, table names, columns, or cancellation behavior.

### 5. Design Complete Scenarios

Create one scenario per distinct path. Include, where applicable:

- Primary success path.
- Confirm/Yes path.
- Decline/No/Cancel path.
- Validation failure and not-found path.
- Configuration disabled or missing path.
- Ineligible state where the workflow is skipped.
- Separate post-action or post-retrieval warning included in the same story.

Each scenario includes:

1. Prerequisites.
2. A Mermaid sequence diagram using business roles, screens, panels, and service roles—not code symbols.
3. Numbered step-by-step details that state what happens next after every user or system action.

### 6. Write the Obsidian Note

Use the structure in [workflow template](./references/workflow-template.md).

Main narrative rules:

- Write in present tense.
- Use visible UI labels and business data names.
- Define abbreviations on first use.
- Explain conditions and outcomes, not methods or framework mechanics.
- Put class names, methods, internal constants, implementation defects, and code-level observations only in a collapsed Technical Notes section.
- Use `[[Wiki Links]]` for User Stories and related workflows.
- Explicitly state when the workflow performs no database writes.

Write through the Obsidian integration so the vault remains synchronized. Do not create the workflow note only as a workspace file.

### 7. Validate Mermaid Diagrams

For every diagram:

1. Load the Mermaid syntax documentation for the diagram type.
2. Validate the exact Mermaid source.
3. Fix every syntax error.
4. Preview the validated diagram.
5. Confirm participant labels are business roles or system roles, not class names.

Do not mark the story complete if any diagram has not been validated and previewed.

### 8. Read Back and Quality Check

Read the saved note from Obsidian and verify:

- Every acceptance criterion maps to at least one scenario or business rule.
- Happy, cancellation, error, disabled, and bypass paths are covered.
- Message codes, exact text, severity, buttons, parameters, and sequencing are correct.
- UI elements and fields use visible business labels.
- Configuration includes exact option code and storage source, or is flagged for clarification.
- Every written field has exact table and column names; read-only workflows explicitly say no writes.
- Data-source tables distinguish business meaning from implementation details.
- Main narrative contains no classes, methods, variables, SQL, or framework-specific mechanics.
- Technical Notes list legacy/revamp gaps, suspicious proxies, message-code collisions, missing tests, and unresolved ambiguity.
- Related User Stories and workflows are linked.
- The note makes sense to a reader who has never seen the current implementation.

Only then report completion.

## Continuation Behavior

When asked to proceed to the next User Story:

1. Identify the current story from the latest completed workflow or conversation context.
2. Resolve the next entry from the story catalogue.
3. Complete the full analyze → document → validate cycle autonomously.
4. Report the completed story and the created Obsidian note.
5. Do not skip stories because their ticket number is lower or higher than surrounding entries.

## Boundaries

- This skill creates business workflow documentation from an existing User Story; it does not implement code unless the user separately asks for code changes.
- Do not modify source code while documenting parity gaps.
- Do not treat a defect discovered during analysis as intended behavior.
- Do not omit a branch because neither implementation currently supports it when the User Story requires it.
- If no authoritative story or enough evidence exists, document confirmed facts and ask only for the specific missing decision.
