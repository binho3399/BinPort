# Worklog

Lịch sử các task đã thực hiện trong project. Mỗi task có table summarize các vấn đề đã làm.

## Task: Route `/bg-test-2` — Animated Clouds / Fog

**Ngày:** 2026-06-29
**Files thay đổi:**
- `app/(debug)/bg-test-2/page.tsx` (mới) — route `/bg-test-2`
- `components/AnimatedClouds.tsx` (mới, rewrite nhiều lần) — canvas animation
- `app/styles/debug.css` — styles cho `.bg-test-2`
- `WORKLOG.md` (mới) — file này

### Summary table

| # | Vấn đề / Yêu cầu | Giải pháp | Kết quả |
|---|---|---|---|
| 1 | Tạo route `/bg-test-2` + animated cloud realistic | Tạo page trong `(debug)`, component `AnimatedClouds` vẽ canvas 2D | Route hoạt động |
| 2 | Cloud to + nhiều lớp sương mù, view như đứng trong sương | Chuyển từ discrete clouds → 5 fog bands (wavy bands) full-width, alpha thấp chồng lớp | Cảm giác sương mù |
| 3 | Layer sương rõ hơn | Tăng alpha (0.55→0.85), gradient giữ đậm lâu hơn | Rõ hơn |
| 4 | Layer cao 1/3 viewport + đường cong mạnh hơn | `height * 0.33`, wavy path (sin wave 2-2.4 chu kỳ) + destination-in horizontal gradient | Band cong, cao đúng |
| 5 | Khối mây to đan xen + movement thực tế | Rewrite → **volumetric cloud masses** (8 cụm, 8-10 blob/cụm), drift+morph+breathe+rotation | Khối to, đan xen, sống động |
| 6 | Tăng số lượng + contrast + cloud về phía dưới | 8→14 cụm, alpha tăng, y `0.42→0.95` viewport | Nhiều hơn, rõ hơn, phía dưới |
| 7 | Tăng contrast mạnh (đang nhạt nhòa) | Alpha gần 0.92-1.0, gradient ×1.15, lõi ×1.6 | Contrast cao |
| 8 | Tăng nhẹ background cho cloud nổi | `#d6e4ed`→`#a8c3d8` (top) và tương ứng | Cloud nổi hơn |
| 9 | Giảm bg lại 1 chút → rồi chỉnh về phía mức cũ | 2 bước: `#bccfde` → `#c8d8e4` (top) | Cân bằng |
| 10 | Layer tự nhiên hơn (tránh circle) + cloud chỉ 1/3 dưới | **Organic blob path** (14 điểm biên, quadraticCurveTo) thay `ctx.arc`; y `0.7→0.98` | Biên lởm chởm tự nhiên, cloud đáy |
| 11 | Edges mịn hơn + tăng contrast + thêm layer sương 1/5 dưới | Thêm `ctx.filter='blur(3px)'` + gradient 5 stops; depth 4 (4 cụm y 0.82→1.0); alpha tăng | Mịn + thêm layer |
| 12 | **Debug lag/nóng máy** | Phát hiện `ctx.filter='blur(3px)'` apply cho ~180 fill/frame (~10,800 blur/sec) = perf killer. **Bỏ blur hoàn toàn**, giữ gradient fade | Hết lag/nóng, vẫn mịn |
| 13 | Cloud mờ dần từ tâm ra, giảm sắc nét cạnh | Gradient outer radius ×1.5, 6 stops fade dề đều (72%→42%→20%→8%→0) | Fade mịn hơn |
| 14 | Dùng Playwright check edges chưa mịn | Pixel analysis phát hiện: path tại `radius×0.78-1.2` nhưng gradient fade tới 0 tại `radius×1.5` → **path cắt gradient khi alpha còn ~0.2 = cạnh cứng**. Fix: đảo ngược — gradient fade tới 0 tại `radius×1.3`, path kéo dài `radius×1.4-1.9` (vượt quá fade) → biên path vô hình | Transition width **215-690px (TB 451px)**, max jump pixel **3-6**, cực mịn |

### Bài học rút ra

- **`ctx.filter = 'blur()'`** là perf killer của Canvas 2D khi apply cho nhiều fill lớn/frame. Tránh dùng; ưu tiên radial gradient fade để làm mềm edge.
- **Path biên phải nằm ngoài vùng fade** của gradient (alpha 0) để không bị cắt cứng. Nếu path ở giữa vùng fade, alpha tại biên ≠ 0 → cạnh sắc nét.
- Khi debug visual bằng Playwright, **chọn đúng canvas** (project có WebGL canvas của PersistentExperience) — filter canvas có 2d context.
- Pixel analysis (đo brightness jump, transition width) khách quan hơn nhìn bằng mắt để đánh giá edge smoothness.

