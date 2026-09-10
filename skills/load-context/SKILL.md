---
name: load-context
description: >
  Load vault context before implement-task: dossier services, LIS/ECP
  notes, and Knowledge Base. CRS Registration still uses the Flex
  mapping table below. Do not use to write code.
argument-hint: "[task name, panel name, or topic]"
---

# Load vault context

Before starting implementation, surface the notes for this package.

---

## Step 1 — Search

1. Read the active dossier `services` / `repos`. Search
   `LIS/ECP/<service>/` for each.
2. Search Knowledge Base for the panel, component, or workflow.
3. CRS Registration only: also use the Flex mapping table below.

### Common legacy component name mappings

| React task | Legacy Flex component |
|---|---|
| Registration Keys Panel | `RegistrationKeysPm`, `RegistrationKeysView.mxml` |
| Patient Demographics Panel | `PatientDemographicsPm`, `PatientDemographicsView.mxml` |
| Request Info Panel | `RequestInfoPm`, `RequestInfoView.mxml` |
| Test Panel | `TestPm`, `TestView.mxml` |
| ANAT Panel | `AnatPm`, `AnatView.mxml` |
| BBNK Panel | `BbnkPm`, `BbnkView.mxml` |
| MICR VIRO Panel | `MicrViroPm`, `MicrViroView.mxml` |
| Action Buttons / Retain | `ActionButtonsPm`, `RetainCheckboxView.mxml` |
| Patient Panel (banner) | `PatientInfoView.mxml` |
| Save workflow | `RegistrationPm.registerRequest()` |

---

## Step 2 — Extract and summarise

For each document found, produce:

**Document:** vault-relative path (`LIS/ECP/<service>/…` or `Knowledge Base/…`)

**Business rules relevant to this task:**
- Bullet list of rules that must be implemented

**Legacy behaviour:**
- What the Flex component did — for migration fidelity

**Shared library components to use:**
- Which `@lis/lis-hub-lib` components apply (if any)

**Dictionary data needed:**
- Which VOs are required (`RetainMasterVo`, `ObjectAttributeVo`, etc.)

**Open questions / unknowns:**
- Anything the documentation leaves unclear
- Flag as potential blocker (reference D.1–D.6 if applicable)

---

## Step 3 — Phase map

Based on the documents found, confirm which phase(s) this task belongs to and what the current phase scope permits:

```
Phase: {X}
Scope: {layout only | enablement | interaction | workflow | backend}
What to implement now: ...
What to defer: ...
```

---

## Step 4 — Handoff

End with:
> "Context loaded. Ready to implement — run `/implement-task {phase.task} {task name}` to proceed."

If significant unknowns were found:
> "Recommend running `/blocker-check {task name}` before implementing."

If a dossier exists, also say:
> "Package notes are on the dossier. `/implement-task` then `/code-change-log`."
