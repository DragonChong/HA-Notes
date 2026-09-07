---
name: test-nested-ping
description: >
  Phase 0 nested-discovery check. Confirms Cursor finds SKILL.md under
  category subfolders. Use only when the user types /test-nested-ping.
  Do not use for real project work.
disable-model-invocation: true
---

# Test nested ping

Throwaway. Path on disk:

`LIS/skills/nested/category/test-nested-ping/SKILL.md`

which is also

`%USERPROFILE%\.cursor\skills\nested\category\test-nested-ping\SKILL.md`

via the existing junction.

## When invoked

Reply with one line:

```
nested discovery: ok — LIS/skills/nested/category/test-nested-ping
```

Then tick the Open Item `/test-nested-ping` discovered on
`SDLC/Projects/TMP-phase0-plumbing — Phase 0 Plumbing/_Dossier.md`
and stop.
