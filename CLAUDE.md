# CLAUDE.md

## Project Overview

Next.js 16 portfolio website với 3D WebGL (Three.js / React Three Fiber). TypeScript strict, ESM, App Router.

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

## Conventions

- **TypeScript strict** — không dùng `any`, không skip type-check
- **ESM** (`"type": "module"`) — dùng `import`, không `require`
- **Path alias**: `@/*` maps to project root
- **React 19** + **Next.js 16** App Router — server components by default, `"use client"` khi cần
- **Styling**: Tailwind CSS via `globals.css`
- **3D**: React Three Fiber + Drei cho WebGL scene, GSAP cho animations
- **Formatting**: Prettier (check CI), ESLint (next/core-web-vitals + typescript)

## Verification

Sau mỗi code change, chạy:

```bash
npm run type-check && npm run lint
```

Build trước khi commit:

```bash
npm run build
```

## Local Dev Notes

- Dùng `http://localhost:<port>` thay vì `http://127.0.0.1:<port>` khi test với Playwright/browser
- 3D model tại `/models/model.glb` — cần dev server chạy để load
- CodeGraph UI chỉ render trong development mode
