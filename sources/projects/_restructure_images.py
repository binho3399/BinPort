#!/usr/bin/env python3
"""Re-arrange images in markdown articles to match the source page structure.

Strategy:
  1. Parse the source HTML to get (heading_text, image_filename) pairs in document order.
  2. Skip footer/CTA images and the project title heading.
  3. For each remaining image, map its HTML heading to a markdown section heading
     using a keyword table.
  4. Rewrite the markdown:
       - Remove the existing "## Source Images" gallery (if any).
       - Insert cover images right after the H1.
       - Insert section images just before the next section header
         (i.e. at the end of the target section's content).
       - Any images that could not be confidently placed go into a small
         "## Other Source Images" appendix with the original heading as a caption.
"""
import re
import subprocess
import sys
from pathlib import Path
from typing import List, Optional, Tuple, Dict

BASE = Path("/Users/binho/Documents/cloned-web/sources/projects")
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

# (folder, source url) — folder uses the "NN-slug" prefix from the reorg.
PROJECTS = [
    ("01-temphu",      "https://binh.framer.website/works/temphu"),
    ("02-ichiban",     "https://binh.framer.website/works/tabo-ecommerce-b2b"),
    ("03-suzu-studio", "https://binh.framer.website/works/suzu-studio"),
    ("04-chus",        "https://binh.framer.website/works/chus"),
    ("05-hoc-lieu",    "https://binh.framer.website/works/hoc-lieu"),
    ("06-dosi-in",     "https://binh.framer.website/works/dosi-in"),
    ("07-gentouch",    "https://binh.framer.website/works/gentouch"),
    ("10-tabo-erp",    "https://binh.framer.website/works/tabo-erp"),
    ("11-tabo-pos",    "https://binh.framer.website/works/tabo-pos"),
]

# Headings that signal a footer/CTA region — images under these are dropped.
FOOTER_KEYWORDS = (
    "let's make an impact", "let's create", "let's ",
    "ho binh", "contact me", "available for freelance",
    "back to top", "years of experience", "client retention",
    "satisfied clients", "projects finished", "screens delivered",
    "copyright", "created by", "book a call", "hit me up",
    "templifica", "zalo", "linkedin", "facebook",
    "available on", "role", "scope",  # article header meta
)

# Project title headings — these images are visually covers, just placed
# after the page H1. We merge them with the "no heading" cover group.
PROJECT_TITLE_KEYWORDS = (
    "temphu", "ichiban", "suzu studio", "chus",
    "hoc lieu", "dosi-in", "dosi in", "gentouch",
    "tabo erp", "tabo pos", "wholesale pos",
)

# Map HTML heading text → markdown section heading.
# First heading_keyword that appears in the HTML heading wins;
# then first MD section whose lowercase heading contains any of the
# candidates wins.
KEYWORD_MAP = [
    # Process / work
    ("design sprint",          ["implementation process", "design process", "work progress", "work process"]),
    ("implementation process", ["implementation process"]),

    # Sitemap & IA
    ("website built by lucidchart", ["sitemap", "information architect", "information architecture"]),
    ("sitemap list",                ["sitemap", "information architect", "information architecture"]),
    ("map list of the pages",       ["sitemap", "information architect", "information architecture"]),
    ("information of each page",    ["information architecture"]),

    # User flow / flowchart
    ("description of the user flow", ["flowchart", "user flow"]),
    ("example of user flow",         ["user flow", "flowchart"]),
    ("diagrams for users",           ["user flow", "flowchart"]),

    # Wireframes
    ("wireframe screens",     ["lof i wireframe", "wireframe"]),
    ("mobile wireframes",     ["lof i wireframe", "wireframe"]),
    ("example of a stream",   ["design sprint"]),  # hoc-lieu wireframe sketch
    ("desktop",               ["wireframe"]),
    ("mobile",                ["wireframe"]),

    # Design Sprint subsections (Map to map, Goal: X)
    ("map to map", ["design sprint"]),
    ("goal :",     ["design sprint"]),

    # Research (Ichiban / shared)
    ("swot analysis",             ["competitor analysis"]),
    ("feature matrix",            ["competitor analysis"]),
    ("in the market research",    ["competitor analysis"]),
    ("competitor analysis",       ["competitor analysis"]),
    ("competitor",                ["competitor analysis"]),
    ("business model canvas",     ["stakeholder interview", "research"]),
    ("value proposition canvas",  ["stakeholder interview", "research"]),
    ("user persona",              ["user persona", "user research", "proto-persona"]),
    ("at this phase, we only focus", ["user persona", "proto-persona"]),
    ("at this stage, we only focus", ["user persona", "proto-persona"]),
    ("empathy map",               ["empathy mapping", "user research"]),
    ("empath",                    ["empathy mapping", "user research"]),  # typo-tolerant
    ("empth",                     ["empathy mapping", "user research"]),  # "Empthy" typo
    ("journey map",               ["user research", "user persona"]),

    # Design System
    ("to ensure consistency",          ["design system"]),
    ("we just defined the brand font", ["design system"]),
    ("components we defined",          ["design system"]),
    ("in the design system of the project", ["design system"]),

    # UI Design
    ("ui design",                            ["ui design"]),
    ("couple of screens from the marketing", ["ui design"]),
    ("couple of screens from the e-commerce", ["ui design"]),
    ("couple of screens from the project",   ["ui design"]),
    ("screens from project management",      ["ui design"]),

    # Devices Mockup
    ("devices mockup", ["devices mockup"]),

    # Case Study
    ("case study", ["case study"]),
]


