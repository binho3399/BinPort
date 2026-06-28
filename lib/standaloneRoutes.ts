const standaloneRoutes = new Set(['/bg-test', '/yellow-canvas-test', '/codegraph']);

export function isStandaloneRoute(pathname: string) {
  return standaloneRoutes.has(pathname);
}
