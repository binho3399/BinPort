# Architecture Guide

Mục tiêu: tài liệu ngắn gọn để biết **đặt code ở đâu** và **file nào là source of truth** trước khi thêm/move logic. Dùng cùng với `AGENTS.md` và `DESIGN.md`, không thay thế chúng.

## Purpose

- Giảm việc đặt nhầm code vào shared shell khi thực ra chỉ là route-level change.
- Giữ ownership rõ ràng giữa `app/`, `components/`, `lib/`, `public/`, `app/styles/`.
- Tạo checklist nhanh cho tasks kiểu: add route, update project card, sửa copy, tweak WebGL/sky, thêm debug page, thêm test.

## Directory ownership map

| Path | Owns what |
|---|---|
| `app/` | App Router entrypoints, layout, global CSS imports, dev/debug routes. Không đặt business copy lớn ở đây nếu đã có `lib/` source file phù hợp. |
| `components/PersistentExperience.tsx` | Shared always-on shell orchestration: WebGL layer, sky, preloader, nav, cursor, route overlay. |
| `components/pages/` | Route body components như home/projects/about/contact. Route-specific structure belongs here. |
| `components/webgl/` | WebGL scene internals: model state, camera, interactions, textures, frame updates, scene prep. |
| `components/SkyBackground.tsx` | Sky canvas/background behavior riêng, tách khỏi Three.js model scene. |
| `components/shell/` | Shared shell hooks cho route transitions/reveal state. |
| `lib/routes.ts` | Route definitions, labels, route-level flags/source of truth cho navigation-related config. |
| `lib/siteContent.ts` | Site/profile/about/contact copy + metadata-like text content. |
| `lib/projects.ts` | Projects data/cards/content source of truth. |
| `lib/interactions.ts` | Shared interaction event bus/contracts, especially `signal-pole:*`. |
| `app/styles/` | Global CSS architecture split by layer/responsibility; no Tailwind assumption. |
| `public/` | Static assets: models, project images, videos, fonts. |
| `app/*test*`, `app/codegraph`, debug pages | Dev-only diagnostics or inspection surfaces; không dùng làm production feature home cho new logic. |

## Source-of-truth files

- **UI design tokens/layout rules**: `DESIGN.md`
- **Module ownership / code placement**: `docs/architecture.md`
- **Shell + repo conventions / edge cases**: `AGENTS.md`
- **Route registry / navigation flags**: `lib/routes.ts`
- **Site copy**: `lib/siteContent.ts`
- **Projects list/card content**: `lib/projects.ts`
- **Shared shell composition**: `components/PersistentExperience.tsx`
- **Adaptive experience policy contract**: `components/useAdaptiveExperienceMode.ts`
- **WebGL route→state mapping**: `components/webgl/modelRoutes.ts`
- **Global CSS import order**: `app/globals.css`

## Experience Mode Contract

- `components/useAdaptiveExperienceMode.ts` is the canonical policy reader for adaptive shell behavior.
- Stable modes: `full` | `reduced` | `minimal`.
- Initial SSR/hydration state must be deterministic. The hook should expose `isResolved` and upgrade to real client policy after mount.
- Inputs today: viewport width, pointer coarse/fine capability, `prefers-reduced-motion`, and weak-device heuristics.
- Contract:
  - `full`: allow normal background WebGL, showreel video, richer ambient motion.
  - `reduced`: keep shell running nhưng hạ motion/cost, avoid assuming full visual extras.
  - `minimal`: strongest fallback for motion-sensitive environments; minimize animation-heavy behavior.
- Backward-compatible booleans such as `disableHeavyExperience` may remain for existing consumers, but new consumers should prefer named policy fields like `allowBackgroundWebGL`, `allowShowreelVideo`, `shouldReduceMotion`, `shouldUseLowPowerRendering`.
- Shared shell structure should not branch on unresolved client-only media queries. For example, home WebGL should wait until adaptive policy is resolved to avoid hydration mismatch.
- Nếu adaptive behavior thay đổi, update contract ở đây trước hoặc cùng lúc với consumer changes.

## Placement rules + examples

### 1. New route

- Add App Router entry in `app/<route>/page.tsx`.
- Put route body UI in `components/pages/<RouteName>Page.tsx`.
- Update `lib/routes.ts` if route participates in nav/transition flags.

Example: thêm `/journal` → route file ở `app/journal/page.tsx`, page component ở `components/pages/JournalPage.tsx`, route label/flags ở `lib/routes.ts`.

### 2. New project / update project card

- Edit `lib/projects.ts`.
- Put related images/videos under `public/projects/` or `public/videos/`.
- Chỉ sửa `components/pages/ProjectsPage` nếu layout/rendering behavior itself changes.

### 3. Site/profile/about/contact copy

