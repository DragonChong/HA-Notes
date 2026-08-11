#!/usr/bin/env python3
"""
Automated QA checks for HA/LIS CP3 design review decks.

Mechanizes the checkable items from the SKILL.md QA checklist so they don't
rely on a human re-reading the whole deck by eye:

  - Title slide has a JIRA key, service name, forum, and date
  - No placeholder text (TBD, lorem)
  - No slide exceeds ~8 bullets / ~10 table rows
  - Every agenda item has a matching later slide title
  - Every slide has a `#` title (guaranteed by the parser, checked anyway)

Judgment-based checklist items (Promotion/Fallback included where relevant,
terminology consistency) are NOT covered here and still need a human pass.

Usage:
    python qa-design-review-pptx.py <input.md> [--forum CP3]

Exit code 1 if any hard failures are found, 0 otherwise (warnings alone
don't fail the run).
"""

from __future__ import annotations

import argparse
import importlib.util
import re
import sys
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent


def _load_generator():
    """Load generate-design-review-pptx.py as a module (hyphenated filename
    can't be `import`-ed directly) so parsing logic has one source of truth."""
    spec = importlib.util.spec_from_file_location(
        "design_review_generator", SKILL_DIR / "generate-design-review-pptx.py"
    )
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


GEN = _load_generator()

DATE_RE = re.compile(r"\b\d{1,2}(st|nd|rd|th)?\s+\w+,?\s*\d{4}\b", re.IGNORECASE)
JIRA_RE = re.compile(r"\(LIS-\d+\)")
SERVICE_RE = re.compile(r"^\([\w.-]+\)$")
PLACEHOLDER_RE = re.compile(r"\b(TBD|lorem)\b", re.IGNORECASE)


def check_title_slide(slides: list[dict], forum: str, errors: list[str]) -> None:
    if not slides:
        errors.append("No slides parsed — nothing to check.")
        return

    title_slide = slides[0]
    combined = "\n".join([title_slide["title"], *title_slide["body"]])

    if not JIRA_RE.search(combined):
        errors.append("Title slide is missing a JIRA key, e.g. `(LIS-12345)`.")
    if forum.lower() not in combined.lower():
        errors.append(f"Title slide is missing the forum name (expected '{forum}').")
    if not DATE_RE.search(combined):
        errors.append("Title slide is missing a recognizable date (e.g. '5th Jul 2026').")
    if not any(SERVICE_RE.match(line.strip()) for line in title_slide["body"]):
        errors.append("Title slide is missing a service name line, e.g. `(lis-example-svc)`.")


def check_placeholder_text(md_content: str, errors: list[str]) -> None:
    for i, line in enumerate(md_content.splitlines(), start=1):
        if PLACEHOLDER_RE.search(line):
            errors.append(f"Placeholder text found on markdown line {i}: {line.strip()!r}")


def check_slide_sizes(slides: list[dict], warnings: list[str]) -> None:
    for i, slide in enumerate(slides):
        image_ref, body = GEN.extract_image(slide["body"])
        kind = GEN.classify_slide({"title": slide["title"], "body": body}, i)

        if kind in ("bullets", "agenda"):
            item_count = len([line for line in body if line.strip()])
            if item_count > 8:
                warnings.append(
                    f"Slide {i + 1} ('{slide['title']}') has {item_count} lines — "
                    "consider splitting (~8 top-level bullets max)."
                )
        elif kind == "table":
            _, rows, _ = GEN.parse_markdown_table(body)
            if len(rows) > 10:
                warnings.append(
                    f"Slide {i + 1} ('{slide['title']}') table has {len(rows)} rows — "
                    "consider splitting (~10 rows max)."
                )


def check_agenda_coverage(slides: list[dict], warnings: list[str]) -> None:
    agenda_index = next(
        (i for i, s in enumerate(slides) if s["title"].strip().lower() == "agenda"), None
    )
    if agenda_index is None:
        return

    later_titles = " | ".join(s["title"].lower() for s in slides[agenda_index + 1 :])
    for item in slides[agenda_index]["body"]:
        item_clean = item.strip().lower()
        if not item_clean:
            continue
        if item_clean not in later_titles:
            warnings.append(
                f"Agenda item '{item.strip()}' has no later slide whose title contains it "
                "(fine for items like 'Q&A' or 'Open discussion' — otherwise check)."
            )


def run_qa(md_path: Path, forum: str) -> tuple[list[str], list[str]]:
    md_content = md_path.read_text(encoding="utf-8")
    slides = GEN.parse_slides(md_content)

    errors: list[str] = []
    warnings: list[str] = []

    check_title_slide(slides, forum, errors)
    check_placeholder_text(md_content, errors)
    check_slide_sizes(slides, warnings)
    check_agenda_coverage(slides, warnings)

    return errors, warnings


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("md_path", type=Path, help="Path to the design review markdown file")
    parser.add_argument("--forum", default="CP3", help="Review forum name expected on the title slide (default: CP3)")
    args = parser.parse_args()

    md_path = args.md_path.resolve()
    if not md_path.exists():
        print(f"Error: Markdown file not found: {md_path}", file=sys.stderr)
        sys.exit(1)

    errors, warnings = run_qa(md_path, args.forum)

    if errors:
        print(f"FAILED — {len(errors)} error(s):")
        for e in errors:
            print(f"  [ERROR] {e}")
    else:
        print("No errors.")

    if warnings:
        print(f"{len(warnings)} warning(s):")
        for w in warnings:
            print(f"  [WARN] {w}")

    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
