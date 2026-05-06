#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();
const CONFIG_PATH = path.join(ROOT_DIR, "scripts", "mindmap.config.json");
const raw = fs.readFileSync(CONFIG_PATH, "utf8");
const config = JSON.parse(raw);

const ignoreDirs = new Set(config.ignoreDirs ?? []);
const ignoreFiles = new Set(config.ignoreFiles ?? []);
const outputFile = config.outputFile.split("/").join(path.sep);
const maxDepth = config.maxDepth ?? 3;

let timer = null;
let running = false;
let lastSignature = "";

function shouldIgnore(relPath) {
  const normalized = relPath.split(path.sep).join(path.sep);
  if (!normalized || normalized === ".") {
    return false;
  }
  const parts = normalized.split(path.sep);
  if (parts.some((part) => ignoreDirs.has(part))) {
    return true;
  }
  const fileName = parts[parts.length - 1];
  if (ignoreFiles.has(fileName)) {
    return true;
  }
  if (normalized === outputFile) {
    return true;
  }
  return false;
}

function generate() {
  if (running) {
    return;
  }
  running = true;
  const child = spawn("node", ["scripts/generate-codebase-mindmap.mjs"], {
    cwd: ROOT_DIR,
    stdio: "inherit"
  });
  child.on("exit", () => {
    running = false;
  });
}

function scheduleGenerate() {
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => {
    generate();
  }, 300);
}

function collectSignature() {
  const entries = [];

  function walk(currentRelPath, depth) {
    if (depth > maxDepth + 1) {
      return;
    }
    const absPath = path.join(ROOT_DIR, currentRelPath);
    const dirEntries = fs.readdirSync(absPath, { withFileTypes: true });
    for (const entry of dirEntries) {
      const relPath = path.join(currentRelPath, entry.name);
      if (shouldIgnore(relPath)) {
        continue;
      }
      if (entry.isDirectory()) {
        entries.push(`d:${relPath}`);
        walk(relPath, depth + 1);
        continue;
      }
      entries.push(`f:${relPath}`);
    }
  }

  walk(".", 0);
  entries.sort();
  return entries.join("|");
}

console.log("Watching repository for mindmap updates...");
console.log("Press Ctrl+C to stop.");
generate();
lastSignature = collectSignature();
setInterval(() => {
  const nextSignature = collectSignature();
  if (nextSignature !== lastSignature) {
    lastSignature = nextSignature;
    scheduleGenerate();
  }
}, 2000);
