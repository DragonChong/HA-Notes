# Slide outline template

Optional intermediate markdown before the `.deck.json`. Use it when the source
is long or the user wants to confirm the slide list first. Each `### Slide:`
block becomes one slide; `**Archetype:**` is a hint, not a requirement.

```markdown
## Slides

**Length:** brief | standard | full
**Title:** Cluster Cutover Briefing
**Date:** 14 Aug 2026
**Audience:** on-call + duty AM
**Owner:** LIS Team

### Agenda
Window
What changes
Runbook
Go / no-go
Q&A

### Slide: How we got here
**Archetype:** evolution
Friday night still has outpatient traffic until midnight
Saturday 02:00 is the first quiet window this month
Rollback is the previous Helm revision, kept for 72 hours

### Slide: What changes tonight
**Archetype:** cards
Hub BFF points at the new CRS spec-ack service
Dictionary cache warms for 15 minutes before cut
No schema change; no PMI backfill

### Slide: Runbook
**Archetype:** steps-sidebar
Drain inbound A08
Flip the route
Verify the first live acknowledgement

### Slide: Go / no-go
**Archetype:** matrix
Error rate, queue depth, last successful ack — per check

### Slide: Q&A
**Archetype:** statement
```

Mermaid stays in a `### Diagram:` block. Render it to PNG (mermaid-diagrams)
and attach it with the `image` archetype; do not paste mermaid into a spec.
