'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

// ── Types ──────────────────────────────────────────────────────────────────

type NodeKind = 'function' | 'method' | 'constant' | 'property' | 'type_alias' | 'import' | 'file';
type EdgeKind = 'calls' | 'imports' | 'contains' | 'references';

interface GraphNode {
  id: string;
  kind: NodeKind;
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
}

interface GraphEdge {
  id: number;
  source: string;
  target: string;
  kind: EdgeKind;
  line: number | null;
}

interface Stats {
  totals: { nodes: number; edges: number; files: number; unresolved_refs: number };
  nodeKinds: { kind: string; count: number }[];
  edgeKinds: { kind: string; count: number }[];
  fileStats: { language: string; count: number }[];
}

interface NodeDetail {
  node: GraphNode;
  outEdges: GraphEdge[];
  inEdges: GraphEdge[];
  relatedNodes: GraphNode[];
}

// ── Constants ──────────────────────────────────────────────────────────────

const KIND_COLOR: Record<string, string> = {
  function: '#4f8ef7',
  method: '#7c6fef',
  constant: '#f59e42',
  property: '#36c07a',
  type_alias: '#e75480',
  import: '#a1a1aa',
  file: '#22d3ee',
};

const EDGE_COLOR: Record<string, string> = {
  calls: '#4f8ef7',
  imports: '#22d3ee',
  contains: '#a1a1aa',
  references: '#f59e42',
};

function kindColor(kind: string) {
  return KIND_COLOR[kind] ?? '#888';
}

// ── Force Graph ────────────────────────────────────────────────────────────

interface ForceNode extends d3.SimulationNodeDatum {
  id: string;
  kind: string;
  name: string;
  file_path: string;
}

interface ForceLink extends d3.SimulationLinkDatum<ForceNode> {
  source: string | ForceNode;
  target: string | ForceNode;
  kind: string;
}

function ForceGraph({
  nodes,
  edges,
  selectedId,
  onSelectNode,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedId: string | null;
  onSelectNode: (id: string) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<d3.Simulation<ForceNode, ForceLink> | null>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth || 900;
    const height = svgRef.current.clientHeight || 600;

    const g = svg.append('g');

    svg.call(
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.05, 4])
        .on('zoom', (event) => g.attr('transform', event.transform)),
    );

    // Arrow markers per edge kind
    const defs = svg.append('defs');
    Object.entries(EDGE_COLOR).forEach(([kind, color]) => {
      defs
        .append('marker')
        .attr('id', `arrow-${kind}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 18)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', color);
    });

    const fnodes: ForceNode[] = nodes.map((n) => ({
      id: n.id,
      kind: n.kind,
      name: n.name,
      file_path: n.file_path,
    }));

    const nodeSet = new Set(fnodes.map((n) => n.id));
    const flinks: ForceLink[] = edges
      .filter((e) => nodeSet.has(e.source) && nodeSet.has(e.target))
      .map((e) => ({ source: e.source, target: e.target, kind: e.kind }));

    const sim = d3
      .forceSimulation<ForceNode>(fnodes)
      .force(
        'link',
        d3
          .forceLink<ForceNode, ForceLink>(flinks)
          .id((d) => d.id)
          .distance(80),
      )
      .force('charge', d3.forceManyBody().strength(-180))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide(16));

    simRef.current = sim;

    const link = g
      .append('g')
      .attr('stroke-opacity', 0.55)
      .selectAll('line')
      .data(flinks)
      .join('line')
      .attr('stroke', (d) => EDGE_COLOR[d.kind] ?? '#888')
      .attr('stroke-width', 1.2)
      .attr('marker-end', (d) => `url(#arrow-${d.kind})`);

    const drag = d3
      .drag<SVGCircleElement, ForceNode>()
      .on('start', (event, d) => {
        if (!event.active) sim.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) sim.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    const node = g
      .append('g')
      .selectAll<SVGCircleElement, ForceNode>('circle')
      .data(fnodes)
      .join('circle')
      .attr('r', (d) => (d.kind === 'file' ? 12 : 8))
      .attr('fill', (d) => kindColor(d.kind))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .call(drag)
      .on('click', (_event, d) => onSelectNode(d.id));

    node.append('title').text((d) => `${d.kind}: ${d.name}\n${d.file_path}`);

    const label = g
      .append('g')
      .selectAll('text')
      .data(fnodes.filter((n) => n.kind !== 'import'))
      .join('text')
      .attr('font-size', 9)
      .attr('fill', '#e2e8f0')
      .attr('text-anchor', 'middle')
      .attr('dy', -11)
      .style('pointer-events', 'none')
      .text((d) => (d.name.length > 20 ? d.name.slice(0, 18) + '…' : d.name));

    sim.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as ForceNode).x ?? 0)
        .attr('y1', (d) => (d.source as ForceNode).y ?? 0)
        .attr('x2', (d) => (d.target as ForceNode).x ?? 0)
        .attr('y2', (d) => (d.target as ForceNode).y ?? 0);
      node.attr('cx', (d) => d.x ?? 0).attr('cy', (d) => d.y ?? 0);
      label.attr('x', (d) => d.x ?? 0).attr('y', (d) => d.y ?? 0);
    });

    return () => {
      sim.stop();
    };
  }, [nodes, edges, onSelectNode]);

  // Highlight selected node
  useEffect(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current)
      .selectAll<SVGCircleElement, ForceNode>('circle')
      .attr('stroke', (d) => (d.id === selectedId ? '#fbbf24' : '#fff'))
      .attr('stroke-width', (d) => (d.id === selectedId ? 3 : 1.5));
  }, [selectedId]);

  return (
    <svg
      ref={svgRef}
      style={{ width: '100%', height: '100%', background: '#0f172a', borderRadius: 8 }}
    />
  );
}

