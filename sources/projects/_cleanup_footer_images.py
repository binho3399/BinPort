#!/usr/bin/env python3
"""Remove header/footer images that are not referenced in the article body.

For each project folder:
  1. Parse README.md to find every image filename referenced via ![](./images/X)
  2. List every file in the corresponding images/ directory
  3. Delete the unreferenced ones (header/footer/social/CTA assets that
     Framer inlines into every page)

This is destructive — deleted files can be re-fetched by running
_fetch_assets.py again (it pulls them back from framerusercontent.com).
"""
import re
import sys
from pathlib import Path

BASE = Path("/Users/binho/Documents/cloned-web/sources/projects")

# Full projects only (skip the HouseNow / CarNow placeholders).
PROJECTS = [
    "01-temphu", "02-ichiban", "03-suzu-studio", "04-chus",
    "05-hoc-lieu", "06-dosi-in", "07-gentouch",
    "10-tabo-erp", "11-tabo-pos",
]

IMG_REF_RE = re.compile(r'!\[[^\]]*\]\(\./images/([^)]+)\)')

DRY_RUN = "--dry-run" in sys.argv


def main() -> int:
    total_deleted = 0
    total_saved = 0
    for folder in PROJECTS:
        md_path = BASE / folder / "README.md"
        img_dir = BASE / folder / "images"

        if not md_path.exists() or not img_dir.exists():
            continue

        # 1. Find body images referenced in README
        referenced = set(IMG_REF_RE.findall(md_path.read_text()))

        # 2. List everything on disk
        on_disk = {f.name for f in img_dir.iterdir() if f.is_file()}

        # 3. Unreferenced = on disk but not in body
        unreferenced = sorted(on_disk - referenced)

        if not unreferenced:
            print(f"{folder}: {len(referenced)} body, {len(on_disk)} on disk — nothing to remove")
            continue

        # 4. Delete (or just report in dry-run mode)
        saved = 0
        for fn in unreferenced:
            f = img_dir / fn
            saved += f.stat().st_size
            if not DRY_RUN:
                f.unlink()
        total_deleted += len(unreferenced)
        total_saved += saved

        size_kb = saved / 1024
        verb = "would remove" if DRY_RUN else "removed"
        print(f"{folder}: {len(referenced)} body, {len(on_disk)} on disk → "
              f"{verb} {len(unreferenced)} header/footer ({size_kb:.1f} KB)")
        if DRY_RUN:
            for fn in unreferenced:
                print(f"    {fn}")

    total_kb = total_saved / 1024
    verb = "would remove" if DRY_RUN else "removed"
    print(f"\nTotal: {verb} {total_deleted} images, {total_kb:.1f} KB freed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
