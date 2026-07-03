# Design System

> Single source of truth for UI consistency across the Hirotos-style portfolio experience. Agents should reference this file for all design decisions — do not invent new values unless explicitly requested.

---

## 1. Visual Reference

- **Primary**: https://www.hirotos.com/ — live homepage parity target
- **Local clones**: `.cloned-sites/` — when user explicitly names a local reference
- **Judge parity in the browser** (rendered DOM/CSS/runtime), not by code similarity

---

## 2. Color Palette

### Core Tokens (`:root` in `base.css`)

| Token | Value | Usage |
|---|---|---|
| `--background` | `#f0f4f8` | Page/shell background (light sky) |
| `--foreground` | `#10100f` | Primary text color |
| `--muted` | `#10100fad` | Muted text / secondary content |
| `--line` | `#10100f24` | Borders, dividers, rules |
| `--accent` | `#8f6200` | Accent / highlight |

### Semantic Grays (Near-Black Scale)

| Value | Usage |
|---|---|
| `#0b0b0a` | Heading text, nav active, cursor shape, back-circle bg, home text |
| `#0b0b0a75` | Nav link default |
| `#0b0b0a85` | Home rotate hint, project card meta |
| `#0b0b0a94` | Page shell header text |
| `#0b0b0a9e` | About page body text |
| `#0b0b0ac2` | About page meta values |
| `#0b0b0a6b` | Language toggle inactive, about meta labels |
| `#0b0b0a7a` | Page shell intro subtitle |
| `#0b0b0a24` / `#0b0b0a29` | Subtle borders, rule lines |
| `#0b0b0a00` | Transparent gradient end |

### Surfaces & Overlays

| Value | Usage |
|---|---|
| `#ffffffeb` | Preloader text (near-white) |
| `#fff` | Page transition snapshot bg, back-circle arrow |
| `#e9e6df` | Project card default background |
| `rgba(255,255,255,0.72)` | Project card overlay |
| `#f5f5f2` | Debug page background |
| `#ffdf0e` | Yellow canvas test preview |
| `#070707` | Page transition next slide |
| `#0707072e` | Transition drop-shadow |

### WebGL Background Gradient

```css
.webgl-background {
  background: linear-gradient(
    to bottom,
    #b8dff0 0%,
    #cce8f3 35%,
    #e2f1f8 65%,
    #f0f7fb 100%
  );
}
```

### Film Grain

- Opacity: `0.06` (default), `0.04` (prefers-reduced-motion)
- Mix-blend-mode: `overlay`
- SVG fractal noise, 256×256 tiles

---

## 3. Typography

### Font Families

| Font | Source | Usage |
|---|---|---|
| `gazzetta-variable` | `/fonts/typekit/gazzetta-variable-normal.woff2` | Headings, display text (weight 100–900) |
| `helvetica-neue-lt-pro` | Typekit (lazy-loaded) | Body text, navigation, UI labels |

**Font loading strategy**: `next/script` with `strategy="lazyOnload"` + `preconnect` + `preload`. `font-display: swap` prevents FOIT.

### Font Sizing System

All font sizes use `clamp()` for fluid scaling. The formula pattern is:
```
clamp(<min-px>, min(<vw-scale>, <middle-px> + <vw-scale>), <max-px>)
```

