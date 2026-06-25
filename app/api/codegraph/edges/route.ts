import { NextRequest, NextResponse } from 'next/server';
import { getDb, type DbEdge } from '../../../../lib/codegraph-db';

export function GET(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const nodeIds = searchParams.get('nodeIds');

  let edges: DbEdge[];
  if (nodeIds) {
    const ids = nodeIds.split(',').filter(Boolean);
    const placeholders = ids.map(() => '?').join(',');
    edges = db
      .prepare(
        `SELECT id, source, target, kind, line FROM edges WHERE source IN (${placeholders}) OR target IN (${placeholders})`,
      )
      .all(...ids, ...ids) as DbEdge[];
  } else {
    edges = db
      .prepare('SELECT id, source, target, kind, line FROM edges LIMIT 2000')
      .all() as DbEdge[];
  }

  return NextResponse.json({ edges });
}
