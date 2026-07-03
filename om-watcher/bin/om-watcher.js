#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import process from 'node:process';
import chokidar from 'chokidar';

// ─── ANSI codes ──────────────────────────────────────────────────────────────
const RESET       = '\x1b[0m';
const BG          = '\x1b[48;5;235m';   // dark background fill
const CYAN        = '\x1b[36m';          // vertical accents, progress fill
const DIM_BORDER  = '\x1b[38;5;242m';    // dim gray for corners / horizontals
const WHITE       = '\x1b[37m';          // title
const GRAY        = '\x1b[38;5;246m';    // subtitle, percentage
const BAR_EMPTY   = '\x1b[38;5;237m';    // unfilled progress cells

// ─── Panel geometry ──────────────────────────────────────────────────────────
const CONTENT_WIDTH     = 32;
const PANEL_WIDTH       = CONTENT_WIDTH + 2;  // │ border on each side
const PANEL_HEIGHT      = 5;                   // top + 3 content + bottom
const PROGRESS_BAR_W    = 22;
const MIN_COLS          = 60;
const MIN_ROWS          = 10;
const DEBOUNCE_MS       = 50;
const DEFAULT_THRESHOLD = 50000;

// ─── Number formatting ───────────────────────────────────────────────────────

/** Threshold display: if >= 1000, show X.Yk; else plain integer. */
function formatThreshold(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

/** Token display: <1k → plain, <1m → X.Yk, else X.Ym. */
function formatTokens(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'm';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

/** Percentage: 1 decimal. "—" if threshold is 0 and current > 0. */
function formatPercent(current, threshold) {
  if (threshold === 0) {
    return current === 0 ? '0.0%' : '\u2014';  // em dash
  }
  const pct = Math.min(100, (current / threshold) * 100);
  return pct.toFixed(1) + '%';
}

// ─── Config resolution ───────────────────────────────────────────────────────

/** Try to read & parse a JSON file; return null on any failure. */
function tryReadJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Resolve the observation-token threshold using the same priority as the
 * plugin: env → project config → global config → default.
 */
function resolveThreshold(cwd) {
  // 1. Environment variable
  const envVal = process.env.OM_REFLECTION_OBSERVATION_TOKENS;
  if (envVal !== undefined && envVal !== '') {
    const n = parseInt(envVal, 10);
    if (!Number.isNaN(n) && n > 0) return n;
  }

  // 2. Project config
  const projectCfg = tryReadJson(path.join(cwd, '.opencode', 'om-config.json'));
  const projectVal = projectCfg?.reflection?.observationTokens;
  if (typeof projectVal === 'number' && projectVal > 0) return projectVal;

  // 3. Global config
  const home = os.homedir();
  const globalCfg = tryReadJson(path.join(home, '.config', 'opencode', 'om-config.json'));
  const globalVal = globalCfg?.reflection?.observationTokens;
  if (typeof globalVal === 'number' && globalVal > 0) return globalVal;

  // 4. Fallback default
  return DEFAULT_THRESHOLD;
}

/**
 * Resolve the state directory:
 *   --state-dir <path>  >  OM_STATE_DIR env  >  <cwd>/.opencode/om-state/
 */
function resolveStateDir(cwd) {
  // CLI --state-dir
  const argIdx = process.argv.indexOf('--state-dir');
  if (argIdx !== -1 && argIdx + 1 < process.argv.length) {
    return path.resolve(process.argv[argIdx + 1]);
  }

  // OM_STATE_DIR env
  if (process.env.OM_STATE_DIR) {
    return path.resolve(process.env.OM_STATE_DIR);
  }

  // Default
  return path.join(cwd, '.opencode', 'om-state');
}

// ─── State file reading ──────────────────────────────────────────────────────

/** Read all .json files from stateDir; return array of parsed objects. */
function readAllSessions(stateDir) {
  const sessions = [];
  let names;
  try {
    names = fs.readdirSync(stateDir);
  } catch {
    return sessions; // dir doesn't exist or is unreadable
  }

  for (const name of names) {
    if (!name.endsWith('.json')) continue;
    try {
      const raw = fs.readFileSync(path.join(stateDir, name), 'utf-8');
      const data = JSON.parse(raw);
      sessions.push(data);
    } catch {
      // skip invalid JSON — do not crash
    }
  }
  return sessions;
}

/** Pick the session with the most recent updatedAt. */
function findPrimarySession(sessions) {
  if (sessions.length === 0) return null;
  return sessions.reduce((best, s) =>
    (s.updatedAt || 0) > (best.updatedAt || 0) ? s : best,
  );
}

// ─── Progress bar ────────────────────────────────────────────────────────────

/**
 * Build the coloured progress bar string (ANSI escapes included).
 * Does NOT end with RESET — the caller wraps the line and resets at the end
 * so the dark background (BG) stays active across the full line.
 */
function buildProgressBar(current, threshold) {
  if (threshold <= 0 || current <= 0) {
    return BAR_EMPTY + '\u2591'.repeat(PROGRESS_BAR_W);
  }
  const filled = Math.min(PROGRESS_BAR_W, Math.round((current / threshold) * PROGRESS_BAR_W));
  const empty  = PROGRESS_BAR_W - filled;
  return (
    CYAN + '\u2588'.repeat(filled) +
    BAR_EMPTY + '\u2591'.repeat(empty)
  );
}

// ─── Panel rendering ─────────────────────────────────────────────────────────

/** Application state object shape. */
let warned = false;

/**
 * Render the panel at the top-right corner of the terminal.
 * Uses ANSI cursor saves/restore to avoid disturbing the user's shell.
 */
function render(state) {
  /* ---- geometry ---- */
  const cols = process.stdout.columns || 80;
  const rows = process.stdout.rows    || 24;

  if (cols < MIN_COLS || rows < MIN_ROWS) {
    if (!warned) {
      warned = true;
      process.stderr.write(
        'om-watcher: terminal too small (<60 cols or <10 rows), skipping panel\n',
      );
    }
    return;
  }
  warned = false;

  const startCol = cols - PANEL_WIDTH + 1;  // 1-indexed
  if (startCol < 1) return;

  /* ---- derive display values ---- */
  const { tokens, threshold, sessionCount } = state;
  const fmtTokens     = formatTokens(tokens);
  const fmtThreshold  = formatThreshold(threshold);
  const pctText       = formatPercent(tokens, threshold);
  const barStr        = buildProgressBar(tokens, threshold);

  /* ---- build each visual line (no ANSI, just characters) ---- */
  const topBorder    = '\u256d' + '\u2500'.repeat(CONTENT_WIDTH) + '\u256e';
  const bottomBorder = '\u2570' + '\u2500'.repeat(CONTENT_WIDTH) + '\u256f';

  // Title  — append session count when >1
  const sessionSuffix = sessionCount > 1 ? ` \u00b7 ${sessionCount}` : '';
  const titleRaw     = `  Observational Memory${sessionSuffix}`;
  const titlePadded  = titleRaw.length > CONTENT_WIDTH
    ? titleRaw.slice(0, CONTENT_WIDTH - 1) + '\u2026'
    : titleRaw.padEnd(CONTENT_WIDTH);

  // Token line
  const tokenRaw    = `  ${fmtTokens} / ${fmtThreshold} tokens`;
  const tokenPadded = tokenRaw.length > CONTENT_WIDTH
    ? tokenRaw.slice(0, CONTENT_WIDTH - 1) + '\u2026'
    : tokenRaw.padEnd(CONTENT_WIDTH);

  // Progress bar line
  const leftGap   = '  ';
  const midGap    = '  ';
  const pctWidth  = pctText.length;
  const rightPad  = Math.max(0, CONTENT_WIDTH - leftGap.length - PROGRESS_BAR_W - midGap.length - pctWidth);

  /* ---- assemble ANSI-wrapped panel lines ---- */
  const lines = [
    // 0 — top border
    `${BG}${DIM_BORDER}${topBorder}${RESET}`,

    // 1 — title
    `${BG}${CYAN}\u2502${WHITE}${titlePadded}${CYAN}\u2502${RESET}`,

    // 2 — token count
    `${BG}${CYAN}\u2502${GRAY}${tokenPadded}${CYAN}\u2502${RESET}`,

    // 3 — progress bar  (re-assembled with ANSI codes since barStr has escapes)
    `${BG}${CYAN}\u2502${GRAY}${leftGap}${barStr}${GRAY}${midGap}${pctText}${' '.repeat(rightPad)}${CYAN}\u2502${RESET}`,

    // 4 — bottom border
    `${BG}${DIM_BORDER}${bottomBorder}${RESET}`,
  ];

  /* ---- emit ---- */
  let output = '\x1b[s';       // save cursor
  output += '\x1b[?25l';      // hide cursor

  for (let i = 0; i < lines.length; i++) {
    output += `\x1b[${i + 1};${startCol}H`;   // cursor → row i+1, col startCol
    output += lines[i];
    output += '\x1b[K';                         // clear to end of line
  }

  output += '\x1b[?25h';      // show cursor
  output += '\x1b[u';         // restore cursor

  process.stdout.write(output);
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────

function cleanup() {
  const cols = process.stdout.columns || 80;
  const startCol = Math.max(1, cols - PANEL_WIDTH + 1);

  let output = '\x1b[?25h';  // ensure cursor visible
  // Clear the panel area line by line
  for (let i = 0; i < PANEL_HEIGHT; i++) {
    output += `\x1b[${i + 1};${startCol}H`;
    output += '\x1b[0m';
    output += '\x1b[K';
  }
  // Move cursor down one line to leave a clean line before the shell prompt
  output += `\x1b[${PANEL_HEIGHT + 1};1H`;
  output += '\x1b[0m';
  process.stdout.write(output);
  process.exit(0);
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const cwd       = process.cwd();
  const stateDir  = resolveStateDir(cwd);
  const threshold = resolveThreshold(cwd);

  // Ensure state dir exists so the watcher can observe it
  try {
    fs.mkdirSync(stateDir, { recursive: true });
  } catch {
    // best-effort; watcher might fail later
  }

  let state = { tokens: 0, threshold, sessionCount: 0 };

  function updateState() {
    const sessions     = readAllSessions(stateDir);
    const primary      = findPrimarySession(sessions);
    state = {
      tokens:        primary?.observationTokens ?? 0,
      threshold,
      sessionCount:  sessions.length,
    };
    render(state);
  }

  // Initial render
  updateState();

  // Chokidar watcher
  const watcher = chokidar.watch(stateDir, {
    depth:      0,
    persistent: true,
    // Only report file changes, not directories
    ignored:    (p, stats) => stats?.isDirectory?.() === true,
  });

  let debounceId = null;
  function debouncedUpdate() {
    if (debounceId) clearTimeout(debounceId);
    debounceId = setTimeout(() => {
      updateState();
      debounceId = null;
    }, DEBOUNCE_MS);
  }

  watcher.on('add',    debouncedUpdate);
  watcher.on('change', debouncedUpdate);
  watcher.on('unlink', debouncedUpdate);
  watcher.on('error',  () => { /* silent — keep last known panel */ });

  // Terminal resize
  process.stdout.on('resize', () => { render(state); });

  // Clean exit
  process.on('SIGINT',  cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit',    () => {
    // Ensure cursor is visible even if cleanup wasn't called
    process.stdout.write('\x1b[?25h\x1b[0m');
  });
}

main();
