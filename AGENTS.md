<!-- CODEGRAPH_START -->

## CodeGraph

In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the repo root), reach for it BEFORE grep/find or reading files when you need to understand or locate code:

- **MCP tools** (when available): `codegraph_explore` answers most code questions in one call - the relevant symbols' verbatim source plus the call paths between them. `codegraph_node` returns one symbol's source + callers, or reads a whole file with line numbers. If the tools are listed but deferred, load them by name via tool search.
- **Shell** (always works): `codegraph explore "<symbol names or question>"` and `codegraph node <symbol-or-file>` print the same output.

If there is no `.codegraph/` directory, skip CodeGraph entirely - indexing is the user's decision.

<!-- CODEGRAPH_END -->

## Image Analysis

The orchestration lane/model can read images directly. When the task involves a screenshot, UI design, mockup, photo, or any image:

- Analyze the image directly in the orchestration lane first; do not delegate image reading to a `vision-looker` subagent.
- Describe relevant visual content, layout, colors, typography, spacing, components, and visible text/labels before making UI/CSS decisions.
- Base implementation, CSS edits, layout fixes, and visual parity decisions on that direct image analysis.
- For multi-step visual work, keep structured notes (sections or bullets) so the findings map cleanly to code changes.

## Reading images from clipboard

If an inline-attached image is not available to the active lane, ask the user to copy it into the macOS clipboard and dump it to a local file:

- Ask the user to copy the image into the macOS clipboard (e.g. right-click → Copy Image, or `Cmd+Shift+Ctrl+4` to screenshot a region into the clipboard).
- Run `pngpaste /tmp/opencode_paste.png` (already installed via Homebrew) to dump the clipboard image to a file.
- Alternative without `pngpaste` (built-in Swift on macOS): `swift -e 'import AppKit; if let d=NSPasteboard.general.data(forType:.png){try d.write(to:URL(fileURLWithPath:"/tmp/opencode_paste.png"))}'`
- Then read/analyze `/tmp/opencode_paste.png` directly in the orchestration lane.
- If `pngpaste` reports "No image data found", the clipboard does not currently hold an image — ask the user to re-copy and retry.

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

## Design System

- **`DESIGN.md`** is the single source of truth for UI consistency. Consult it for colors, typography, spacing, layout patterns, component specs, animation, and responsive behavior. Do not invent new design values unless explicitly asked.

## Codebase Map

- `app/` contains App Router pages, global CSS imports, and dev-only CodeGraph routes/UI, the `yellow-canvas-test` and `bg-test-2` diagnostic pages.
- `components/PersistentExperience.tsx` is a thin orchestrator (~120 lines) that composes the always-on experience shell: WebGL layer, sky backdrop, preloader, route content, site nav, cursor, film grain, and route-wave overlay. Route-transition state lives in `components/shell/useRouteTransition.ts`; per-route reveal animations live in `components/shell/usePageRevealAnimations.ts`. Wave path morphing is in `components/waveTransition.ts`.
- Sibling shell pieces: `components/Preloader.tsx` (preload + wave exit), `components/SiteNav.tsx` (top-right nav), `components/FilmGrain.tsx` (CSS animated grain), `components/SkyBackground.tsx` (canvas sky), `components/Cursor.tsx` (custom cursor/sticker).
- `components/WebGLScene.tsx` and `components/webgl/` own the React Three Fiber scene. The primary model is loaded from `/models/model.glb` through `SignalModel.tsx`. `webgl/` is split into focused modules: `prepareScene.ts` (materials/lighting), `hitTest.ts` (interactive sign hit detection), `textures.ts` + `textureAnimation.ts` (per-frame texture redraws), `useModelCamera.ts` (camera + scroll), `useModelInteractions.ts`, `usePointerScroll.ts`, `useModelCursor.ts`, `useCanvasHoverPointer.ts`, `useSignalModelFrame.ts` (per-frame update), `modelRoutes.ts` (route → model state), `types.ts` (shared types).
- `components/pages/` contains route-level page bodies (`HomePage`, `ProjectsPage`, `AboutPage`, `ContactPage`) plus `BackButton.tsx`. Shared route definitions and shell flags live in `lib/routes.ts`; profile, metadata, about, and contact copy live in `lib/siteContent.ts`; project cards live in `lib/projects.ts`.
- `lib/interactions.ts` owns the `signal-pole:*` interaction event bus (cursor enter/leave/reset, camera scroll reset, entered). `lib/events.ts` is a thin re-export. `lib/navigationContext.ts` exposes a React context for the shell's `handleNavigate` (used by `BackButton`).
- CSS is plain CSS split under `app/styles/` and imported in this order by `app/globals.css`: `base.css` → `shell.css` → `preloader.css` → `route-wave.css` → `nav.css` → `cursor.css` → `background.css` → `page-shell.css` → `pages.css` → `debug.css` → `responsive.css` (overrides must be last). Do not assume Tailwind utilities are available.
- Static assets live under `public/`: `models/`, `projects/`, `videos/`, `fonts/`, and `favicon.ico`.

## Development Commands

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

## Edge Cases

- If a WebGL screenshot is blank or stale, check the browser origin, console, `/models/model.glb` network status, canvas client size, and drawing buffer size before changing Three.js code.
- If a visual parity request names a local clone, inspect that reference first. If no local clone is named, use `https://www.hirotos.com/` as the visual reference for homepage parity.
- If changing shared shell, cursor, WebGL, route transitions, or global CSS, assume every route can be affected and verify at least `/`, `/projects`, `/about`, and `/contact` when practical.
- If only one route or component is requested, do not refactor shared shell code unless the issue is proven to originate there.
- If homepage text, profile content, project copy, or metadata appears different from the reference, keep local content stable unless the user explicitly asks for copy changes.
- If Playwright or browser checks use `127.0.0.1` and visuals behave oddly, retry with `http://localhost:<port>` before debugging app code.
- If a port is occupied, inspect the process and choose another free port instead of killing unrelated processes.
- If `.codegraph/` exists, use CodeGraph for code-location questions before broad `rg` searches. If it does not exist or the database is unavailable, skip CodeGraph without trying to rebuild it.
- If `app/codegraph/page.tsx` returns `notFound()` in production, treat that as intentional behavior unless the task is specifically about CodeGraph tooling.
- If lint/type-check/build failures appear after a focused change, first determine whether the failure is related to the edited files before widening the task.
- If a requested change conflicts with fixed full-viewport layout requirements, preserve the clone-like structure unless the user explicitly asks for a different interaction model.
- If visual verification differs between development and production mode, trust production-mode checks more for parity decisions.
