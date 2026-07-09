#!/usr/bin/env python3
"""
Convert ## Design section from a LIS JIRA Obsidian note to slide-ready Markdown
for the design-review-pptx skill.

Usage:
    python jira-design-to-slides.py <jira-note.md> [output-slides.md]

Metadata (Review type, JIRA key, Service, Review date) is read from ## Design
body lines (**Key:** value). Title slide is auto-generated.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path


def parse_frontmatter(text: str) -> tuple[dict, str]:
    if not text.startswith("---"):
        return {}, text
    end = text.find("---", 3)
    if end == -1:
        return {}, text
    fm_block = text[3:end].strip()
    body = text[end + 3 :].lstrip()
    fm: dict = {}
    for line in fm_block.splitlines():
        if ":" in line:
            key, val = line.split(":", 1)
            fm[key.strip()] = val.strip().strip('"')
    return fm, body


def extract_design_section(body: str) -> str | None:
    match = re.search(r"^## Design\s*$", body, re.MULTILINE)
    if not match:
        return None
    start = match.end()
    rest = body[start:]
    next_section = re.search(r"^## [^#]", rest, re.MULTILINE)
    return rest[: next_section.start()].strip() if next_section else rest.strip()


def parse_metadata(design: str) -> dict[str, str]:
    meta: dict[str, str] = {}
    for line in design.splitlines():
        m = re.match(r"^\*\*([^*]+):\*\*\s*(.+)$", line.strip())
        if m:
            meta[m.group(1).strip().lower()] = m.group(2).strip()
    return meta


def _parse_blocks(content: str) -> list[tuple[str, str]]:
    blocks: list[tuple[str, str]] = []
    pattern = re.compile(r"^### (Agenda|Slide: (.+)|Diagram: (.+))\s*$", re.MULTILINE)
    matches = list(pattern.finditer(content))

    for i, m in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(content)
        block_body = content[m.end() : end].strip()

        if m.group(1) == "Agenda":
            blocks.append(("agenda", block_body))
        elif m.group(2):
            title = m.group(2).strip()
            blocks.append(("slide", f"{title}\n{block_body}" if block_body else title))
        elif m.group(3):
            blocks.append(("diagram", f"{m.group(3).strip()}\n{block_body}"))

    return blocks


def split_slide(block: str) -> tuple[str, str]:
    lines = block.split("\n", 1)
    title = lines[0].strip()
    body = lines[1].strip() if len(lines) > 1 else ""
    return title, body


def build_title_slide(meta: dict, fm: dict) -> tuple[str, str]:
    jira_key = meta.get("jira key", "")
    service = meta.get("service", "")
    if not service and fm.get("services"):
        service = fm["services"].strip("[]").split(",")[0].strip()

    title_text = fm.get("title", "Design Review")
    if jira_key and jira_key not in title_text:
        # Shorten for slide title
        short = title_text.split("`")[0].strip() if "`" in title_text else title_text
        if len(short) > 80:
            short = short[:77] + "..."
        title_text = f"{short} ({jira_key})"

    review_date = meta.get("review date", "")
    forum = meta.get("review forum", "CP3")

    body_lines = []
    if service:
        body_lines.append(f"({service})")
    body_lines.append(forum)
    if review_date:
        body_lines.append(review_date)

    return title_text, "\n".join(body_lines)


def convert(jira_path: Path) -> str:
    text = jira_path.read_text(encoding="utf-8")
    fm, body = parse_frontmatter(text)
    design = extract_design_section(body)
    if not design:
        raise ValueError(f"No ## Design section found in {jira_path}")

    meta = parse_metadata(design)
    blocks = _parse_blocks(
        "\n".join(
            line
            for line in design.splitlines()
            if not re.match(r"^\*\*[^*]+:\*\*", line.strip())
        ).strip()
    )

    slides_out: list[str] = []
    slide_num = 0

    def add_slide(title: str, content: str) -> None:
        nonlocal slide_num
        slide_num += 1
        slides_out.append(f"<!-- Slide number: {slide_num} -->")
        slides_out.append(f"# {title}")
        if content:
            slides_out.append(content)
        slides_out.append("")

    # Title slide
    title, title_body = build_title_slide(meta, fm)
    slide_num += 1
    slides_out.append(f"<!-- Slide number: {slide_num} -->")
    slides_out.append(f"# {title}")
    slides_out.append(title_body)
    slides_out.append("")

    for block_type, block_content in blocks:
        if block_type == "agenda":
            add_slide("Agenda", block_content)
        elif block_type == "slide":
            slide_title, slide_body = split_slide(block_content)
            if slide_title.upper() == "Q&A" and not slide_body:
                add_slide("Q&A", "")
            else:
                add_slide(slide_title, slide_body)
        # diagram blocks stay in JIRA note unless exported to PNG separately

    assets = []
    asset_comment = f"<!-- Assets: {', '.join(assets)} -->" if assets else "<!-- Assets: none -->"
    return asset_comment + "\n\n" + "\n".join(slides_out).rstrip() + "\n"


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    jira_path = Path(sys.argv[1]).resolve()
    if not jira_path.exists():
        print(f"Error: file not found: {jira_path}", file=sys.stderr)
        sys.exit(1)

    output_path = (
        Path(sys.argv[2]).resolve()
        if len(sys.argv) > 2
        else jira_path.with_name(jira_path.stem + "-slides.md")
    )

    try:
        md = convert(jira_path)
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(md, encoding="utf-8")
    slide_count = md.count("<!-- Slide number:")
    print(f"Created: {output_path} ({slide_count} slides)")


if __name__ == "__main__":
    main()
