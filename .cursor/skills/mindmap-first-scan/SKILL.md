---
name: mindmap-first-scan
description: Uses the codebase Mermaid mindmap as the first navigation step before code edits. Use when the task involves modifying code, refactoring, fixing bugs, or implementing features so scanning starts from the mapped module scope instead of broad repository-wide exploration.
---

# Mindmap-First Scan

## Purpose

Use `docs/codebase-mindmap.md` as the mandatory first step for code tasks, then narrow search scope to the smallest relevant area before reading files deeply.

## Required workflow

1. Refresh map confidence:
   - Run `pnpm map:check`.
   - If stale, run `pnpm map:generate` before code exploration.

2. Locate candidate modules from the mindmap:
   - Read `docs/codebase-mindmap.md`.
   - Identify likely branches (for this repo usually `src/app`, `src/components`, `src/lib`, `src/config`, `scripts`, `docs`).

3. Constrain search to mapped scope first:
   - Run targeted `rg` only inside selected branches.
   - Read only the files needed to confirm behavior and edit points.

4. Expand scope only when justified:
   - Expand to adjacent branches only if evidence in scoped search is insufficient.
   - Full-repo scan is last resort.

5. After structural changes:
   - If directories/files are added, moved, or removed, regenerate map with `pnpm map:generate`.
   - Re-run `pnpm map:check` to verify consistency.

## Decision rubric

- Clear single-file change:
  - Read mindmap quickly, confirm branch, jump straight to target file.
- Multi-file feature/refactor:
  - Use mindmap to pick 1-2 primary branches, search there first, then widen if needed.
- Unclear ownership bug:
  - Start with the runtime entry branch in mindmap (`src/app`), then follow related nodes.

## Guardrails

- Do not start with broad repository scanning unless scoped searches fail.
- Do not skip mindmap lookup for code-edit tasks.
- Prefer deterministic, repeatable search paths over ad-hoc exploration.

## Edge cases and fallbacks

- Missing map file:
  - If `docs/codebase-mindmap.md` is missing, run `pnpm map:generate` immediately and continue.
- Stale map during long tasks:
  - Re-run `pnpm map:check` before major edits and before final validation.
- Parallel agents:
  - Only one agent should run `pnpm map:generate`; other agents should use `pnpm map:check`.
- Rename/move heavy changes:
  - Regenerate map right after structural moves instead of waiting until end of task.
- Scoped search returns no signal:
  - Expand to adjacent branches first; use full-repo scan only as last resort.
- Mindmap vs runtime behavior mismatch:
  - Use mindmap for navigation, but always confirm logic in source code before editing.

## Repo-specific references

- Mindmap output: `docs/codebase-mindmap.md`
- Generator: `scripts/generate-codebase-mindmap.mjs`
- Config: `scripts/mindmap.config.json`
- Watch mode: `pnpm map:watch`

## Quick command set

```bash
pnpm map:check
pnpm map:generate
pnpm map:watch
```
