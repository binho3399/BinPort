import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/codegraph-db';

export function GET() {
  const db = getDb();

  const nodeKinds = db
    .prepare('SELECT kind, COUNT(*) as count FROM nodes GROUP BY kind ORDER BY count DESC')
    .all() as { kind: string; count: number }[];

  const edgeKinds = db
    .prepare('SELECT kind, COUNT(*) as count FROM edges GROUP BY kind ORDER BY count DESC')
    .all() as { kind: string; count: number }[];

  const fileStats = db
    .prepare('SELECT language, COUNT(*) as count FROM files GROUP BY language ORDER BY count DESC')
    .all() as { language: string; count: number }[];

  const totals = db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM nodes) as nodes,
        (SELECT COUNT(*) FROM edges) as edges,
        (SELECT COUNT(*) FROM files) as files,
        (SELECT COUNT(*) FROM unresolved_refs) as unresolved_refs`,
    )
    .get() as { nodes: number; edges: number; files: number; unresolved_refs: number };

  return NextResponse.json({ totals, nodeKinds, edgeKinds, fileStats });
}
