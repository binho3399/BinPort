# Optimize & Refactor Plan

Based on full codebase analysis. Grouped by impact, ordered by recommended execution.

---

## Phase 1 — Cleanup & Hygiene (low risk, high payoff)

### 1.1 Remove dead/stale artifacts
- Delete `.claude/worktrees/peaceful-benz-d2ea0d/` — full stale copy of the codebase (~30 files), wastes space and confuses search.
- Delete `output/` directory — stale build logs and playwright artifacts from Jun 23–29, not tracked by git, not needed.
- Add both to `.gitignore` if not already.
- **Risk:** None. Pure deletion.

### 1.2 Remove or wire up dead components
- **`PageTransition` component** (`PersistentExperience.tsx:203-219`) — renders `.page-transition` overlay with clip-path/snapshot divs but is **never animated or driven** by any code. Route transitions use the SVG `.route-wave` instead. Either remove the component + `.page-transition` CSS (`page-shell.css:139-200`), or wire it in. Recommendation: remove.
- **`app/loading.tsx`** — renders `.route-loading` but no CSS defines those classes anywhere. Either add the CSS or remove the file.
- **Risk:** Low. Verify no visual change after removal.

### 1.3 Fix module-level mutable state
- `PersistentExperience.tsx:28` — `let hasEnteredExperience = false` is module-scoped mutable state. In dev with HMR, it survives across reloads and can skip the preloader incorrectly. Move to a `useRef` or `sessionStorage` check.
- **Risk:** Low. Only affects dev-mode preloader skip logic.

---

## Phase 2 — Decompose God Components (medium risk, high maintainability)

### 2.1 Split `PersistentExperience.tsx` (534 lines)

Current single component handles 6 responsibilities. Split into:

| New file | Responsibility | Lines moved |
|---|---|---|
| `components/Preloader.tsx` | Preloader + wave exit animation | ~165 |
| `components/RouteTransition.tsx` | Route-wave cover/reveal logic + wave SVG | ~120 |
| `components/SiteNav.tsx` | Navigation buttons + `handleNavigate` | ~50 |
| `components/FilmGrain.tsx` | Film grain overlay + keyframes | ~30 |
| `components/PersistentExperience.tsx` | Orchestrator only — composes the above + state | ~140 |

**Key deduplication:** The reveal timeline logic appears **twice** (lines 311-337 for pre-covered, lines 354-379 for full transition) — extract to a shared `runRevealTimeline(path, svg, onComplete)` helper.

### 2.2 Split `SignalModel.tsx` (518 lines)

Extract into focused modules:

| New file | Responsibility | Lines moved |
|---|---|---|
| `components/webgl/hitTest.ts` | `getInteractiveCanvasHit`, `isCanvasHitOccluded`, `isWithinInteractiveUv`, etc. | ~100 |
| `components/webgl/textureAnimation.ts` | Per-frame texture update logic (contact, profile, projects) | ~60 |
| `components/webgl/useModelCamera.ts` | Camera setup, scroll smoothing, shake — the camera `useEffect` + scroll logic from `useFrame` | ~50 |
| `components/webgl/SignalModel.tsx` | Composition only — group ref, pointer events, delegates to hooks | ~150 |

**Key deduplication:** The `useFrame` callback (lines 324-436) runs texture updates, traffic light animation, scroll smoothing, and camera shake all in one 110-line closure. Split into separate `useFrame` calls or helper functions.

### 2.3 Deduplicate material setup in `prepareScene.ts`

`applyProjectsMaterial`, `applyContactMaterial`, `applyProfileMaterial` are **nearly identical** — 15 lines each, only differ in `emissiveIntensity` and `roughness`. Consolidate:

```ts
type SignMaterialConfig = { emissiveIntensity: number; roughness: number };
const SIGN_MATERIAL_CONFIG: Record<string, SignMaterialConfig> = {
  'hiroto-profile': { emissiveIntensity: 0.72, roughness: 0.54 },
  to_projects:     { emissiveIntensity: 0.68, roughness: 0.48 },
  to_contact:      { emissiveIntensity: 0.86, roughness: 0.50 },
};

function applySignMaterial(object: SignalMesh, texture, config: SignMaterialConfig) { ... }
```

Removes ~30 lines of duplication.

---

## Phase 3 — CSS Architecture (low risk, high consistency)

### 3.1 Establish z-index token system

Current z-index values are magic numbers scattered across 4 CSS files. Define tokens in `base.css`:

```css
:root {
  --z-webgl: 0;
  --z-route-wave: 45;
  --z-content: 3;
  --z-page-transition: 50;
  --z-nav: 80;
  --z-film-grain: 150;
  --z-cursor: 160;
  --z-preloader: 999;
}
```

Replace all hardcoded `z-index` values with `var(--z-*)`.

### 3.2 Split `shell.css` (335 lines) by concern

Current `shell.css` mixes preloader, route-wave, experience-page, site-nav, back-button, and mouse-stalker. Split into:

