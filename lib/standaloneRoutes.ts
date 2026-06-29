const standaloneRoutes = new Set(['/yellow-canvas-test', '/codegraph']);

export function isStandaloneRoute(pathname: string) {
  return standaloneRoutes.has(pathname);
}
