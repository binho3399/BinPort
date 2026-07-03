# Sources: Projects

Archived source articles scraped from [binh.framer.website/projects](https://binh.framer.website/projects), in the order they appear on the source site (with placeholder slots where the project has no published URL yet).

Each numbered project folder is self-contained: a `README.md` (the article) and an `images/` directory of all PNG/JPG assets pulled from the source. Original source URL and fetch date live in the file's frontmatter.

| # | Folder | Project | Role | Images | Status | Live site |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | [01-temphu/](./01-temphu) | Temphu | UXUI Lead | 10 | full | https://temphu.com |
| 02 | [02-ichiban/](./02-ichiban) | Ichiban | UXUI Leader | 24 | full | https://Ichibanco.vn |
| 03 | [03-suzu-studio/](./03-suzu-studio) | SuZu Studio | Project Manager | 14 | full | https://dev-suzustudio.framer.website |
| 04 | [04-chus/](./04-chus) | Chus | UXUI Leader | 16 | full | https://chus.vn |
| 05 | [05-hoc-lieu/](./05-hoc-lieu) | Hoc Lieu | UX/UI Designer | 14 | full | https://www.figma.com/proto/USTbxwBllAgm3kO8NgO4d1 |
| 06 | [06-dosi-in/](./06-dosi-in) | Dosi-in | UXUI Leader | 29 | full | https://dosi-in.com |
| 07 | [07-gentouch/](./07-gentouch) | Gentouch | UI Designer | 9 | full | https://gentouchstudios.com |
| 08 | [08-housenow/](./08-housenow) | HouseNow | — | 0 | placeholder | (no source URL) |
| 09 | [09-carnow/](./09-carnow) | CarNow | — | 0 | placeholder | (no source URL) |
| 10 | [10-tabo-erp/](./10-tabo-erp) | Tabo ERP | UI Designer | 9 | full¹ | https://gentouchstudios.com |
| 11 | [11-tabo-pos/](./11-tabo-pos) | Wholesale POS | UI Designer | 9 | full¹ | https://gentouchstudios.com |

¹ **Note on 10 / 11:** both pages exist on the Framer site (confirmed via `sitemap.xml`) but their body still uses the Gentouchstudios template copy and images. The archive reflects the source as-is.

**Totals:** 11 articles (9 full + 2 placeholder), 134 body images (4 cover + 5–25 in-section per project), 0 header/footer/CTA images, ~50 MB on disk.

## Layout

```
sources/projects/
├── README.md                       # this file
├── _fetch_assets.py                # downloads body images only (skips header/footer)
├── _restructure_images.py          # rewrites each README.md with inline images
├── _cleanup_footer_images.py       # legacy: remove already-downloaded header/footer files
├── _reorg.py                       # one-time script: produced the numbered layout
├── 01-temphu/
│   ├── README.md                   # article body, images inline
│   └── images/                     # 10 body PNG/JPG assets
├── 02-ichiban/         …  (24 images)
├── 03-suzu-studio/     …  (14 images)
├── 04-chus/            …  (16 images)
├── 05-hoc-lieu/        …  (14 images)
├── 06-dosi-in/         …  (29 images)
├── 07-gentouch/        …  (9 images)
├── 08-housenow/
│   ├── README.md                   # placeholder (no source URL)
│   └── images/                     # empty
├── 09-carnow/
│   ├── README.md                   # placeholder (no source URL)
│   └── images/                     # empty
├── 10-tabo-erp/        …  (9 images, template body)
└── 11-tabo-pos/        …  (9 images, template body)
```

## HouseNow / CarNow placeholders

The `/projects` page and `sitemap.xml` of `binh.framer.website` list only the 7 original published `/works/*` pages (plus `tabo-erp` / `tabo-pos` that are not linked from the index). HouseNow and CarNow are not on this site.

Slots 08 and 09 exist so the numbering is reserved. To fill them in, drop the case-study markdown into `<NN-slug>/README.md`, place images under `<NN-slug>/images/`, and (optionally) add the `(folder, url)` entry to the `PROJECTS` list in `_fetch_assets.py` and `_restructure_images.py` so the scripts can refresh them.

## How images are placed

Images are pulled from the source HTML and routed to the correct position in the README using a heading-to-section keyword map. The same classifier is used at fetch time and at restructure time, so the on-disk `images/` directory and the in-markdown references stay in sync.

1. **Covers (3–4 per project):** images that appear before any heading, plus the project-title heading image. They sit at the top of `README.md`, just under the frontmatter.
2. **In-section images:** the heading text immediately before each image is matched against a keyword table (`design sprint` → Implementation Process, `sitemap` → Sitemap, `user persona` → User Persona(s), `couple of screens` → UI Design, …). Matching images are inserted at the end of the target section, just before the next `##` header.
3. **Header / footer / CTA images** (Ho Binh profile, social icons, "Let's make an impact" banner, stats block, "Back to top", nav chrome, …) are filtered out at the source — `_fetch_assets.py` never downloads them, and `_restructure_images.py` never references them.

The keyword map covers the recurring headings across all 9 archived articles. To add a new pattern, edit `KEYWORD_MAP` in `_restructure_images.py` and re-run.

## Re-running the pipeline

```bash
python3 _fetch_assets.py        # download missing body images, skip header/footer
python3 _restructure_images.py  # rebuild inline image placement
```

Both scripts are idempotent and body-only by design:
- `_fetch_assets.py` imports the heading classifier from `_restructure_images.py`, so header/footer images are skipped at the source. It only writes a `## Source Images` gallery to a README that has no image references at all (i.e. a brand-new project that has not been processed yet).
- `_restructure_images.py` strips any previously inserted image lines (cover, in-section, gallery) before re-inserting them, so re-runs do not duplicate anything.

`_cleanup_footer_images.py` is a one-time legacy utility that removes header/footer images that were downloaded by older versions of `_fetch_assets.py`. It accepts `--dry-run` to preview deletions.

`_reorg.py` is a one-time script that produced the numbered layout. It is kept for reference but should not be re-run unless you want to re-flatten the structure.

## Notes

- Asset filenames are the original Framer asset IDs (e.g. `sOW9yYvauDsGRY4iHqeHSMion0.png`). They are stable identifiers, not human-readable, but preserve the link back to the source CDN.
- Only PNG/JPG/JPEG/WEBP/GIF are captured. SVG icons, font files (`.woff2`), and Framer JS chunks (`.mjs`) are intentionally excluded — add a second pass to `_fetch_assets.py` if you want them too.
- Sections that were placeholders in the source (e.g. "Iteration & Validation", "Outcome & Impact", "Lessons Learned") are preserved as headings so the article structure is intact, but they have no images attached.
- If a section is later filled in on the source site, re-run `_restructure_images.py` and the new images will be routed automatically.
