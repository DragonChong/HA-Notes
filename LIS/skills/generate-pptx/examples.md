# Examples

## Example — brief operational deck

**Source:** a meeting note (not a JIRA design section).

**Outline excerpt:**

```markdown
## Slides

**Length:** brief
**Title:** Cluster Cutover Briefing
**Date:** 14 Aug 2026
**Audience:** on-call + duty AM

### Slide: How we got here
Friday night still has outpatient traffic until midnight
Saturday 02:00 is the first quiet window this month

### Slide: What changes tonight
Hub BFF points at the new CRS spec-ack service
Dictionary cache warms for 15 minutes before cut
No schema change

### Slide: Runbook
Drain inbound A08 → flip the route → verify the first live ack
```

**Becomes:** [examples/cluster-cutover-briefing.deck.json](examples/cluster-cutover-briefing.deck.json)

| Outline block | Archetype |
|---------------|-----------|
| cover metadata | `title-hero` |
| How we got here | `evolution` |
| What changes tonight | `cards` |
| Runbook | `steps-sidebar` |
| Go / no-go | `matrix` |
| next actions | `closing` |

That is the whole point of this skill: the same kit as a CP3 design review, with
no JIRA key, no Promotion/Fallback mandate, and no `## Design` section required.
