# cloned-web

Source-editable Next.js 16 / React 19 portfolio rebuild of the Hirotos-style experience. Persistent WebGL background, route shell, custom cursor, page transitions, and project gallery interactions.

## Local setup

1. Copy the example env file to a local-only file:

   ```bash
   cp .env.example .env.local
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` (use `localhost`, not `127.0.0.1` — see `AGENTS.md` for the WebGL/HMR origin caveat).

## Available scripts

```bash
npm run dev           # Start Next dev server
npm run build         # Production build
npm run start         # Serve the production build
npm run lint          # ESLint over the repo
npm run type-check    # TypeScript without emit
npm run format:check  # Prettier check
npm run format        # Prettier write
npm run smoke:test    # Playwright smoke tests
npm run analyze       # ANALYZE=true next build (bundle-analyzer)
```

## Documentation

| File | Purpose |
|---|---|
| `AGENTS.md` | Agent instructions — codebase map, dev commands, edge cases. Loaded automatically by OpenCode. |
| `CLAUDE.md` | Project context for Claude — Vietnamese-mixed English, conventions, CodeGraph usage, parity/visual work. |
| `DESIGN.md` | **Single source of truth for UI consistency** — colors, typography, spacing, layout, components, animation, responsive, CSS architecture, accessibility. |
| `PLAN.md` | Quy trình cập nhật `WORKLOG.md` sau mỗi task (template + thứ tự thực hiện). |
| `WORKLOG.md` | Timeline history của tất cả tasks đã thực hiện (files changed + summary table + bài học rút ra). |
| `REFACTOR_PLAN.md` | Refactor backlog grouped by phase, with ✅/⚠️ status per item. |

## Environment variables

This app currently does not depend on any runtime environment variables beyond `NODE_ENV`.

`.env.example` only documents placeholders for likely future configuration:

- `NEXT_PUBLIC_SITE_URL`: reserved for future metadata or canonical URL wiring.
- `CODEGRAPH_ENABLED`: reserved for internal CodeGraph-related documentation/workflows and is not used by the current runtime.

Do not store real secrets in `.env.example` or commit local env files.
