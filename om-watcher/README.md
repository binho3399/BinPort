# om-watcher

A standalone terminal tool that watches the [Observational Memory](https://github.com/solvedbydev/opencode-observational-memory) plugin's state files and renders a compact status panel in the **top-right corner** of the terminal.

```
┌──────────────────────────────┐
│  Observational Memory        │
│  30 / 50.0k tokens           │
│  ████░░░░░░░░░░░░░░░░░░░░░  0.1%  │
└──────────────────────────────┘
```

Run it in a separate terminal pane (tmux / iTerm / kitty split) alongside `opencode`.

## Usage

```bash
npx om-watcher
# or from this repo:
node bin/om-watcher.js
```

The panel appears at the top-right of the terminal and updates in real time as the plugin writes state files.

## Configuration resolution order

State directory (where session `.json` files are stored):

1. `--state-dir <path>` CLI argument
2. `OM_STATE_DIR` environment variable
3. `<cwd>/.opencode/om-state/` (default)

Observation-token threshold (used for the progress bar and the `50.0k` display):

1. `OM_REFLECTION_OBSERVATION_TOKENS` environment variable (positive integer)
2. `<cwd>/.opencode/om-config.json` → `reflection.observationTokens`
3. `~/.config/opencode/om-config.json` → `reflection.observationTokens`
4. `50000` (default)

This mirrors the same resolution logic the plugin uses internally.

## Example: tmux split

```bash
# Split window vertically, run watcher in the right pane
tmux split-window -h "node /path/to/om-watcher/bin/om-watcher.js"
```

## Example: iTerm2 split pane

```bash
# Open a new vertical split and run the watcher
echo -e '\x1b]1337;Split=vert\x07' && node bin/om-watcher.js
```

## Requirements

- Node.js >= 18
- A terminal that supports 256-color ANSI escapes and Unicode box-drawing characters
