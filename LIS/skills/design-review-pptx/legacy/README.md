# Retired — HA-template / python-pptx generator

These files were the `design-review-pptx` skill up to **Aug 2026**. They are kept for
reference and rollback only. **Nothing in the active skill calls them.**

## What they did

Rendered a Markdown slide outline onto `ha-lis-design-review-template.pptx` using
`python-pptx`, matching the LIS-10672 / LIS-10583 decks:

- **4:3 canvas** (10 × 7.5 in), Office Theme white background
- Century Gothic titles (`#0070C0`), Calibri body
- Output was bullet lists, plain tables and Consolas code blocks

## Why retired

The visual quality ceiling was low — bullets and untinted tables, on a 4:3 canvas that
no longer matches how these reviews are presented. The replacement is a declarative
deck spec rendered by PptxGenJS on a 16:9 canvas with a real design system
(see `../SKILL.md` and `../references/design-system.md`).

## Files

| File | Purpose |
|------|---------|
| `ha-lis-design-review-template.pptx` | Canonical HA master (from the LIS-10672 deck) |
| `generate-design-review-pptx.py` | Markdown → styled .pptx |
| `qa-design-review-pptx.py` | Mechanical QA checks |
| `extract-slides.py` | Pull slides forward from a prior deck's markdown |
| `validate_pptx.py` | Ad-hoc structure dump |
| `slide-types.md` | Per-slide content reference for the old format |
| `examples.md` | Real deck excerpts in the old markdown format |
| `requirements.txt` | `python-pptx` |

## If you need the HA template again

The template `.pptx` here is still the authoritative HA master. Either run the old
generator directly:

```bash
pip install -r requirements.txt
python generate-design-review-pptx.py "docs/{Title}.md" "docs/{Title}.pptx"
```

…or lift the template's master into a new archetype in the active kit.

## Still useful ideas carried forward

- The **QA checklist semantics** (title slide must carry JIRA key / service / date;
  no placeholder text; agenda must cover the slide sequence) now live in `../qa-deck.js`.
- `extract-slides.py`'s **reuse prior slides** workflow is now `generate-deck.js --extract`,
  operating on deck-spec JSON instead of scraped markdown.
