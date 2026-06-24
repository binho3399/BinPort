<!-- CODEGRAPH_START -->
## CodeGraph

In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the repo root), reach for it BEFORE grep/find or reading files when you need to understand or locate code:

- **MCP tools** (when available): `codegraph_explore` answers most code questions in one call - the relevant symbols' verbatim source plus the call paths between them. `codegraph_node` returns one symbol's source + callers, or reads a whole file with line numbers. If the tools are listed but deferred, load them by name via tool search.
- **Shell** (always works): `codegraph explore "<symbol names or question>"` and `codegraph node <symbol-or-file>` print the same output.

If there is no `.codegraph/` directory, skip CodeGraph entirely - indexing is the user's decision.
<!-- CODEGRAPH_END -->

## Local Visual Debugging

- When verifying this Next.js app with Playwright or browser screenshots, use `http://localhost:<port>` instead of `http://127.0.0.1:<port>` unless `next.config.mjs` explicitly allows `127.0.0.1` in `allowedDevOrigins`.
- Next dev may block HMR/dev resources from `127.0.0.1` as a cross-origin request when the server advertises `localhost`. That can leave WebGL captures misleadingly blank or stale even when the app code is fine.
- If a screenshot does not show the 3D model, first confirm the exact origin, check the browser console for blocked `/_next/webpack-hmr` messages, and verify `/models/model.glb` appears in network requests with `200 OK` before debugging Three.js scene code.
- For WebGL screenshot checks, confirm the canvas client size and drawing buffer size; the canvas should visually fill `.webgl-background`.
