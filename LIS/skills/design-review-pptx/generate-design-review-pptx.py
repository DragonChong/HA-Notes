#!/usr/bin/env python3
"""
Generate HA/LIS CP3 design review PPTX from Markdown using the canonical template.

Usage:
    python generate-design-review-pptx.py <input.md> [output.pptx]
    python generate-design-review-pptx.py deck.md

If output path is omitted, writes {input-basename}.pptx next to the markdown file.
Template: ha-lis-design-review-template.pptx (same master as LIS-10672 / LIS-10583 decks).
"""

from __future__ import annotations

import re
import shutil
import sys
from pathlib import Path

from pptx import Presentation
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt

SKILL_DIR = Path(__file__).resolve().parent
TEMPLATE = SKILL_DIR / "ha-lis-design-review-template.pptx"

# Directory the input Markdown file lives in — relative image references
# (`![](diagram.png)`) resolve against this. Set by main() before generation.
MD_DIR = Path(".")

LAYOUT_TITLE = 0
LAYOUT_TITLE_CONTENT = 1
LAYOUT_TITLE_ONLY = 7

IMAGE_RE = re.compile(r"^!\[[^\]]*\]\(([^)]+)\)$")


def delete_all_slides(prs: Presentation) -> None:
    while len(prs.slides) > 0:
        slide_id = prs.slides._sldIdLst[0]
        r_id = slide_id.rId
        prs.part.drop_rel(r_id)
        del prs.slides._sldIdLst[0]


def body_placeholder(slide):
    for shape in slide.placeholders:
        if shape.placeholder_format.idx != 0:
            return shape
    raise RuntimeError("Body placeholder not found")


def clear_text_frame(text_frame) -> None:
    text_frame.clear()
    if not text_frame.paragraphs:
        text_frame.add_paragraph()


def parse_slides(md_content: str) -> list[dict]:
    """Parse design-review Markdown into slide dicts."""
    parts = re.split(r"<!--\s*Slide number:\s*\d+\s*-->\s*", md_content)
    slides = []

    for part in parts:
        part = part.strip()
        if not part:
            continue

        lines = part.splitlines()
        if not lines or not lines[0].startswith("# "):
            continue

        title = lines[0][2:].strip()
        body = [line.rstrip() for line in lines[1:] if line.strip()]
        slides.append({"title": title, "body": body})

    return slides


def extract_image(body: list[str]) -> tuple[str | None, list[str]]:
    """Pull the first `![alt](path)` reference out of a slide body.

    Returns (image_ref, remaining_body). Only one image per slide is
    supported, matching the documented slide-type patterns; any further
    image lines are left in the body as text.
    """
    image_ref: str | None = None
    remaining: list[str] = []

    for line in body:
        match = IMAGE_RE.match(line.strip())
        if match and image_ref is None:
            image_ref = match.group(1)
            continue
        remaining.append(line)

    return image_ref, remaining


def is_table_line(line: str) -> bool:
    return line.strip().startswith("|")


def parse_markdown_table(body: list[str]) -> tuple[list[str], list[list[str]], list[str]]:
    """Return headers, rows, and footnotes from body lines."""
    table_lines: list[str] = []
    footnotes: list[str] = []
    in_table = False

    for line in body:
        if is_table_line(line):
            table_lines.append(line)
            in_table = True
        elif in_table:
            footnotes.append(line.strip())

    if not table_lines:
        return [], [], footnotes

    rows_raw = [
        [cell.strip() for cell in line.strip().strip("|").split("|")]
        for line in table_lines
        if not re.match(r"^\|\s*-+", line.strip())
    ]
    if not rows_raw:
        return [], [], footnotes

    return rows_raw[0], rows_raw[1:], footnotes


def parse_code_block(body: list[str]) -> tuple[str | None, list[str]]:
    """Extract fenced code block and trailing notes."""
    text = "\n".join(body)
    match = re.search(r"```(?:\w+)?\n(.*?)```", text, re.DOTALL)
    if not match:
        return None, body

    code = match.group(1).strip()
    before, after = text[: match.start()], text[match.end() :]
    notes = [line.strip() for line in (before + after).splitlines() if line.strip()]
    return code, notes


