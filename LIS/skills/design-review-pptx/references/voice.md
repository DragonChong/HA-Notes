# Voice

How slide prose should sound. Apply `/humanizer` in **embedded mode** to
titles, card bodies, agenda item notes, and speaker notes. Then copy that
wording into `deck.json`.

Do **not** rewrite identifiers, SQL, ConfigMap keys, JIRA keys, table names,
column names, or status enums.

## Samples

| Profile | File (cite in place) |
|---------|----------------------|
| CP3 default (`incremental` / `full`) | `D:\ECP\LIS\lis-scheduler-lib\docs\job-normalization\Normalize Table-driven Job Definitions.deck.json` |
| `walkthrough` only | `G:\Request\BackEnd\Specimen Sorter\USID Auto-Registration Flow.deck.json` |

Scheduler bar for a note:

> The rename is not cosmetic: config keys change with it.

Do not copy from the scheduler sample: cover typo `lis-scheudler`, missing
`asks`, missing closing.

USID is a workshop: many `image` slides, as-is vs to-be, asks per stage. Not
the 6–10 CP3 sequence.

## Watch list

Rewrite these when they appear in **prose**:

- Title-case labels: `User requirement - check auto-registration status` → a
  statement (`Staff need to see auto-registration status after the sorter runs`).
- Notes that read the slide back: `This slide shows the background.`
- `Additionally`, `enhance`, `key`, `crucial`, `highlight`, `leverage`.
- Fake asks: `Any feedback?`, `confirm reviewed_by`.
- Em dashes in titles. Use a hyphen.

Keep:

- Service names, table/column names, ConfigMap keys, JIRA keys, status enums.
- Concrete promotion steps and SQL.
- Mixed feelings already in `02` (`v1 stays unauthenticated`).

Do not invent a fact to make a sentence smoother. If the brief needs a class
or API that is not in `02`, stop and hand back to `system-design`.
