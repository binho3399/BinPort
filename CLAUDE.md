# CLAUDE.md

## Project Overview

Next.js 16 portfolio website với 3D WebGL (Three.js / React Three Fiber). TypeScript strict, ESM, App Router. Codebase này là source-editable rebuild theo hướng Hirotos-style: persistent WebGL background, route shell, custom cursor, page transitions, và project gallery.

## Commands

```bash
npm run dev           # Dev server (localhost:3000)
npm run build         # Production build
npm run start         # Serve the production build
npm run lint          # ESLint
npm run type-check    # tsc --noEmit
npm run format:check  # Prettier check
npm run format        # Prettier fix
npm run smoke:test    # Playwright smoke tests
npm run analyze       # ANALYZE=true next build (bundle-analyzer)
```

## Project Structure

```
app/                # Next.js App Router pages + API routes
  (debug)/          # Diagnostic pages (yellow-canvas-test, bg-test, bg-test-2, codegraph)
  api/codegraph/    # CodeGraph REST API (dev only)
  codegraph/        # CodeGraph UI explorer (dev only)
  styles/           # Plain CSS layers imported by app/globals.css
components/         # React components
  shell/            # Route-transition hooks (useRouteTransition, usePageRevealAnimations)
  webgl/            # Three.js scene modules (SignalModel, hitTest, textures, camera, …)
  pages/            # Page-level components (HomePage, AboutPage, …) + BackButton
  Preloader.tsx     # Preloader + wave exit animation
  SiteNav.tsx       # Top-right nav
  Cursor.tsx        # Custom cursor and sticker-preview behavior
  FilmGrain.tsx     # CSS-animated grain overlay (12fps, reduced-motion safe)
  SkyBackground.tsx # Canvas sky backdrop
  PersistentExperience.tsx  # Thin shell orchestrator
  WebGLScene.tsx    # React Three Fiber entrypoint
lib/                # Shared utilities
  routes.ts         # Route IDs, nav order, shell flags, standalone routes
  siteContent.ts    # Profile, metadata, about, contact copy
  projects.ts       # Project gallery data
  interactions.ts   # signal-pole:* event bus (cursor, camera reset, entered)
  events.ts         # Re-export of interactions (kept for legacy imports)
  navigationContext.ts # React context for shell handleNavigate
  codegraph-db.ts   # better-sqlite3 access to .codegraph/codegraph.db
public/             # Static assets (models/, projects/, videos/, fonts/, favicon.ico)
```

Key invariants:

- `components/PersistentExperience.tsx` là thin orchestrator — compose Preloader, SiteNav, FilmGrain, Cursor, SkyBackground, WebGLScene, route-wave SVG. Route transitions delegated to `components/shell/useRouteTransition.ts`; per-route reveal animations to `components/shell/usePageRevealAnimations.ts`.
- Cursor event names live in `lib/interactions.ts` (namespace `signal-pole:*`); `lib/events.ts` is re-export only.
- `components/WebGLScene.tsx` + `components/webgl/*` own the Three.js scene; `webgl/SignalModel.tsx` loads `/models/model.glb` (Meshopt-compressed).
- `lib/routes.ts` is single source of truth cho route IDs, nav order, shell flags (`backButtonVisible`, `homeInteractive`, `contactShellHidden`), và `standaloneRoutes` (yellow-canvas-test, codegraph, bg-test-2).
- CSS layers: `base.css` (tokens + z-index) → `shell.css` → `preloader.css` → `route-wave.css` → `nav.css` → `cursor.css` → `background.css` → `page-shell.css` → `pages.css` → `debug.css` → `responsive.css` (overrides last).

## Conventions

