#!/usr/bin/env python3
"""
Pull specific slides forward from a prior design review deck's Markdown.

Incremental reviews often reuse architecture/flow slides from an earlier
full review instead of rewriting them (see examples.md, "Reusing prior
design slides"). Today that's a manual copy-paste. This script finds
slides by title (case-insensitive substring match) in a source .md and
prints them renumbered, ready to paste into the new deck's .md.

Usage:
    # Discovery: list all slide titles in the source deck
    python extract-slides.py "docs/GCRS Order Interface DHP Migration.md"

    # Extract specific slides by title match, renumbered starting at 4
    python extract-slides.py "docs/GCRS Order Interface DHP Migration.md" \
        --title "Message Processing Mechanism" \
        --start-number 4

Notes:
    - If a reused slide has an image reference (`![](file.png)`), copy the
      referenced image file alongside the new deck's .md too — the
      generator resolves image paths relative to the new .md's directory,
      not the source deck's.
"""

from __future__ import annotations

import argparse
import importlib.util
import sys
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent


def _load_generator():
    spec = importlib.util.spec_from_file_location(
        "design_review_generator", SKILL_DIR / "generate-design-review-pptx.py"
    )
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


GEN = _load_generator()


def render_slide(number: int, slide: dict) -> str:
    lines = [f"<!-- Slide number: {number} -->", f"# {slide['title']}", *slide["body"]]
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("source_md", type=Path, help="Path to the source deck's markdown file")
    parser.add_argument(
        "--title",
        action="append",
        default=[],
        help="Case-insensitive substring to match against slide titles. Repeatable.",
    )
    parser.add_argument(
        "--start-number",
        type=int,
        default=1,
        help="Slide number to start renumbering matched slides from (default: 1)",
    )
    args = parser.parse_args()

    source_path = args.source_md.resolve()
    if not source_path.exists():
        print(f"Error: source markdown not found: {source_path}", file=sys.stderr)
        sys.exit(1)

    md_content = source_path.read_text(encoding="utf-8")
    slides = GEN.parse_slides(md_content)

    if not args.title:
        print(f"{len(slides)} slide(s) found in {source_path.name}:\n")
        for i, slide in enumerate(slides, start=1):
            print(f"  {i}. {slide['title']}")
        print("\nRe-run with one or more --title \"<substring>\" to extract matching slides.")
        return

    needles = [t.lower() for t in args.title]
    matched = [s for s in slides if any(n in s["title"].lower() for n in needles)]

    if not matched:
        print("No slides matched the given --title filter(s).", file=sys.stderr)
        sys.exit(1)

    blocks = []
    number = args.start_number
    for slide in matched:
        blocks.append(render_slide(number, slide))
        number += 1

        image_ref, _ = GEN.extract_image(slide["body"])
        if image_ref:
            print(
                f"Note: slide '{slide['title']}' references image '{image_ref}' — "
                "copy that file alongside the new deck's .md.",
                file=sys.stderr,
            )

    print("\n\n".join(blocks))


if __name__ == "__main__":
    main()
