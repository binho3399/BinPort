import { NextRequest, NextResponse } from 'next/server';
import { getDb, hasCodegraphDb, type DbNode, type DbEdge } from '../../../../../lib/debug/codegraph-db';

export function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return params.then(({ id }) => {
    if (!hasCodegraphDb()) {
      return NextResponse.json({ error: 'CodeGraph database unavailable' }, { status: 404 });
    }

    const db = getDb();
    const nodeId = decodeURIComponent(id);

    const node = db
      .prepare(
        'SELECT id, kind, name, qualified_name, file_path, language, start_line, end_line, signature, visibility, is_exported, is_async, docstring FROM nodes WHERE id = ?',
      )
      .get(nodeId) as DbNode | undefined;

    if (!node) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const outEdges = db
      .prepare('SELECT id, source, target, kind, line FROM edges WHERE source = ?')
      .all(nodeId) as DbEdge[];

    const inEdges = db
      .prepare('SELECT id, source, target, kind, line FROM edges WHERE target = ?')
      .all(nodeId) as DbEdge[];

    const targetIds = outEdges.map((e) => e.target);
    const sourceIds = inEdges.map((e) => e.source);
    const allIds = [...new Set([...targetIds, ...sourceIds])];

    let relatedNodes: DbNode[] = [];
    if (allIds.length > 0) {
      const placeholders = allIds.map(() => '?').join(',');
      relatedNodes = db
        .prepare(
          `SELECT id, kind, name, qualified_name, file_path, language, start_line, end_line, signature, visibility, is_exported, is_async, docstring FROM nodes WHERE id IN (${placeholders})`,
        )
        .all(...allIds) as DbNode[];
    }

    return NextResponse.json({ node, outEdges, inEdges, relatedNodes });
  });
}