- Edit `lib/siteContent.ts`.
- Không hardcode text mới directly inside page/shell component nếu content có thể tái sử dụng hoặc là canonical copy.

### 4. Shared shell behavior

- Use `components/PersistentExperience.tsx` for shell composition only.
- Put transition/reveal hook logic into `components/shell/`.
- Put shell warmup/prefetch side effects into focused shell hooks (for example `useWarmRoutes`, `useWarmHomeExperience`) when they are not pure composition concerns.
- Put nav/cursor/preloader specific behavior into their own component files, not inline into page components.

Example: route reveal timing change → `components/shell/useRouteTransition.ts` or `usePageRevealAnimations.ts`, không đặt trong `app/page.tsx`.

### 5. WebGL behavior

- Scene wrapper: `components/WebGLScene.tsx`
- Camera/interaction/frame/model logic: `components/webgl/*`
- Route-specific WebGL state mapping: `components/webgl/modelRoutes.ts`
- Asset files: `public/models/`
- Current architecture decision: the heavy WebGL model is **home-only** and only mounts when `useAdaptiveExperienceMode()` resolves to a policy that allows background WebGL. Non-home and reduced/minimal modes keep the shell/sky route experience but skip the model layer for performance and hydration safety.
- Route transitions must tolerate the WebGL model wrapper being absent; treat `modelWrapperRef.current === null` as a valid state.

Example: đổi camera response theo route `/about` → update `components/webgl/modelRoutes.ts` or `useModelCamera.ts`, không nhét condition vào unrelated page copy file.

### 6. Sky/background behavior

- Sky rendering logic belongs in `components/SkyBackground.tsx`.
- Ambient/background layer CSS belongs in `app/styles/background.css`.
- Không trộn sky-only behavior vào WebGL model modules trừ khi thật sự shared canvas concern.

### 7. CSS

- `base.css`: tokens, reset-level globals, z-index vars.
- `shell.css`: fixed shell/layout scaffolding.
- `preloader.css`, `route-wave.css`, `nav.css`, `cursor.css`, `background.css`: feature-owned styling.
- `page-shell.css`, `pages.css`: route/page structures.
- `debug.css`: diagnostics only.
- `responsive.css`: late overrides only.

Example: cursor visual tweak → `app/styles/cursor.css`; page intro spacing tweak → `page-shell.css` or `pages.css`; diagnostic overlay style → `debug.css`.

### 8. Debug / diagnostics

- Put temporary or dev-only inspection UI under explicit debug/test routes in `app/`.
- Put debug-only shared components under `components/debug/`, not the production component root.
- Put debug-only server helpers under `lib/debug/`, not top-level app-domain `lib/`.
- Keep debug-specific styles in `app/styles/debug.css`.
- Accepted tradeoff hiện tại: `debug.css` vẫn được import globally for simplicity, but new debug-only rules should stay narrowly scoped to explicit debug selectors/routes and should not style production shell classes.
- Không để debug toggles leak into production route components unless intentionally productized.

### 9. Tests

- Co-locate or place under existing test conventions in repo when present.
- Prefer tests near changed domain: route/page behavior near route tests, shared shell/WebGL behavior in focused component or integration coverage.
- Không thêm test fixture/copy duplication nếu data đã có canonical source trong `lib/`.

## Boundaries / anti-patterns

- Không đặt canonical copy trực tiếp trong `app/*/page.tsx` nếu `lib/siteContent.ts` / `lib/projects.ts` mới là đúng owner.
- Không biến `PersistentExperience.tsx` thành mega-file chứa detailed logic của nav/cursor/WebGL/page-specific behavior.
- Không đặt page-specific hacks vào shared shell/CSS global layer nếu chỉ ảnh hưởng một route.
- Không trộn sky background concerns với Three.js model concerns khi chúng có lifecycle khác nhau.
- Không thêm random CSS vào `responsive.css` nếu không phải responsive override cuối chuỗi.
- Không dùng debug pages làm nơi “tạm đặt” production logic rồi quên move lại.

## Verification checklist

- Xác nhận file owner đúng theo bảng trên.
- Nếu thêm route: check `app/<route>/page.tsx` + `components/pages/*` + `lib/routes.ts` đã aligned.
- Nếu đổi copy/projects: check source of truth nằm ở `lib/siteContent.ts` hoặc `lib/projects.ts`.
- Nếu đổi shell/WebGL/sky/CSS: check không vô tình move logic sang sai layer.
- Nếu thêm assets: check path under `public/` phù hợp domain (`models/`, `projects/`, `videos/`, `fonts/`).
- Re-open `DESIGN.md` trước khi invent spacing/color/typography values mới.
- Documentation-only task: inspect diff only; không cần chạy app/test trừ khi task nói khác.
