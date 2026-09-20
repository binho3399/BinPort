# Cloned Web — Project Instructions

Next.js 16 / React 19 rebuild Hirotos-style: persistent WebGL background, fixed shell, cursor, route transitions, gallery.

## Memory & CodeGraph

- Nếu dùng memory tool, scope `project: "cloned-web"`; query prefix `cloned-web:`. Track: `next16`, `react19`, `threejs`, `webgl-background`, `hirotos-parity`, `route-transitions`.
- Nếu `.codegraph/` tồn tại, dùng CodeGraph trước broad search; nếu không có/DB unavailable thì skip.

## Visual rules

- Reference mặc định: `https://www.hirotos.com/` cho homepage parity; nếu user chỉ định local clone, inspect nó trước.
- Giữ copy/content ổn định trừ khi user yêu cầu đổi copy.
- Preserve fixed full-viewport shell: hidden overflow, fixed WebGL background/route layer/nav/cursor/preloader/transition overlays.
- `DESIGN.md` là source of truth UI; `docs/architecture.md` là source of truth module ownership. Không invent design values.
- Shared shell changes (`PersistentExperience`, `Cursor`, `WebGLScene`, `app/styles/*`) ảnh hưởng mọi route; chỉ refactor shared code khi issue proven originate there.
- Ảnh/screenshot: orchestration lane đọc trực tiếp, describe layout/color/typography/spacing/text trước khi quyết UI. Cần clipboard image trên macOS: `pngpaste /tmp/opencode_paste.png`.

## Debugging WebGL

- Screenshot check dùng `http://localhost:<port>`, không `127.0.0.1` trừ khi config cho phép.
- Blank/stale model: kiểm tra origin/console/HMR blocked, `/models/model.glb` 200, canvas client/drawing buffer size, camera/scroll/material trước khi đổi Three.js.
- Visual parity khác nhau dev/prod → tin production hơn.

## Workflow

- Plans user yêu cầu lưu `docs/plans/YYYY-MM-DD-HHMM-<plan-name>.md`; không commit draft throwaway.
- `app/codegraph/*` là dev helper; production/unavailable trả `notFound()` là intentional.
- `.env.example` chỉ placeholder; giữ không chứa secrets.

## Commands & verification

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run type-check
npm run format:check
npm run format
npm run smoke:test
npm run analyze
```

- Normal change: `npm run type-check` + `npm run lint`.
- Before commit hoặc shared shell/WebGL/CSS change: `npm run build`.
- Parity: production build, start free port, browser/Playwright screenshot qua `http://localhost:<port>`. Shared change: verify `/`, `/projects`, `/about`, `/contact` khi khả thi.
- Port occupied → inspect và chọn port khác, không kill process lạ. Failure sau focused change → xác định liên quan trước khi mở rộng scope.
