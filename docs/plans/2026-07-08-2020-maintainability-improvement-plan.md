# Maintainability Improvement Plan

## Purpose

Tài liệu này gom lại reviewed findings từ architecture drift + oracle review thành backlog thực thi an toàn. Mục tiêu là giảm coupling trong shared experience shell, làm rõ ownership/contracts, và tăng confidence trước khi tiếp tục parity/features.

## Current assessment

- Shell hiện deliver được trải nghiệm chính, nhưng shared layer vẫn có vài implicit contracts chưa được document/test đủ rõ.
- `PersistentExperience` cần tiếp tục giữ vai trò orchestrator mỏng; một số responsibilities vẫn có xu hướng dồn vào shared layer.
- Route transition / adaptive experience behavior có risk regression cao nếu đổi mà không có focused tests.
- WebGL lifecycle và persistent-vs-home-only behavior cần quyết định/document rõ hơn trước khi refactor sâu.
- Debug/dev-only boundaries đã có nhưng vẫn nên cleanup để tránh bleed vào production paths.

### Caution: current uncommitted high-risk files

Các file dưới đây đang là vùng shared/high-impact, nên tránh chồng thêm refactor lớn khi working tree chưa sạch:

- `components/PersistentExperience.tsx`
- `components/SkyBackground.tsx`
- `components/WebGLScene.tsx`
- `components/webgl/SignalModel.tsx`
- `components/useAdaptiveExperienceMode.ts`
- `app/styles/shell.css`

## Prioritized backlog

### P0 — Tests for shell / adaptive transitions

Mục tiêu: có regression coverage cho shared shell state, route transitions, adaptive experience behavior.

File targets:

- `components/PersistentExperience.tsx`
- `components/shell/useRouteTransition.ts`
- `components/useAdaptiveExperienceMode.ts`
- existing test locations / new focused test files near shell behavior

Notes:

- Cover happy path + reduced-motion/adaptive branches.
- Ưu tiên test contracts, không snapshot-heavy UI noise.

### P0 — Formalize experience mode contract

Mục tiêu: document rõ input/output/ownership của “experience mode” để tránh hidden assumptions giữa shell, route layer, WebGL, và sky.

File targets:

- `components/useAdaptiveExperienceMode.ts`
- `components/PersistentExperience.tsx`
- `docs/architecture.md` or follow-up focused docs if needed

Notes:

- Define when mode changes, ai consumes the mode, và fallback behavior là gì.

### P1 — Reduce `useRouteTransition` DOM selector coupling via refs

Mục tiêu: bớt query/select coupling, làm transition hook predictable hơn và dễ test hơn.

File targets:

- `components/shell/useRouteTransition.ts`
- `components/PersistentExperience.tsx`
- any route shell wrapper components receiving refs

Notes:

- Prefer explicit refs/contracts over brittle selector lookups.

### P1 — Decide/document home-only vs persistent WebGL

Mục tiêu: chốt architectural decision cho WebGL lifecycle across routes trước khi tối ưu tiếp.

File targets:

- `components/PersistentExperience.tsx`
- `components/WebGLScene.tsx`
- `components/webgl/modelRoutes.ts`
- `docs/architecture.md`
- this plan / related docs if ADR-style note is added later

Notes:

- Decision phải cover UX intent, performance tradeoff, cleanup expectations, route parity impact.

### P1 — Harden WebGL resource lifecycle

Mục tiêu: cleanup/material/texture/frame-loop lifecycle rõ ràng hơn để tránh leaks or stale state.

File targets:

- `components/WebGLScene.tsx`
- `components/webgl/SignalModel.tsx`
- `components/webgl/prepareScene.ts`
- `components/webgl/textureAnimation.ts`
- related hooks under `components/webgl/`

Notes:

- Focus on mount/unmount, route changes, asset reuse, listener disposal.

### P2 — Debug boundary cleanup

Mục tiêu: tách rõ debug-only code paths/styles khỏi production experience.

File targets:

- `app/(debug)/codegraph/page.tsx`
- `app/(debug)/*` debug/test routes
- `app/api/codegraph/*`
- `lib/codegraph-db.ts` or future `lib/debug/*`
- `app/styles/debug.css`

Notes:

- Keep diagnostics discoverable nhưng không leak assumptions vào main shell.

### P2 — Move hardcoded copy/config

Mục tiêu: giảm hardcoded strings/config rải rác trong components khi đã có canonical owner file.

File targets:

- `components/pages/*`
- `components/PersistentExperience.tsx`
- `lib/siteContent.ts`
- `lib/projects.ts`
- `lib/routes.ts`

Notes:

- Chỉ move những gì thực sự canonical/reused; tránh over-abstract copy nhỏ không cần thiết.

### P2 — Keep `PersistentExperience` thin

Mục tiêu: tiếp tục enforce orchestrator-only role, tránh “god component”.

File targets:

- `components/PersistentExperience.tsx`
- `components/shell/*`
- sibling components (`Cursor`, `SiteNav`, `Preloader`, `SkyBackground`, `WebGLScene`)

Notes:

- New logic nên đẩy xuống dedicated hook/module nếu không phải composition concern.

## Safe implementation order

1. Add/fix tests for shell + adaptive experience behavior first.
2. Formalize/document experience mode contract.
3. Decide persistent-vs-home-only WebGL behavior and document decision.
4. Refactor `useRouteTransition` selector coupling toward refs.
5. Harden WebGL resource lifecycle with tests/verification in place.
6. Cleanup debug boundaries.
7. Move hardcoded copy/config to canonical `lib/*` owners.
8. Final pass: thin `PersistentExperience` further only after contracts are stable.

## Verification matrix

| Area | Verify with |
|---|---|
| Shell/adaptive transitions | Focused tests + route navigation smoke across `/`, `/projects`, `/about`, `/contact` |
| Experience mode contract | Doc/code review: inputs, outputs, owners, fallback states are explicit |
| Route transition refactor | No selector regressions; transition timing/visibility still correct |
| WebGL architecture decision | Decision documented; behavior consistent across named routes |
| WebGL lifecycle hardening | Manual route-change checks + build/type/lint + no obvious stale canvas/resource symptoms |
| Debug cleanup | Debug routes still work intentionally; production paths unchanged |
| Copy/config moves | Canonical text/config lives in `lib/*`; no unintended content changes |
| Thin `PersistentExperience` | File responsibility reduced without moving route-specific hacks into new shared layers |

## Non-goals

- Không phải feature roadmap.
- Không phải visual redesign plan.
- Không yêu cầu đổi homepage copy/content.
- Không ép refactor toàn bộ WebGL stack trong một pass.
- Không đụng application source ngay trong doc task này; đây là execution guide cho follow-up work.
