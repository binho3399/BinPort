#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const gitCheck = spawnSync("git", ["rev-parse", "--is-inside-work-tree"], {
  stdio: "ignore"
});
if (gitCheck.status !== 0) {
  console.log("Pre-commit: not in a git work tree, skip staging step.");
  process.exit(0);
}

const check = spawnSync("node", ["scripts/generate-codebase-mindmap.mjs", "--check", "--silent"], {
  stdio: "ignore"
});
if (check.status === 0) {
  console.log("Pre-commit: mindmap already up to date.");
  process.exit(0);
}

const generate = spawnSync("node", ["scripts/generate-codebase-mindmap.mjs", "--silent"], {
  stdio: "inherit"
});
if (generate.status !== 0) {
  process.exit(generate.status ?? 1);
}

const add = spawnSync("git", ["add", "docs/codebase-mindmap.md"], {
  stdio: "inherit"
});

if (add.status !== 0) {
  console.error("Failed to stage docs/codebase-mindmap.md in pre-commit hook.");
  process.exit(add.status ?? 1);
}

console.log("Pre-commit: codebase mindmap regenerated and staged.");