| New file | Contents |
|---|---|
| `app/styles/preloader.css` | `.preloader`, `.preloader__wave`, `.preloader__inner`, `.preloader__text` |
| `app/styles/route-wave.css` | `.route-wave` |
| `app/styles/nav.css` | `.site-nav`, `.back-circle-control` |
| `app/styles/cursor.css` | `.mouse-stalker` and children |
| `app/styles/shell.css` | `.webgl-background`, `.persistent-experience`, `.experience-page` only |

Update `globals.css` imports.

### 3.3 Replace hardcoded colors with tokens

Colors like `#0b0b0a`, `#0b0b0a75`, `#0b0b0a6b` are repeated 20+ times across CSS files. Add to `base.css`:

```css
:root {
  --ink: #0b0b0a;
  --ink-90: #0b0b0ae6;
  --ink-80: #0b0b0acc;
  --ink-70: #0b0b0ab3;
  --ink-50: #0b0b0a80;
  --ink-40: #0b0b0a66;
  /* etc. */
}
```

---

## Phase 4 — Performance Optimization (medium risk, measurable gains)

### 4.1 Eliminate redundant antialiasing
`WebGLScene.tsx:117` uses `EffectComposer` with `multisampling={8}` **plus** `SMAA`. MSAA (multisampling) and SMAA both antialias edges — pick one:
- Keep `multisampling={4}` (cheaper, hardware-accelerated), remove SMAA.
- Or keep SMAA, set `multisampling={0}`.
- Expected savings: one fewer post-processing render pass per frame.

### 4.2 Gate video texture when off-screen
`prepareScene.ts:153` creates a `VideoTexture` that autoplays continuously even when the model isn't visible (non-home routes). Pause the video element when not on home route. The `showreel` texture should only play when the model is mounted.

### 4.3 Unify render loops
Currently **two independent render loops**:
- `WebGLScene` → `RenderScheduler` runs `frameloop="demand"` with `setInterval` at 24fps (interactive) or 12fps (idle).
- `SkyBackground` runs its own `requestAnimationFrame` loop at 30fps.

The sky canvas (`SkyBackground`) always animates even on non-home routes. Consider:
- Pausing sky animation when tab is hidden (already done) ✓
- Throttling sky to match the WebGL idle interval or stopping it on non-home routes where it's behind page content.

### 4.4 Reduce shadow map size on mobile
`WebGLScene.tsx:88` — `shadowMapSize = 2048` is heavy on mobile. Detect `(max-width: 620px)` and reduce to 1024.

### 4.5 Lazy-load WebGL only on home route
`PersistentExperience.tsx:484` already gates `<WebGLScene>` with `isHomeRoute`, but `WebGLScene` is dynamically imported at module level (`PersistentExperience.tsx:15`). The dynamic import with `ssr: false` is good. Verify the chunk doesn't load on non-home routes.

---

## Phase 5 — Type Safety & Modernization (low risk)

### 5.1 Update React 19 ref types
`usePointerScroll.ts:2` — `MutableRefObject` is deprecated in React 19. Use `RefObject` or `RefObject<T>` directly.

### 5.2 Tighten type assertions in SignalModel
Several `as SignalMesh`, `as THREE.PerspectiveCamera` casts. Add runtime guard functions that narrow types cleanly.

### 5.3 Add `useGLTF.preload('/models/model.glb')`
Currently the model loads on mount. Add `useGLTF.preload` call to start fetching the `.glb` as early as possible (e.g., in `WebGLScene.tsx` at module level).

---

## Phase 6 — DX Improvements (optional, low risk)

### 6.1 Consolidate `routes.ts` and `standaloneRoutes.ts`
Two separate route config files. Merge standalone routes into `routes.ts` as a single source of truth:

```ts
export const routes = [...];
export const standaloneRoutes = new Set(['/yellow-canvas-test', '/codegraph', '/bg-test-2']);
```

### 6.2 Add bundle analysis to build
`@next/bundle-analyzer` is in devDependencies but not wired. Add:
```json
"analyze": "ANALYZE=true next build"
```
And wrap config with `@next/bundle-analyzer` plugin.

---

## Execution Priority

| Priority | Phase | Effort | Impact |
|---|---|---|---|
| P0 | 1.1 Delete stale artifacts | 5 min | Removes confusion |
| P0 | 1.2 Remove dead components | 15 min | Less dead code |
| P1 | 3.1 z-index tokens | 15 min | Prevents stacking bugs |
| P1 | 4.1 Fix redundant AA | 5 min | Perf gain |
| P1 | 2.3 Dedup materials | 20 min | Maintainability |
| P2 | 2.1 Split PersistentExperience | 1-2 hr | Core maintainability |
| P2 | 2.2 Split SignalModel | 1-2 hr | Core maintainability |
| P2 | 3.2 Split shell.css | 30 min | CSS maintainability |
| P3 | 4.2-4.4 Perf optimizations | 1 hr | Measurable perf |
| P3 | 5.x Type safety | 30 min | Correctness |
| P4 | 6.x DX improvements | 30 min | Developer experience |

## Verification per phase
- After every phase: `npm run type-check && npm run lint`
- After Phase 1, 3, 4: `npm run build` then production screenshot check on `/`, `/projects`, `/about`, `/contact`
- After Phase 2: full visual + interaction test (route transitions, cursor, model hover, scroll-to-rotate)
