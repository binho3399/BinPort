export const routeIds = {
  home: 'home',
  projects: 'projects',
  about: 'about',
  contact: 'contact',
} as const;

export type RouteId = (typeof routeIds)[keyof typeof routeIds];

export const routes = [
  { href: '/', label: 'Home', id: routeIds.home },
  { href: '/projects', label: 'Projects', id: routeIds.projects },
  { href: '/about', label: 'About', id: routeIds.about },
  { href: '/contact', label: 'Contact', id: routeIds.contact },
];

export const shellRouteFlags = {
  backButtonVisible: new Set<RouteId>([routeIds.contact]),
  homeInteractive: routeIds.home,
  contactShellHidden: routeIds.contact,
} as const;

export function shouldShowShellBackButton(route: RouteId | null) {
  return route !== null && shellRouteFlags.backButtonVisible.has(route);
}

export function isHomeRoute(route: RouteId | null) {
  return route === shellRouteFlags.homeInteractive;
}

export function isContactRoute(route: RouteId | null) {
  return route === shellRouteFlags.contactShellHidden;
}

export function getRouteId(pathname: string): RouteId | null {
  return routes.find((route) => route.href === pathname)?.id ?? null;
}

export const standaloneRoutes = new Set(['/yellow-canvas-test', '/codegraph', '/bg-test-2']);

export function isStandaloneRoute(pathname: string) {
  return standaloneRoutes.has(pathname);
}