// ── Stats Panel ────────────────────────────────────────────────────────────

function StatsPanel({ stats }: { stats: Stats }) {
  return (
    <div style={styles.statsGrid}>
      {[
        { label: 'Nodes', value: stats.totals.nodes },
        { label: 'Edges', value: stats.totals.edges },
        { label: 'Files', value: stats.totals.files },
        { label: 'Unresolved', value: stats.totals.unresolved_refs },
      ].map(({ label, value }) => (
        <div key={label} style={styles.statCard}>
          <span style={styles.statValue}>{value}</span>
          <span style={styles.statLabel}>{label}</span>
        </div>
      ))}
      <div style={{ ...styles.statCard, gridColumn: '1 / -1' }}>
        <span style={styles.statLabel}>By kind</span>
        <div style={styles.kindRow}>
          {stats.nodeKinds.map(({ kind, count }) => (
            <span key={kind} style={{ ...styles.kindBadge, background: kindColor(kind) + '33', borderColor: kindColor(kind) }}>
              <span style={{ color: kindColor(kind) }}>{kind}</span>
              <span style={styles.kindCount}>{count}</span>
            </span>
          ))}
        </div>
      </div>
      <div style={{ ...styles.statCard, gridColumn: '1 / -1' }}>
        <span style={styles.statLabel}>Edges by kind</span>
        <div style={styles.kindRow}>
          {stats.edgeKinds.map(({ kind, count }) => (
            <span key={kind} style={{ ...styles.kindBadge, background: (EDGE_COLOR[kind] ?? '#888') + '33', borderColor: EDGE_COLOR[kind] ?? '#888' }}>
              <span style={{ color: EDGE_COLOR[kind] ?? '#888' }}>{kind}</span>
              <span style={styles.kindCount}>{count}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Node Detail Panel ──────────────────────────────────────────────────────

function NodeDetailPanel({
  detail,
  allNodes,
  onSelectNode,
  onClose,
}: {
  detail: NodeDetail;
  allNodes: GraphNode[];
  onSelectNode: (id: string) => void;
  onClose: () => void;
}) {
  const { node, outEdges, inEdges, relatedNodes } = detail;
  const nodeById = Object.fromEntries(relatedNodes.map((n) => [n.id, n]));

  return (
    <div style={styles.detailPanel}>
      <div style={styles.detailHeader}>
        <span style={{ ...styles.kindChip, background: kindColor(node.kind) + '33', borderColor: kindColor(node.kind), color: kindColor(node.kind) }}>
          {node.kind}
        </span>
        <span style={styles.detailName}>{node.name}</span>
        <button onClick={onClose} style={styles.closeBtn} aria-label="Close">✕</button>
      </div>

      <div style={styles.detailMeta}>
        <span style={styles.metaItem}>📁 {node.file_path}:{node.start_line}</span>
        {node.is_exported ? <span style={styles.metaItem}>✦ exported</span> : null}
        {node.is_async ? <span style={styles.metaItem}>⚡ async</span> : null}
        {node.visibility ? <span style={styles.metaItem}>{node.visibility}</span> : null}
      </div>

      {node.signature && (
        <pre style={styles.signature}>{node.signature}</pre>
      )}

      {node.docstring && (
        <p style={styles.docstring}>{node.docstring}</p>
      )}

      {inEdges.length > 0 && (
        <div style={styles.edgeSection}>
          <div style={styles.edgeSectionTitle}>Callers / Importers ({inEdges.length})</div>
          {inEdges.map((e) => {
            const n = nodeById[e.source];
            return (
              <button key={e.id} style={styles.edgeRow} onClick={() => n && onSelectNode(n.id)}>
                <span style={{ color: EDGE_COLOR[e.kind] ?? '#888', fontSize: 11 }}>{e.kind}</span>
                <span style={styles.edgeNodeName}>{n?.name ?? e.source}</span>
                <span style={styles.edgeFile}>{n?.file_path}</span>
              </button>
            );
          })}
        </div>
      )}

      {outEdges.length > 0 && (
        <div style={styles.edgeSection}>
          <div style={styles.edgeSectionTitle}>Calls / Imports ({outEdges.length})</div>
          {outEdges.map((e) => {
            const n = nodeById[e.target];
            return (
              <button key={e.id} style={styles.edgeRow} onClick={() => n && onSelectNode(n.id)}>
                <span style={{ color: EDGE_COLOR[e.kind] ?? '#888', fontSize: 11 }}>{e.kind}</span>
                <span style={styles.edgeNodeName}>{n?.name ?? e.target}</span>
                <span style={styles.edgeFile}>{n?.file_path}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Legend ─────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div style={styles.legend}>
      {Object.entries(KIND_COLOR).map(([kind, color]) => (
        <span key={kind} style={styles.legendItem}>
          <span style={{ ...styles.legendDot, background: color }} />
          {kind}
        </span>
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function CodeGraphUI() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<NodeDetail | null>(null);
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState('');
  const [fileFilter, setFileFilter] = useState('');
  const [tab, setTab] = useState<'graph' | 'stats'>('graph');
  const [loading, setLoading] = useState(true);
  const [allFiles, setAllFiles] = useState<string[]>([]);

  const fetchNodes = useCallback(async (s: string, k: string, f: string) => {
    const params = new URLSearchParams();
    if (s) params.set('search', s);
    if (k) params.set('kind', k);
    if (f) params.set('file', f);
    const res = await fetch(`/api/codegraph/nodes?${params}`);
    const data = await res.json() as { nodes: GraphNode[] };
    return data.nodes;
  }, []);

  const fetchEdges = useCallback(async (nodeIds: string[]) => {
    const params = new URLSearchParams({ nodeIds: nodeIds.join(',') });
    const res = await fetch(`/api/codegraph/edges?${params}`);
    const data = await res.json() as { edges: GraphEdge[] };
    return data.edges;
  }, []);

  // Initial load
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/codegraph/stats').then((r) => r.json() as Promise<Stats>),
      fetchNodes('', '', ''),
      fetch('/api/codegraph/edges').then((r) => r.json() as Promise<{ edges: GraphEdge[] }>),
    ]).then(([s, ns, es]) => {
      setStats(s);
      setNodes(ns);
      setEdges(es.edges);
      const files = [...new Set(ns.map((n) => n.file_path))].sort();
      setAllFiles(files);
      setLoading(false);
    });
  }, [fetchNodes]);

  // Filter nodes + edges when search/filter changes
  useEffect(() => {
    if (loading) return;
    fetchNodes(search, kindFilter, fileFilter).then(async (ns) => {
      const ids = ns.map((n) => n.id);
      const es = await fetchEdges(ids);
      setNodes(ns);
      setEdges(es);
    });
  }, [search, kindFilter, fileFilter, loading, fetchNodes, fetchEdges]);

  const handleSelectNode = useCallback(async (id: string) => {
    setSelectedId(id);
    const res = await fetch(`/api/codegraph/node/${encodeURIComponent(id)}`);
    const data = await res.json() as NodeDetail;
    setDetail(data);
  }, []);

  const nodeKinds = stats ? stats.nodeKinds.map((k) => k.kind) : [];

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <span style={styles.headerTitle}>CodeGraph</span>
        <span style={styles.headerSub}>{nodes.length} nodes · {edges.length} edges</span>
        <div style={styles.tabs}>
          {(['graph', 'stats'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
            >
              {t === 'graph' ? '⬡ Graph' : '◫ Stats'}
            </button>
          ))}
        </div>
      </header>

      {tab === 'graph' && (
        <div style={styles.toolbar}>
          <input
            style={styles.searchInput}
            placeholder="Search nodes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={styles.select}
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
          >
            <option value="">All kinds</option>
            {nodeKinds.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <select
            style={styles.select}
            value={fileFilter}
            onChange={(e) => setFileFilter(e.target.value)}
          >
            <option value="">All files</option>
            {allFiles.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      )}

      <div style={styles.body}>
        {loading ? (
          <div style={styles.loading}>Loading graph…</div>
        ) : tab === 'stats' && stats ? (
          <div style={{ padding: 24 }}>
            <StatsPanel stats={stats} />
          </div>
        ) : (
          <div style={styles.graphArea}>
            <ForceGraph
              nodes={nodes}
              edges={edges}
              selectedId={selectedId}
              onSelectNode={handleSelectNode}
            />
            <Legend />
            {detail && (
              <NodeDetailPanel
                detail={detail}
                allNodes={nodes}
                onSelectNode={handleSelectNode}
                onClose={() => { setDetail(null); setSelectedId(null); }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: '#0a0f1e',
    color: '#e2e8f0',
    fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
    fontSize: 13,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '12px 20px',
    borderBottom: '1px solid #1e293b',
    background: '#0d1424',
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#4f8ef7',
    letterSpacing: '-0.01em',
  },
  headerSub: {
    color: '#64748b',
    fontSize: 12,
  },
  tabs: {
    display: 'flex',
    gap: 4,
    marginLeft: 'auto',
  },
  tab: {
    padding: '5px 14px',
    borderRadius: 6,
    border: '1px solid #1e293b',
    background: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: 12,
  },
  tabActive: {
    background: '#1e293b',
    color: '#e2e8f0',
    borderColor: '#334155',
  },
  toolbar: {
    display: 'flex',
    gap: 8,
    padding: '8px 16px',
    borderBottom: '1px solid #1e293b',
    background: '#0d1424',
    flexShrink: 0,
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    minWidth: 160,
    padding: '6px 10px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 6,
    color: '#e2e8f0',
    fontSize: 12,
    outline: 'none',
  },
  select: {
    padding: '6px 10px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 6,
    color: '#e2e8f0',
    fontSize: 12,
    outline: 'none',
    cursor: 'pointer',
  },
  body: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#64748b',
    fontSize: 14,
  },
  graphArea: {
    position: 'relative',
    height: '100%',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
    maxWidth: 800,
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '14px 16px',
    background: '#0d1424',
    border: '1px solid #1e293b',
    borderRadius: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    color: '#4f8ef7',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 6,
  },
  kindRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  kindBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 8px',
    borderRadius: 4,
    border: '1px solid',
    fontSize: 11,
  },
  kindCount: {
    color: '#94a3b8',
    fontSize: 11,
  },
  detailPanel: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 340,
    maxHeight: 'calc(100% - 24px)',
    overflowY: 'auto',
    background: '#0d1424',
    border: '1px solid #1e293b',
    borderRadius: 10,
    padding: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  kindChip: {
    padding: '2px 8px',
    borderRadius: 4,
    border: '1px solid',
    fontSize: 11,
    flexShrink: 0,
  },
  detailName: {
    fontWeight: 700,
    color: '#f1f5f9',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: 14,
    padding: '0 4px',
    lineHeight: 1,
    flexShrink: 0,
  },
  detailMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  metaItem: {
    fontSize: 11,
    color: '#94a3b8',
    background: '#1e293b',
    padding: '2px 8px',
    borderRadius: 4,
  },
  signature: {
    background: '#1a2540',
    padding: '8px 10px',
    borderRadius: 6,
    fontSize: 11,
    color: '#7dd3fc',
    margin: '8px 0',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  docstring: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 1.5,
    margin: '8px 0',
  },
  edgeSection: {
    marginTop: 12,
  },
  edgeSectionTitle: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 6,
  },
  edgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '5px 8px',
    background: 'none',
    border: '1px solid #1e293b',
    borderRadius: 5,
    color: '#e2e8f0',
    cursor: 'pointer',
    marginBottom: 4,
    textAlign: 'left',
    fontSize: 12,
  },
  edgeNodeName: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#cbd5e1',
  },
  edgeFile: {
    fontSize: 10,
    color: '#475569',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 100,
  },
  legend: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    background: 'rgba(13,20,36,0.85)',
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #1e293b',
    backdropFilter: 'blur(4px)',
    zIndex: 5,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    color: '#94a3b8',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
};
