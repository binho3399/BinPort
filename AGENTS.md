<!-- CODEGRAPH_START -->

## CodeGraph

In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the repo root), reach for it BEFORE grep/find or reading files when you need to understand or locate code:

- **MCP tools** (when available): `codegraph_explore` answers most code questions in one call - the relevant symbols' verbatim source plus the call paths between them. `codegraph_node` returns one symbol's source + callers, or reads a whole file with line numbers. If the tools are listed but deferred, load them by name via tool search.
- **Shell** (always works): `codegraph explore "<symbol names or question>"` and `codegraph node <symbol-or-file>` print the same output.

If there is no `.codegraph/` directory, skip CodeGraph entirely - indexing is the user's decision.

<!-- CODEGRAPH_END -->

## Local Visual Debugging

- When verifying this Next.js app with Playwright or browser screenshots, use `http://localhost:<port>` instead of `http://127.0.0.1:<port>` unless `next.config.mjs` explicitly allows `127.0.0.1` in `allowedDevOrigins`.
- Next dev may block HMR/dev resources from `127.0.0.1` as a cross-origin request when the server advertises `localhost`. That can leave WebGL captures misleadingly blank or stale even when the app code is fine.
- If a screenshot does not show the 3D model, first confirm the exact origin, check the browser console for blocked `/_next/webpack-hmr` messages, and verify `/models/model.glb` appears in network requests with `200 OK` before debugging Three.js scene code.
- For WebGL screenshot checks, confirm the canvas client size and drawing buffer size; the canvas should visually fill `.webgl-background`.

## Project Context

- This is a source-editable Next.js 16 / React 19 portfolio rebuild of the Hirotos-style experience, centered on a persistent WebGL background, route shell, custom cursor, page transitions, and project gallery interactions.
- Treat the visual reference as `https://www.hirotos.com/` for live homepage parity unless the user explicitly names `.cloned-sites/` or another local reference. For clone-color or clone-layout follow-ups, inspect the named reference first instead of inventing new styling.
- Keep the homepage copy/content stable during parity work unless the user asks for copy changes. Most previous gaps were shell/layout, typography, fixed layers, cursor behavior, WebGL state, and route-transition behavior.
- Judge visual parity in the browser, not by code similarity alone. The useful contract is the rendered DOM/CSS/runtime behavior.

## Codebase Map

- `app/` contains App Router pages, global CSS imports, dev-only CodeGraph routes/UI, and the `yellow-canvas-test` diagnostic page.
- `components/PersistentExperience.tsx` owns the always-on experience shell: WebGL layer, preloader, route content, site nav, cursor, and page-transition overlay.
- `components/WebGLScene.tsx` and `components/webgl/` own the React Three Fiber scene. The primary model is loaded from `/models/model.glb` through `SignalModel.tsx`.
- `components/Cursor.tsx` owns the custom cursor/sticker behavior. Cursor event names live in `lib/events.ts` and use the `signal-pole:*` namespace.
- `components/pages/` contains route-level page bodies. Shared route definitions live in `lib/routes.ts`; profile, metadata, about, and contact copy live in `lib/siteContent.ts`; project cards live in `lib/projects.ts`.
- CSS is plain CSS split under `app/styles/` and imported by `app/globals.css`. Do not assume Tailwind utilities are available.
- Static assets live under `public/`: `models/`, `projects/`, `videos/`, `fonts/`, and `favicon.ico`.

## Development Commands

```bash
npm run dev          # Start Next dev server
npm run build        # Production build
npm run start        # Serve the production build
npm run lint         # ESLint over the repo
npm run type-check   # TypeScript without emit
npm run format:check # Prettier check
npm run format       # Prettier write
```

## Implementation Notes

- Prefer small, route-aware edits. Shared shell changes in `PersistentExperience`, `Cursor`, `WebGLScene`, or `app/styles/*` affect every route.
- Preserve the fixed full-viewport structure required by the clone-like experience: hidden page overflow, fixed WebGL background, fixed route layer, nav, cursor, preloader, and transition overlays.
- When adjusting WebGL appearance, check the model asset request, canvas client size, drawing buffer size, camera/scroll state, and material/lighting changes before treating a blank screenshot as a scene bug.
- CodeGraph pages and API routes are development helpers. `app/codegraph/page.tsx` intentionally returns `notFound()` in production or when `.codegraph/codegraph.db` is unavailable.
- Keep environment examples non-secret. `.env.example` currently documents placeholders only; runtime does not depend on custom env vars beyond normal Next/Node behavior.

## Verification

- For normal code changes, run `npm run type-check` and `npm run lint`.
- Before commit or after shared shell/WebGL/CSS changes, run `npm run build`.
- For visual parity work, prefer a production check: `npm run build`, then `npx next start -p <free-port>`, then Playwright/browser screenshots against `http://localhost:<port>`.
- If a port is already occupied, inspect and reuse/choose another port rather than killing unrelated processes.