def classify_slide(slide: dict, index: int) -> str:
    title = slide["title"]
    body = slide["body"]

    if title.strip().upper() == "Q&A":
        return "qa"
    if index == 0:
        # Slide order guarantees the first slide is the title slide — don't
        # gate this on the literal string "CP3" appearing in the body, since
        # that breaks silently for any other review forum or a typo.
        return "title"
    if title.strip().lower() == "agenda":
        return "agenda"
    if "```" in "\n".join(body):
        # Check for a code fence before table lines: a code sample (e.g. SQL
        # using `||` concatenation) can contain a line starting with "|"
        # and would otherwise be misclassified as a table slide.
        return "code"
    if any(is_table_line(line) for line in body):
        return "table"
    return "bullets"


def add_title_slide(prs: Presentation, slide: dict) -> None:
    s = prs.slides.add_slide(prs.slide_layouts[LAYOUT_TITLE])
    body = slide["body"]

    service_line = ""
    meta_lines: list[str] = []
    for line in body:
        if line.startswith("(") and line.endswith(")"):
            service_line = line
        else:
            meta_lines.append(line)

    title_text = slide["title"]
    if service_line:
        title_text = f"{title_text}\n{service_line}"

    s.shapes.title.text = title_text

    for shape in s.placeholders:
        if shape.placeholder_format.idx == 1:
            shape.text = "\n".join(meta_lines)
            break


def add_agenda_slide(prs: Presentation, slide: dict) -> None:
    s = prs.slides.add_slide(prs.slide_layouts[LAYOUT_TITLE_CONTENT])
    s.shapes.title.text = slide["title"]
    body = body_placeholder(s)
    clear_text_frame(body.text_frame)

    for i, item in enumerate(slide["body"]):
        p = body.text_frame.paragraphs[0] if i == 0 else body.text_frame.add_paragraph()
        p.text = item
        p.font.bold = True


def add_bullet_slide(prs: Presentation, slide: dict) -> None:
    s = prs.slides.add_slide(prs.slide_layouts[LAYOUT_TITLE_CONTENT])
    s.shapes.title.text = slide["title"]
    body = body_placeholder(s)
    clear_text_frame(body.text_frame)

    for i, line in enumerate(slide["body"]):
        level = 0
        text = line
        if line.startswith("- "):
            text = line[2:]
            level = 1
        elif line.startswith("  ") or line.startswith("\t"):
            text = line.strip()
            level = 1

        p = body.text_frame.paragraphs[0] if i == 0 else body.text_frame.add_paragraph()
        p.text = text
        p.level = level


def add_table_slide(prs: Presentation, slide: dict) -> None:
    s = prs.slides.add_slide(prs.slide_layouts[LAYOUT_TITLE_CONTENT])
    s.shapes.title.text = slide["title"]

    headers, rows, footnotes = parse_markdown_table(slide["body"])
    if not headers:
        add_bullet_slide(prs, slide)
        return

    table_rows = [headers, *rows]
    row_count = len(table_rows)
    col_count = len(headers)
    table_shape = s.shapes.add_table(
        row_count,
        col_count,
        Inches(0.9),
        Inches(1.35),
        Inches(8.8),
        Inches(max(0.38 * row_count, 0.8)),
    )
    table = table_shape.table

    for r, row in enumerate(table_rows):
        for c, value in enumerate(row):
            cell = table.cell(r, c)
            cell.text = value
            for paragraph in cell.text_frame.paragraphs:
                paragraph.font.size = Pt(12 if r == 0 else 11)
                paragraph.font.bold = r == 0

    if footnotes:
        top = Inches(1.35 + 0.38 * row_count + 0.15)
        box = s.shapes.add_textbox(Inches(0.9), top, Inches(8.8), Inches(1.2))
        tf = box.text_frame
        tf.word_wrap = True
        for i, note in enumerate(footnotes):
            p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
            p.text = note
            p.font.size = Pt(11)


