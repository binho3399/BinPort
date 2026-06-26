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
