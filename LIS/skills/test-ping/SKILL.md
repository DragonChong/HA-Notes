---
name: test-ping
description: >
  Phase 0 plumbing check. Reads the TMP-phase0-plumbing dossier and reports
  its stage in two lines. Use only when the user types /test-ping or asks to
  verify SDLC skill discovery. Do not use for real project work.
disable-model-invocation: true
---

# Test ping

Throwaway Phase 0 skill. Delete after discovery is confirmed and
`sdlc-orchestrator` exists.

## When invoked

1. Read `SDLC/Projects/TMP-phase0-plumbing — Phase 0 Plumbing/_Dossier.md`
   (frontmatter plus `## Status` and `## Open Items` only).
2. Report exactly two lines, no preamble:

```
TMP-phase0-plumbing · enhancement · stage: <stage> · gates: <gates_passed or none>
Next: Phase 1 — build sdlc-orchestrator
```

3. Tick the matching Open Item (`/test-ping` from this vault window, or
   from a repo window if that is where you were invoked).
4. Set `updated` to today. Then stop.