| Context | Size | Line Height | Letter Spacing |
|---|---|---|---|
| **Hero/Name** | `clamp(24px, 2.8vw)` | 0.98 | 0 |
| **Page heading (h1)** | `clamp(22px, min(2.4vw, 23.4px + 0.84vw))` | 1.08 | 0 |
| **Intro heading (about/contact)** | `clamp(34px, min(5.2vw, 49.4px + 1.82vw))` | 0.96 | — |
| **Project title (h2)** | `clamp(18px, min(1.7vw, 22px))` | 1 | — |
| **Nav links** | `max(12px, min(0.8vw, 7.8px + 0.28vw))` | 1 | 0.045em |
| **Page shell header** | `max(13px, min(1vw, 9.75px + 0.35vw))` | 0.95 | 0.035em |
| **Meta labels** | `max(12px, min(0.8vw, 7.8px + 0.28vw))` | 1.25 | 0.018em |
| **Cursor stalker label** | `max(10px, min(0.667vw, 6.5px + 0.23345vw))` | — | 0.035em |
| **Home rotate hint** | `max(11px, min(0.733vw, 7.15px + 0.25655vw))` | 1 | 0.045em |
| **Project card meta** | `max(11px, min(0.733vw, 7.15px + 0.25655vw))` | — | 0.045em |
| **About body** | `max(14px, min(1.2vw, 10.4px + 0.42vw))` | 1.65 | — |
| **Contact links** | `max(18px, min(1.8vw, 15.6px + 0.63vw))` | 1 | — |
| **Preloader** | `clamp(12px, 1.35vw, 15px)` | 1 | 0.14em |

### Typography Conventions

- **Text transform**: ALL `uppercase` for nav, meta labels, preloader, page header, project card meta, rotate hint, about meta. Body text is sentence case.
- **Font weight**: `500` for headings and most UI text. Nav links are `400`.
- **Cursor stalker**: weight `700`.
- **Line height**: Headings are tight (0.96–1.08). Body text is loose (1.65).

---

## 4. Spacing System

### CSS Custom Properties

| Property | Value | Usage |
|---|---|---|
| `--ui-gutter-x` | `clamp(14px, 2.6vw, 44px)` | Horizontal gutter for page edges |
| `--ui-gutter-y` | `clamp(18px, 2.8vw, 40px)` | Vertical gutter for page edges |
| `--ui-edge-x` | `var(--ui-gutter-x)` | Horizontal edge (same as gutter) |

### Common Spacing Patterns

- Nav gap: `8px`
- Page shell header gap: `20px`
- Project card overlay inset: `12px` from edges
- About meta grid gap: `clamp(14px, 2vw, 26px)`
- Home meta grid gap: `clamp(12px, 2vw, 28px)`
- Intro margin-top: `clamp(46px, 8vh, 82px)`
- Section body margin-top: `clamp(28px, 5vh, 48px)`

### Grid Gaps

- Project gallery: `14px`
- About meta (3-col): `clamp(14px, 2vw, 26px)`
- Home meta (3-col): `clamp(12px, 2vw, 28px)`

---

## 5. Layout

### Fixed Full-Viewport Structure

Z-index tokens live in `app/styles/base.css` (see `--z-*` custom properties). Listed low → high:

```
┌──────────────────────────────────────┐
│  Preloader (--z-preloader: 999)      │  ← initial load overlay
├──────────────────────────────────────┤
│  Debug (--z-debug: 200)              │  ← diagnostic routes only
├──────────────────────────────────────┤
│  Mouse Stalker (--z-cursor: 160)     │  ← fixed cursor (pointer: fine)
├──────────────────────────────────────┤
│  Film Grain (--z-grain: 150)         │  ← fixed, pointer-events: none
├──────────────────────────────────────┤
│  Site Nav (--z-nav: 80)              │  ← fixed top-right
├──────────────────────────────────────┤
│  Home Rotate Hint (--z-hint: 70)     │  ← fixed bottom-right
├──────────────────────────────────────┤
│  Route Wave (--z-route-wave: 45)     │  ← SVG cover/reveal overlay
├──────────────────────────────────────┤
│  Route Content (--z-content: 3)      │  ← fixed route pages
├──────────────────────────────────────┤
│  WebGL Background (--z-base: 0)      │  ← fixed, full viewport
│  ┌ Sky Layer (--z-base: 0)           │
│  └ WebGL Canvas (--z-layer-1: 1)    │
└──────────────────────────────────────┘
```

Note: route transitions are driven by the SVG `.route-wave` overlay (morphing path in `components/waveTransition.ts`), not a `.page-transition` element.

Key constraints:
- `html`, `body`: `overflow: hidden`, `width/height: 100%`
- Page content: `position: fixed; inset: 0; z-index: 3`
- Each route page has its own visibility class: `.is-page-ready`, `.is-entered`, `.is-page-surface-ready`