---

## [2026-06-29] Task: Tạo quy trình cập nhật work history (PLAN.md)

**Files thay đổi:**
- `PLAN.md` (mới) — định nghĩa quy trình luôn cập nhật `WORKLOG.md` theo timeline sau mỗi task, kèm template entry và thứ tự thực hiện
- `WORKLOG.md` (sửa) — append entry này theo template của PLAN.md

### Summary

| # | Vấn đề / Yêu cầu | Giải pháp | Kết quả |
|---|---|---|---|
| 1 | Cần file quy định luôn cập nhật history công việc theo timeline | Tạo `PLAN.md` định nghĩa: quy trình (todo → implement → verify → append), template entry (ngày/files/table/bài học), thứ tự thực hiện | Quy trình sẵn sàng áp dụng |
| 2 | Áp dụng quy tắc: sau session tạo history ghi vào worklog | Append entry này vào `WORKLOG.md` theo đúng template đã định nghĩa | Entry đầu tiên theo format mới |

### Bài học rút ra
- Tách biệt rõ: `AGENTS.md` (instructions tự load), `PLAN.md` (quy trình work history), `WORKLOG.md` (timeline history). Không trộn lẫn roles.

---

## [2026-06-29] Task: Tăng contrast mây + gió trái→phải mạnh hơn (bg-test-2)

**Files thay đổi:**
- `components/AnimatedClouds.tsx` (sửa) — tăng baseAlpha + gradient opacity, đổi driftX luôn dương (trái→phải), tăng driftRange 3x

### Summary

| # | Vấn đề / Yêu cầu | Giải pháp | Kết quả |
|---|---|---|---|
| 1 | Tăng contrast các đám mây | Tăng baseAlpha (depth 0-3: 0.96→0.98, 0.82→0.92, 0.68→0.82, 0.7→0.86); tăng gradient stops (stop 0: ×1.15→×1.3, stop 0.3: ×0.8→×0.92, core: ×1.6→×1.85) | Mây đậm hơn, rõ ràng với nền trời |
| 2 | Mây di chuyển trái→phải | Bỏ random sign `*(Math.random()<0.85?1:-1)`, driftX luôn dương; đơn giản hóa wrap logic (chỉ reset khi ra phải) | 100% mây drift trái→phải |
| 3 | Tăng sức gió | driftRange: depth0 14-20→40-60, depth1 10-15→30-45, depth2 8-12→22-32, depth3 6-11→18-28 (px/s) | Tốc độ gió ~3x cũ |

### Bài học rút ra
- Khi đổi hướng drift thành 1 chiều, phải dọn dead branch trong wrap logic (else if driftX<0) để code sạch.
- Tăng contrast = tăng alpha trung tâm + tăng alpha mid-stops, không chỉ tăng baseAlpha.

---

## [2026-06-29] Task: Tăng số lượng layers cloud (bg-test-2)

**Files thay đổi:**
- `components/AnimatedClouds.tsx` (sửa) — mở rộng từ 4 → 7 depth layers, tổng 18 → 38 cloud masses

### Summary

| # | Vấn đề / Yêu cầu | Giải pháp | Kết quả |
|---|---|---|---|
| 1 | Tăng số lượng layers cloud | Mở rộng depths array từ 4 → 7 layers; thêm 2 layer nhỏ (scale 0.35-0.55, 0.45-0.7) cho mây xa mờ; tăng count mỗi layer (5→6 ở 3 layer gần) | 38 masses, 7 depth layers, density sâu hơn |

### Bài học rút ra
- Thêm layer nhỏ (scale thấp, alpha thấp) ở yRange dưới tạo cảm giác mây xa mờ, tăng chiều sâu scene mà không bị đặc.
- Giữ gradient scale/alpha/drift giảm dần theo depth để parallax tự nhiên.

---

## [2026-06-29] Task: Tăng sức gió (bg-test-2)

**Files thay đổi:**
- `components/AnimatedClouds.tsx` (sửa) — tăng driftRange ~2x cho tất cả 7 layers

### Summary

| # | Vấn đề / Yêu cầu | Giải pháp | Kết quả |
|---|---|---|---|
| 1 | Clouds di chuyển nhanh hơn | Tăng driftRange: layer0 42-60→85-120, layer1 34-48→70-95, layer2 28-40→55-78, layer3 22-32→42-60, layer4 18-26→34-48, layer5 18-28→34-52, layer6 14-22→26-38 (px/s) | Tốc độ gió ~2x |

