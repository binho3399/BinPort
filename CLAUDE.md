# CLAUDE.md

## Project Overview

Next.js 16 portfolio website với 3D WebGL (Three.js / React Three Fiber). TypeScript strict, ESM, App Router. Codebase này là source-editable rebuild theo hướng Hirotos-style: persistent WebGL background, route shell, custom cursor, page transitions, và project gallery.

## Commands

```bash
npm run dev          # Dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
npm run format:check # Prettier check
npm run format       # Prettier fix
```

## Project Structure

```
app/              # Next.js App Router pages + API routes
  api/codegraph/  # CodeGraph REST API (dev only)
  codegraph/      # CodeGraph UI explorer (dev only)
components/       # React components
  webgl/          # Three.js scene components (SignalModel, textures, canvas)
  pages/          # Page-level components (HomePage, AboutPage, etc.)
lib/              # Shared utilities (routes, events, siteContent, codegraph-db)
public/           # Static assets (models/, fonts/, images/)
```

Key files:

- `components/PersistentExperience.tsx`: persistent shell, preloader, nav, cursor, transition overlay, route content, and WebGL layer.
- `components/Cursor.tsx`: custom cursor and sticker-preview behavior.
- `components/WebGLScene.tsx` + `components/webgl/`: React Three Fiber scene; `SignalModel.tsx` loads `/models/model.glb`.
- `lib/routes.ts`: route IDs and nav order.
- `lib/siteContent.ts`: profile, metadata, about, and contact content.
- `lib/projects.ts`: projects gallery data.
- `app/styles/*.css`: plain CSS layers imported by `app/globals.css`.

## Conventions

- **TypeScript strict** — không dùng `any`, không skip type-check
- **ESM** (`"type": "module"`) — dùng `import`, không `require`
- **Path alias**: `@/*` maps to project root
- **React 19** + **Next.js 16** App Router — server components by default, `"use client"` khi cần
- **Styling**: plain CSS modules/layers under `app/styles/`, imported by `app/globals.css` (do not assume Tailwind utilities)
- **3D**: React Three Fiber + Drei cho WebGL scene, GSAP cho animations
- **Formatting**: Prettier (check CI), ESLint (next/core-web-vitals + typescript)

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
