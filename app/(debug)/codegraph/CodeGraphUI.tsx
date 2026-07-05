'use client';

import ForceGraph from './parts/ForceGraph';
import Legend from './parts/Legend';
import NodeDetailPanel from './parts/NodeDetailPanel';
import StatsPanel from './parts/StatsPanel';
import { styles } from './styles';
import useCodeGraphData from './useCodeGraphData';

export default function CodeGraphUI() {
  const {
    stats,
    nodes,
    edges,
    selectedId,
    detail,
    search,
    setSearch,
    kindFilter,
    setKindFilter,
    fileFilter,
    setFileFilter,
    tab,
    setTab,
    loading,
    allFiles,
    handleSelectNode,
    setDetail,
    setSelectedId,
  } = useCodeGraphData();

  const nodeKinds = stats ? stats.nodeKinds.map((k) => k.kind) : [];

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <span style={styles.headerTitle}>CodeGraph</span>
        <span style={styles.headerSub}>
          {nodes.length} nodes · {edges.length} edges
        </span>
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
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <select
            style={styles.select}
            value={fileFilter}
            onChange={(e) => setFileFilter(e.target.value)}
          >
            <option value="">All files</option>
            {allFiles.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
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
                onSelectNode={handleSelectNode}
                onClose={() => {
                  setDetail(null);
                  setSelectedId(null);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
