---
name: load-context
description: Load relevant CRS Revamp knowledge base documents before starting a Registration task. Use this at the start of any complex implementation session to surface business rules, legacy behaviour, and open questions from the Obsidian knowledge base. Run before implement-task for unfamiliar or complex tasks.
argument-hint: "[task name, panel name, or topic e.g. 'Patient Demographics Panel']"
---

# Load Knowledge Base Context

Before starting implementation, surface the relevant knowledge base documents for the specified task or topic.

---

## Step 1 — Search the knowledge base

Search `@workspace` across the `lis-knowledge-base` folder for:

1. The panel, component, or workflow name provided by the user
2. Related enablement, interaction, or validation notes
3. The corresponding legacy Flex component name (common mappings below)

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

**Document:** `Knowledge Base/01_Screens/Registration/{path}`

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
