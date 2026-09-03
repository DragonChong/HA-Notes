---
title: Rollout Plan
tags:
  - sdlc
  - reference
  - plan
created: 2026-09-03
updated: 2026-09-03
status: blueprint
---

# Rollout Plan

Part of [[SDLC Agentic Workflow]]. Six phases. Each phase ends with something provably working on real work, not a pile of `SKILL.md` files.

> [!important] The sequencing principle
> Build the **spine** before the limbs. An orchestrator with three good stages beats twelve stage skills with no orchestrator, because the second one is just your current setup with more files.

---

## Phase 0 — Scaffolding (≈1 week, no new skills)

- Create `SDLC/` structure — done, this blueprint
- Consolidate skills into `.cursor/skills/` with the category subfolders; symlink to `~/.cursor/skills`
- Write `AGENTS.md` at the vault root and in each active repo
- Build `SDLC/Dossiers.base`
- Write the templates in `SDLC/Templates/`
- Run the [[Cursor Setup#Verify before you scale|plumbing verification checklist]]

**Done when:** a Custom Mode reads a hand-written `_Dossier.md` from a repo window and reports its stage correctly.

---

## Phase 1 — The spine (≈2 weeks)

Build `sdlc-orchestrator`, `requirement-confirmation`, and refit `generate-design` → `system-design`. Add design-source precedence to `design-review-pptx`. Add dossier awareness to `lis-jira-log-creator`.

**Prove it on one real, small enhancement, end to end from requirement to CP3 deck.**

**Done when:** requirement → design → deck → JIRA log runs through the orchestrator, gates are enforced, and the dossier records the whole thing without you editing frontmatter by hand.

> [!tip] Pilot candidate
> Pick something with a small blast radius, one service, a design you already understand, and a CP3 slot you are not anxious about. A `lis-scheduler` or `lis-patient-pmi-sync-svc` enhancement of the size you have already shipped is ideal — you will be able to tell instantly whether the output is better or worse than doing it by hand.

---

## Phase 2 — Plan and build (≈2 weeks)

Build `project-plan` and `code-change-log`. Generalize `implement-task`, `task-plan`, `task-add`, `task-update`, `blocker-check`, `load-context` off CRS Revamp.

**Done when:** the same pilot dossier carries a Gantt and a complete change log, and the CRS Revamp skills still work on CRS Revamp after generalization.

> [!warning] Do not skip `code-change-log`
> Four later skills (`code-review`, `sit-test-report`, `promotion-config`, `monitoring-plan`) read it. Building them before it means building them against a source that does not exist yet.

---

## Phase 3 — Quality gates (≈2 weeks)

Build `code-review` (absorbing `phase-review`, calling `sonar-scan-fix`) and `sit-test-report`.

**Done when:** a real PR gets an agent review that finds something a human missed, and one SIT report `.docx` is produced entirely from the dossier.

---

## Phase 4 — Promotion (≈2–3 weeks)

Build `promotion-config`, `promotion-form`, `monitoring-plan`, `promotion-checklist`. Resolve DB access first — see [[Open Questions]].

**Done when:** one promotion is prepared entirely from the dossier and the checklist verdict is evidence-linked rather than asserted.

---

## Phase 5 — Close the loop (≈1 week + ongoing)

Build `pilot-monitor` and `load-test-scenario`. Add `uat-support`. Start the retro log below.

**Done when:** a dossier closes with the knowledge base updated, and the next project's requirement stage retrieves that update.

---

## Effort reality check

Twelve new skills, one refit, one generalization pass across six skills. At a realistic 1–2 days per stage skill including the iteration to make it actually good, that is **8–10 weeks of part-time work alongside delivery** — not a weekend. The phases are ordered so that value arrives from Phase 1 and does not depend on Phase 4 landing.

The honest risk is not that it fails, it is that it stalls at Phase 2 with six half-built skills. Guard against that by finishing each phase on a real project before starting the next.

---

## Measuring whether it is working

Track these per dossier and compare against your pre-agentic baseline:

| Metric | Why |
|---|---|
| Elapsed days per stage vs planned | Is the workflow faster, or just more documented? |
| Rework after a gate | High rework means the gate criteria are wrong |
| Defects found in SIT vs in pilot | Shifting left is the real win |
| CP3 actions per review | Design quality proxy |
| Promotion rollbacks | The number that must not go up |
| Time spent correcting agent output | If this exceeds time saved, the skill needs work |

If the last row is high for a given skill, that skill's `SKILL.md` is the problem — use `skill-creator` to iterate on it rather than working around it.

---

## Retro log

One line per closed dossier: what the workflow got wrong, and which skill was changed as a result.

| Date | Dossier | What went wrong | Fix applied |
|---|---|---|---|
| | | | |

## Related

- [[SDLC Agentic Workflow]] · [[Skill Catalogue]] · [[Open Questions]]
