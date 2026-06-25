import fs from 'node:fs';
import Database from 'better-sqlite3';
import path from 'node:path';

let db: ReturnType<typeof Database> | null = null;

export function getDbPath() {
  return path.join(process.cwd(), '.codegraph', 'codegraph.db');
}

export function hasCodegraphDb() {
  return fs.existsSync(getDbPath());
}

export function getDb() {
  if (!db) {
    db = new Database(getDbPath(), { readonly: true });
  }
  return db;
}

export type DbNode = {
  id: string;
  kind: string;
  name: string;
  qualified_name: string;
  file_path: string;
  language: string;
  start_line: number;
  end_line: number;
  signature: string | null;
  visibility: string | null;
  is_exported: number;
  is_async: number;
  docstring: string | null;
};

export type DbEdge = {
  id: number;
  source: string;
  target: string;
  kind: string;
  line: number | null;
};

export type DbFile = {
  path: string;
  language: string;
  node_count: number;
  size: number;
};
