# BinPort Portfolio Site

Next.js portfolio site with content-driven pages and an auto-generated Mermaid codebase mindmap.

## Tech Stack

- Framework: Next.js 16 (App Router)
- UI: React 19 + React DOM 19
- Language: TypeScript 5
- Styling: Tailwind CSS 4
- Content: Markdown (`gray-matter`, `reading-time`)
- Linting: ESLint 9 + `eslint-config-next`
- Package manager: pnpm 10
- Automation: Node.js scripts for Mermaid mindmap generate/watch/check/pre-commit

## Prerequisites

- Node.js `20.19.0` (see `.nvmrc`)
- pnpm `10.x`

## Setup

```bash
pnpm install
cp .env.example .env.local
```

## Development

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
pnpm lint
pnpm build
```

## Codebase mindmap workflow

```bash
pnpm map:generate   # regenerate docs/codebase-mindmap.md
pnpm map:watch      # auto-regenerate on structural changes
pnpm map:check      # verify mindmap is up to date
pnpm map:precommit  # pre-commit helper (used by .husky/pre-commit)
```

Mindmap output file:

- `docs/codebase-mindmap.md`

## Project structure (high level)

- `src/app` - Next.js routes and pages
- `src/components` - shared UI/client components
- `src/lib` - content loaders/helpers
- `src/config` - site-level configuration
- `src/content` - markdown content collections
- `scripts` - automation scripts (including mindmap generation)