def curl(url: str) -> str:
    r = subprocess.run(
        ["curl", "-sL", url, "-A", UA], capture_output=True, text=True, timeout=30,
    )
    return r.stdout


def parse_events(html: str) -> List[Tuple[Optional[str], str]]:
    """Return [(heading_text or None, image_filename)] in document order, deduped."""
    seen, events, current = set(), [], None
    for m in re.finditer(
        r'<h[1-6][^>]*>(.*?)</h[1-6]>|'
        r'(https://framerusercontent\.com/(?:images|assets)/[A-Za-z0-9]+\.(?:png|jpg|jpeg|webp|gif))',
        html, re.DOTALL,
    ):
        if m.group(1) is not None:
            t = re.sub(r'<[^>]+>', ' ', m.group(1))
            t = re.sub(r'\s+', ' ', t).strip()
            current = t
        else:
            url = m.group(2).split('?')[0]
            if url in seen:
                continue
            seen.add(url)
            events.append((current, url.split('/')[-1]))
    return events


def _normalize(text: str) -> str:
    """Lowercase + replace typographic quotes with straight apostrophes."""
    return text.lower().replace('\u2019', "'").replace('\u2018', "'").replace('\u201c', '"').replace('\u201d', '"')


def is_footer_or_header(text: str) -> bool:
    if not text:
        return False
    t = _normalize(text)
    return any(kw in t for kw in FOOTER_KEYWORDS)


def is_project_title(text: str) -> bool:
    """True when the heading IS the project name or starts with it
    (e.g. "Tabo ERP - eCommerce" should still match the "tabo erp" project)."""
    if not text:
        return False
    t = _normalize(text).strip().rstrip(':').strip()
    for kw in PROJECT_TITLE_KEYWORDS:
        if t == kw or t == kw.replace('-', ' '):
            return True
        if t.startswith(kw + ' ') or t.startswith(kw + '-'):
            return True
    return False


def heading_to_md_section(heading_text: Optional[str], md_sections_lower: List[str]) -> Optional[str]:
    if not heading_text:
        return None
    t = _normalize(heading_text)
    for kw, candidates in KEYWORD_MAP:
        if kw in t:
            for cand in candidates:
                for md in md_sections_lower:
                    if cand in md:
                        return md
    return None


def get_md_section_headings(md_text: str) -> List[Tuple[str, int]]:
    """Return [(heading_text, line_idx)] for ## and ### headings only (skip H1)."""
    out = []
    for i, line in enumerate(md_text.split('\n')):
        m = re.match(r'^(#{2,3})\s+(.+)', line)
        if m:
            out.append((m.group(2).strip(), i))
    return out


def clean_image_lines(md_text: str) -> str:
    """Remove all pure image markdown lines and collapse excessive blank lines.
    Makes the script idempotent: re-runs won't accumulate duplicate images."""
    # Strip lines that are just an image reference
    md_text = re.sub(r'^!\[.*?\]\([^)]*images/[^)]+\)\s*\n', '', md_text, flags=re.MULTILINE)
    # Collapse 3+ newlines to 2 (one blank line max)
    md_text = re.sub(r'\n{3,}', '\n\n', md_text)
    return md_text


