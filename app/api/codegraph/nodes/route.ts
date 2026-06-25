import { NextRequest, NextResponse } from 'next/server';
import { getDb, hasCodegraphDb, type DbNode } from '../../../../lib/codegraph-db';

export function GET(req: NextRequest) {
  if (!hasCodegraphDb()) {
    return NextResponse.json({ error: 'CodeGraph database unavailable' }, { status: 404 });
  }

  const db = getDb();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') ?? '';
  const kind = searchParams.get('kind') ?? '';
  const file = searchParams.get('file') ?? '';

  let query =
    'SELECT id, kind, name, qualified_name, file_path, language, start_line, end_line, signature, visibility, is_exported, is_async, docstring FROM nodes WHERE 1=1';
  const params: (string | number)[] = [];

  if (search) {
    query += ' AND (lower(name) LIKE ? OR lower(qualified_name) LIKE ?)';
    params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
  }
  if (kind) {
    query += ' AND kind = ?';
    params.push(kind);
  }
  if (file) {
    query += ' AND file_path = ?';
    params.push(file);
  }

  query += ' ORDER BY file_path, start_line LIMIT 500';

  const nodes = db.prepare(query).all(...params) as DbNode[];
  return NextResponse.json({ nodes });
}
