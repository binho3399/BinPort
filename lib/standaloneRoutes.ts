const standaloneRoutes = new Set(['/yellow-canvas-test', '/codegraph', '/bg-test-2']);

export function isStandaloneRoute(pathname: string) {
  return standaloneRoutes.has(pathname);
}
