# AI Token Optimization

This project uses two complementary tools to keep token usage low for the
`opencode-go-low-cost` preset:

- **RTK** — Rust command-line wrapper that compresses noisy CLI output
  (`rtk <command> [args...]`).
- **Ponytail** — OpenCode session-wide plugin
  (`@dietrichgebert/ponytail`) that prunes and trims LLM tool results.

Both are **opt-in** and only affect commands/scripts that go through them.
The original `npm` scripts are untouched.

---

## Quick start

```bash
# 1. Install RTK (one-time)
brew install rtk

# 2. (Optional) Verify the opencode plugin is registered
grep ponytail ~/.config/opencode/opencode.json

# 3. (Optional) Verify Ponytail default mode
cat ~/.config/ponytail/config.json
# { "defaultMode": "lite" }

# 4. Use the wrapped scripts
npm run ai:lint
npm run ai:typecheck
npm run ai:build
npm run ai:test
npm run ai:diff
```

After editing `~/.config/opencode/opencode.json` (Ponytail registration) or
`~/.config/ponytail/config.json` (default mode), **quit and restart
opencode** — config is loaded once at startup.

---

## RTK — Rust Token Killer

RTK is a smart CLI proxy. It intercepts well-known commands (`next build`,
`eslint`, `tsc`, `playwright test`, `git`, `ls`, `grep`, etc.) and rewrites
their output into a token-friendly summary, with no behavior change to the
underlying tool. Unknown commands fall back to passthrough.

### Syntax

```bash
rtk <command> [args...]
```

### Subcommands used by this project

| Script        | Command                         | Notes                                    |
| ------------- | ------------------------------- | ---------------------------------------- |
| `ai:build`    | `rtk next build --skip-env`     | `--skip-env` keeps Next.js env vars raw. |
| `ai:lint`     | `rtk eslint .`                  |                                          |
| `ai:typecheck`| `rtk tsc --noEmit`              |                                          |
| `ai:test`     | `rtk playwright test`           |                                          |
| `ai:diff`     | `rtk git diff`                  | Append args: `npm run ai:diff -- HEAD~1` |

The original scripts (`npm run build`, `npm run lint`, etc.) still exist and
run without RTK — keep them for CI or for any case where you need the full,
uncompressed output.

### Environment

| Variable                  | Effect                                              |
| ------------------------- | --------------------------------------------------- |
| `RTK_TELEMETRY_DISABLE=1` | Disable telemetry (recommended for CI / shared boxes). |
| `RTK_NO_TOML=1`           | Skip RTK's own config file discovery.               |
| `RTK_TOML_DEBUG=1`        | Verbose RTK config logging.                          |

### Disabling RTK per-invocation

```bash
# Use the original scripts (no RTK):
npm run build
npm run lint
npm run type-check
npm run smoke:test
```

### Installation alternatives (if `brew` is unavailable)

```bash
# Official install script (Linux/macOS, requires curl + sudo):
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/main/install.sh | bash
```

Latest release: **v0.43.0** — see <https://github.com/rtk-ai/rtk>.

---

## Ponytail — session-wide output pruning

Ponytail is a separate OpenCode plugin (`@dietrichgebert/ponytail`) that
trims tool output (especially shell, read, and list results) before it
reaches the model. It is registered globally in
`~/.config/opencode/opencode.json` under `plugin`, and configured by:

- `~/.config/ponytail/config.json` with `{"defaultMode": "<mode>"}`, **or**
- environment variable `PONYTAIL_DEFAULT_MODE=<mode>`.

### Modes

| Mode   | Effect                                                                 |
| ------ | ---------------------------------------------------------------------- |
| `lite` | Conservative trimming; safe default.                                   |
| `full` | Stricter; smaller tool results reaching the model.                     |
| `ultra`| Most aggressive; can drop tool output details — use with care.        |
| `off`  | Disabled.                                                              |

This project uses **`lite` as the default**. `full` is opt-in per session
(see "Switching modes" below).

### Switching modes at runtime (slash command)

Inside an opencode session:

```
/ponytail full      # strict mode for fixer/oracle-heavy work
/ponytail lite      # back to the default
/ponytail ultra     # aggressive (use only if output is drowning the model)
/ponytail off       # disable for the rest of the session
```

The switch is **session-global** — it affects all agents in the current
session, not a single lane. (Ponytail has no per-agent or per-lane override
in the oh-my-opencode-slim schema.)

### When to use `full`

- Long fixer/oracle sessions editing many files (`/ponytail full` first).
- Designer refactor or simplification passes (`/ponytail full` first).
- Verbose CI / test output (`ai:test` already compresses via RTK; Ponytail
  is rarely needed on top of that).

### When to leave it on `lite`

- Default for orchestrator / explorer / librarian work.
- Default for designer creative tasks.
- Any session dominated by planning, exploration, or long context
  accumulation.

---

## Recommended workflow

1. **Plan / explore / research sessions** — stay on `lite`. Use
   `npm run ai:typecheck` and `npm run ai:lint` as background checks; lean
   on `codegraph` (not full file reads) for code questions.
2. **Implementation / refactor sessions** — switch to `/ponytail full` at
   the top of the session, then run `ai:build` and `ai:test` as needed.
3. **Cleanup / simplification** — keep `/ponytail full`; pair with the
   `simplify` skill on the oracle lane.

---

## Disabling / rollback

### Disable Ponytail only

- **Per session:** `/ponytail off` in opencode.
- **Permanently:** remove `"@dietrichgebert/ponytail"` from
  `~/.config/opencode/opencode.json` `plugin` array, **or** set
  `PONYTAIL_DEFAULT_MODE=off` in your shell rc. Restart opencode.

### Remove RTK scripts

Edit `package.json` and delete the `ai:*` lines. Original scripts are
untouched, so this is a clean removal.

### Full revert

Backups were created on first edit:

- `~/.config/opencode/opencode.json.bak.rtk-ponytail.<timestamp>`
- `package.json.bak.rtk-ponytail.<timestamp>`

To restore:

```bash
cp ~/.config/opencode/opencode.json.bak.rtk-ponytail.<timestamp> \
   ~/.config/opencode/opencode.json
cp package.json.bak.rtk-ponytail.<timestamp> \
   package.json
rm -rf ~/.config/ponytail/
```

Then restart opencode.

---

## Files touched

- `~/.config/opencode/opencode.json` — added `"@dietrichgebert/ponytail"`
  to the `plugin` array. No model routing, MCP, or provider changes.
- `~/.config/ponytail/config.json` — new file, `{"defaultMode": "lite"}`.
- `package.json` — added `ai:build`, `ai:lint`, `ai:typecheck`, `ai:test`,
  `ai:diff`. Original scripts preserved.
- `oh-my-opencode-slim.json` preset — **not modified**. Model names,
  variants, and lane structure are exactly as the user specified.

## Known limitations

- Ponytail is session-global; per-lane Lite/Full is not supported.
- `ai:dev` and `ai:start` were intentionally **not** added — RTK is
  optimized for batch tools with noisy output, not interactive/long-running
  dev servers.
- RTK is a local CLI, not an opencode plugin. It runs only when invoked
  via the `ai:*` scripts or directly.
