import { useCallback, useEffect, useRef, useState } from 'react';
import type { GraphEdge, GraphNode, NodeDetail, Stats } from './types';

export default function useCodeGraphData() {
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
  const [error, setError] = useState<string | null>(null);

  const requestSeq = useRef(0);

  const fetchNodes = useCallback(async (s: string, k: string, f: string) => {
    const params = new URLSearchParams();
    if (s) params.set('search', s);
    if (k) params.set('kind', k);
    if (f) params.set('file', f);
    const res = await fetch(`/api/codegraph/nodes?${params}`);
    if (!res.ok) throw new Error(`Failed to load nodes (${res.status})`);
    const data = (await res.json()) as { nodes: GraphNode[] };
    return data.nodes;
  }, []);

  const fetchEdges = useCallback(async (nodeIds: string[]) => {
    const params = new URLSearchParams({ nodeIds: nodeIds.join(',') });
    const res = await fetch(`/api/codegraph/edges?${params}`);
    if (!res.ok) throw new Error(`Failed to load edges (${res.status})`);
    const data = (await res.json()) as { edges: GraphEdge[] };
    return data.edges;
  }, []);

  const fetchNodeDetail = useCallback(async (id: string) => {
    const res = await fetch(`/api/codegraph/node/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`Failed to load node detail (${res.status})`);
    const data = (await res.json()) as NodeDetail;
    return data;
  }, []);

  useEffect(() => {
    const seq = ++requestSeq.current;

    Promise.all([
      fetch('/api/codegraph/stats').then((r) => {
        if (!r.ok) throw new Error(`Failed to load stats (${r.status})`);
        return r.json() as Promise<Stats>;
      }),
      fetchNodes('', '', ''),
      fetch('/api/codegraph/edges').then((r) => {
        if (!r.ok) throw new Error(`Failed to load edges (${r.status})`);
        return r.json() as Promise<{ edges: GraphEdge[] }>;
      }),
    ])
      .then(([s, ns, es]) => {
        if (requestSeq.current !== seq) return;
        setStats(s);
        setNodes(ns);
        setEdges(es.edges);
        setAllFiles([...new Set(ns.map((n) => n.file_path))].sort());
      })
      .catch((err: unknown) => {
        if (requestSeq.current !== seq) return;
        setError(err instanceof Error ? err.message : 'Failed to load CodeGraph data');
      })
      .finally(() => {
        if (requestSeq.current !== seq) return;
        setLoading(false);
      });
  }, [fetchNodes]);

  useEffect(() => {
    if (loading) return;
    const seq = ++requestSeq.current;
    let active = true;

    (async () => {
      try {
        const ns = await fetchNodes(search, kindFilter, fileFilter);
        if (!active || requestSeq.current !== seq) return;
        const ids = ns.map((n) => n.id);
        const es = ids.length > 0 ? await fetchEdges(ids) : [];
        if (!active || requestSeq.current !== seq) return;
        setNodes(ns);
        setEdges(es);
        setError(null);
      } catch (err: unknown) {
        if (!active || requestSeq.current !== seq) return;
        setError(err instanceof Error ? err.message : 'Failed to update CodeGraph data');
      }
    })();

    return () => {
      active = false;
    };
  }, [search, kindFilter, fileFilter, loading, fetchNodes, fetchEdges]);

  const handleSelectNode = useCallback(
    async (id: string) => {
      const seq = ++requestSeq.current;
      setSelectedId(id);
      try {
        const data = await fetchNodeDetail(id);
        if (requestSeq.current !== seq) return;
        setDetail(data);
        setError(null);
      } catch (err: unknown) {
        if (requestSeq.current !== seq) return;
        setError(err instanceof Error ? err.message : 'Failed to load node detail');
      }
    },
    [fetchNodeDetail],
  );

  return { stats, nodes, edges, selectedId, detail, search, setSearch, kindFilter, setKindFilter, fileFilter, setFileFilter, tab, setTab, loading, allFiles, handleSelectNode, setDetail, setSelectedId, error };
}
