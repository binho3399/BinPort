export type NodeKind = 'function' | 'method' | 'constant' | 'property' | 'type_alias' | 'import' | 'file';
export type EdgeKind = 'calls' | 'imports' | 'contains' | 'references';

export interface GraphNode {
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

export interface GraphEdge {
  id: number;
  source: string;
  target: string;
  kind: EdgeKind;
  line: number | null;
}

export interface Stats {
  totals: { nodes: number; edges: number; files: number; unresolved_refs: number };
  nodeKinds: { kind: string; count: number }[];
  edgeKinds: { kind: string; count: number }[];
  fileStats: { language: string; count: number }[];
}

export interface NodeDetail {
  node: GraphNode;
  outEdges: GraphEdge[];
  inEdges: GraphEdge[];
  relatedNodes: GraphNode[];
}

export interface ForceNode extends d3.SimulationNodeDatum {
  id: string;
  kind: string;
  name: string;
  file_path: string;
}

export interface ForceLink extends d3.SimulationLinkDatum<ForceNode> {
  source: string | ForceNode;
  target: string | ForceNode;
  kind: string;
}