- **TypeScript strict** — không dùng `any`, không skip type-check
- **ESM** (`"type": "module"`) — dùng `import`, không `require`
- **Path alias**: `@/*` maps to project root
- **React 19** + **Next.js 16** App Router — server components by default, `"use client"` khi cần
- **Styling**: plain CSS layers under `app/styles/`, imported by `app/globals.css` (do not assume Tailwind utilities)
- **3D**: React Three Fiber + Drei cho WebGL scene; GSAP cho route transitions, preloader scramble, page reveal (not film grain — that's CSS keyframes)
- **Formatting**: Prettier (check CI), ESLint (next/core-web-vitals + typescript)

## Design System

- **`DESIGN.md`** là single source of truth cho UI consistency. Tham khảo file này cho: colors, typography, spacing, layout patterns, component specs, animation easing, responsive breakpoints. Không tự ý invent design values mới trừ khi được yêu cầu.

## Parity / Visual Work

- Use `https://www.hirotos.com/` as the live homepage parity reference unless the user explicitly points to `.cloned-sites/` or another local reference.
- For `.cloned-sites/` follow-ups, inspect that reference before changing CSS/WebGL values.
- Keep homepage text stable unless the user explicitly asks to edit copy; most parity changes should be shell, layout, typography, fixed layers, cursor, WebGL, and route-transition behavior.
- Browser-rendered behavior is the source of truth. Do not judge parity from source similarity alone.
- Shared shell edits can affect all routes, especially changes in `PersistentExperience`, `Cursor`, `WebGLScene`, and `app/styles/*`.

## Verification

Sau mỗi code change, chạy:

```bash
npm run type-check && npm run lint
```

Build trước khi commit:

```bash
npm run build
```

Cho visual/WebGL parity, ưu tiên production-mode check:

```bash
npm run build
npx next start -p <free-port>
```

Sau đó verify bằng Playwright/browser tại `http://localhost:<port>`.

## Local Dev Notes

- Dùng `http://localhost:<port>` thay vì `http://127.0.0.1:<port>` khi test với Playwright/browser
- 3D model tại `/models/model.glb` — cần dev server chạy để load
- Nếu screenshot không thấy 3D model, kiểm tra origin, console, request `/models/model.glb` có `200 OK`, canvas client size, và drawing buffer size trước khi debug scene code.
- CodeGraph UI chỉ render trong development mode và khi `.codegraph/codegraph.db` tồn tại.

## CodeGraph Usage

CodeGraph database (`.codegraph/codegraph.db`) chứa semantic graph của toàn bộ codebase — nodes (functions, classes, components, exports) và edges (calls, imports, dependencies). **Ưu tiên dùng CodeGraph** cho các task cần hiểu cross-file relationships thay vì manual grep/find.

### Khi nào dùng CodeGraph

- **Find all references**: tìm tất cả nơi gọi một function/component, hoặc import một module
- **Trace call chains**: hiểu call graph từ entry point đến leaf functions
- **Dependency analysis**: tìm unused exports, circular dependencies, hoặc impact analysis khi refactor
- **Cross-file refactoring**: rename/move/delete symbols an toàn với full reference list
- **Understand architecture**: visualize module boundaries, layer violations, component hierarchy

### Cách query CodeGraph

**REST API** (cần dev server chạy):

```bash
# Tìm nodes theo search term
curl "http://localhost:3000/api/codegraph/nodes?search=WebGLScene"

# Lọc theo kind
curl "http://localhost:3000/api/codegraph/nodes?kind=function&file=lib/routes.ts"

# Lấy edges của một node
curl "http://localhost:3000/api/codegraph/edges?nodeIds=node-id-1,node-id-2"

# Stats overview
curl "http://localhost:3000/api/codegraph/stats"
```

**Direct DB query** (không cần dev server):

```typescript
import { getDb, hasCodegraphDb } from '@/lib/codegraph-db';

if (hasCodegraphDb()) {
  const db = getDb();
  
  // Tìm function callers
  const callers = db.prepare(`
    SELECT n.name, n.file_path, e.line 
    FROM edges e 
    JOIN nodes n ON e.source = n.id 
    WHERE e.target = ? AND e.kind = 'call'
  `).all(targetNodeId);
  
  // Tìm unused exports
  const unused = db.prepare(`
    SELECT n.id, n.name, n.file_path 
    FROM nodes n 
    WHERE n.is_exported = 1 
    AND n.id NOT IN (SELECT target FROM edges WHERE kind = 'import')
  `).all();
}
```

### Schema Overview

**nodes table**:
- `id`, `kind` (function, class, component, variable, etc.)
- `name`, `qualified_name`, `file_path`
- `start_line`, `end_line`, `signature`, `docstring`
- `is_exported`, `is_async`, `visibility`

**edges table**:
- `source`, `target` (node IDs)
- `kind` (call, import, extends, implements, etc.)
- `line` (line number trong source file)

### Examples

```bash
# Workflow: refactor PersistentExperience component
# Step 1: Tìm component definition
curl "localhost:3000/api/codegraph/nodes?search=PersistentExperience&kind=component"

# Step 2: Lấy node ID từ response, query edges
curl "localhost:3000/api/codegraph/edges?nodeIds=<node-id>"

# Step 3: Check all imports và calls để đảm bảo không break references
```

**Fallback**: Nếu `.codegraph/codegraph.db` không tồn tại hoặc outdated, dùng grep/find như bình thường và recommend user rebuild CodeGraph database.