### Page Shell Pattern

```
.page-shell
  ├── .page-shell__header (grid: auto auto 1fr)
  ├── .page-shell__intro
  │   ├── p (eyebrow)
  │   └── h1 (heading)
  └── page-specific content
```

### Grid Systems

| Component | Columns | Notes |
|---|---|---|
| `.page-shell__header` | `auto auto 1fr` | Leading, center, trailing |
| `.home-meta` | `repeat(3, 1fr)` | Bottom of home page |
| `.about-page__meta` | `repeat(3, 1fr)` | Below about body |
| `.projects-gallery` | `repeat(4, 1fr)` | Project cards |
| `.contact-page__links` | `1fr` | Centered single column |

---

## 6. Component Patterns

### Site Navigation (`.site-nav`)

- Fixed top-right, `z-index: 80`
- Flex column, `align-items: flex-end`, gap `8px`
- Links: uppercase, `#0b0b0a75` → `#0b0b0a` on hover
- Hover: `translate(-2px)` left
- Active page: `[aria-current='page']` → `color: #0b0b0a`
- Hidden during route transition (`opacity: 0`, `pointer-events: none`)

### Back Circle Control (`.back-circle-control`)

- Sticky top-left in shell, `z-index: 80`
- Round: `border-radius: 999px`, `width/height: clamp(38px, 3.1vw, 46px)`
- Background: `#0b0b0a`, hover: `#000` + `scale(0.94)`
- SVG arrow: 58% size, stroke-width 2.4px, white

### Mouse Stalker (`.mouse-stalker`)

- Fixed, `width/height: 18px`, `z-index: 160`
- SVG shape: `fill: #0b0b0a`, `stroke: #0b0b0a`, 1px stroke
- Label: white, weight 700, uppercase
- Arrow: white, round caps, 1.4px stroke
- Hidden on `@media (pointer: coarse)` (touch devices)

### Preloader (`.preloader`)

- Fixed fullscreen, `z-index: 999`
- Dark wave SVG (`#0b0b0a` fill) as background
- Text: white (`#ffffffeb`), uppercase, letter-spacing 0.14em
- Initially invisible (opacity 0, visibility hidden)

### Route Wave (`.route-wave`)

- Fixed fullscreen, `z-index: var(--z-route-wave)` (45)
- SVG path with GSAP-animated morphing between `waveClosedPath` / `waveMidPath` / `waveOpenPath` (defined in `components/waveTransition.ts`)
- Driven by `components/shell/useRouteTransition.ts`; click on nav covers → push route → reveal
- Reduced motion: preloader + nav transitions still disabled via `@media (prefers-reduced-motion)` blocks in `preloader.css` and `nav.css`

### Project Cards (`.project-card`)

- Aspect: flexible, `min-height: 420px`
- Background: `#e9e6df`
- Image: `object-fit: cover`, `transform: scale(1.015)`, hover → `scale(1.06)`
- Overlay: `rgba(255,255,255,0.72)` + `backdrop-filter: blur(14px)`, inset 12px from edges
- Title: h2, `font-weight: 500`, tight stacking (margin 7px top / 5px bottom)

### Home Rotate Hint (`.home-rotate-hint`)

- Fixed right-bottom, `z-index: 70`
- Animated vertical gradient line (`background-position` keyframes)
- Text: uppercase, `#0b0b0a85`, `pointer-events: none`

---

## 7. Animation & Motion

### Timing & Easing

| Context | Duration | Easing |
|---|---|---|
| Nav link hover | 0.18s | Default (ease) |
| Back-circle hover | 0.18s colors / 0.26s transform | `cubic-bezier(0.2, 0.8, 0.2, 1)` |
| Cursor transition | 0.18s | Default |
| Language toggle | 0.18s | Default |
| Project card image zoom | 0.52s | `cubic-bezier(0.2, 0.8, 0.2, 1)` |
| Contact link hover | 0.18s | Default |
| Rotate hint scroll | 1.9s | `ease-in-out` (infinite) |
| Film grain CSS animation | 0.83s | `steps(10)` (12fps) |
| Route transition | GSAP-morphed SVG path | `power2.in` cover / `power3.inOut` reveal |