def restructure(md_path: Path, folder: str, html: str) -> dict:
    events = parse_events(html)
    md_text = md_path.read_text()
    # Clean any previously inserted image lines so re-runs are idempotent
    md_text = clean_image_lines(md_text)
    md_section_headings = get_md_section_headings(md_text)
    md_sections_lower = [h.lower() for h, _ in md_section_headings]

    covers: List[str] = []
    section_images: Dict[str, List[str]] = {}
    skipped_footer = 0
    skipped_unmatched: List[Tuple[str, str]] = []

    # "Outcome" headings in research context carry visuals of the preceding
    # research artifact (BMC, VPC, Journey Map, etc.). Track the last
    # known section so we can attach them there.
    last_known_section: Optional[str] = None

    for heading, filename in events:
        if heading is None or is_project_title(heading):
            covers.append(filename)
            continue
        if is_footer_or_header(heading):
            skipped_footer += 1
            continue
        if _normalize(heading).strip() == "outcome":
            # Attach to the most recently mapped section
            if last_known_section is not None:
                section_images.setdefault(last_known_section, []).append(filename)
            else:
                skipped_unmatched.append((heading, filename))
            continue
        target = heading_to_md_section(heading, md_sections_lower)
        if target is None:
            skipped_unmatched.append((heading, filename))
            continue
        section_images.setdefault(target, []).append(filename)
        last_known_section = target

    # Drop old gallery + old "Other Source Images" appendix
    md_text = re.sub(r'\n+## Source Images\n.*$', '', md_text, flags=re.DOTALL)
    md_text = re.sub(r'\n+## Other Source Images\n.*$', '', md_text, flags=re.DOTALL)
    lines = md_text.split('\n')

    # Re-scan section headings after gallery removal
    md_section_headings = get_md_section_headings('\n'.join(lines))

    # Build insertions: (line_idx, image_md_block) — insert at end of each section
    insertions: List[Tuple[int, str]] = []
    for sec_lower, filenames in section_images.items():
        start = next((idx for h, idx in md_section_headings if h.lower() == sec_lower), None)
        if start is None:
            continue
        next_starts = [idx for h, idx in md_section_headings if idx > start]
        end = min(next_starts) if next_starts else len(lines)
        img_block_lines = [f"![{sec_lower}-{i+1}](./images/{fn})" for i, fn in enumerate(filenames)]
        block = '\n\n' + '\n\n'.join(img_block_lines) + '\n'
        insertions.append((end, block))

    # Apply insertions in reverse line order
    insertions.sort(key=lambda x: -x[0])
    for line_idx, block in insertions:
        lines.insert(line_idx, block)

    # Insert cover images after H1 (or after frontmatter)
    if covers:
        h1_idx = next(
            (i for i, line in enumerate(lines) if re.match(r'^#\s+', line) and not line.startswith('##')),
            None,
        )
        insert_at = 0
        if lines and lines[0].strip() == '---':
            for i in range(1, len(lines)):
                if lines[i].strip() == '---':
                    insert_at = i + 1
                    break
        elif h1_idx is not None:
            insert_at = h1_idx + 1
        cover_block = '\n' + ''.join(
            f"\n![cover-{i+1}](./images/{fn})" for i, fn in enumerate(covers)
        ) + '\n'
        lines.insert(insert_at, cover_block)

    # Unmatched → "Other Source Images" appendix
    if skipped_unmatched:
        other_lines = ['\n\n## Other Source Images\n',
                       'These images could not be confidently placed in a specific section.\n']
        for heading, fn in skipped_unmatched:
            other_lines.append(f"\n*Context: {heading[:80]}*\n")
            other_lines.append(f"\n![{fn}](./images/{fn})")
        other_lines.append('\n')
        lines.append(''.join(other_lines))

    md_path.write_text('\n'.join(lines).rstrip() + '\n')

    return {
        'covers': len(covers),
        'in_section': sum(len(v) for v in section_images.values()),
        'footer_skipped': skipped_footer,
        'unmatched': len(skipped_unmatched),
        'sections_hit': sorted(section_images.keys()),
    }


def main() -> int:
    for folder, url in PROJECTS:
        print(f"\n=== {folder} ===")
        html = curl(url)
        if not html:
            print(f"  FAIL: empty response for {url}")
            continue
        md_path = BASE / folder / "README.md"
        result = restructure(md_path, folder, html)
        print(f"  covers: {result['covers']}, in-section: {result['in_section']}, "
              f"footer skipped: {result['footer_skipped']}, unmatched: {result['unmatched']}")
        print(f"  sections: {', '.join(result['sections_hit'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