### Bài học rút ra
- Khi tăng drift speed, parallax càng rõ: layer gần chạy nhanh, layer xa chậm → chiều sâu scene mạnh hơn.

---

## [2026-06-29] Task: Tăng contrast layers cloud rõ ràng hơn (bg-test-2)

**Files thay đổi:**
- `components/AnimatedClouds.tsx` (sửa) — tăng gradient opacity + đẩy tint layer xa đậm hơn để tách lớp

### Summary

| # | Vấn đề / Yêu cầu | Giải pháp | Kết quả |
|---|---|---|---|
| 1 | Mây trông rõ ràng hơn (tăng contrast) | Blob gradient: center ×1.3→×1.45, thêm stop 0.35 ×1.05, mid-stops đậm hơn. Core: center ×1.85→×2.0, stop 0.4 ×0.85 | Mây đậm/đặc hơn, khối rõ |
| 2 | Tách lớp giữa các layers | Đẩy tint layer xa đậm/xanh hơn (layer2 248→244, layer3 240→232, layer4 232→220, layer6 224→212) | Parallax depth rõ, layer xa phân biệt với layer gần + nền |

### Bài học rút ra
- Không xem được ảnh user gửi (model không hỗ trợ image input) → áp dụng tăng contrast tổng thể dựa trên code.
- Tăng contrast theo 2 hướng: (1) opacity gradient mỗi blob, (2) chênh lệch tint giữa các depth layers để tách lớp.

---

## [2026-06-30] Task: Optimize homepage + codebase (Phase 0-5)

**Files thay đổi:**
- `public/models/model.glb` (sửa) — nén Meshopt, 842KB → 246KB (71% giảm, visually lossless)
- `app/layout.tsx` (sửa) — async Typekit qua `next/script` lazyOnload + preconnect; thêm `viewport` export (themeColor)
- `app/styles/base.css` (sửa) — `font-display: auto` → `swap` (chống FOIT)
- `components/PersistentExperience.tsx` (sửa) — `dynamic(() => import('./WebGLScene'), { ssr:false })` code-split three.js; FilmGrain thay GSAP loop bằng CSS animation `steps(10)` 0.83s
- `next.config.mjs` (sửa) — `experimental.optimizePackageImports` (three, drei, fiber, gsap, lucide-react), `compiler.removeConsole` (exclude error), `images.formats` (avif, webp)
- `app/loading.tsx` (mới) — route loading skeleton minimal
- `components/WebGLScene.tsx` (sửa) — RenderScheduler idle throttle 24fps home / 12fps non-home; adaptive shadow map 1024 home / 512 non-home
- `components/SkyBackground.tsx` (sửa) — RAF throttle 60fps → 30fps (giảm 50% drawImage/frame)
- `components/webgl/SignalModel.tsx` (sửa) — texture redraw interval 24fps home / 12fps non-home
- `app/styles/shell.css` (sửa) — xóa permanent `will-change` trên `[data-text-reveal]`; `.mouse-stalker` will-change bỏ `width,height`; thêm `contain: layout paint style` trên `.webgl-background`, `.preloader`; mở rộng `prefers-reduced-motion` (nav, back-circle)
- `app/styles/background.css` (sửa) — `contain: layout paint style` trên `.film-grain`; `animation: none` trong reduced-motion
- `app/styles/page-shell.css` (sửa) — `prefers-reduced-motion` block cho page-transition (filter/transition/will-change reset)
- `app/styles/pages.css` (sửa) — `content-visibility: auto` + `contain-intrinsic-size: auto 800px` trên `.projects-gallery`

### Summary