### Animation Principles

- Subtle, fast transitions (most 0.18s)
- Transform-based hover effects (translate, scale)
- Cubic-bezier easing for organic feel (project cards, back-circle)
- `prefers-reduced-motion` disables all non-essential motion
- Film grain uses CSS animation instead of JS loop for performance
- WebGL scene throttled: 24fps home / 12fps non-home via RenderScheduler
- Sky background RAF throttled to 30fps

---

## 8. Responsive Breakpoints

| Breakpoint | Changes |
|---|---|
| **≤960px** | Gallery: 4-col → 2-col. Card min-height: 420px → 330px |
| **≤620px** | Gallery: 2-col → 1-col. Page shell header: right padding removed, last span hidden. Home meta: 3-col → 1-col. About meta: 3-col → 1-col. About intro text → left-aligned. Page padding reduces. |

### Mobile-Specific Adjustments

- Projects page: `padding: 82px 18px 28px` (tighter), `overflow: auto` (scrollable)
- Contact links: gap reduces, font-size scales up on small screens
- Mouse stalker: hidden on touch devices (`@media (pointer: coarse)`)

---

## 9. CSS Architecture

### File Organization

```
app/globals.css          ← imports all partials (order matters!)
app/styles/
├── base.css             ← Tokens (colors, spacing, z-index), @font-face, reset, html/body
├── shell.css            ← Fixed layers: webgl-background, persistent-experience, experience-page, home-rotate-hint
├── preloader.css        ← .preloader + .preloader__wave / __inner / __text
├── route-wave.css       ← .route-wave SVG cover/reveal overlay
├── nav.css              ← .site-nav + .back-circle-control
├── cursor.css           ← .mouse-stalker and children
├── background.css       ← .sky-layer, .webgl-canvas-wrap, .film-grain
├── page-shell.css       ← Page shell grid, intro, home profile, home meta, route-current
├── pages.css            ← Route-specific (projects, about, contact)
├── debug.css            ← Dev-only debug page styles (yellow-canvas-test, sky-bg-test)
└── responsive.css       ← All media queries (overrides, must be last)
```

### Import Order (globals.css)

1. `base.css` — foundations (must be first)
2. `shell.css` — fixed experience shell (webgl-bg, persistent-experience, experience-page, home-rotate-hint)
3. `preloader.css` — preloader layers
4. `route-wave.css` — route transition SVG overlay
5. `nav.css` — site nav + back-circle-control
6. `cursor.css` — mouse stalker
7. `background.css` — sky + film grain
8. `page-shell.css` — page layout shell
9. `pages.css` — route-specific styles
10. `debug.css` — debug/testing pages
11. `responsive.css` — overrides (must be last)

### Implementation Rules

- **No Tailwind** — plain CSS only
- **No CSS-in-JS** — all styles in `app/styles/*.css`
- **CSS custom properties** for theme tokens (colors, spacing, z-index). Z-index tokens (`--z-base`, `--z-content`, `--z-route-wave`, `--z-hint`, `--z-nav`, `--z-grain`, `--z-cursor`, `--z-debug`, `--z-preloader`) live in `base.css` and are referenced via `var(--z-*)` everywhere
- **Fluid sizing** via `clamp()` with consistent formula patterns
- **`contain` property** on fixed layers for performance isolation
- **`will-change`** used sparingly, only on animated elements during animation
- **`content-visibility: auto`** for below-the-fold content only
- **`prefers-reduced-motion`** respected everywhere

---

## 10. Accessibility

- All interactive elements keyboard-focusable with visible focus rings
- `prefers-reduced-motion` disables: page transition animations, film grain animation, nav transitions, rotate hint scroll
- Touch devices: custom cursor hidden (`pointer: coarse` media query)
- Semantic HTML structure preserved (h1/h2 hierarchy, landmarks)
- Color contrast maintained between text and backgrounds
