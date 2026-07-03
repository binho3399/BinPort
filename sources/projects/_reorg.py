#!/usr/bin/env python3
"""Reorganize the projects tree: one numbered folder per project containing
its markdown (as README.md) and images/ subfolder, ordered by source page.

Source order from https://binh.framer.website/projects:
  1. Temphu
  2. Ichiban
  3. SuZu Studio
  4. Chus
  5. Hoc Lieu
  6. Dosi-in
  7. Gentouch
"""
import shutil
from pathlib import Path

BASE = Path("/Users/binho/Documents/cloned-web/sources/projects")

PROJECTS = [
    "temphu",
    "ichiban",
    "suzu-studio",
    "chus",
    "hoc-lieu",
    "dosi-in",
    "gentouch",
]


def main() -> int:
    for i, slug in enumerate(PROJECTS, 1):
        new_name = f"{i:02d}-{slug}"
        new_dir = BASE / new_name
        new_dir.mkdir(exist_ok=True)

        old_md = BASE / f"{slug}.md"
        new_md = new_dir / "README.md"
        if old_md.exists():
            shutil.move(str(old_md), str(new_md))

        old_img = BASE / slug / "images"
        new_img = new_dir / "images"
        if old_img.exists():
            if new_img.exists():
                shutil.rmtree(new_img)
            shutil.move(str(old_img), str(new_img))

        # Drop the now-empty old slug dir
        old_slug_dir = BASE / slug
        if old_slug_dir.exists():
            shutil.rmtree(old_slug_dir)

        # Rewrite image paths: ./<slug>/images/ -> ./images/
        if new_md.exists():
            text = new_md.read_text()
            text = text.replace(f"./{slug}/images/", "./images/")
            new_md.write_text(text)

        image_count = len(list(new_img.glob("*"))) if new_img.exists() else 0
        print(f"  {new_name}/  README.md + {image_count} images")

    print("\nDone.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