def add_code_slide(prs: Presentation, slide: dict) -> None:
    s = prs.slides.add_slide(prs.slide_layouts[LAYOUT_TITLE_CONTENT])
    s.shapes.title.text = slide["title"]

    code, notes = parse_code_block(slide["body"])
    if not code:
        add_bullet_slide(prs, slide)
        return

    box = s.shapes.add_textbox(Inches(0.9), Inches(1.25), Inches(8.8), Inches(3.2))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = code
    p.font.name = "Consolas"
    p.font.size = Pt(10)

    if notes:
        note_box = s.shapes.add_textbox(Inches(0.9), Inches(4.55), Inches(8.8), Inches(0.8))
        note_tf = note_box.text_frame
        note_tf.word_wrap = True
        for i, note in enumerate(notes):
            np = note_tf.paragraphs[0] if i == 0 else note_tf.add_paragraph()
            np.text = note
            np.font.size = Pt(11)


def embed_image(slide, image_ref: str, kind: str, has_text: bool) -> None:
    """Add the diagram referenced by a slide's `![](...)` line as a picture.

    - No other body text (pure diagram slide): dominant, centred image.
    - Body text present (e.g. Architecture Diagram labels, Flow steps):
      image placed beside the text on the right, and the bullet/agenda
      content placeholder is narrowed so the two don't overlap.
    """
    image_path = Path(image_ref)
    if not image_path.is_absolute():
        image_path = (MD_DIR / image_path).resolve()

    if not image_path.exists():
        print(f"Warning: image not found, skipping embed: {image_path}", file=sys.stderr)
        return

    if not has_text:
        slide.shapes.add_picture(str(image_path), Inches(1.3), Inches(1.3), width=Inches(7.4))
        return

    if kind in ("bullets", "agenda"):
        try:
            body = body_placeholder(slide)
            body.width = Inches(4.6)
        except RuntimeError:
            pass

    slide.shapes.add_picture(str(image_path), Inches(5.4), Inches(1.3), width=Inches(4.0))


def add_qa_slide(prs: Presentation) -> None:
    s = prs.slides.add_slide(prs.slide_layouts[LAYOUT_TITLE_ONLY])
    title = s.shapes.title
    title.text = "Q&A"
    title.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
    title.text_frame.paragraphs[0].font.size = Pt(48)
    title.text_frame.vertical_anchor = MSO_ANCHOR.MIDDLE


def build_presentation(slides: list[dict], output_path: Path) -> Presentation:
    if not TEMPLATE.exists():
        raise FileNotFoundError(
            f"Template not found: {TEMPLATE}\n"
            "Ensure ha-lis-design-review-template.pptx is in the skill folder."
        )

    shutil.copy(TEMPLATE, output_path)
    prs = Presentation(output_path)
    delete_all_slides(prs)

    handlers = {
        "title": add_title_slide,
        "agenda": add_agenda_slide,
        "bullets": add_bullet_slide,
        "table": add_table_slide,
        "code": add_code_slide,
        "qa": lambda p, _: add_qa_slide(p),
    }

    for i, slide in enumerate(slides):
        image_ref, body_wo_image = extract_image(slide["body"])
        working_slide = {"title": slide["title"], "body": body_wo_image}

        kind = classify_slide(working_slide, i)
        handler = handlers[kind]
        if kind == "qa":
            handler(prs, working_slide)
        else:
            handler(prs, working_slide)

        if image_ref:
            embed_image(prs.slides[-1], image_ref, kind, has_text=bool(body_wo_image))

    return prs


def main() -> None:
    global MD_DIR

    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    md_path = Path(sys.argv[1]).resolve()
    if not md_path.exists():
        print(f"Error: Markdown file not found: {md_path}", file=sys.stderr)
        sys.exit(1)

    MD_DIR = md_path.parent

    output_path = (
        Path(sys.argv[2]).resolve()
        if len(sys.argv) > 2
        else md_path.with_suffix(".pptx")
    )

    md_content = md_path.read_text(encoding="utf-8")
    slides = parse_slides(md_content)
    if not slides:
        print("Error: No slides parsed from markdown.", file=sys.stderr)
        sys.exit(1)

    prs = build_presentation(slides, output_path)
    prs.save(output_path)
    print(f"Created: {output_path} ({len(slides)} slides)")


if __name__ == "__main__":
    main()
