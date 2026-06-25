import Database from 'better-sqlite3';
import path from 'path';

let db: ReturnType<typeof Database> | null = null;

export function getDb() {
  if (!db) {
    const dbPath = path.join(process.cwd(), '.codegraph', 'codegraph.db');
    db = new Database(dbPath, { readonly: true });
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
