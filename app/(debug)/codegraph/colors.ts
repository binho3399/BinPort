export const KIND_COLOR: Record<string, string> = {
  function: '#4f8ef7',
  method: '#7c6fef',
  constant: '#f59e42',
  property: '#36c07a',
  type_alias: '#e75480',
  import: '#a1a1aa',
  file: '#22d3ee',
};

export const EDGE_COLOR: Record<string, string> = {
  calls: '#4f8ef7',
  imports: '#22d3ee',
  contains: '#a1a1aa',
  references: '#f59e42',
};

export function kindColor(kind: string) {
  return KIND_COLOR[kind] ?? '#888';
}