| # | Vấn đề / Yêu cầu | Giải pháp | Kết quả |
|---|---|---|---|
| 1 | Model 842KB load blocking homepage | Nén Meshopt via `@gltf-transform/cli meshopt` (visually lossless) | 842KB → 246KB raw, 106KB transfer (87% giảm transfer) |
| 2 | Three.js 1.13MB trong initial bundle mọi route | `dynamic(() => import('./WebGLScene'), { ssr:false })` + loading fallback | Initial JS 1.13MB+ → 446KB rootMainFiles (60% giảm initial payload) |
| 3 | Typekit CSS render-blocking trong `<head>` | `next/script` strategy="lazyOnload" + preconnect + preload | Non-blocking font load (FOUT thay FOIT) |
| 4 | `font-display: auto` gây FOIT | `font-display: swap` | Text luôn visible khi font load |
| 5 | FilmGrain GSAP tween 12fps mãi mãi trên main thread | CSS animation `steps(10)` 0.83s + `prefers-reduced-motion: none` | Bỏ 1 permanent main-thread loop |
| 6 | SkyBackground RAF 60fps liên tục (~50 drawImage/frame) | Throttle 30fps, RAF schedule top-first, elapsed time giữ nguyên | Giảm 50% GPU draw work, cloud speed identical |
| 7 | RenderScheduler idle 24fps trên mọi route | 24fps home / 12fps non-home (interactive prop) | Giảm render idle trên /about,/contact,/projects |
| 8 | Shadow map 1024 trên mọi route | Adaptive 1024 home / 512 non-home | Giảm GPU fill cost non-home |
| 9 | Texture redraw 24fps trên mọi route | 24fps home / 12fps non-home (textureInterval) | Giảm CPU useFrame non-home |
| 10 | Permanent `will-change` trên ~8 element groups | Xóa rule; `.mouse-stalker` bỏ `width,height` | Giảm compositor layer memory |
| 11 | 10 fixed layers không contain | `contain: layout paint style` trên webgl-bg, preloader, film-grain | Isolate rendering, giảm layout recalc |
| 12 | `prefers-reduced-motion` incomplete | Mở rộng: nav, page-transition, film-grain animation | Accessibility đầy đủ |
| 13 | Offscreen project cards render không cần | `content-visibility: auto` + `contain-intrinsic-size` trên gallery | Browser skip render offscreen cards |
| 14 | Next config tối giản | `optimizePackageImports`, `removeConsole`, `images.formats` avif/webp | Bundle + image optimization |
| 15 | Không có viewport export | `export const viewport` (themeColor #050505) | UX/meta |

## [2026-07-01] Task: Tạo DESIGN.md + cập nhật references

**Files thay đổi:**
- `DESIGN.md` (mới) — comprehensive design system document: color palette, typography, spacing, layout, component patterns, animation, responsive breakpoints, CSS architecture, accessibility
- `AGENTS.md` (sửa) — thêm section "Design System" tham chiếu DESIGN.md (trước Codebase Map)
- `CLAUDE.md` (sửa) — thêm section "Design System" tham chiếu DESIGN.md (trước Parity / Visual Work)

### Summary

| # | Vấn đề / Yêu cầu | Giải pháp | Kết quả |
|---|---|---|---|
| 1 | Không có single source of truth cho design system — colors/typography/spacing phân tán trong 7 file CSS | Tạo `DESIGN.md` extract tất cả design tokens, patterns, conventions từ CSS vào một file có cấu trúc | 10 sections, ~250 lines, coverage toàn bộ design system |
| 2 | Agents không biết có DESIGN.md để tham chiếu | Thêm section "Design System" vào đầu `AGENTS.md` (instructions tự load) và `CLAUDE.md` (context cho Claude) | Cả 2 file đều reference DESIGN.md là single source of truth |

### Bài học rút ra
- Khi extract design system từ CSS, cần đọc kỹ tất cả file (kể cả debug.css) để không miss token
- Section ordering trong DESIGN.md nên theo: foundations (colors, typography, spacing) → patterns (layout, components) → behavior (animation, responsive) → architecture (CSS files) → accessibility
- AGENTS.md nên để reference DESIGN.md trước Codebase Map vì design consistency ảnh hưởng mọi route và component

---

### Bài học rút ra
- **Meshopt compression** qua `@gltf-transform/cli meshopt` giảm 71% file size visually lossless — tốt hơn Draco cho parity tuyệt đối. Drei v10.7.7 `useGLTF` auto-register `MeshoptDecoder` by default (`useMeshopt=true`), không cần code thêm.
- **Turbopack code-split**: `dynamic({ ssr:false })` tách three.js vào dynamic chunk (1.04MB) — không nằm trong `rootMainFiles` (initial load). Initial payload giảm 60% dù total JS không đổi. Đo `rootMainFiles` trong `build-manifest.json`, không phải total chunks.
- **3 lane song song** (fixer WebGL + fixer shell/config + designer CSS) với write scope không giao nhau → hoàn thành 15 thay đổi trong 1 round, chỉ cần reconcile + verify 1 lần.
- **CSS animation thay GSAP loop**: `steps(10)` timing function + 10 keyframes = 12fps jitter, parity-safe ở opacity 0.06 + mix-blend overlay. Bỏ được permanent main-thread tween.
- **`content-visibility: auto`** chỉ áp dụng cho below-the-fold content (`.projects-gallery`), không cho above-the-fold — tránh blank viewport.
- **`contain: layout paint style`** trên fixed full-viewport layers (webgl-bg, preloader, film-grain) → isolate rendering, không ảnh hưởng visual.
