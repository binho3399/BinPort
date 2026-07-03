#!/usr/bin/env python3
"""Fetch project images from Framer pages and embed them in markdown.

Header/footer/CTA images (Ho Binh profile, social icons, "Let's make an
impact" banner, etc.) are filtered out at the source by reusing the
heading classification from _restructure_images.py — they are never
downloaded in the first place.
"""

import re
import sys
import json
import subprocess
import urllib.parse
from pathlib import Path

# Reuse the same image/heading parser + filter as the restructure script
sys.path.insert(0, str(Path(__file__).parent))
from _restructure_images import (  # noqa: E402
    parse_events, is_footer_or_header, is_project_title,
)

BASE = Path("/Users/binho/Documents/cloned-web/sources/projects")

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

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

# Match framer image URLs and capture the full base path + filename
# Captures: (full_base_url, filename) where full_base_url has no query
IMG_PATTERNS = [
    re.compile(r'(https://framerusercontent\.com/images/[A-Za-z0-9]+\.(?:png|jpg|jpeg|webp|gif))'),
    re.compile(r'(https://framerusercontent\.com/assets/[A-Za-z0-9]+\.(?:png|jpg|jpeg|webp|gif))'),
]


def curl(url: str) -> str:
    r = subprocess.run(
        ["curl", "-sL", url, "-A", UA],
        capture_output=True, text=True, timeout=30,
    )
    return r.stdout


def extract_images(html: str) -> list[str]:
    """Return body+cover image URLs (skip header/footer/CTA).

    Walks the HTML for (heading, image) pairs in document order and drops
    any image whose preceding heading is a footer/header keyword. Images
    with no heading (top of page) and the project-title heading image are
    both kept — they become covers in the article.
    """
    events = parse_events(html)
    out: list[str] = []
    seen: set[str] = set()
    for heading, url in events:
        if heading is None or is_project_title(heading):
            pass  # keep: cover/hero images
        elif is_footer_or_header(heading):
            continue  # drop: footer/header/CTA
        else:
            pass  # keep: body content
        if url not in seen:
            seen.add(url)
            out.append(url)
    return out


def download(url: str, dest: Path) -> int:
    if dest.exists() and dest.stat().st_size > 0:
        return dest.stat().st_size
    r = subprocess.run(
        ["curl", "-sL", url, "-A", UA, "-o", str(dest)],
        capture_output=True, timeout=60,
    )
    return dest.stat().st_size if dest.exists() else -1


def update_markdown(md_path: Path, folder: str, images: list[str]) -> bool:
    text = md_path.read_text()
    # Skip if the markdown already has a Source Images gallery OR any inline
    # image references (i.e. it has been processed by _restructure_images.py).
    if "## Source Images" in text or re.search(r'!\[[^\]]*\]\(\./images/', text):
        return False
    if not images:
        return False
    section = "\n\n## Source Images\n\n"
    section += f"All visual assets fetched from the source page and stored locally.\n\n"
    for i, url in enumerate(images, 1):
        filename = Path(urllib.parse.urlparse(url).path).name
        # Caption: first 3 are cover/hero, rest numbered
        if i <= 3:
            label = f"cover-{i}"
        else:
            label = f"asset-{i - 3}"
        section += f"![{label}](./images/{filename})\n\n"
    md_path.write_text(text.rstrip() + section)
    return True


def main() -> int:
    summary = []
    for folder, url in PROJECTS:
        img_dir = BASE / folder / "images"
        img_dir.mkdir(parents=True, exist_ok=True)
        md_path = BASE / folder / "README.md"

        print(f"\n=== {folder} ===")
        html = curl(url)
        if not html:
            print(f"  FAIL: empty response for {url}")
            summary.append((folder, 0, 0, "fetch failed"))
            continue
        images = extract_images(html)
        print(f"  {len(images)} unique images")
        ok, fail = 0, 0
        for img_url in images:
            filename = Path(urllib.parse.urlparse(img_url).path).name
            dest = img_dir / filename
            size = download(img_url, dest)
            if size > 0:
                ok += 1
            else:
                fail += 1
        updated = update_markdown(md_path, folder, images)
        print(f"  downloaded: {ok}, failed: {fail}, markdown updated: {updated}")
        summary.append((folder, len(images), ok, "ok" if updated else "md skipped"))

    print("\n=== Summary ===")
    print(f"{'folder':<16} {'found':>6} {'ok':>4}  status")
    for folder, found, ok, status in summary:
        print(f"{folder:<16} {found:>6} {ok:>4}  {status}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
